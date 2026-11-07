import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

if (args.includes("--help")) {
  console.log("Usage: node scripts/capture-evidence.mjs --repo <path to a clone of spherex-blink> [--out <file>] [--band D1] [--pair idA,idB]");
  process.exit(0);
}

const repoArg = flag("--repo") || process.env.SPHEREX_BLINK_REPO;
if (!repoArg) {
  console.error("Fix: pass --repo <path to your clone of https://github.com/Unavailable4u/spherex-blink> (or set SPHEREX_BLINK_REPO).");
  process.exit(1);
}
const REPO = path.resolve(repoArg);
const TILES = path.join(REPO, "web", "tiles");
const OUT = path.resolve(flag("--out") || path.join(ROOT, "src", "data", "evidence.json"));
const BAND = flag("--band") || "D1";
const PAIR = flag("--pair");

const fail = (msg) => {
  console.error(`Fix: ${msg}`);
  process.exit(1);
};

for (const rel of ["web/tiles/regions.json", "web/tiles/orrery.json", "web/js/parallax.js", "web/js/wcs.js", "web/tiles/pallas/manifest.json"]) {
  if (!fs.existsSync(path.join(REPO, rel))) fail(`${rel} was not found under ${REPO}. Is --repo a full clone of spherex-blink?`);
}

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const Parallax = require(path.join(REPO, "web", "js", "parallax.js"));
const WCS = require(path.join(REPO, "web", "js", "wcs.js"));

const round = (x, n) => (x === null || x === undefined || Number.isNaN(x) ? null : +x.toFixed(n));

const git = spawnSync("git", ["-C", REPO, "rev-parse", "HEAD"], { encoding: "utf8" });
const dirty = spawnSync("git", ["-C", REPO, "status", "--porcelain", "--", "web/tiles", "web/js", "data-prep"], { encoding: "utf8" });
const sourceCommit = git.status === 0 ? git.stdout.trim() : null;
const sourceDirty = dirty.status === 0 ? dirty.stdout.trim().length > 0 : null;

const regionsFile = readJson(path.join(TILES, "regions.json"));
const orrery = readJson(path.join(TILES, "orrery.json"));
Parallax.setData(orrery);

const fields = regionsFile.regions.map((r) => {
  const man = readJson(path.join(TILES, r.id, "manifest.json"));
  return {
    id: r.id,
    title: r.title,
    kind: r.kind,
    target: r.target || null,
    frames: r.frames,
    bands: r.bands,
    epochs: r.epochs,
    ra: man.center.ra,
    dec: man.center.dec,
    sizeDeg: man.size_deg,
  };
});

const realFields = fields.filter((x) => x.kind === "real");
const simulatedFields = fields.filter((x) => x.kind !== "real");
const overview = {
  realFields: realFields.length,
  simulatedFields: simulatedFields.length,
  realFrames: realFields.reduce((a, x) => a + x.frames, 0),
  simulatedFrames: simulatedFields.reduce((a, x) => a + x.frames, 0),
  asteroidFields: realFields.filter((x) => x.target).length,
  passes: ["2025-04", "2025-10", "2026-04"],
};

const lamOf = (fr, wcs) => {
  if (fr.wavelength_um) return { v: fr.wavelength_um, est: false };
  const p = fr.wavelength_plane;
  if (!p) return null;
  const v = p.c0 + (p.per_col * wcs.width) / 2 + (p.per_row * wcs.height) / 2;
  return v > 0 ? { v, est: true } : null;
};

function loadField(id) {
  const dir = path.join(TILES, id);
  const man = readJson(path.join(dir, "manifest.json"));
  const wcsJson = readJson(path.join(dir, "wcs.json"));
  const sky = fs.existsSync(path.join(dir, "sky.json")) ? readJson(path.join(dir, "sky.json")) : null;
  const val = fs.existsSync(path.join(dir, "validation.json")) ? readJson(path.join(dir, "validation.json")) : null;
  const wcs = WCS.make(wcsJson);
  const frames = man.frames
    .map((fr) => {
      const lam = lamOf(fr, wcs);
      return {
        id: fr.id,
        band: fr.band,
        epoch: fr.epoch,
        utc: fr.utc,
        mjd: fr.mjd,
        coverage: fr.coverage,
        wavelengthUm: lam ? round(lam.v, 4) : null,
        wavelengthEstimated: lam ? lam.est : null,
        bkg: fr.bkg,
        unit: fr.unit,
        file: `tiles/${id}/${fr.path}`,
      };
    })
    .sort((a, b) => a.mjd - b.mjd);
  return { id, dir, man, wcsJson, wcs, sky, val, frames };
}

const pallas = loadField("pallas");
const six = loadField("pallas-6mo");
const pixscale = (pallas.man.size_deg * 3600) / pallas.wcsJson.width;

