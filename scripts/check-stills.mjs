import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const val = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

if (args.includes("--help")) {
  console.log("Usage: node scripts/check-stills.mjs [--frames 100,1200,...] [--scale 0.5] [--id SpherexFilm] [--browser <chrome path>]");
  process.exit(0);
}

const timeline = fs.readFileSync(path.join(ROOT, "src", "config", "timeline.ts"), "utf8");
const scenes = [...timeline.matchAll(/scene\("(S\d)",\s*"([^"]+)",\s*(\d+),\s*(\d+)\)/g)].map((m) => ({
  id: m[1],
  name: m[2],
  start: Number(m[3]),
  end: Number(m[4]),
}));
const cutBlock = timeline.match(/CUT_FRAMES[^=]*=\s*\[([\s\S]*?)\]/);
const cutFrames = cutBlock ? cutBlock[1].split(",").map((x) => x.trim()).filter(Boolean).map(Number) : [];
const totalMatch = timeline.match(/export const TOTAL = (\d+)/);
const TOTAL = totalMatch ? Number(totalMatch[1]) : 4500;
if (scenes.length === 0) {
  console.error("Fix: could not read SCENES from src/config/timeline.ts.");
  process.exit(1);
}
const sceneOf = (frame) => scenes.find((s) => frame >= s.start && frame <= s.end);

let frames;
if (val("--frames")) {
  frames = val("--frames").split(",").map((x) => Number(x.trim()));
} else {
  const set = new Set([...cutFrames]);
  for (const s of scenes) {
    set.add(s.start);
    set.add(Math.floor((s.start + s.end) / 2));
    set.add(s.end);
  }
  frames = [...set];
}
frames = [...new Set(frames)].filter((f) => Number.isInteger(f) && f >= 0 && f < TOTAL).sort((a, b) => a - b);

const scale = Number(val("--scale") || 0.5);
const id = val("--id") || "SpherexFilm";
const browserExecutable = val("--browser") || process.env.REMOTION_BROWSER || undefined;

function decodePng(buf) {
  let pos = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 8;
  let colorType = 2;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const body = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = body.readUInt32BE(0);
      height = body.readUInt32BE(4);
      bitDepth = body[8];
      colorType = body[9];
    } else if (type === "IDAT") idat.push(body);
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  if (bitDepth !== 8 || !channels) throw new Error(`unsupported PNG (bit depth ${bitDepth}, colour type ${colorType})`);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const src = y * (stride + 1) + 1;
    const dst = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[dst + x - channels] : 0;
      const b = y > 0 ? out[dst - stride + x] : 0;
      const c = x >= channels && y > 0 ? out[dst - stride + x - channels] : 0;
      let v = raw[src + x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[dst + x] = v & 255;
    }
  }
  return { width, height, channels, data: out };
}

function analyse(img) {
  const { width, height, channels, data } = img;
  const luma = (i) => (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
  const band = Math.max(1, Math.round((96 * width) / 1920));
  let sum = 0;
  const bright = { top: 0, bottom: 0, left: 0, right: 0 };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const l = channels >= 3 ? luma(i) : data[i] / 255;
      sum += l;
      if (l > 0.5) {
        if (y < band) bright.top++;
        if (y >= height - band) bright.bottom++;
        if (x < band) bright.left++;
        if (x >= width - band) bright.right++;
      }
    }
  }
  const edge = Math.max(bright.top / (band * width), bright.bottom / (band * width), bright.left / (band * height), bright.right / (band * height));
  return { mean: sum / (width * height), edge };
}

console.log("Bundling...");
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src", "index.ts"), publicDir: path.join(ROOT, "public") });
const composition = await selectComposition({ serveUrl, id, browserExecutable });
const outDir = path.join(ROOT, "out", "stills");
fs.mkdirSync(outDir, { recursive: true });

let failures = 0;
console.log("frame  scene  mean   edge   result");
for (const frame of frames) {
  const file = path.join(outDir, `f${frame}.png`);
  await renderStill({ composition, serveUrl, frame, output: file, scale, browserExecutable });
  const written = fs.existsSync(file) && fs.statSync(file).size > 0;
  let mean = 0;
  let edge = 0;
  const problems = [];
  if (!written) problems.push("not written");
  else {
    const m = analyse(decodePng(fs.readFileSync(file)));
    mean = m.mean;
    edge = m.edge;
    if (frame !== TOTAL - 1 && mean < 0.01) problems.push("blank");
    if (edge > 0.3) problems.push("edge band bright");
  }
  if (problems.length) failures++;
  const s = sceneOf(frame);
  console.log(`${String(frame).padStart(5)}  ${(s ? s.id : "-").padEnd(5)}  ${mean.toFixed(3)}  ${edge.toFixed(3)}  ${problems.length ? problems.join(", ") : "ok"}`);
}
console.log(failures === 0 ? `All ${frames.length} stills passed. Files are in out/stills/.` : `${failures} of ${frames.length} stills failed.`);
process.exit(failures === 0 ? 0 : 1);
