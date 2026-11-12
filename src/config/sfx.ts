import { FILM_CURSOR } from "../scenes";
import { CUES, FPS, SCENES, TOTAL } from "./timeline";

export type SfxName = "tick" | "click" | "whoosh" | "chime" | "thud" | "riser" | "hatch" | "pulse";

export interface SfxCue {
  frame: number;
  name: SfxName;
  gain: number;
}

export const SFX_FILES: Record<SfxName, string> = {
  tick: "audio/tick.wav",
  click: "audio/click.wav",
  whoosh: "audio/whoosh.wav",
  chime: "audio/chime.wav",
  thud: "audio/thud.wav",
  riser: "audio/riser.wav",
  hatch: "audio/hatch.wav",
  pulse: "audio/pulse.wav",
};

export const SFX_SECONDS: Record<SfxName, number> = {
  tick: 0.06,
  click: 0.12,
  whoosh: 0.9,
  chime: 1.8,
  thud: 0.5,
  riser: 2,
  hatch: 0.6,
  pulse: 0.35,
};

export const SFX_GAIN: Record<SfxName, number> = {
  tick: 0.25,
  click: 0.5,
  whoosh: 0.45,
  chime: 0.5,
  thud: 0.7,
  riser: 0.45,
  hatch: 0.4,
  pulse: 0.2,
};

export const CHIME_NOTE_GAIN = 0.32;
export const CAPTION_TICK_GAIN = 0.22;

export const VOICE_FILE = "audio/voice.wav";
export const VOICE_GAIN = 1;

export const DRONE_FILE = "audio/drone.wav";
export const DRONE_GAIN = 0.35;
export const DRONE_FADE_FRAMES = 3 * FPS;
export const SILENT_TAIL_FRAMES = 20;
export const DRONE_FADE_END = TOTAL - SILENT_TAIL_FRAMES;
export const DRONE_FADE_START = DRONE_FADE_END - DRONE_FADE_FRAMES;

export const MIN_GAP_FRAMES = 3;
export const MAX_NUDGE_FRAMES = 6;

const RISER_FRAMES = Math.round(SFX_SECONDS.riser * FPS);
const BLINK_START = 1140;
const BLINK_END = 1290;
const BLINK_STEP = 10;
const PULSE_STEP = 15;
const PULSE_LAST_OUTRO = 4440;
const STAT_LOCK_FRAMES = 45;

const VERDICT_CALLOUTS: readonly number[] = [
  CUES.s0.calloutJump,
  CUES.s3.calloutJump,
  CUES.s4.calloutMover,
  CUES.s5.calloutChecked,
  CUES.s6.calloutNear,
  CUES.s7.calloutCross,
];

const NOTE_CALLOUTS: readonly number[] = [
  CUES.s2.bands,
  CUES.s3.calloutStars,
  CUES.s3.calloutAmber,
  CUES.s3.calloutWarn,
  CUES.s4.calloutBlind,
  CUES.s4.calloutSnap,
  CUES.s6.calloutShift,
  CUES.s6.calloutSix,
];

const CAPTIONS: readonly number[] = [
  CUES.s0.caption,
  CUES.s2.caption,
  CUES.s2.captionPatch,
  CUES.s3.captionPluto,
  CUES.s3.captionPair,
  CUES.s4.caption,
  CUES.s4.captionKnown,
  CUES.s5.caption,
  CUES.s5.captionFields,
  CUES.s5.captionStrict,
  CUES.s6.caption,
  CUES.s6.captionMeasure,
  CUES.s6.captionHonest,
  CUES.s7.caption,
  CUES.s7.captionExport,
  CUES.s7.captionState,
  CUES.s8.caption,
  CUES.s8.captionHatch,
  CUES.s8.captionClaim,
];

const cue = (frame: number, name: SfxName, gain: number = SFX_GAIN[name]): SfxCue => ({ frame, name, gain });

function range(from: number, to: number, step: number): number[] {
  const out: number[] = [];
  for (let f = from; f < to; f += step) out.push(f);
  return out;
}

const isClear = (frame: number, taken: readonly SfxCue[]): boolean =>
  taken.every((c) => c.name === "pulse" || Math.abs(c.frame - frame) >= MIN_GAP_FRAMES);

function nudged(frame: number, taken: readonly SfxCue[]): number {
  for (let d = 0; d <= MAX_NUDGE_FRAMES; d++) {
    if (isClear(frame + d, taken)) return frame + d;
  }
  throw new Error(`sfx: no free frame within ${MAX_NUDGE_FRAMES} frames after ${frame}`);
}

function assertCues(cues: readonly SfxCue[]): void {
  const hits = cues.filter((c) => c.name !== "pulse");
  for (let i = 1; i < hits.length; i++) {
    const a = hits[i - 1];
    const b = hits[i];
    if (b.frame - a.frame < MIN_GAP_FRAMES) {
      throw new Error(`sfx: ${a.name} at ${a.frame} and ${b.name} at ${b.frame} are closer than ${MIN_GAP_FRAMES} frames`);
    }
  }
  for (const c of cues) {
    const end = c.frame + Math.ceil(SFX_SECONDS[c.name] * FPS);
    if (c.frame < 0 || end > TOTAL - SILENT_TAIL_FRAMES) {
      throw new Error(`sfx: ${c.name} at ${c.frame} sounds until frame ${end}, inside the last ${SILENT_TAIL_FRAMES} frames`);
    }
  }
}

function build(): SfxCue[] {
  const out: SfxCue[] = [];
  for (const key of ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9"] as const) out.push(cue(SCENES[key].start, "whoosh"));
  for (const key of ["S1", "S6", "S9"] as const) out.push(cue(SCENES[key].start - RISER_FRAMES, "riser"));
  out.push(cue(CUES.s2.counter + STAT_LOCK_FRAMES, "thud"));
  out.push(cue(CUES.s8.columns, "hatch"));
  for (const frame of range(BLINK_START, BLINK_END, BLINK_STEP)) out.push(cue(frame, "tick"));
  for (const w of FILM_CURSOR) {
    if (w.click) out.push(cue(w.frame, "click"));
  }
  for (const frame of VERDICT_CALLOUTS) out.push(cue(nudged(frame, out), "chime"));
  for (const frame of NOTE_CALLOUTS) out.push(cue(nudged(frame, out), "chime", CHIME_NOTE_GAIN));
  for (const frame of CAPTIONS) {
    if (isClear(frame, out)) out.push(cue(frame, "tick", CAPTION_TICK_GAIN));
  }
  for (const frame of range(SCENES.S1.start, SCENES.S1.end, PULSE_STEP)) out.push(cue(frame, "pulse"));
  for (const frame of range(SCENES.S9.start, PULSE_LAST_OUTRO, PULSE_STEP)) out.push(cue(frame, "pulse"));
  const sorted = out.sort((a, b) => a.frame - b.frame || a.name.localeCompare(b.name));
  assertCues(sorted);
  return sorted;
}

export const SFX_CUES: SfxCue[] = build();

export function droneGainAt(frame: number): number {
  const t = Math.min(1, Math.max(0, (DRONE_FADE_END - frame) / DRONE_FADE_FRAMES));
  return DRONE_GAIN * t * t * (3 - 2 * t);
}
