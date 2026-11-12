import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "docs", "submission");
const RENDERS = path.join(ROOT, "out");
const FPS = 30;
const CHECK = process.argv.includes("--check");

if (process.argv.includes("--help")) {
  console.log("Usage: node scripts/make-submission-assets.mjs [--check]\nWrites docs/submission/{README.md,captions.srt,captions-30s.srt,credits.md,honesty.md}. --check verifies them and probes any renders in out/.");
  process.exit(0);
}

const fail = (msg) => {
  console.error(`Fix: ${msg}`);
  process.exit(1);
};

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), "utf8");

async function loadTs(rel) {
  const js = ts.transpileModule(read(rel), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "submission-"));
  const file = path.join(dir, `${path.basename(rel, ".ts")}.mjs`);
  fs.writeFileSync(file, js);
  return import(pathToFileURL(file).href);
}

const { copy } = await loadTs("src/config/copy.ts");
const { CUES, SCENES, SCENE_ORDER, TOTAL } = await loadTs("src/config/timeline.ts");
const evidence = JSON.parse(read("src/data/evidence.json"));

const cutBlock = read("scripts/render.mjs").match(/const CUT_RANGES = \[([\s\S]*?)\];/);
if (!cutBlock) fail("scripts/render.mjs has no CUT_RANGES list.");
const CUT_RANGES = [...cutBlock[1].matchAll(/\[(\d+),\s*(\d+)\]/g)].map((m) => [Number(m[1]), Number(m[2])]);
const CUT_TOTAL = CUT_RANGES.reduce((a, [s, e]) => a + (e - s + 1), 0);
if (CUT_TOTAL !== 900) fail(`the 30 second cut must be 900 frames, the range list gives ${CUT_TOTAL}.`);

const constantsCache = {};
function sceneConstants(scene) {
  if (!constantsCache[scene]) {
    const map = {};
    for (const m of read(`src/scenes/${scene}.tsx`).matchAll(/^const ([A-Z][A-Z0-9_]*) = (\d+);/gm)) map[m[1]] = Number(m[2]);
    constantsCache[scene] = map;
  }
  return constantsCache[scene];
}

function item(scene, kind, text, start, end) {
  const stop = typeof end === "string" ? sceneConstants(scene)[end] : end;
  if (!Number.isFinite(start) || !Number.isFinite(stop) || stop <= start) {
    fail(`${scene} ${kind} "${[].concat(text).join(" ")}" has no usable frame range (${start} to ${end}).`);
  }
  return { scene, kind, lines: [].concat(text), start, end: stop };
}

const { brand, s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, urls } = copy;
const c = CUES;

