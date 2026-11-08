import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");
const args = process.argv.slice(2);
const has = (name) => args.includes(name);
const val = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

if (has("--help")) {
  console.log(
    "Usage: node scripts/render.mjs [--4k] [--frames] [--cut30] [--from N --to M] [--allow-sample] [--browser <chrome path>] [--concurrency N]",
  );
  process.exit(0);
}

const ID = "SpherexFilm";
const TOTAL = 4500;
const CUT_RANGES = [
  [0, 119],
  [1170, 1289],
  [1800, 1919],
  [2310, 2429],
  [2880, 2999],
  [3150, 3269],
  [3480, 3539],
  [4260, 4379],
];
const CUT_TOTAL = CUT_RANGES.reduce((a, [s, e]) => a + (e - s + 1), 0);
if (CUT_TOTAL !== 900) {
  console.error(`Fix: the 30 second cut must be 900 frames, the range list gives ${CUT_TOTAL}.`);
  process.exit(1);
}

const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

const evidence = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "data", "evidence.json"), "utf8"));
if (evidence.meta && evidence.meta.sample && !has("--allow-sample")) {
  fail("Fix: src/data/evidence.json is sample data. Run npm run evidence, or pass --allow-sample for a test render.");
}

const gate = spawnSync(process.execPath, [path.join(ROOT, "scripts", "validate-evidence.mjs"), "--final"], { stdio: "inherit" });
if (gate.status !== 0) fail("Fix: the evidence final check failed (see above). Nothing was rendered.");

const manifestFile = path.join(ROOT, "public", "assets-manifest.json");
if (!fs.existsSync(manifestFile)) fail("Fix: public/assets-manifest.json is missing. Run npm run assets -- --from <path to spherex-blink>.");
if (!JSON.parse(fs.readFileSync(manifestFile, "utf8")).complete) fail("Fix: the assets are incomplete. Run npm run assets again and read its output.");

if (!fs.existsSync(path.join(ROOT, "public", "audio", "drone.wav"))) {
  console.warn("WARN public/audio/drone.wav is missing: rendering SILENT. Run npm run sfx to add the sound.");
}

const browserExecutable = val("--browser") || process.env.REMOTION_BROWSER || undefined;
const concurrency = val("--concurrency") ? Number(val("--concurrency")) : undefined;
const scale = has("--4k") ? 2 : 1;
const suffix = has("--4k") ? "4k" : "1080p";

const stamp = () => new Date().toISOString().replace(/[:.]/g, "-");
function freeFile(file) {
  if (fs.existsSync(file)) {
    const parsed = path.parse(file);
    fs.renameSync(file, path.join(parsed.dir, `${parsed.name}-${stamp()}${parsed.ext}`));
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  return file;
}

function probe(file) {
  const r = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,duration", "-of", "default=nw=1", file],
    { encoding: "utf8" },
  );
  if (r.status === 0) console.log(r.stdout.trim().split("\n").join("  "));
  else console.log("ffprobe not available: skipped the summary.");
}

function progress(label) {
  return ({ progress: p, renderedFrames }) => {
    process.stdout.write(`\r${label} ${String(renderedFrames).padStart(5)} frames  ${(p * 100).toFixed(1).padStart(5)}%`);
  };
}

console.log("Bundling...");
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src", "index.ts"), publicDir: path.join(ROOT, "public") });
const composition = await selectComposition({ serveUrl, id: ID, browserExecutable });
const common = {
  composition,
  serveUrl,
  codec: "h264",
  crf: 18,
  x264Preset: "veryfast",
  pixelFormat: "yuv420p",
  audioCodec: "aac",
  audioBitrate: "192k",
  scale,
  browserExecutable,
  concurrency,
};

if (has("--cut30")) {
  const dir = path.join(OUT, "cut30-parts");
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const parts = [];
  for (let i = 0; i < CUT_RANGES.length; i++) {
    const [from, to] = CUT_RANGES[i];
    const file = path.join(dir, `part-${String(i).padStart(2, "0")}.mp4`);
    await renderMedia({ ...common, outputLocation: file, frameRange: [from, to], onProgress: progress(`part ${i + 1}/${CUT_RANGES.length}`) });
    process.stdout.write("\n");
    parts.push(file);
  }
  const list = path.join(dir, "list.txt");
  fs.writeFileSync(list, parts.map((p) => `file '${p.replace(/\\/g, "/")}'`).join("\n") + "\n", "utf8");
  const out = freeFile(path.join(OUT, "spherex-blink-film-30s.mp4"));
  const fadeStart = (CUT_TOTAL - 15) / 30;
  const r = spawnSync(
    "ffmpeg",
    [
      "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", list,
      "-vf", `fade=t=out:st=${fadeStart}:d=0.5:color=0x05060a`,
      "-af", `afade=t=out:st=${fadeStart}:d=0.5`,
      "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "192k", out,
    ],
    { stdio: "inherit" },
  );
  if (r.status !== 0) fail("Fix: ffmpeg could not join the parts of the 30 second cut.");
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`Wrote ${path.relative(ROOT, out)} (${(fs.statSync(out).size / 1048576).toFixed(1)} MB, ${CUT_TOTAL} frames).`);
  probe(out);
  process.exit(0);
}

const from = val("--from") !== undefined ? Number(val("--from")) : 0;
const to = val("--to") !== undefined ? Number(val("--to")) : TOTAL - 1;
if (!(from >= 0 && to >= from && to < TOTAL)) fail(`Fix: --from and --to must satisfy 0 <= from <= to <= ${TOTAL - 1}.`);
const partial = from !== 0 || to !== TOTAL - 1;

if (has("--frames")) {
  const dir = path.join(OUT, "frames");
  fs.mkdirSync(dir, { recursive: true });
  await renderMedia({
    ...common,
    codec: "h264",
    imageSequence: true,
    imageFormat: "png",
    outputLocation: dir,
    frameRange: [from, to],
    onProgress: progress("frames"),
  });
  process.stdout.write("\n");
  console.log(`Wrote ${to - from + 1} PNG frames to ${path.relative(ROOT, dir)}.`);
  process.exit(0);
}

const name = `spherex-blink-film-${suffix}${partial ? `-f${from}-${to}` : ""}.mp4`;
const out = freeFile(path.join(OUT, name));
await renderMedia({ ...common, outputLocation: out, frameRange: [from, to], onProgress: progress("render") });
process.stdout.write("\n");
console.log(`Wrote ${path.relative(ROOT, out)} (${(fs.statSync(out).size / 1048576).toFixed(1)} MB).`);
probe(out);
