export interface SubtitleCue {
  readonly from: number;
  readonly to: number;
  readonly text: string;
}

export const subtitleCues: readonly SubtitleCue[] = [
  { from: 60, to: 141, text: "Almost everything in the sky stands still." },
  { from: 210, to: 268, text: "Then one dot jumps." },
  { from: 324, to: 399, text: "This is SPHEREx Blink Comparator." },
  { from: 426, to: 574, text: "Real infrared images of one patch of sky. Find what moves." },
  { from: 606, to: 762, text: "SPHEREx scans the whole sky in one hundred and two infrared colours." },
  { from: 800, to: 875, text: "Real fields. Real frames." },
  { from: 966, to: 1058, text: "One patch of sky, seen on different days." },
  { from: 1092, to: 1199, text: "Flip between two days, and the stars stay put." },
  { from: 1230, to: 1286, text: "The trick that found Pluto." },
  { from: 1306, to: 1396, text: "Amber is earlier. Cyan is later." },
  { from: 1416, to: 1502, text: "Pick two days apart, in similar colour." },
  { from: 1596, to: 1673, text: "Judge by position, not brightness." },
  { from: 1692, to: 1768, text: "Known objects off. Click the dot." },
  { from: 1806, to: 1871, text: "The click snaps to the centroid." },
  { from: 1896, to: 1985, text: "A real mover is gone from the other frames." },
  { from: 2106, to: 2163, text: "Then check it against the sky." },
  { from: 2232, to: 2285, text: "Checked, not drawn." },
  { from: 2316, to: 2400, text: "The known asteroid, found in the pixels." },
  { from: 2466, to: 2546, text: "Then across sixteen asteroid fields." },
  { from: 2586, to: 2670, text: "Even the stricter check is reported honestly." },
  { from: 2712, to: 2821, text: "A distant planet barely moves. Earth does." },
  { from: 2886, to: 3005, text: "Earth's orbit shifts the view. That shift is parallax." },
  { from: 3006, to: 3071, text: "Six months buys far more." },
  { from: 3078, to: 3161, text: "Measure a mover. Fit a distance." },
  { from: 3206, to: 3304, text: "The fit says nearby: asteroid or comet." },
  { from: 3306, to: 3421, text: "A distant fit is a candidate. Never a detection." },
  { from: 3440, to: 3468, text: "Flag it." },
  { from: 3486, to: 3545, text: "Cross-matched against known objects." },
  { from: 3546, to: 3657, text: "Export as CSV or JSON." },
  { from: 3672, to: 3748, text: "Flags are saved in this browser only." },
  { from: 3786, to: 3904, text: "What is real. What is simulated. What is limited." },
  { from: 3926, to: 4007, text: "No coverage is a hatch, not black." },
  { from: 4020, to: 4097, text: "Simulated data is always labelled." },
  { from: 4098, to: 4162, text: "Nothing here claims a detection." },
  { from: 4262, to: 4355, text: "SPHEREx Blink Comparator. Find what moves." },
  { from: 4356, to: 4429, text: "Free. Public. One link." },
];