const ITEMS = [
  item("S0Hook", "caption", s0.caption, c.s0.caption, "CAPTION_END"),
  item("S0Hook", "callout", s0.calloutJump, c.s0.calloutJump, "CALLOUT_END"),
  item("S1Title", "title", brand.eyebrow, c.s1.eyebrow, SCENES.S1.end + 1),
  item("S1Title", "title", brand.name, c.s1.lockup, SCENES.S1.end + 1),
  item("S1Title", "title", s1.tagline, c.s1.tagline, SCENES.S1.end + 1),
  item("S2Data", "caption", s2.caption, c.s2.caption, "CAPTION_END"),
  item("S2Data", "caption", s2.captionPatch, c.s2.captionPatch, "PATCH_CAPTION_END"),
  item("S3Blink", "callout", s3.calloutStars, c.s3.calloutStars, "STARS_END"),
  item("S3Blink", "callout", s3.calloutJump, c.s3.calloutJump, "JUMP_END"),
  item("S3Blink", "caption", s3.captionPluto, c.s3.captionPluto, "PLUTO_END"),
  item("S3Blink", "callout", s3.calloutAmber, c.s3.calloutAmber, "AMBER_END"),
  item("S3Blink", "caption", s3.captionPair, c.s3.captionPair, "PAIR_END"),
  item("S3Blink", "callout", s3.calloutWarn, c.s3.calloutWarn, "WARN_END"),
  item("S4Inspect", "caption", s4.caption, c.s4.caption, "CAPTION_END"),
  item("S4Inspect", "callout", s4.calloutBlind, c.s4.calloutBlind, "BLIND_END"),
  item("S4Inspect", "callout", s4.calloutSnap, c.s4.calloutSnap, "SNAP_END"),
  item("S4Inspect", "callout", s4.calloutMover, c.s4.calloutMover, "MOVER_END"),
  item("S4Inspect", "caption", s4.captionKnown, c.s4.captionKnown, "KNOWN_CAPTION_END"),
  item("S5Check", "caption", s5.caption, c.s5.caption, "CAPTION_END"),
  item("S5Check", "callout", s5.calloutChecked, c.s5.calloutChecked, "CHECKED_END"),
  item("S5Check", "caption", s5.captionFields, c.s5.captionFields, "FIELDS_END"),
  item("S5Check", "caption", s5.captionStrict, c.s5.captionStrict, "STRICT_END"),
  item("S6PlanetX", "caption", s6.caption, c.s6.caption, "CAPTION_END"),
  item("S6PlanetX", "callout", s6.calloutShift, c.s6.calloutShift, "SHIFT_END"),
  item("S6PlanetX", "callout", s6.calloutSix, c.s6.calloutSix, "SIX_END"),
  item("S6PlanetX", "caption", s6.captionMeasure, c.s6.captionMeasure, "MEASURE_END"),
  item("S6PlanetX", "callout", s6.calloutNear, c.s6.calloutNear, "NEAR_END"),
  item("S6PlanetX", "caption", s6.captionHonest, c.s6.captionHonest, "HONEST_END"),
  item("S7Flag", "caption", s7.caption, c.s7.caption, "CAPTION_END"),
  item("S7Flag", "callout", s7.calloutCross, c.s7.calloutCross, "CROSS_END"),
  item("S7Flag", "caption", s7.captionExport, c.s7.captionExport, "EXPORT_CAPTION_END"),
  item("S7Flag", "caption", s7.captionState, c.s7.captionState, "STATE_CAPTION_END"),
  item("S8Limits", "caption", s8.caption, c.s8.caption, c.s8.captionHatch),
  item("S8Limits", "caption", s8.captionHatch, c.s8.captionHatch, c.s8.captionClaim),
  item("S8Limits", "caption", s8.captionClaim, c.s8.captionClaim, "LIFT_START"),
  item("S9Outro", "title", [s9.lockup, s9.tagline], c.s9.lockup, TOTAL),
  item("S9Outro", "title", [urls.live, urls.repo], c.s9.link, TOTAL),
  item("S9Outro", "title", s9.tail, c.s9.link + 30, TOTAL),
];

function slices(list) {
  const cuts = [...new Set(list.flatMap((i) => [i.start, i.end]))].sort((a, b) => a - b);
  const out = [];
  for (let n = 0; n + 1 < cuts.length; n++) {
    const a = cuts[n];
    const b = cuts[n + 1];
    const active = list.filter((i) => i.start <= a && i.end >= b).sort((x, y) => x.start - y.start);
    if (active.length === 0) continue;
    const text = active.flatMap((i) => i.lines).join("\n");
    const prev = out[out.length - 1];
    if (prev && prev.end === a && prev.text === text) prev.end = b;
    else out.push({ start: a, end: b, text });
  }
  return out;
}

function clipToCut(list) {
  const out = [];
  let offset = 0;
  for (const [from, to] of CUT_RANGES) {
    const stop = to + 1;
    for (const i of list) {
      const s = Math.max(i.start, from);
      const e = Math.min(i.end, stop);
      if (e > s) out.push({ ...i, start: offset + s - from, end: offset + e - from });
    }
    offset += stop - from;
  }
  return out;
}

