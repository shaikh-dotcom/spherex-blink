import React from "react";
import { focusRect } from "../config/focus";
import { Stub } from "./Stub";

export interface TimeBarState {
  position: number;
  epochSeg: null | number;
  reveal: number;
}

export const TIME_DEFAULT: TimeBarState = { position: 0, epochSeg: null, reveal: 1 };

export const TimeBar: React.FC<{ state: TimeBarState }> = () => <Stub name="TimeBar (stub)" rect={focusRect("timeBar")} />;
