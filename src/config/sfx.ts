import { CUES, FPS, SCENES } from "./timeline";

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

export const DRONE_FILE = "audio/drone.wav";
export const DRONE_GAIN = 0.35;

const RISER_FRAMES = Math.round(SFX_SECONDS.riser * FPS);
const BLINK_START = 1140;
const BLINK_END = 1290;
const BLINK_STEP = 10;
const PULSE_STEP = 15;
const PULSE_LAST_OUTRO = 4440;

const cue = (frame: number, name: SfxName, gain: number = SFX_GAIN[name]): SfxCue => ({ frame, name, gain });

function range(from: number, to: number, step: number): number[] {
  const out: number[] = [];
  for (let f = from; f < to; f += step) out.push(f);
  return out;
}

function build(): SfxCue[] {
  const out: SfxCue[] = [];
  for (const key of ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9"] as const) out.push(cue(SCENES[key].start, "whoosh"));
  for (const key of ["S1", "S6", "S9"] as const) out.push(cue(SCENES[key].start - RISER_FRAMES, "riser"));
  out.push(cue(CUES.s2.counter, "thud"));
  for (const frame of [CUES.s0.calloutJump, CUES.s3.calloutJump, CUES.s4.calloutMover, CUES.s5.calloutChecked, CUES.s6.calloutNear, CUES.s7.calloutCross]) {
    out.push(cue(frame, "chime"));
  }
  out.push(cue(CUES.s8.columns, "hatch"));
  for (const frame of range(BLINK_START, BLINK_END, BLINK_STEP)) out.push(cue(frame, "tick"));
  for (const frame of range(SCENES.S1.start, SCENES.S1.end, PULSE_STEP)) out.push(cue(frame, "pulse"));
  for (const frame of range(SCENES.S9.start, PULSE_LAST_OUTRO, PULSE_STEP)) out.push(cue(frame, "pulse"));
  return out.sort((a, b) => a.frame - b.frame || a.name.localeCompare(b.name));
}

export const SFX_CUES: SfxCue[] = build();