const stamp = (frame) => {
  const ms = Math.round((frame * 1000) / FPS);
  const p = (n, w) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000), 2)}:${p(Math.floor(ms / 60000) % 60, 2)}:${p(Math.floor(ms / 1000) % 60, 2)},${p(ms % 1000, 3)}`;
};

const toSrt = (cues) => cues.map((q, n) => `${n + 1}\n${stamp(q.start)} --> ${stamp(q.end)}\n${q.text}\n`).join("\n");

const seconds = (frame) => (frame / FPS).toFixed(2);

const { overview } = evidence;
const { totals } = evidence.validationAll;
const ceres = evidence.validationAll.fields.find((x) => x.id === "ceres");
const pallas = evidence.pallas.validation.summary;
const bandCounts = evidence.fields.map((x) => x.bands.length);
const minBands = Math.min(...bandCounts);
const maxBands = Math.max(...bandCounts);
const acknowledgement = evidence.acknowledgement;
const tagline = s1.tagline.join(" ");

const sceneLine = {
  S0: "A field of stars that stand still, and one dot that jumps.",
  S1: `Title card: ${brand.name}. ${tagline}`,
  S2: `SPHEREx scans the whole sky in 102 infrared colours. The app holds ${overview.realFields} real fields and ${overview.realFrames} real frames; each field shows a handful of colours seen on different days.`,
  S3: "The blink comparator on real frames of one patch of sky. Stars stay put, one dot jumps. The Best pair button picks two frames days apart in similar colour.",
  S4: "Known objects off, hunt blind, click the dot. The app snaps to the centroid and checks that the dot is gone from the other frames, then checks it against the known layer.",
  S5: `The reality check finds the known asteroid in the pixels: Pallas in ${pallas.frames_detected} of ${pallas.frames_checked} frames, ${totals.framesDetected} of ${totals.framesChecked} across ${totals.fields} asteroid fields, and ${totals.moversConfirmed} of ${totals.framesChecked} under the stricter check.`,
  S6: "Why a distant planet barely moves while Earth does, parallax from Earth's orbit, and the Planet X lab fitting a distance to a measured mover. The measured mover is the asteroid Pallas and the app's verdict is a nearby object.",
  S7: "Flag it, cross-matched to known objects, export as CSV or JSON. Flags are saved in this browser only.",
  S8: "What is real, what is simulated, what is limited. No coverage is a hatch, not black. Nothing here claims a detection.",
  S9: "Lockup, the live app link, the repository link and the data acknowledgement.",
};

const sceneRows = SCENE_ORDER.map((key) => {
  const s = SCENES[key];
  return `| ${s.id} ${s.name} | ${seconds(s.start)} to ${seconds(s.end + 1)} | ${s.start} to ${s.end} | ${sceneLine[key]} |`;
}).join("\n");

const cutRows = CUT_RANGES.map(([from, to]) => {
  const scene = SCENE_ORDER.map((k) => SCENES[k]).find((s) => from >= s.start && from <= s.end);
  return `| ${scene.id} ${scene.name} | ${from} to ${to} | ${seconds(from)} to ${seconds(to + 1)} |`;
}).join("\n");

const readme = `# SPHEREx Blink Comparator: demo film

NASA Space Apps 2026, challenge "Planet X and SPHEREx".

${tagline}

## What the video shows

A ${seconds(TOTAL)} second film of the ${brand.name} web app working on real SPHEREx Quick Release 2 data. It follows the app's own workflow: flip between infrared observations of one patch of sky taken on different days, spot the dot that moves, check it against the pixels and the known sky, see why a distant body would show parallax from Earth's orbit, flag a candidate and export it. It ends on what is real, what is simulated and what is limited. The app is a prototype and the film claims no discovery.

Live app: ${urls.live}
Repository: ${urls.repo}

## Files

