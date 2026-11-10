export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const WINDOW = { w: 1600, h: 900 } as const;

export const GRID = {
  headerH: 70,
  railW: 252,
  panelW: 392,
  centreW: 956,
  rulerLeft: 58,
  rulerTop: 30,
  figure: 608,
  captionH: 54,
  timeH: 58,
  pad: 22,
} as const;

export type FocusName =
  | "fullWindow"
  | "header"
  | "rail"
  | "bandPlates"
  | "blinkControls"
  | "layers"
  | "keys"
  | "centre"
  | "figure"
  | "skyImage"
  | "caption"
  | "timeBar"
  | "panel"
  | "tabs"
  | "inspectMeta"
  | "moverCheck"
  | "flagForm"
  | "flagList"
  | "contextField"
  | "realityCheck"
  | "referenceBlend"
  | "skyMapCard"
  | "pxLab"
  | "pxDistance"
  | "pxOutput"
  | "pxMeasure"
  | "orreryCard";

export const FOCUS_NAMES: readonly FocusName[] = [
  "fullWindow",
  "header",
  "rail",
  "bandPlates",
  "blinkControls",
  "layers",
  "keys",
  "centre",
  "figure",
  "skyImage",
  "caption",
  "timeBar",
  "panel",
  "tabs",
  "inspectMeta",
  "moverCheck",
  "flagForm",
  "flagList",
  "contextField",
  "realityCheck",
  "referenceBlend",
  "skyMapCard",
  "pxLab",
  "pxDistance",
  "pxOutput",
  "pxMeasure",
  "orreryCard",
];

const PANEL_X = GRID.railW + GRID.centreW;
const FIG_X = GRID.railW + (GRID.centreW - (GRID.rulerLeft + GRID.figure)) / 2;
const IMG_X = FIG_X + GRID.rulerLeft;
const IMG_Y = GRID.headerH + GRID.pad + GRID.rulerTop;

export const FOCUS: Record<FocusName, Rect> = {
  fullWindow: { x: 0, y: 0, w: WINDOW.w, h: WINDOW.h },
  header: { x: 0, y: 0, w: WINDOW.w, h: GRID.headerH },
  rail: { x: 0, y: GRID.headerH, w: GRID.railW, h: WINDOW.h - GRID.headerH },
  bandPlates: { x: 20, y: 76, w: 226, h: 134 },
  blinkControls: { x: 20, y: 210, w: 226, h: 210 },
  layers: { x: 20, y: 420, w: 226, h: 170 },
  keys: { x: 20, y: 590, w: 226, h: 230 },
  centre: { x: GRID.railW, y: GRID.headerH, w: GRID.centreW, h: WINDOW.h - GRID.headerH },
  figure: { x: FIG_X, y: GRID.headerH + GRID.pad, w: GRID.rulerLeft + GRID.figure, h: GRID.rulerTop + GRID.figure + GRID.captionH },
  skyImage: { x: IMG_X, y: IMG_Y, w: GRID.figure, h: GRID.figure },
  caption: { x: FIG_X, y: IMG_Y + GRID.figure + 6, w: GRID.rulerLeft + GRID.figure, h: GRID.captionH - 6 },
  timeBar: { x: GRID.railW + 38, y: WINDOW.h - GRID.timeH - GRID.pad + 8, w: GRID.centreW - 76, h: GRID.timeH },
  panel: { x: PANEL_X, y: GRID.headerH, w: GRID.panelW, h: WINDOW.h - GRID.headerH },
  tabs: { x: PANEL_X, y: GRID.headerH, w: GRID.panelW, h: 50 },
  inspectMeta: { x: PANEL_X, y: 130, w: GRID.panelW, h: 270 },
  moverCheck: { x: PANEL_X, y: 400, w: GRID.panelW, h: 170 },
  flagForm: { x: PANEL_X, y: 556, w: GRID.panelW, h: 192 },
  flagList: { x: PANEL_X, y: 748, w: GRID.panelW, h: 148 },
  contextField: { x: PANEL_X, y: 130, w: GRID.panelW, h: 200 },
  realityCheck: { x: PANEL_X, y: 330, w: GRID.panelW, h: 260 },
  referenceBlend: { x: PANEL_X, y: 590, w: GRID.panelW, h: 150 },
  skyMapCard: { x: PANEL_X, y: 740, w: GRID.panelW, h: 150 },
  pxLab: { x: PANEL_X, y: 130, w: GRID.panelW, h: 330 },
  pxDistance: { x: PANEL_X, y: 150, w: GRID.panelW, h: 70 },
  pxOutput: { x: PANEL_X, y: 215, w: GRID.panelW, h: 115 },
  pxMeasure: { x: PANEL_X, y: 460, w: GRID.panelW, h: 170 },
  orreryCard: { x: PANEL_X, y: 640, w: GRID.panelW, h: 250 },
};

export function focusRect(name: FocusName): Rect {
  const r = FOCUS[name];
  if (!r) throw new Error(`focus: unknown focus name "${String(name)}" (see FOCUS_NAMES in src/config/focus.ts)`);
  return r;
}

export function rectCenter(r: Rect): { x: number; y: number } {
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

export function rectPoint(r: Rect, fx: number, fy: number): { x: number; y: number } {
  return { x: r.x + r.w * fx, y: r.y + r.h * fy };
}
