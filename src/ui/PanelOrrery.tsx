import React from "react";
import { focusRect } from "../config/focus";
import { Stub } from "./Stub";

export interface PanelOrreryState {
  reveal: number;
  day: number;
  playing: boolean;
}

export const ORRERY_DEFAULT: PanelOrreryState = { reveal: 0, day: 0, playing: false };

export const PanelOrrery: React.FC<{ state: PanelOrreryState }> = () => <Stub name="PanelOrrery (stub)" rect={focusRect("orreryCard")} />;