| File | What | Frames | Length |
|---|---|---|---|
| out/spherex-blink-film-1080p.mp4 | Full film, 1920x1080, H.264, AAC audio | ${TOTAL} | ${seconds(TOTAL)} s |
| out/spherex-blink-film-4k.mp4 | Same film at 3840x2160 | ${TOTAL} | ${seconds(TOTAL)} s |
| out/spherex-blink-film-30s.mp4 | Short cut of eight segments of the film | ${CUT_TOTAL} | ${seconds(CUT_TOTAL)} s |
| docs/submission/captions.srt | English subtitles for the full film | | |
| docs/submission/captions-30s.srt | English subtitles for the 30 second cut | | |

The out/ folder is build output and is not committed. Rebuild with \`npm run assets -- --from ../spherex-blink\`, \`npm run sfx\`, then \`node scripts/render.mjs\`, \`node scripts/render.mjs --4k\` and \`node scripts/render.mjs --cut30\`.

The film has no spoken narration. Both subtitle files mirror the text shown on screen (captions, callouts, title and end card). The long data acknowledgement on the end card is not subtitled; its full text is in credits.md.

## Scenes (seconds = frame / ${FPS})

| Scene | Seconds | Frames | Shows |
|---|---|---|---|
${sceneRows}

## The 30 second cut

| From scene | Frames | Seconds in the full film |
|---|---|---|
${cutRows}

## Space Apps demo requirements

Read on 11 November 2026 from the Project Submission Guide on spaceappschallenge.org (the 2025 edition, dated 3 October 2025; the 2026 edition is scheduled for 13 November 2026):

- The demo is required and is either a video up to 30 seconds or a slide deck of up to seven slides.
- Video demos must include English subtitles.
- The demo is hosted on an external site (for example YouTube or Google Drive) and the link must be public with no login.
- Projects that exceed the length limits are not eligible for Global Judging.

For that reason the 30 second cut with captions-30s.srt is the file to use as the project demo, and the ${seconds(TOTAL)} second film is the full walkthrough to link from the detailed project description. Read the 2026 guide on 13 November and confirm the limits have not changed before submitting.

Submission window for 2026 (spaceappschallenge.org/2026): opens Saturday 14 November at 9:00 a.m. and closes Sunday 15 November at 11:59 p.m., local time of the team's event.

The project form also has a Use of Artificial Intelligence field; answer it on the project page according to the team's actual use.

## Companion documents

- credits.md: data acknowledgement, picture credits, fonts, links
- honesty.md: what is real, simulated and limited, and what the film does not claim
`;

const credits = JSON.parse(read("public/sky/credits.json"));
const refCredits = new Map();
for (const dir of ["pallas", "pallas-6mo"]) {
  const ref = JSON.parse(read(`public/ref/${dir}/ref.json`));
  for (const layer of ref.layers) refCredits.set(layer.label, layer.credit);
}
const pictureRows = [
  ...[...refCredits].map(([label, credit]) => `| ${label} | ${credit} |`),
  ...Object.entries(credits.planets).map(([name, v]) => `| ${name[0].toUpperCase()}${name.slice(1)} | ${v.credit} |`),
  `| Milky Way panorama | ${credits.milkyway.credit} |`,
].join("\n");

const creditsDoc = `# Credits and data acknowledgement

## Data

${evidence.meta.dataRelease}, retrieved from the NASA/IPAC Infrared Science Archive (IRSA).

Acknowledgement text, shown on the end card of the film and reproduced here exactly:

> ${acknowledgement}

## Pictures, as credited by the app

| Picture | Credit |
|---|---|
${pictureRows}

## Fonts

CMU Serif and CMU Typewriter Text (Computer Modern Unicode), used under the SIL Open Font License, Version 1.1. The licence text is in public/fonts/OFL.txt, copied there by \`npm run assets\`.

## Links

- Live app: ${urls.live}
- Repository: ${urls.repo}
`;

