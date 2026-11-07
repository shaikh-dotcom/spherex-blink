import React from "react";
import { focusRect } from "../config/focus";
import { Stub } from "./Stub";

export interface PanelPlanetXState {
  distanceAu: number;
  outReveal: number;
  measureReveal: number;
  fitReveal: number;
}

export const PLANETX_DEFAULT: PanelPlanetXState = { distanceAu: 500, outReveal: 0, measureReveal: 0, fitReveal: 0 };

export const PanelPlanetX: React.FC<{ state: PanelPlanetXState }> = () => <Stub name="PanelPlanetX (stub)" rect={focusRect("pxLab")} />;