const bandFrames = pallas.frames.filter((fr) => fr.band === BAND && pallas.sky && pallas.sky.frames[fr.id]);
if (bandFrames.length < 2) fail(`band ${BAND} of the pallas field has fewer than two frames with sky data.`);

function pickPair(list) {
  let best = null;
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const A = list[i];
      const B = list[j];
      const dt = Math.abs(A.mjd - B.mjd);
      const dl = A.wavelengthUm && B.wavelengthUm ? Math.abs(A.wavelengthUm - B.wavelengthUm) : null;
      const rel = dl === null ? null : dl / ((A.wavelengthUm + B.wavelengthUm) / 2);
      const ov = Math.min(A.coverage, B.coverage);
      const far = dt >= 0.5;
      const wf = rel === null ? 0.6 : 1 / (1 + Math.pow(rel / 0.1, 2));
      const tf = 0.7 + 0.3 * Math.min(1, dt / 5);
      const score = (far ? 1 : 0.02) * ov * wf * tf * (ov < 0.3 ? 0.3 : 1);
      if (!best || score > best.score) best = { a: A, b: B, score };
    }
  }
  return best;
}

let pairSource = "rule";
let pair;
if (PAIR) {
  const [ia, ib] = PAIR.split(",");
  const a = bandFrames.find((x) => x.id === ia);
  const b = bandFrames.find((x) => x.id === ib);
  if (!a || !b) fail(`--pair ${PAIR}: both ids must be frames of band ${BAND} of the pallas field (${bandFrames.map((x) => x.id).join(", ")}).`);
  pair = { a, b };
  pairSource = "override";
} else {
  pair = pickPair(bandFrames);
}

const target = {};
for (const fr of pallas.frames) {
  const t = pallas.sky && pallas.sky.target ? pallas.sky.target[fr.id] : null;
  if (!t) continue;
  const p = pallas.wcs.toPix(t[0], t[1]);
  target[fr.id] = { ra: t[0], dec: t[1], col: round(p.col, 2), row: round(p.row, 2) };
}

const validation = pallas.val
  ? {
      summary: pallas.val.summary,
      frames: Object.fromEntries(
        Object.entries(pallas.val.frames).map(([id, v]) => [
          id,
          {
            band: v.band,
            pred: v.pred,
            centroid: v.centroid,
            offsetPx: v.offset_px,
            peak: v.peak,
            median: v.median,
            snr: v.snr,
            detected: v.detected,
            absentElsewhere: v.absent_elsewhere,
          },
        ]),
      ),
    }
  : null;
if (!validation) fail("tiles/pallas/validation.json is missing. Run data-prep/verify_target.py --region pallas in spherex-blink first.");

const bandInfo = pallas.man.bands ? pallas.man.bands[BAND] : null;
const stretch = bandInfo && typeof bandInfo === "object" ? bandInfo.stretch || bandInfo : null;

function fluxOf(peak, frame) {
  if (!stretch || stretch.lo === undefined || stretch.hi === undefined || stretch.a === undefined) return null;
  const y = peak / 255;
  const x = stretch.lo + (stretch.hi - stretch.lo) * stretch.a * Math.sinh(y * Math.asinh(1 / stretch.a)) + frame.bkg;
  return { value: +x.toPrecision(3), unit: frame.unit || "MJy / sr", lowerLimit: peak >= 255 };
}

const vA = validation.frames[pair.a.id];
const vB = validation.frames[pair.b.id];
if (!vA || !vB) fail("the chosen pair has no entry in validation.json.");

const skyA = pallas.wcs.toSky(vA.centroid[0], vA.centroid[1]);
const skyB = pallas.wcs.toSky(vB.centroid[0], vB.centroid[1]);
const gal = WCS.galactic(skyA.ra, skyA.dec);
const ecl = WCS.ecliptic(skyA.ra, skyA.dec);
const galCheck = WCS.galactic(266.405, -28.936);
if (Math.abs(((galCheck.l + 180) % 360) - 180) > 0.05 || Math.abs(galCheck.b) > 0.05) fail("self-check failed: the galactic centre did not map to l=0, b=0.");

const sameVisitHours = 1;
const otherFrames = bandFrames.filter((fr) => fr.id !== pair.a.id && Math.abs(fr.mjd - pair.a.mjd) * 24 >= sameVisitHours);

