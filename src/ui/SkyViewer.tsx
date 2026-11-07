import React from "react";
import { focusRect } from "../config/focus";
import { Stub } from "./Stub";

export interface SkyViewerState {
  fieldId: string;
  pairA: string;
  pairB: string;
  blinkPhase: number;
  zoom: number;
  cx: number;
  cy: number;
  selection: null | { col: number; row: number };
  overlayAB: boolean;
  view: "sky" | "solar";
  refBlend: number;
  pxDrawAu: null | number;
  markA: null | { col: number; row: number };
  markB: null | { col: number; row: number };
  reveal: number;
}

export const VIEWER_DEFAULT: SkyViewerState = {
  fieldId: "pallas",
  pairA: "",
  pairB: "",
  blinkPhase: 0,
  zoom: 1,
  cx: 0.5,
  cy: 0.5,
  selection: null,
  overlayAB: false,
  view: "sky",
  refBlend: 0,
  pxDrawAu: null,
  markA: null,
  markB: null,
  reveal: 1,
};

export const SkyViewer: React.FC<{ state: SkyViewerState }> = () => <Stub name="SkyViewer (stub)" rect={focusRect("figure")} />;