const honesty = `# Honesty statement

${brand.name} is a prototype working on a sample of the sky. It does not claim a discovery.

## What is real

- Real SPHEREx data from Quick Release 2: ${overview.realFields} real fields and ${overview.realFrames} real frames, shown as the app shows them.
- The reality check finds a known asteroid in the pixels. Pallas is found on its predicted spot in ${pallas.frames_detected} of ${pallas.frames_checked} frames (rms offset ${pallas.rms_offset_px} px). Across ${totals.fields} asteroid fields it is found in ${totals.framesDetected} of ${totals.framesChecked} frames.
- Every number on screen is read from evidence captured from the app's own code (src/data/evidence.json, app commit ${evidence.meta.sourceCommit.slice(0, 7)}).

## What is simulated

- ${overview.simulatedFields} practice field with ${overview.simulatedFrames} frames is simulated and is always labelled "${copy.badges.simulated}" on screen.
- The Planet X lab's tracks at a chosen distance are simulated and carry the app's label "Planet X @ d AU (simulated)".
- The opening star field and the parallax diagram are illustrations and are labelled as such.

## What is limited

- Each field holds only ${minBands} to ${maxBands} of the six detectors, a handful of the 102 colours. The data is a sample of the sky, not the whole survey.
- The stricter check (the dot is gone from that pixel in the other frames too) passes in ${totals.moversConfirmed} of ${totals.framesChecked} frames, not all of them.
- Ceres: the known asteroid is found on its predicted spot in ${ceres.framesDetected} of ${ceres.framesChecked} frames, but the stricter check passes in ${ceres.moversConfirmed} of ${ceres.framesChecked} even though Ceres moves far. This is not yet explained. The film's limits scene reports the overall ${totals.moversConfirmed} of ${totals.framesChecked}, which includes it, and gives Ceres no row of its own.
- Slow asteroids barely move in their window, so they cannot pass the stricter check.
- Tiles are 8-bit stretched pictures, so brightness is approximate.
- No coverage is shown as a hatch, never as black.
- Flags are saved in this browser only.

## The Planet X result

The measured pair in the film is the asteroid Pallas. The app's verdict on it is "Nearby object: asteroid or comet", and the film shows that verdict. It shows no distant-body fit. A distant verdict in the app reads as a candidate for follow-up, never as a detection.

## What the film does not claim

- It does not claim a discovery, a detected planet, or that the tool finds unknown objects.
- It says nothing about SPHEREx beyond the app's own text.
- It does not present any invented statistic, date or coordinate.
`;

if (!CHECK) {
  fs.mkdirSync(OUT, { recursive: true });
  const full = slices(ITEMS);
  const cut = slices(clipToCut(ITEMS));
  fs.writeFileSync(path.join(OUT, "README.md"), readme);
  fs.writeFileSync(path.join(OUT, "captions.srt"), toSrt(full));
  fs.writeFileSync(path.join(OUT, "captions-30s.srt"), toSrt(cut));
  fs.writeFileSync(path.join(OUT, "credits.md"), creditsDoc);
  fs.writeFileSync(path.join(OUT, "honesty.md"), honesty);
  console.log(`Wrote docs/submission: captions.srt (${full.length} cues), captions-30s.srt (${cut.length} cues), README.md, credits.md, honesty.md.`);
  process.exit(0);
}

let failures = 0;
const bad = (msg) => {
  failures++;
  console.error(`FAIL ${msg}`);
};
const ok = (msg) => console.log(`ok   ${msg}`);

const docs = ["README.md", "captions.srt", "captions-30s.srt", "credits.md", "honesty.md"];
const text = {};
for (const name of docs) {
  const file = path.join(OUT, name);
  if (!fs.existsSync(file)) bad(`docs/submission/${name} is missing. Run npm run submission.`);
  else text[name] = fs.readFileSync(file, "utf8");
}

const expected = {
  "README.md": readme,
  "captions.srt": toSrt(slices(ITEMS)),
  "captions-30s.srt": toSrt(slices(clipToCut(ITEMS))),
  "credits.md": creditsDoc,
  "honesty.md": honesty,
};
for (const name of docs) {
  if (text[name] === undefined) continue;
  if (text[name] === expected[name]) ok(`${name} is current`);
  else bad(`${name} is out of date. Run npm run submission.`);
}

