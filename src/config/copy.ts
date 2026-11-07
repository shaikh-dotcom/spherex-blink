export const urls = {
  live: "https://unavailable4u.github.io/spherex-blink/",
  repo: "https://github.com/Unavailable4u/spherex-blink",
} as const;

export const brand = {
  name: "SPHEREx Blink Comparator",
  nameLead: "SPHEREx",
  nameAccent: "Blink Comparator",
  eyebrow: "NASA SPACE APPS 2026 · PLANET X AND SPHEREX",
} as const;

export const badges = {
  real: "Real data · SPHEREx QR2",
  simulated: "Simulated · practice field",
  prototype: "Prototype, not a discovery tool",
  candidate: "Candidate, never found",
} as const;

export const s0 = {
  caption: ["Almost everything in the sky", "stands still."],
  calloutJump: "One dot jumps",
  tag: "WHAT A BLINK COMPARATOR SHOWS",
} as const;

export const s1 = {
  tagline: ["Real infrared images of one patch of sky.", "Find what moves."],
} as const;

export const s2 = {
  caption: ["SPHEREx scans the whole sky", "in 102 infrared colours."],
  counterLabel: "real fields",
  counterFrames: "real frames",
  bandsTag: "DETECTORS D1–D6",
  captionPatch: ["One patch of sky, a handful of colours,", "seen on different days."],
} as const;

export const s3 = {
  calloutStars: "Stars stay put",
  calloutJump: "One dot jumps",
  captionPluto: ["The trick Clyde Tombaugh used", "to find Pluto in 1930."],
  calloutAmber: "Amber earlier, cyan later",
  captionPair: "Best pair: days apart, similar colour.",
  calloutWarn: "Judge by position, not brightness",
} as const;

export const s4 = {
  caption: "Hunt blind. Click the dot.",
  calloutBlind: "Known objects off",
  calloutSnap: "Snaps to the centroid",
  calloutMover: "Gone from the other frames",
  captionKnown: "Then check it against the sky.",
} as const;

export const s5 = {
  caption: "Checked, not drawn.",
  calloutChecked: "Found in the pixels",
  captionFields: "Sixteen asteroid fields.",
  captionStrict: "The stricter check is honest too.",
} as const;

export const s6 = {
  caption: ["A distant planet barely moves.", "Earth does."],
  calloutShift: "Parallax from Earth's orbit",
  calloutSix: "Six months buys far more",
  captionMeasure: "Measure a mover. Fit a distance.",
  calloutNear: "Nearby: asteroid or comet",
  captionHonest: ["A distant fit is a candidate.", "Never a detection."],
} as const;

export const s7 = {
  caption: "Flag it.",
  calloutCross: "Cross-matched to known",
  captionExport: "Export as CSV or JSON.",
  captionState: "It says where flags go.",
} as const;

export const s8 = {
  caption: ["What is real.", "What is simulated. What is limited."],
  columns: { real: "REAL", simulated: "SIMULATED", limited: "LIMITED" },
  captionHatch: "No coverage is a hatch, not black.",
  captionClaim: ["Nothing here claims a detection."],
} as const;

export const s9 = {
  lockup: "SPHEREx Blink Comparator",
  tagline: "Find what moves.",
  tail: "Free. Public. One link.",
} as const;

export const copy = { urls, brand, badges, s0, s1, s2, s3, s4, s5, s6, s7, s8, s9 } as const;

export type Copy = typeof copy;
