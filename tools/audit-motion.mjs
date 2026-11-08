import fs from "node:fs";
import path from "node:path";
import { register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

if (args.includes("--help")) {
  console.log("Usage: node tools/audit-motion.mjs [--scene S3]");
  process.exit(0);
}

const loaderSource = `
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
let ts;
export function initialize(data) {
  ts = createRequire(data.root)("typescript");
}
const exts = [".ts", ".tsx", ".js", ".mjs", ".json"];
function tryFile(p) {
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  for (const e of exts) if (fs.existsSync(p + e)) return p + e;
  for (const e of exts) {
    const i = path.join(p, "index" + e);
    if (fs.existsSync(i)) return i;
  }
  return null;
}
export async function resolve(specifier, context, nextResolve) {
  if ((specifier.startsWith(".") || specifier.startsWith("/")) && context.parentURL && context.parentURL.startsWith("file:")) {
    const base = specifier.startsWith("/") ? specifier : path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
    const hit = tryFile(base);
    if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
export async function load(url, context, nextLoad) {
  if (url.endsWith(".json") && url.startsWith("file:")) {
    const text = fs.readFileSync(fileURLToPath(url), "utf8");
    return { format: "module", source: "export default " + text + ";", shortCircuit: true };
  }
  if ((url.endsWith(".ts") || url.endsWith(".tsx")) && url.startsWith("file:")) {
    const text = fs.readFileSync(fileURLToPath(url), "utf8");
    const out = ts.transpileModule(text, {
      fileName: fileURLToPath(url),
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
        isolatedModules: true,
      },
    });
    return { format: "module", source: out.outputText, shortCircuit: true };
  }
  return nextLoad(url, context);
}
`;

register("data:text/javascript;base64," + Buffer.from(loaderSource).toString("base64"), {
  parentURL: pathToFileURL(path.join(ROOT, "package.json")).href,
  data: { root: pathToFileURL(path.join(ROOT, "package.json")).href },
});

const src = (...p) => pathToFileURL(path.join(ROOT, "src", ...p)).href;

let scenes, timeline, cameraMod, cameraFx, focusMod;
try {
  scenes = await import(src("scenes", "index.ts"));
  timeline = await import(src("config", "timeline.ts"));
  cameraMod = await import(src("config", "camera.ts"));
  cameraFx = await import(src("fx", "Camera.tsx"));
  focusMod = await import(src("config", "focus.ts"));
} catch (e) {
  console.error("Fix: the audit could not load the film modules.");
  console.error(e && e.stack ? e.stack : String(e));
  process.exit(1);
}

const { FILM_CAMERA } = scenes;
const { SCENES, SCENE_ORDER, FPS, BEAT } = timeline;
const { CAMERA_LIMITS } = cameraMod;
const { getCameraState } = cameraFx;

const MIN_MOVE = 24;
const MAX_HOLD = 60;
const MIN_GAP = 10;
const MAX_PAN = 160;
const ZOOM_LIMIT = 2.0;
const DRIFT_BIAS = 0.05;

const onlyScene = (() => {
  const i = args.indexOf("--scene");
  return i >= 0 ? args[i + 1] : null;
})();

const poseKey = (k) => [k.target, k.padding, k.scaleBias, k.rotateX, k.rotateY, k.rotateZ].join("|");
const moveLen = (k) => (k.frames !== undefined ? k.frames : CAMERA_LIMITS.defaultMoveFrames);

function isDrift(k, prev) {
  return (
    k.target === prev.target &&
    k.padding === prev.padding &&
    k.rotateX === prev.rotateX &&
    k.rotateY === prev.rotateY &&
    k.rotateZ === prev.rotateZ &&
    Math.abs(k.scaleBias / prev.scaleBias - 1) <= DRIFT_BIAS + 1e-9
  );
}

for (let i = 1; i < FILM_CAMERA.length; i++) {
  if (FILM_CAMERA[i].frame < FILM_CAMERA[i - 1].frame) {
    console.error(`Fix: camera keyframes are out of order at index ${i} (frame ${FILM_CAMERA[i].frame} after ${FILM_CAMERA[i - 1].frame}).`);
    process.exit(1);
  }
}

const moves = [];
for (let i = 0; i < FILM_CAMERA.length; i++) {
  const k = FILM_CAMERA[i];
  const prev = i > 0 ? FILM_CAMERA[i - 1] : null;
  if (!prev || poseKey(k) === poseKey(prev)) continue;
  moves.push({ index: i, start: k.frame, end: k.frame + moveLen(k), len: moveLen(k), drift: isDrift(k, prev), ease: k.ease ?? "spring", kf: k });
}

const frameState = new Map();
const stateAt = (frame) => {
  if (!frameState.has(frame)) frameState.set(frame, getCameraState(frame, FILM_CAMERA, FPS));
  return frameState.get(frame);
};

const pad = (v, n) => String(v).padEnd(n);
const rows = [];
let totalFail = 0;
let totalWarn = 0;

const ids = onlyScene ? SCENE_ORDER.filter((id) => id === onlyScene) : SCENE_ORDER;
if (ids.length === 0) {
  console.error(`Fix: unknown scene ${onlyScene}. Use one of ${SCENE_ORDER.join(", ")}.`);
  process.exit(1);
}

const details = [];

for (const id of ids) {
  const sc = SCENES[id];
  const fails = [];
  const warns = [];
  const kfs = FILM_CAMERA.filter((k) => k.frame >= sc.start && k.frame <= sc.end);

  if (kfs.length === 0) fails.push(`no camera keyframe inside ${sc.start}-${sc.end}`);
  else if (kfs[0].frame !== sc.start) fails.push(`first keyframe at f${kfs[0].frame}, scene starts at f${sc.start}`);

  const sceneMoves = moves.filter((m) => m.start >= sc.start && m.start <= sc.end);
  const real = sceneMoves.filter((m) => !m.drift);
  const active = sceneMoves.slice().sort((a, b) => a.start - b.start);

  let cursor = sc.start;
  let longestHold = 0;
  let holdAt = sc.start;
  const prevEnd = (() => {
    const before = moves.filter((m) => m.start < sc.start);
    return before.length ? Math.max(...before.map((m) => m.end)) : -Infinity;
  })();
  cursor = Math.max(sc.start, Math.min(prevEnd, sc.end + 1));
  for (const m of active) {
    const gap = m.start - cursor;
    if (gap > longestHold) {
      longestHold = gap;
      holdAt = cursor;
    }
    cursor = Math.max(cursor, m.end);
  }
  const tail = sc.end + 1 - cursor;
  if (tail > longestHold) {
    longestHold = tail;
    holdAt = cursor;
  }
  if (longestHold > MAX_HOLD) fails.push(`hold of ${longestHold} frames from f${holdAt} with no camera change`);

  let shortest = Infinity;
  for (const m of real) {
    if (m.len < shortest) shortest = m.len;
    if (m.len < MIN_MOVE) fails.push(`move at f${m.start} lasts ${m.len} frames (minimum ${MIN_MOVE})`);
  }

  let minGap = Infinity;
  const ordered = real.slice().sort((a, b) => a.start - b.start);
  for (let i = 1; i < ordered.length; i++) {
    const gap = ordered[i].start - ordered[i - 1].end;
    if (gap < minGap) minGap = gap;
    if (gap < MIN_GAP) warns.push(`gap of ${gap} frames between the moves at f${ordered[i - 1].start} and f${ordered[i].start}`);
  }

  for (const m of real) {
    if (m.len < MIN_MOVE) continue;
    const off = m.start % BEAT;
    const dist = Math.min(off, BEAT - off);
    if (dist > 1) warns.push(`move at f${m.start} is ${dist} frames off the beat`);
  }

  let maxPan = 0;
  let panAt = sc.start;
  let maxZoom = 0;
  let zoomRun = 0;
  let zoomRunStart = sc.start;
  for (let f = sc.start; f <= sc.end; f++) {
    const s = stateAt(f);
    if (f > sc.start) {
      const p = stateAt(f - 1);
      const speed = Math.hypot(s.tx - p.tx, s.ty - p.ty);
      if (speed > maxPan) {
        maxPan = speed;
        panAt = f;
      }
    }
    if (s.scale > maxZoom) maxZoom = s.scale;
    if (s.scale > ZOOM_LIMIT) {
      if (zoomRun === 0) zoomRunStart = f;
      zoomRun++;
      if (zoomRun === MAX_HOLD + 1) fails.push(`zoom above ${ZOOM_LIMIT} for more than ${MAX_HOLD} frames from f${zoomRunStart}`);
    } else zoomRun = 0;
  }
  if (maxPan > MAX_PAN) fails.push(`pan speed ${maxPan.toFixed(1)} px per frame at f${panAt} (limit ${MAX_PAN})`);

  totalFail += fails.length;
  totalWarn += warns.length;
  rows.push({
    id,
    name: sc.name,
    kfs: kfs.length,
    moves: real.length,
    hold: longestHold,
    shortest: Number.isFinite(shortest) ? shortest : "-",
    gap: Number.isFinite(minGap) ? minGap : "-",
    pan: maxPan.toFixed(1),
    zoom: maxZoom.toFixed(2),
    fails,
    warns,
  });
  details.push({ id, fails, warns });
}

console.log(
  [pad("scene", 14), pad("kfs", 5), pad("moves", 7), pad("hold", 6), pad("short", 7), pad("gap", 6), pad("pan", 7), pad("zoom", 6), pad("fail", 6), "warn"].join(""),
);
for (const r of rows) {
  console.log(
    [pad(`${r.id} ${r.name}`, 14), pad(r.kfs, 5), pad(r.moves, 7), pad(r.hold, 6), pad(r.shortest, 7), pad(r.gap, 6), pad(r.pan, 7), pad(r.zoom, 6), pad(r.fails.length, 6), r.warns.length].join(""),
  );
}
console.log("");
for (const d of details) {
  for (const m of d.fails) console.log(`FAIL ${d.id}: ${m}`);
  for (const m of d.warns) console.log(`WARN ${d.id}: ${m}`);
}

const longest = rows.reduce((m, r) => Math.max(m, r.hold), 0);
const filmFails = rows.filter((r) => r.fails.length > 0).map((r) => r.id);
console.log("");
console.log(
  `Summary: ${rows.length} scene(s) audited, ${totalFail} failure(s), ${totalWarn} warning(s). Longest camera hold ${longest} frames. ` +
    (filmFails.length ? `Scenes with failures: ${filmFails.join(", ")}.` : "Every scene passes the motion rules."),
);
process.exit(totalFail > 0 ? 1 : 0);
