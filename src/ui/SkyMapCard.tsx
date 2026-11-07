import React from "react";
import { focusRect } from "../config/focus";
import { Stub } from "./Stub";

export interface SkyMapCardState {
  reveal: number;
  showKnown: boolean;
}

export const SKYMAP_DEFAULT: SkyMapCardState = { reveal: 0, showKnown: true };

export const SkyMapCard: React.FC<{ state: SkyMapCardState }> = () => <Stub name="SkyMapCard (stub)" rect={focusRect("skyMapCard")} />;
