import React from "react";
import { focusRect } from "../config/focus";
import { Stub } from "./Stub";

export interface PanelInspectState {
  reveal: number;
  verdict: null | "none" | "fixed" | "moves" | "unclear";
  verdictReveal: number;
}

export const INSPECT_DEFAULT: PanelInspectState = { reveal: 0, verdict: null, verdictReveal: 0 };

export const PanelInspect: React.FC<{ state: PanelInspectState }> = () => <Stub name="PanelInspect (stub)" rect={focusRect("inspectMeta")} />;
