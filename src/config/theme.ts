export const THEME_MODE = "dark" as const;
export const isLight = false as boolean;

export const ROOT_PX = 16;

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function alpha(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

const colors = {
  paper: "#05060a",
  sheet: "#0a0c13",
  raised: "#10131c",
  sunken: "#03040a",
  rule: "#222329",
  rule2: "#413f3d",
  rule3: "#76726a",

  ink: "#ece6d5",
  ink2: "#bdb8a8",
  ink3: "#8e8a7c",
  faint: "#625f55",

  accent: "#f2a244",
  accentInk: "#f7bd73",
  accentDeep: "#b8651a",
  accent2: "#79c7d6",
  onAccent: "#1a1005",

  frameA: "#f2a244",
  frameB: "#5fc8ff",
  teal: "#79c7d6",
  violet: "#c8a6ff",
  planetX: "#d36bff",

  ok: "#79c7d6",
  okWash: "#10242a",
  okA: "#1d6f82",
  okB: "#3fa3b8",
  okC: "#9fe0ea",
  bad: "#ff5a47",
  badWash: "#2a1512",
  warn: "#f2c04a",
  warnWash: "#2a230f",
  onWarn: "#17130a",
  info: "#c8a6ff",
  infoWash: "#241d33",
  good: "#7fd8a0",

  termBg: "#03040a",
  termFg: "#ece6d5",
  termDim: "#8e8a7c",

  grid: "rgba(236,230,213,.035)",
  glowA: "rgba(242,162,68,.09)",
  glowB: "rgba(121,199,214,.06)",

  stageTop: "#05060a",
  stageBottom: "#0a0c13",
  hookBg: "#020306",

  okInk: "#9fe0ea",
  shadeRgb: "0,0,0",
  edgeRgb: "236,230,213",
  hairRgb: "236,230,213",
  glassRgb: "10,12,19",
  glassDeepRgb: "6,8,13",
  glassBadRgb: "30,14,12",
  scrimRgb: "3,4,8",
  veilRgb: "0,0,0",
  glowRgb: "242,162,68",
  panelTopRgb: "11,13,20",
  panelBottomRgb: "6,7,11",
} as const;

const okGradient = `linear-gradient(135deg, ${colors.okA}, ${colors.okB} 55%, ${colors.okC})`;

export function hatch(color: string = colors.bad, a = 0.16): string {
  return `repeating-linear-gradient(135deg, transparent 0 5px, ${alpha(color, a)} 5px 6px)`;
}

const hatchBad = hatch(colors.bad, 0.16);
const hatchNoData = hatch(colors.ink, 0.1);

const stageGradient = `linear-gradient(180deg, ${colors.stageTop}, ${colors.stageBottom})`;

const appBackground =
  `radial-gradient(900px 560px at 14% -10%, ${colors.glowA}, transparent 62%), ` +
  `radial-gradient(1000px 720px at 92% 112%, ${colors.glowB}, transparent 62%)`;

const panelGradient = `linear-gradient(180deg, rgba(${colors.panelTopRgb},0.9), rgba(${colors.panelBottomRgb},0.96))`;

export const theme = {
  ...colors,
  okGradient,
  hatchBad,
  hatchNoData,
  stageGradient,
  appBackground,
  panelGradient,
  appBackgroundSize: "auto, auto",
  gridSize: 44,
  panelShadow: "0 1px 0 rgba(236,230,213,.04) inset, 0 20px 40px -28px rgba(0,0,0,.9)",
  liftShadow: "0 30px 80px -24px rgba(0,0,0,.85)",
} as const;

export const shade = (a: number): string => `rgba(${colors.shadeRgb},${+a.toFixed(3)})`;
export const edgeLight = (a: number): string => `rgba(${colors.edgeRgb},${+Math.min(1, a).toFixed(3)})`;
export const hair = (a: number): string => `rgba(${colors.hairRgb},${a})`;
export const glass = (a: number): string => `rgba(${colors.glassRgb},${a})`;
export const glassDeep = (a: number): string => `rgba(${colors.glassDeepRgb},${a})`;
export const glassBad = (a: number): string => `rgba(${colors.glassBadRgb},${a})`;
export const scrim = (a: number): string => `rgba(${colors.scrimRgb},${a})`;
export const veil = (a: number): string => `rgba(${colors.veilRgb},${a})`;
export const halo = (a: number): string => `rgba(0,0,0,${a})`;

export type Theme = typeof theme;

export const FAMILY_SERIF = "CMU Serif";
export const FAMILY_MONO = "CMU Typewriter Text";

export const fonts = {
  serif: `"${FAMILY_SERIF}", "Latin Modern Roman", "Computer Modern", "Times New Roman", Georgia, serif`,
  mono: `"${FAMILY_MONO}", "Latin Modern Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`,
} as const;

export const type = {
  hook: 72,
  title: 150,
  captionMin: 56,
  captionMax: 76,
  callout: 24,
  uiMin: 22,
  monoLabelMin: 20,
} as const;

export const layout = {
  safeMargin: 96,
  captionBottom: 110,
} as const;
