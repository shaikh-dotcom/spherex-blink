import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderFrames, renderMedia, selectComposition } from "@remotion/renderer";

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
    "Usage: node scripts/render.mjs [--4k] [--frames] [--cut30] [--from N --to M] [--allow-sample] [--browser <chrome path>] [--concurrency N] [--preset <x264 preset>] [--crf N] [--hw] [--bitrate <e.g. 80M>]",
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

const PRESETS = ["ultrafast", "superfast", "veryfast", "faster", "fast", "medium", "slow", "slower", "veryslow"];
const hw = has("--hw");
const preset = val("--preset") || (has("--4k") ? "slow" : "veryfast");
const crf = val("--crf") !== undefined ? Number(val("--crf")) : has("--4k") ? 16 : 18;
const bitrate = val("--bitrate") || (has("--4k") ? "80M" : "25M");
if (!PRESETS.includes(preset)) fail(`Fix: --preset must be one of ${PRESETS.join(", ")}.`);
if (!(Number.isFinite(crf) && crf >= 0 && crf <= 51)) fail("Fix: --crf must be a number from 0 to 51.");
if (!/^\d+(\.\d+)?[kKmM]$/.test(bitrate)) fail("Fix: --bitrate must look like 80M or 25000K.");
console.log(hw ? `Encoder: NVENC hardware, video bitrate ${bitrate}.` : `Encoder: x264, preset ${preset}, crf ${crf}.`);

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

function countFrames(file) {
  const r = spawnSync(
    "ffprobe",
    ["-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames", "-of", "default=nw=1:nk=1", file],
    { encoding: "utf8" },
  );
  if (r.status !== 0) return null;
  const n = Number(r.stdout.trim());
  return Number.isFinite(n) ? n : null;
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
  ...(hw ? { hardwareAcceleration: "required", videoBitrate: bitrate } : { crf, x264Preset: preset }),
  pixelFormat: "yuv420p",
  colorSpace: "bt709",
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
  const entries = parts.map((p, i) => {
    const [from, to] = CUT_RANGES[i];
    return `file '${p.replace(/\\/g, "/")}'\noutpoint ${((to - from + 1) / composition.fps).toFixed(6)}`;
  });
  fs.writeFileSync(list, entries.join("\n") + "\n", "utf8");
  const out = freeFile(path.join(OUT, "spherex-blink-film-30s.mp4"));
  const fadeStart = (CUT_TOTAL - 15) / 30;
  let r;
  for (const keepFrames of [["-fps_mode", "passthrough"], ["-vsync", "0"]]) {
    r = spawnSync(
      "ffmpeg",
      [
        "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", list,
        ...keepFrames, "-shortest",
        "-vf", `fade=t=out:st=${fadeStart}:d=0.5:color=0x05060a`,
        "-af", `afade=t=out:st=${fadeStart}:d=0.5`,
        "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", "-pix_fmt", "yuv420p",
        "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
        "-c:a", "aac", "-b:a", "192k", out,
      ],
      { encoding: "utf8" },
    );
    if (r.status === 0) break;
  }
  if (r.status !== 0) fail(`Fix: ffmpeg could not join the parts of the 30 second cut.\n${r.stderr || "ffmpeg is not installed or not on PATH."}`);
  fs.rmSync(dir, { recursive: true, force: true });
  const counted = countFrames(out);
  if (counted === null) console.warn("WARN ffprobe is not available: the frame count of the cut was not verified.");
  else if (counted !== CUT_TOTAL) fail(`Fix: the 30 second cut has ${counted} frames, expected ${CUT_TOTAL}. Check ${path.relative(ROOT, out)}.`);
  console.log(`Wrote ${path.relative(ROOT, out)} (${(fs.statSync(out).size / 1048576).toFixed(1)} MB, ${counted === null ? CUT_TOTAL : counted} frames).`);
  probe(out);
  process.exit(0);
}

const from = val("--from") !== undefined ? Number(val("--from")) : 0;
const to = val("--to") !== undefined ? Number(val("--to")) : TOTAL - 1;
if (!(from >= 0 && to >= from && to < TOTAL)) fail(`Fix: --from and --to must satisfy 0 <= from <= to <= ${TOTAL - 1}.`);
const partial = from !== 0 || to !== TOTAL - 1;

if (has("--frames")) {
  const dir = freeFile(path.join(OUT, "frames"));
  fs.mkdirSync(dir, { recursive: true });
  const wanted = to - from + 1;
  await renderFrames({
    composition,
    serveUrl,
    outputDir: dir,
    imageFormat: "png",
    frameRange: [from, to],
    scale,
    browserExecutable,
    concurrency,
    onStart: () => {},
    onFrameUpdate: (rendered) => {
      process.stdout.write(`\rframes ${String(rendered).padStart(5)} of ${wanted}  ${((rendered / wanted) * 100).toFixed(1).padStart(5)}%`);
    },
  });
  process.stdout.write("\n");
  const written = fs.readdirSync(dir).filter((n) => n.endsWith(".png")).length;
  if (written !== wanted) fail(`Fix: expected ${wanted} PNG frames in ${path.relative(ROOT, dir)} but found ${written}.`);
  console.log(`Wrote ${to - from + 1} PNG frames to ${path.relative(ROOT, dir)}.`);
  process.exit(0);
}

const name = `spherex-blink-film-${suffix}${partial ? `-f${from}-${to}` : ""}.mp4`;
const out = freeFile(path.join(OUT, name));
await renderMedia({ ...common, outputLocation: out, frameRange: [from, to], onProgress: progress("render") });
process.stdout.write("\n");
console.log(`Wrote ${path.relative(ROOT, out)} (${(fs.statSync(out).size / 1048576).toFixed(1)} MB).`);
probe(out);