const pick = {
  frame: pair.a.id,
  band: BAND,
  utc: pair.a.utc,
  wavelengthUm: pair.a.wavelengthUm,
  pixel: [Math.round(vA.centroid[0]), Math.round(vA.centroid[1])],
  centroid: vA.centroid,
  predicted: vA.pred,
  ra: round(skyA.ra, 6),
  dec: round(skyA.dec, 6),
  raHms: WCS.hms(skyA.ra),
  decDms: WCS.dms(skyA.dec),
  galactic: { l: round(gal.l, 4), b: round(gal.b, 4) },
  ecliptic: { lon: round(ecl.lon, 4), lat: round(ecl.lat, 4) },
  snr: vA.snr,
  peak8bit: vA.peak,
  flux: fluxOf(vA.peak, pallas.man.frames.find((x) => x.id === pair.a.id)),
  moverCheck: {
    otherFrames: otherFrames.length,
    goneFromAll: vA.absentElsewhere === true,
    basis: "validation.json absent_elsewhere for the picked frame",
  },
};

const ra0 = pallas.sky.field.ra;
const dec0 = pallas.sky.field.dec;
const t0 = bandFrames[0].mjd;
const t1 = bandFrames[bandFrames.length - 1].mjd;
const floor = pallas.val.summary.rms_offset_px / Math.SQRT2;
const sigPx = (snr) => Math.hypot(floor, 1.5 / Math.max(3, snr));
const sigArcsec = Math.hypot(sigPx(30), sigPx(30)) * pixscale;

const DISTANCES = [30, 50, 100, 200, 300, 500, 750, 1000];
const SIX_MONTHS_DAYS = 182.6;
const shiftTable = DISTANCES.map((d) => {
  const w = Parallax.offset(d, t0, t1, ra0, dec0);
  const s = Parallax.offset(d, t0, t0 + SIX_MONTHS_DAYS, ra0, dec0);
  if (!w || !s) fail(`orrery.json does not cover the field dates for ${d} AU.`);
  const wTot = Math.hypot(w.e, w.n);
  const sTot = Math.hypot(s.e, s.n);
  return {
    distanceAu: d,
    windowArcsec: round(wTot, 2),
    windowPx: round(wTot / pixscale, 2),
    sixMonthArcsec: round(sTot, 1),
    sixMonthPx: round(sTot / pixscale, 1),
    sixMonthOverWindow: round(sTot / wTot, 1),
  };
});

const trackIds = bandFrames.filter((fr) => pallas.sky.target && pallas.sky.target[fr.id]);
const trackOffset = WCS.offset(...pallas.sky.target[trackIds[0].id], ...pallas.sky.target[trackIds[trackIds.length - 1].id]);
const targetRate = Math.hypot(trackOffset.e, trackOffset.n) / ((trackIds[trackIds.length - 1].mjd - trackIds[0].mjd) * 24);

const meas = WCS.offset(skyA.ra, skyA.dec, skyB.ra, skyB.dec);
const sigDiffArcsec = Math.hypot(sigPx(vA.snr), sigPx(vB.snr)) * pixscale;
const fit = Parallax.fit(meas, pair.a.mjd, pair.b.mjd, ra0, dec0, sigDiffArcsec);
const detectLimit = Parallax.detectLimit(t0, t1, ra0, dec0, sigArcsec);

const parallax = {
  pixscaleArcsec: round(pixscale, 4),
  window: {
    from: bandFrames[0].utc,
    to: bandFrames[bandFrames.length - 1].utc,
    mjdFrom: t0,
    mjdTo: t1,
    days: round(t1 - t0, 2),
  },
  sixMonthDays: SIX_MONTHS_DAYS,
  sigmaArcsec: round(sigArcsec, 2),
  detectLimitAu: round(detectLimit, 0),
  table: shiftTable,
  headline: shiftTable.find((x) => x.distanceAu === 500),
  targetRateArcsecPerHour: round(targetRate, 1),
  measuredPair: {
    a: pair.a.id,
    b: pair.b.id,
    daysApart: round(Math.abs(pair.b.mjd - pair.a.mjd), 2),
    measuredArcsec: round(Math.hypot(meas.e, meas.n), 1),
    measuredPx: round(Math.hypot(meas.e, meas.n) / pixscale, 1),
    sigmaArcsec: round(sigDiffArcsec, 2),
    fit: fit
      ? {
          kind: fit.kind,
          distanceAu: round(fit.d, 1),
          rangeAu: [round(fit.lo, 1), round(fit.hi, 1)],
          openHigh: fit.openHi,
          limitAu: round(fit.limit, 0),
          predictedAtDminArcsec: fit.predicted ? round(Math.hypot(fit.predicted.e, fit.predicted.n), 0) : null,
          dminAu: Parallax.DMIN,
        }
      : null,
  },
};

const pairInfo = {
  source: pairSource,
  band: BAND,
  a: pair.a.id,
  b: pair.b.id,
  daysApart: round(Math.abs(pair.b.mjd - pair.a.mjd), 3),
  wavelengthRelativeDifference:
    pair.a.wavelengthUm && pair.b.wavelengthUm
      ? round(Math.abs(pair.a.wavelengthUm - pair.b.wavelengthUm) / ((pair.a.wavelengthUm + pair.b.wavelengthUm) / 2), 4)
      : null,
  sharedFootprintUpperBound: round(Math.min(pair.a.coverage, pair.b.coverage), 3),
  note: "Shared footprint is bounded by the smaller per-frame coverage. Confirm in the live app that Best pair picks the same two frames; if not, re-run with --pair idA,idB.",
};

