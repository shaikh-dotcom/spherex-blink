import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const final = args.includes("--final");
const fileArg = args.indexOf("--file");
const FILE = path.resolve(fileArg >= 0 ? args[fileArg + 1] : path.join(ROOT, "src", "data", "evidence.json"));

let failures = 0;
let warnings = 0;
const FAIL = (p, msg) => {
  failures++;
  console.log(`FAIL ${p}: ${msg}`);
};
const WARN = (p, msg) => {
  warnings++;
  console.log(`WARN ${p}: ${msg}`);
};

if (!fs.existsSync(FILE)) {
  console.log(`FAIL ${FILE}: file not found. Fix: npm run evidence -- --repo <path to spherex-blink>`);
  process.exit(1);
}

let ev;
try {
  ev = JSON.parse(fs.readFileSync(FILE, "utf8"));
} catch (e) {
  console.log(`FAIL ${FILE}: not valid JSON (${e.message}). Fix: npm run evidence -- --repo <path to spherex-blink>`);
  process.exit(1);
}

const get = (p) => p.split(".").reduce((o, k) => (o === null || o === undefined ? undefined : o[k]), ev);
const required = [
  "meta.sourceCommit",
  "overview.realFields",
  "overview.realFrames",
  "fields",
  "pallas.frames",
  "pallas.target_positions",
  "pallas.validation.summary.rms_offset_px",
  "pallas.pair.a",
  "pallas.pair.b",
  "pallas.pick.ra",
  "pallas.pick.galactic.l",
  "pallas6mo.passes",
  "validationAll.totals.framesChecked",
  "parallax.headline.windowPx",
  "parallax.headline.sixMonthPx",
  "parallax.targetRateArcsecPerHour",
  "parallax.measuredPair.fit.kind",
  "orrery.bodies.earth",
  "flags.csvColumns",
  "acknowledgement",
];
for (const p of required) {
  const v = get(p);
  if (v === undefined || v === null) FAIL(p, "missing. Fix: re-run npm run evidence.");
}

if (ev.meta && ev.meta.sample === true) FAIL("meta.sample", "SAMPLE data. Fix: re-run npm run evidence against a real clone.");

const expect = (p, actual, wanted, label) => {
  if (actual !== wanted) WARN(p, `${label} is ${actual}, the spherex-blink README says ${wanted}. The film shows the captured value; check which one is right.`);
};
if (ev.overview) {
  expect("overview.realFields", ev.overview.realFields, 20, "real field count");
  expect("overview.simulatedFields", ev.overview.simulatedFields, 1, "simulated field count");
  expect("overview.realFrames", ev.overview.realFrames, 219, "real frame count");
}
if (ev.validationAll && ev.validationAll.totals) {
  const t = ev.validationAll.totals;
  expect("validationAll.totals.framesChecked", t.framesChecked, 150, "frames checked");
  expect("validationAll.totals.framesDetected", t.framesDetected, 148, "frames detected");
  expect("validationAll.totals.moversConfirmed", t.moversConfirmed, 107, "frames gone elsewhere");
  if (t.framesDetected > t.framesChecked) FAIL("validationAll.totals", "more frames detected than checked.");
}
if (ev.pallas && ev.pallas.validation && ev.pallas.validation.summary) {
  const s = ev.pallas.validation.summary;
  expect("pallas.validation.summary.frames_detected", s.frames_detected, 13, "Pallas frames detected");
  expect("pallas.validation.summary.rms_offset_px", s.rms_offset_px, 0.57, "Pallas rms offset (px)");
  expect("pallas.validation.summary.rms_offset_arcsec", s.rms_offset_arcsec, 3.5, "Pallas rms offset (arcsec)");
}

if (ev.pallas && ev.pallas.pair && ev.pallas.frames) {
  const ids = new Set(ev.pallas.frames.map((x) => x.id));
  for (const k of ["a", "b"]) if (!ids.has(ev.pallas.pair[k])) FAIL(`pallas.pair.${k}`, "not a frame of the pallas field.");
  if (ev.pallas.pair.source === "rule") WARN("pallas.pair", "chosen by rule, not read from the live app. Confirm that Best pair shows the same two frames, or re-run with --pair.");
}
if (ev.parallax && ev.parallax.table) {
  const rows = ev.parallax.table;
  for (let i = 1; i < rows.length; i++) {
    if (!(rows[i].windowPx < rows[i - 1].windowPx)) FAIL("parallax.table", "shift must fall as distance grows.");
  }
}
if (ev.orrery && ev.orrery.bodies && ev.orrery.bodies.earth && ev.orrery.bodies.earth.length < 10) FAIL("orrery.bodies.earth", "too few positions.");

const text = fs.readFileSync(FILE, "utf8");
if (/\[\[|TODO/.test(text)) FAIL("text", "the strings [[ or TODO appear in the evidence.");
if (/-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|github_pat_/.test(text)) FAIL("text", "something shaped like a secret is in the evidence.");

if (ev.meta && ev.meta.sourceDirty === true) WARN("meta.sourceDirty", "the spherex-blink clone had uncommitted changes under web/tiles, web/js or data-prep when captured.");

if (final) {
  if (ev.meta && ev.meta.sourceCommit === null) FAIL("meta.sourceCommit", "unknown. Capture from a git clone of spherex-blink.");
  const files = new Set();
  for (const fr of (ev.pallas && ev.pallas.frames) || []) files.add(fr.file);
  for (const fr of (ev.pallas6mo && ev.pallas6mo.frames) || []) files.add(fr.file);
  let missing = 0;
  for (const rel of files) if (!fs.existsSync(path.join(ROOT, "public", rel))) missing++;
  if (missing > 0) FAIL("public/tiles", `${missing} of ${files.size} tile files are missing. Fix: npm run assets -- --from <path to spherex-blink>`);
  const pair = ev.pallas && ev.pallas.pair;
  if (pair && pair.source === "rule") WARN("pallas.pair", "still chosen by rule. Confirm it in the live app before the final render.");
}

console.log(`\n${failures} failure(s), ${warnings} warning(s)${final ? " (final mode)" : ""}.`);
process.exit(failures > 0 ? 1 : 0);
