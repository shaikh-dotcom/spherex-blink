export const FPS = 30;
export const BEAT = 15;
export const BAR = 60;
export const TOTAL = 4500;

export const sec = (s: number): number => Math.round(s * FPS);
export const beat = (n: number): number => n * BEAT;
export const bar = (n: number): number => n * BAR;
export const f = (n: number): number => n;

export const LOGICAL = { w: 1600, h: 900 } as const;
export const STAGE = { w: 1920, h: 1080 } as const;

export type SceneKey = "S0" | "S1" | "S2" | "S3" | "S4" | "S5" | "S6" | "S7" | "S8" | "S9";

export interface SceneRange {
  id: SceneKey;
  name: string;
  start: number;
  end: number;
  duration: number;
}

function scene(id: SceneKey, name: string, start: number, end: number): SceneRange {
  return { id, name, start, end, duration: end - start + 1 };
}

export const SCENES: Record<SceneKey, SceneRange> = {
  S0: scene("S0", "Hook", 0, 299),
  S1: scene("S1", "Title", 300, 599),
  S2: scene("S2", "Data", 600, 1079),
  S3: scene("S3", "Blink", 1080, 1679),
  S4: scene("S4", "Inspect", 1680, 2219),
  S5: scene("S5", "Check", 2220, 2699),
  S6: scene("S6", "PlanetX", 2700, 3419),
  S7: scene("S7", "Flag", 3420, 3779),
  S8: scene("S8", "Limits", 3780, 4199),
  S9: scene("S9", "Outro", 4200, 4499),
};

export const SCENE_ORDER: readonly SceneKey[] = ["S0", "S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9"];

export function sceneAt(frame: number): SceneRange {
  const fr = Math.min(TOTAL - 1, Math.max(0, Math.floor(frame)));
  for (const key of SCENE_ORDER) {
    const s = SCENES[key];
    if (fr >= s.start && fr <= s.end) return s;
  }
  return SCENES.S9;
}

export const CUT_FRAMES: readonly number[] = [
  60, 150, 300, 420, 600, 1080, 1680, 2220, 2700, 3420, 3780, 4200,
];

export const CUES = {
  s0: { caption: 60, calloutJump: 210 },
  s1: { eyebrow: 300, lockup: 315, tagline: 420 },
  s2: { caption: 600, counter: 690, bands: 780, captionPatch: 960 },
  s3: { badge: 1080, calloutStars: 1170, calloutJump: 1200, captionPluto: 1230, calloutAmber: 1290, captionPair: 1410, calloutWarn: 1590 },
  s4: { caption: 1680, calloutBlind: 1710, calloutSnap: 1800, calloutMover: 1890, captionKnown: 2100 },
  s5: { caption: 2220, calloutChecked: 2310, captionFields: 2460, captionStrict: 2580 },
  s6: { caption: 2700, calloutShift: 2880, calloutSix: 3000, captionMeasure: 3060, calloutNear: 3200, captionHonest: 3300 },
  s7: { caption: 3420, calloutCross: 3480, captionExport: 3540, captionState: 3660 },
  s8: { caption: 3780, columns: 3810, captionHatch: 3900, captionClaim: 4080 },
  s9: { lockup: 4260, link: 4290, ack: 4350 },
} as const;
