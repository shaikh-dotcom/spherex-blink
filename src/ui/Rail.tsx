import React from "react";
import { focusRect } from "../config/focus";
import { Stub } from "./Stub";

export interface RailState {
  band: string;
  mode: "static" | "blink" | "overlay";
  rateHz: 1 | 2 | 3 | 5;
  showKnown: boolean;
  showMask: boolean;
  snap: boolean;
  showFlags: boolean;
  hot: null | "band" | "blink" | "pair" | "layers" | "keys";
}

export const RAIL_DEFAULT: RailState = { band: "D1", mode: "static", rateHz: 3, showKnown: true, showMask: true, snap: true, showFlags: true, hot: null };

export const Rail: React.FC<{ state: RailState }> = () => <Stub name="Rail (stub)" rect={focusRect("rail")} />;
