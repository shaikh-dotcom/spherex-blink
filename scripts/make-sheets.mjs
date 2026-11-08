import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const has = (name) => args.includes(name);
const val = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

if (has("--help") || args.length === 0) {
  console.log(
    "Usage: node scripts/make-sheets.mjs (--from N --to M | --scene S3) [--every 4] [--cols 8] [--scale 0.25] [--id SpherexFilm] [--browser <chrome path>]",
  );
  process.exit(args.length === 0 ? 1 : 0);
}

const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

const timeline = fs.readFileSync(path.join(ROOT, "src", "config", "timeline.ts"), "utf8");
const scenes = [...timeline.matchAll(/scene\("(S\d)",\s*"([^"]+)",\s*(\d+),\s*(\d+)\)/g)].map((m) => ({ id: m[1], start: Number(m[3]), end: Number(m[4]) }));
const totalMatch = timeline.match(/export const TOTAL = (\d+)/);
const TOTAL = totalMatch ? Number(totalMatch[1]) : 4500;

let from;
let to;
if (val("--scene")) {
  const sc = scenes.find((s) => s.id === val("--scene"));
  if (!sc) fail(`Fix: unknown scene ${val("--scene")}. Use one of ${scenes.map((s) => s.id).join(", ")}.`);
  from = sc.start;
  to = sc.end;
} else {
  if (val("--from") === undefined || val("--to") === undefined) fail("Fix: pass --from and --to, or --scene S3.");
  from = Number(val("--from"));
  to = Number(val("--to"));
}
const every = Math.max(1, Math.floor(Number(val("--every") || 4)));
const cols = Math.max(1, Math.floor(Number(val("--cols") || 8)));
const scale = Number(val("--scale") || 0.25);
const id = val("--id") || "SpherexFilm";
const browserExecutable = val("--browser") || process.env.REMOTION_BROWSER || undefined;

if (!(Number.isInteger(from) && Number.isInteger(to) && from >= 0 && to >= from && to < TOTAL)) fail(`Fix: --from and --to must satisfy 0 <= from <= to <= ${TOTAL - 1}.`);
if (!(scale > 0 && scale <= 1)) fail("Fix: --scale must be above 0 and at most 1.");

const frames = [];
for (let f = from; f <= to; f += every) frames.push(f);
const rows = Math.ceil(frames.length / cols);
if (frames.length > 600) fail(`Fix: ${frames.length} cells is too many for one sheet. Raise --every or narrow the range.`);

const dir = path.join(ROOT, "out", "sheets");
const tmp = path.join(dir, `tmp-${from}-${to}`);
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });

console.log("Bundling...");
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src", "index.ts"), publicDir: path.join(ROOT, "public") });
const composition = await selectComposition({ serveUrl, id, browserExecutable });
const browser = await openBrowser("chrome", { browserExecutable });

try {
  for (let i = 0; i < frames.length; i++) {
    const file = path.join(tmp, `c${String(i).padStart(5, "0")}.png`);
    await renderStill({ composition, serveUrl, frame: frames[i], output: file, scale, browserExecutable, puppeteerInstance: browser });
    process.stdout.write(`\rstill ${i + 1}/${frames.length} (frame ${frames[i]})   `);
  }
} finally {
  await browser.close({ silent: true });
}
process.stdout.write("\n");

const sheet = path.join(dir, `sheet-${from}-${to}.png`);
const labelsFile = path.join(dir, `sheet-${from}-${to}.txt`);
const band = Math.max(18, Math.round(composition.height * scale * 0.11));
const fontSize = Math.max(11, Math.round(band * 0.7));

const fontCandidates = [
  "C:/Windows/Fonts/consola.ttf",
  "C:/Windows/Fonts/arial.ttf",
  "/System/Library/Fonts/Supplemental/Courier New.ttf",
  "/Library/Fonts/Arial.ttf",
  "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
  "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
  "/usr/share/fonts/TTF/DejaVuSansMono.ttf",
].filter((p) => fs.existsSync(p));

const esc = (p) => p.replace(/\\/g, "/").replace(/:/g, "\\:");

function tile(withLabels, fontFile) {
  const labelFilter = withLabels
    ? `,drawtext=${fontFile ? `fontfile='${esc(fontFile)}':` : ""}text='%{expr_int_format\\:${from}+n*${every}\\:d\\:5}':fontcolor=0xece6d5:fontsize=${fontSize}:x=(w-text_w)/2:y=h-${band}+(${band}-text_h)/2`
    : "";
  const vf = `pad=iw:ih+${band}:0:0:color=0x05060a${labelFilter},tile=${cols}x${rows}:padding=4:margin=4:color=0x0a0c13`;
  return spawnSync(
    "ffmpeg",
    ["-y", "-v", "error", "-framerate", "1", "-i", path.join(tmp, "c%05d.png"), "-vf", vf, "-frames:v", "1", sheet],
    { encoding: "utf8" },
  );
}

let labelled = false;
for (const fontFile of [...fontCandidates, null]) {
  const r = tile(true, fontFile);
  if (r.status === 0 && fs.existsSync(sheet)) {
    labelled = true;
    break;
  }
}
if (!labelled) {
  const r = tile(false, null);
  if (r.status !== 0) {
    fs.rmSync(tmp, { recursive: true, force: true });
    fail(`Fix: ffmpeg could not build the contact sheet.\n${r.stderr || "ffmpeg is not installed or not on PATH."}`);
  }
  console.warn("WARN ffmpeg drawtext is unavailable: the sheet has no labels. Cell order is listed in the text file next to it.");
}

fs.writeFileSync(
  labelsFile,
  frames.map((f, i) => `row ${Math.floor(i / cols) + 1} col ${(i % cols) + 1}: frame ${f}`).join("\n") + "\n",
  "utf8",
);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`Wrote ${path.relative(ROOT, sheet)} (${frames.length} cells, ${cols} columns, every ${every} frames, frames ${from}-${to}).`);
