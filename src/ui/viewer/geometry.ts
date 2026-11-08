import { FOCUS, GRID } from "../../config/focus";
import { selectPallas } from "../../data/select";
import type { SkyViewerState } from "./state";

export const FIGURE = { w: FOCUS.figure.w, h: FOCUS.figure.h } as const;

export const VIEW_BOX = {
  left: GRID.rulerLeft,
  top: GRID.rulerTop,
  outer: GRID.figure,
  border: 1,
  inner: GRID.figure - 2,
} as const;

export const ZOOM_MAX = 14;

export const TILE = { w: selectPallas().tile.width, h: selectPallas().tile.height } as const;

export interface ViewTransform {
  s: number;
  tx: number;
  ty: number;
}

const clamp = (v: number, lo: number, hi: number): number => Math.min(hi, Math.max(lo, v));

export function viewTransform(state: Pick<SkyViewerState, "zoom" | "cx" | "cy">): ViewTransform {
  const W = VIEW_BOX.inner;
  const s = clamp(state.zoom, 1, ZOOM_MAX);
  const tx = clamp(W / 2 - state.cx * W * s, W - W * s, 0);
  const ty = clamp(W / 2 - state.cy * W * s, W - W * s, 0);
  return { s, tx, ty };
}

export function tileToFigure(state: Pick<SkyViewerState, "zoom" | "cx" | "cy">, col: number, row: number): { x: number; y: number } {
  const v = viewTransform(state);
  const W = VIEW_BOX.inner;
  return {
    x: VIEW_BOX.left + VIEW_BOX.border + v.tx + v.s * (((col + 0.5) / TILE.w) * W),
    y: VIEW_BOX.top + VIEW_BOX.border + v.ty + v.s * (((row + 0.5) / TILE.h) * W),
  };
}

export function tileToApp(state: Pick<SkyViewerState, "zoom" | "cx" | "cy">, col: number, row: number): { x: number; y: number } {
  const p = tileToFigure(state, col, row);
  return { x: FOCUS.figure.x + p.x, y: FOCUS.figure.y + p.y };
}
