import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "audio");
const RATE = 48000;
const TAU = Math.PI * 2;
const args = process.argv.slice(2);
const check = args.includes("--check");
const onlyIdx = args.indexOf("--only");
const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

const SPECS = {
  drone: { seconds: 150, peak: 0.35 },
  tick: { seconds: 0.06, peak: 0.708 },
  click: { seconds: 0.12, peak: 0.708 },
  whoosh: { seconds: 0.9, peak: 0.708 },
  chime: { seconds: 1.8, peak: 0.708 },
  thud: { seconds: 0.5, peak: 0.708 },
  riser: { seconds: 2, peak: 0.708 },
  hatch: { seconds: 0.6, peak: 0.708 },
  pulse: { seconds: 0.35, peak: 0.708 },
};

function rng(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const samples = (seconds) => new Float32Array(Math.round(seconds * RATE));
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (t) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

function svf(buf, cutoffAt, q, mode) {
  let low = 0;
  let band = 0;
  const out = new Float32Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    const fc = cutoffAt(i / RATE);
    const f = 2 * Math.sin(Math.PI * Math.min(fc, RATE * 0.22) / RATE);
    const input = buf[i];
    low += f * band;
    const high = input - low - q * band;
    band += f * high;
    out[i] = mode === "band" ? band : mode === "low" ? low : high;
  }
  return out;
}

function noise(seconds, seed) {
  const r = rng(seed);
  const b = samples(seconds);
  for (let i = 0; i < b.length; i++) b[i] = r() * 2 - 1;
  return b;
}

function normalise(buf, peak) {
  let m = 0;
  for (let i = 0; i < buf.length; i++) m = Math.max(m, Math.abs(buf[i]));
  const g = m > 0 ? peak / m : 1;
  for (let i = 0; i < buf.length; i++) buf[i] *= g;
  return buf;
}

function edges(buf, inSeconds, outSeconds) {
  const a = Math.round(inSeconds * RATE);
  const b = Math.round(outSeconds * RATE);
  for (let i = 0; i < buf.length; i++) {
    let g = 1;
    if (i < a) g *= i / a;
    const left = buf.length - 1 - i;
    if (left < b) g *= left / b;
    buf[i] *= g;
  }
  return buf;
}

const makers = {
  drone() {
    const n = SPECS.drone.seconds;
    const b = samples(n);
    const hiss = svf(noise(n, 11), () => 260, 1.2, "low");
    const hiss2 = svf(noise(n, 12), () => 520, 1.4, "band");
    const parts = [
      [55, 1],
      [55.27, 0.8],
      [82.41, 0.5],
      [110.1, 0.35],
      [164.8, 0.12],
    ];
    for (let i = 0; i < b.length; i++) {
      const t = i / RATE;
      let v = 0;
      for (const [f, a] of parts) v += a * Math.sin(TAU * f * t + f * 0.37);
      v += 3.2 * hiss[i] + 1.4 * hiss2[i];
      const swell = 0.25 + 0.35 * smooth(t / 120);
      const trem = 0.88 + 0.12 * Math.sin(TAU * 0.07 * t);
      b[i] = v * swell * trem;
    }
    edges(b, 1, 3);
    return normalise(b, SPECS.drone.peak);
  },
  tick() {
    const b = samples(SPECS.tick.seconds);
    const r = rng(21);
    for (let i = 0; i < b.length; i++) {
      const t = i / RATE;
      b[i] = Math.sin(TAU * 2400 * t) * Math.exp(-t / 0.006) + (r() * 2 - 1) * Math.exp(-t / 0.0015) * 0.4;
    }
    return normalise(edges(b, 0.0003, 0.004), SPECS.tick.peak);
  },
  click() {
    const b = samples(SPECS.click.seconds);
    const n = svf(noise(SPECS.click.seconds, 31), () => 2600, 0.9, "high");
    for (let i = 0; i < b.length; i++) {
      const t = i / RATE;
      b[i] = n[i] * Math.exp(-t / 0.004) * 0.9 + Math.sin(TAU * 1250 * t) * Math.exp(-t / 0.012) * 0.8;
    }
    return normalise(edges(b, 0.0003, 0.01), SPECS.click.peak);
  },
  whoosh() {
    const d = SPECS.whoosh.seconds;
    const n = svf(noise(d, 41), (t) => 350 + 2600 * Math.sin(Math.PI * clamp01(t / d)), 0.55, "band");
    for (let i = 0; i < n.length; i++) {
      const t = i / RATE / d;
      n[i] *= Math.pow(Math.sin(Math.PI * clamp01(t)), 1.6);
    }
    return normalise(edges(n, 0.002, 0.02), SPECS.whoosh.peak);
  },
  chime() {
    const b = samples(SPECS.chime.seconds);
    const partials = [
      [880, 1, 0.55],
      [1318.5, 0.6, 0.4],
      [1760, 0.4, 0.3],
      [2637, 0.18, 0.18],
    ];
    for (let i = 0; i < b.length; i++) {
      const t = i / RATE;
      let v = 0;
      for (const [f, a, tau] of partials) v += a * Math.sin(TAU * f * t) * Math.exp(-t / tau);
      b[i] = v * (1 - Math.exp(-t / 0.003));
    }
    return normalise(edges(b, 0, 0.05), SPECS.chime.peak);
  },
  thud() {
    const b = samples(SPECS.thud.seconds);
    const n = svf(noise(SPECS.thud.seconds, 51), () => 180, 1.1, "low");
    let phase = 0;
    for (let i = 0; i < b.length; i++) {
      const t = i / RATE;
      const f = 45 + 80 * Math.exp(-t / 0.05);
      phase += (TAU * f) / RATE;
      b[i] = Math.sin(phase) * Math.exp(-t / 0.13) + n[i] * Math.exp(-t / 0.03) * 1.5;
    }
    return normalise(edges(b, 0.0005, 0.04), SPECS.thud.peak);
  },
  riser() {
    const d = SPECS.riser.seconds;
    const n = svf(noise(d, 61), (t) => 200 * Math.pow(25, clamp01(t / d)), 0.7, "band");
    let phase = 0;
    for (let i = 0; i < n.length; i++) {
      const t = i / RATE;
      const u = clamp01(t / d);
      phase += (TAU * (220 * Math.pow(4, u))) / RATE;
      const amp = Math.pow(u, 2.2);
      n[i] = (n[i] * 1.6 + Math.sin(phase) * 0.5) * amp;
    }
    return normalise(edges(n, 0.002, 0.03), SPECS.riser.peak);
  },
  hatch() {
    const d = SPECS.hatch.seconds;
    const b = samples(d);
    const r = rng(71);
    const times = [0, 0.09, 0.17, 0.24, 0.3, 0.355, 0.405, 0.45];
    const tone = svf(noise(d, 72), () => 4200, 1.0, "band");
    for (let k = 0; k < times.length; k++) {
      const start = Math.round(times[k] * RATE);
      const len = Math.round(0.028 * RATE);
      const f = 1800 + k * 450;
      for (let i = 0; i < len && start + i < b.length; i++) {
        const t = i / RATE;
        b[start + i] += (tone[start + i] * 0.5 + Math.sin(TAU * f * t) * 0.6 + (r() * 2 - 1) * 0.1) * Math.exp(-t / 0.009);
      }
    }
    return normalise(edges(b, 0.0003, 0.03), SPECS.hatch.peak);
  },
  pulse() {
    const b = samples(SPECS.pulse.seconds);
    let phase = 0;
    for (let i = 0; i < b.length; i++) {
      const t = i / RATE;
      phase += (TAU * (52 + 40 * Math.exp(-t / 0.04))) / RATE;
      b[i] = Math.sin(phase) * Math.exp(-t / 0.09);
    }
    return normalise(edges(b, 0.001, 0.05), SPECS.pulse.peak);
  },
};