const validationAll = [];
for (const fld of realFields) {
  const vp = path.join(TILES, fld.id, "validation.json");
  if (!fs.existsSync(vp)) continue;
  const v = readJson(vp);
  validationAll.push({
    id: fld.id,
    target: v.summary.target,
    framesChecked: v.summary.frames_checked,
    framesDetected: v.summary.frames_detected,
    moversConfirmed: v.summary.movers_confirmed,
    rmsOffsetPx: v.summary.rms_offset_px,
  });
}
const sum = (k) => validationAll.reduce((a, x) => a + x[k], 0);
const validationTotals = {
  fields: validationAll.length,
  framesChecked: sum("framesChecked"),
  framesDetected: sum("framesDetected"),
  moversConfirmed: sum("moversConfirmed"),
};

const STEP = 5;
const sample = (arr) => arr.filter((_, i) => i % STEP === 0 || i === arr.length - 1);
const orreryOut = {
  mjd0: orrery.mjd0,
  days: orrery.days,
  step: STEP,
  bodies: Object.fromEntries(
    Object.entries(orrery.bodies).map(([name, b]) => [name, sample(b.pos).map((p) => p.map((x) => round(x, 4)))]),
  ),
};

const passes = [1, 2, 3].map((e) => {
  const list = six.frames.filter((fr) => fr.epoch === e);
  return {
    epoch: e,
    from: list[0].utc,
    to: list[list.length - 1].utc,
    frames: list.length,
    bands: [...new Set(list.map((x) => x.band))].sort(),
  };
});

const ackFile = path.join(REPO, "web", "assets", "acknowledgement.txt");
const acknowledgement = fs.existsSync(ackFile) ? fs.readFileSync(ackFile, "utf8").trim() : null;

const flagsSource = fs.readFileSync(path.join(REPO, "web", "js", "flagging.js"), "utf8");
const colsMatch = flagsSource.match(/const COLS = (\[[^\]]+\])/);
const csvColumns = colsMatch ? JSON.parse(colsMatch[1].replace(/'/g, '"')) : null;

const evidence = {
  meta: {
    sample: false,
    capturedAt: new Date().toISOString(),
    sourceRepo: "https://github.com/Unavailable4u/spherex-blink",
    sourceCommit,
    sourceDirty,
    dataRelease: "SPHEREx Quick Release 2 (QR2), DOI 10.26131/IRSA652",
    note: "Captured from a local clone of spherex-blink by scripts/capture-evidence.mjs. Every on-screen number is read from this file.",
  },
  overview,
  fields,
  pallas: {
    id: "pallas",
    target: pallas.sky.target_name,
    centre: { ra: pallas.man.center.ra, dec: pallas.man.center.dec },
    sizeDeg: pallas.man.size_deg,
    tile: pallas.man.tile,
    pixscaleArcsec: round(pixscale, 4),
    bands: [...new Set(pallas.frames.map((x) => x.band))].sort(),
    frames: pallas.frames,
    target_positions: target,
    validation,
    pair: pairInfo,
    pick,
  },
  pallas6mo: {
    id: "pallas-6mo",
    passes,
    frames: six.frames,
    tile: six.man.tile,
    sizeDeg: six.man.size_deg,
  },
  validationAll: { totals: validationTotals, fields: validationAll },
  parallax,
  orrery: orreryOut,
  flags: { csvColumns, categories: ["asteroid", "comet", "planet candidate", "other"] },
  acknowledgement,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(evidence, null, 1) + "\n", "utf8");

const kb = Math.round(fs.statSync(OUT).size / 1024);
console.log(`Wrote ${path.relative(process.cwd(), OUT)} (${kb} KB)`);
console.log(`  source commit      ${sourceCommit || "unknown"}${sourceDirty ? " (working tree has local changes)" : ""}`);
console.log(`  fields             ${overview.realFields} real, ${overview.simulatedFields} simulated, ${overview.realFrames} real frames`);
console.log(`  pair (${pairSource})       ${pair.a.id} -> ${pair.b.id}, ${pairInfo.daysApart} days apart`);
console.log(`  validation         ${validationTotals.framesDetected}/${validationTotals.framesChecked} detected, ${validationTotals.moversConfirmed} gone elsewhere, ${validationTotals.fields} fields`);
console.log(`  500 AU             ${parallax.headline.windowPx} px in the window, ${parallax.headline.sixMonthPx} px in six months`);
console.log("Next: npm run evidence:check");
