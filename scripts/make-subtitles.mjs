import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TOTAL = 4500;
const SILENT_TAIL = 20;
const HOLD = 8;
const MIN_SHOWN = 24;

const timingFile = path.join(ROOT, "out", "voice-timing.txt");
const voiceFile = path.join(ROOT, "src", "config", "voice.ts");
const outFile = path.join(ROOT, "src", "config", "subtitles.ts");

if (!fs.existsSync(timingFile)) {
  console.error("ERROR: out/voice-timing.txt not found. Fix: run make-voice.bat first, it writes that file.");
  process.exit(1);
}

const voiceSrc = fs.readFileSync(voiceFile, "utf8");
const list = voiceSrc.match(/export const voiceBlocks\s*=\s*\[([\s\S]*?)\]\s*as const/);
if (!list) {
  console.error("ERROR: voiceBlocks not found in src/config/voice.ts.");
  process.exit(1);
}
const blocks = [];
const pat = /id:\s*"(V\d+)"\s*,\s*start:\s*(\d+)\s*,\s*text:\s*"((?:[^"\\]|\\.)*)"/g;
let m;
while ((m = pat.exec(list[1])) !== null) {
  blocks.push({ id: m[1], text: m[3].replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\n/g, " ") });
}
if (blocks.length === 0) {
  console.error("ERROR: could not read any block from src/config/voice.ts.");
  process.exit(1);
}

const spans = new Map();
let current = null;
for (const line of fs.readFileSync(timingFile, "utf8").split(/\r?\n/)) {
  const head = line.match(/^(V\d+)\s+starts/);
  if (head) {
    current = head[1];
    spans.set(current, []);
    continue;
  }
  const sent = line.match(/sentence \d+: f(\d+) - f(\d+)/);
  if (sent && current) spans.get(current).push([Number(sent[1]), Number(sent[2])]);
}

const cues = [];
for (const b of blocks) {
  const s = spans.get(b.id);
  if (!s || s.length === 0) {
    console.error(`ERROR: ${b.id} is in voice.ts but not in out/voice-timing.txt. Fix: run make-voice.bat again.`);
    process.exit(1);
  }
  cues.push({ id: b.id, from: s[0][0], end: s[s.length - 1][1], text: b.text });
}
cues.sort((a, b) => a.from - b.from);

const lastFrame = TOTAL - SILENT_TAIL - 1;
const out = cues.map((c, i) => {
  const nextFrom = i + 1 < cues.length ? cues[i + 1].from - 1 : lastFrame;
  let to = Math.max(c.end + HOLD, c.from + MIN_SHOWN);
  to = Math.min(to, nextFrom, lastFrame);
  return { from: c.from, to, text: c.text };
});

const rows = out.map((c) => `  { from: ${c.from}, to: ${c.to}, text: ${JSON.stringify(c.text)} },`).join("\n");
const file = `export interface SubtitleCue {
  readonly from: number;
  readonly to: number;
  readonly text: string;
}

export const subtitleCues: readonly SubtitleCue[] = [
${rows}
];
`;
fs.writeFileSync(outFile, file, "utf8");
console.log(`Wrote src/config/subtitles.ts with ${out.length} subtitle cues from out/voice-timing.txt.`);