function toWav(buf) {
  const data = Buffer.alloc(buf.length * 2);
  for (let i = 0; i < buf.length; i++) {
    const v = Math.max(-1, Math.min(1, buf[i]));
    data.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  const head = Buffer.alloc(44);
  head.write("RIFF", 0);
  head.writeUInt32LE(36 + data.length, 4);
  head.write("WAVE", 8);
  head.write("fmt ", 12);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(1, 22);
  head.writeUInt32LE(RATE, 24);
  head.writeUInt32LE(RATE * 2, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write("data", 36);
  head.writeUInt32LE(data.length, 40);
  return Buffer.concat([head, data]);
}

function inspect(file) {
  const b = fs.readFileSync(file);
  if (b.length < 44 || b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WAVE") return { ok: false, why: "not a WAV file" };
  const fmt = b.readUInt16LE(20);
  const channels = b.readUInt16LE(22);
  const rate = b.readUInt32LE(24);
  const bits = b.readUInt16LE(34);
  const bytes = b.readUInt32LE(40);
  const n = Math.floor(bytes / 2);
  let peak = 0;
  let clipped = 0;
  for (let i = 0; i < n; i++) {
    const v = Math.abs(b.readInt16LE(44 + i * 2));
    if (v > peak) peak = v;
    if (v >= 32767) clipped++;
  }
  return { ok: fmt === 1 && channels === 1 && rate === RATE && bits === 16, fmt, channels, rate, bits, seconds: n / RATE, peak: peak / 32768, clipped };
}

const names = Object.keys(SPECS).filter((n) => !only || n === only);

if (check) {
  let failures = 0;
  console.log("name     seconds  expected  peak(dBFS)  result");
  for (const name of names) {
    const file = path.join(OUT, `${name}.wav`);
    if (!fs.existsSync(file)) {
      console.log(`${name.padEnd(8)} MISSING`);
      failures++;
      continue;
    }
    const r = inspect(file);
    if (!r.ok && !r.seconds) {
      console.log(`${name.padEnd(8)} ${r.why}`);
      failures++;
      continue;
    }
    const want = SPECS[name].seconds;
    const dur = Math.abs(r.seconds - want) < 0.005;
    const clean = r.clipped === 0 && r.peak < 0.9999;
    const pass = r.ok && dur && clean;
    if (!pass) failures++;
    const db = r.peak > 0 ? (20 * Math.log10(r.peak)).toFixed(1) : "-inf";
    console.log(`${name.padEnd(8)} ${r.seconds.toFixed(3).padStart(7)}  ${String(want).padStart(8)}  ${db.padStart(10)}  ${pass ? "ok" : "FAIL"}`);
  }
  console.log(failures === 0 ? "All audio files present and clean." : `${failures} problem(s).`);
  process.exit(failures === 0 ? 0 : 1);
}

fs.mkdirSync(OUT, { recursive: true });
for (const name of names) {
  const file = path.join(OUT, `${name}.wav`);
  const wav = toWav(makers[name]());
  fs.writeFileSync(file, wav);
  console.log(`${name.padEnd(8)} ${(wav.length / 1024).toFixed(0).padStart(7)} KB`);
}
if (!only) {
  const manifest = { rate: RATE, files: Object.keys(SPECS).map((n) => `${n}.wav`) };
  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest) + "\n", "utf8");
}
console.log("Audio written to public/audio/.");
