import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const force = args.includes("--force");

if (args.includes("--help")) {
  console.log("Usage: node scripts/fetch-assets.mjs --from <path to a clone of spherex-blink> [--force]");
  process.exit(0);
}

const fromArg = flag("--from") || process.env.SPHEREX_BLINK_REPO;
if (!fromArg) {
  console.error("Fix: pass --from <path to your clone of https://github.com/Unavailable4u/spherex-blink> (or set SPHEREX_BLINK_REPO).");
  process.exit(1);
}
const REPO = path.resolve(fromArg);
const WEB = path.join(REPO, "web");
if (!fs.existsSync(path.join(WEB, "tiles", "regions.json"))) {
  console.error(`Fix: ${WEB} does not look like the web folder of spherex-blink (web/tiles/regions.json not found).`);
  process.exit(1);
}

const evidencePath = path.join(ROOT, "src", "data", "evidence.json");
if (!fs.existsSync(evidencePath)) {
  console.error("Fix: src/data/evidence.json is missing. Run npm run evidence first.");
  process.exit(1);
}
const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));

const jobs = [];
const add = (src, dest, kind) => jobs.push({ src: path.join(WEB, src), dest: path.join(ROOT, "public", dest), kind });

for (const name of fs.readdirSync(path.join(WEB, "assets", "fonts"))) {
  if (name.endsWith(".woff2") || name === "OFL.txt") add(path.join("assets", "fonts", name), path.join("fonts", name), "font");
}
for (const fr of [...evidence.pallas.frames, ...evidence.pallas6mo.frames]) {
  add(fr.file, fr.file, "tile");
}
for (const region of ["pallas", "pallas-6mo"]) {
  const refDir = path.join(WEB, "tiles", region, "ref");
  if (!fs.existsSync(refDir)) continue;
  for (const name of fs.readdirSync(refDir)) add(path.join("tiles", region, "ref", name), path.join("ref", region, name), "ref");
}
for (const region of ["pallas", "pallas-6mo"]) {
  for (const name of ["wcs.json"]) {
    if (fs.existsSync(path.join(WEB, "tiles", region, name))) add(path.join("tiles", region, name), path.join("tiles", region, name), "meta");
  }
}
for (const name of ["milkyway.jpg", "stars.svg"]) {
  if (fs.existsSync(path.join(WEB, "assets", name))) add(path.join("assets", name), path.join("sky", name), "sky");
}
const planetsDir = path.join(WEB, "assets", "planets");
if (fs.existsSync(planetsDir)) {
  for (const name of fs.readdirSync(planetsDir)) add(path.join("assets", "planets", name), path.join("planets", name), "planet");
}
if (fs.existsSync(path.join(WEB, "assets", "credits.json"))) add(path.join("assets", "credits.json"), path.join("sky", "credits.json"), "sky");

const woff2 = Buffer.from("wOF2");
const validFont = (p) => {
  try {
    const b = fs.readFileSync(p);
    return b.length > 1000 && b.subarray(0, 4).equals(woff2);
  } catch {
    return false;
  }
};

const counts = {};
let bytes = 0;
let problems = 0;
for (const job of jobs) {
  const bucket = (counts[job.kind] ||= { copied: 0, kept: 0, missing: 0 });
  if (!fs.existsSync(job.src)) {
    bucket.missing++;
    problems++;
    console.error(`MISSING ${path.relative(REPO, job.src)}`);
    continue;
  }
  const have = fs.existsSync(job.dest);
  const ok = !have ? false : job.kind === "font" ? validFont(job.dest) : fs.statSync(job.dest).size === fs.statSync(job.src).size;
  if (have && ok && !force) {
    bucket.kept++;
    bytes += fs.statSync(job.dest).size;
    continue;
  }
  fs.mkdirSync(path.dirname(job.dest), { recursive: true });
  fs.copyFileSync(job.src, job.dest);
  if (job.kind === "font" && job.dest.endsWith(".woff2") && !validFont(job.dest)) {
    problems++;
    console.error(`INVALID font ${path.relative(ROOT, job.dest)}`);
  }
  bucket.copied++;
  bytes += fs.statSync(job.dest).size;
}

const manifest = {
  from: REPO.split(path.sep).slice(-2).join("/"),
  files: jobs.length,
  megabytes: +(bytes / 1048576).toFixed(1),
  counts,
  complete: problems === 0,
};
fs.mkdirSync(path.join(ROOT, "public"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "public", "assets-manifest.json"), JSON.stringify(manifest, null, 1) + "\n", "utf8");

for (const [kind, c] of Object.entries(counts)) console.log(`${kind.padEnd(7)} copied ${c.copied}, kept ${c.kept}, missing ${c.missing}`);
console.log(`Total ${manifest.files} files, ${manifest.megabytes} MB in public/. ${manifest.complete ? "Complete." : "INCOMPLETE: see the lines above."}`);
process.exit(problems > 0 ? 1 : 0);