if (text["credits.md"]) {
  if (text["credits.md"].includes(acknowledgement)) ok("credits.md holds the acknowledgement verbatim");
  else bad("credits.md does not hold the acknowledgement verbatim");
  for (const u of Object.values(urls)) if (!text["credits.md"].includes(u)) bad(`credits.md lacks ${u}`);
}

const lastEnd = (srt) => {
  const ends = [...srt.matchAll(/--> (\d\d):(\d\d):(\d\d),(\d\d\d)/g)].map((m) => (+m[1] * 3600 + +m[2] * 60 + +m[3]) * 1000 + +m[4]);
  return Math.max(...ends);
};
if (text["captions.srt"]) {
  if (lastEnd(text["captions.srt"]) <= 150000) ok("captions.srt ends within 150 s");
  else bad("captions.srt runs past 150 s");
}
if (text["captions-30s.srt"]) {
  if (lastEnd(text["captions-30s.srt"]) <= 30000) ok("captions-30s.srt ends within 30 s");
  else bad("captions-30s.srt runs past 30 s");
}

const banned = /\b(discover(y|ed|ies)|confirmed|proves?|found planet x|detected a planet|ai finds planets)\b/i;
for (const name of ["README.md", "captions.srt", "captions-30s.srt", "credits.md"]) {
  if (text[name] && banned.test(text[name].replace(/\bno discovery\b/gi, ""))) bad(`${name} uses a word the honesty rule forbids`);
}
if (text["honesty.md"] && !/prototype/i.test(text["honesty.md"])) bad("honesty.md lacks the prototype statement");

function probe(file, wantFrames, wantWidth) {
  const full = path.join(RENDERS, file);
  if (!fs.existsSync(full)) {
    console.log(`skip ${file} (not rendered)`);
    return;
  }
  let info;
  try {
    info = JSON.parse(
      execFileSync("ffprobe", ["-v", "error", "-count_frames", "-show_entries", "stream=codec_type,codec_name,pix_fmt,width,r_frame_rate,nb_read_frames:format=duration", "-of", "json", full], { encoding: "utf8" }),
    );
  } catch {
    bad(`${file} cannot be read by ffprobe`);
    return;
  }
  const v = info.streams.find((s) => s.codec_type === "video");
  const a = info.streams.find((s) => s.codec_type === "audio");
  const duration = Number(info.format.duration);
  if (!v || v.codec_name !== "h264") bad(`${file} video is not H.264`);
  else if (v.pix_fmt !== "yuv420p") bad(`${file} pix_fmt is ${v.pix_fmt}`);
  else if (v.r_frame_rate !== "30/1") bad(`${file} frame rate is ${v.r_frame_rate}`);
  else if (Number(v.nb_read_frames) !== wantFrames) bad(`${file} has ${v.nb_read_frames} frames, expected ${wantFrames}`);
  else if (v.width !== wantWidth) bad(`${file} width is ${v.width}, expected ${wantWidth}`);
  else if (!a || a.codec_name !== "aac") bad(`${file} has no AAC audio`);
  else if (Math.abs(duration - wantFrames / FPS) > 0.1) bad(`${file} lasts ${duration.toFixed(3)} s, expected ${(wantFrames / FPS).toFixed(2)} s`);
  else ok(`${file}: ${v.nb_read_frames} frames, ${duration.toFixed(3)} s, h264 yuv420p, aac`);
}
probe("spherex-blink-film-1080p.mp4", TOTAL, 1920);
probe("spherex-blink-film-4k.mp4", TOTAL, 3840);
probe("spherex-blink-film-30s.mp4", CUT_TOTAL, 1920);

if (failures > 0) {
  console.error(`${failures} failure(s).`);
  process.exit(1);
}
console.log("Submission files are consistent.");
