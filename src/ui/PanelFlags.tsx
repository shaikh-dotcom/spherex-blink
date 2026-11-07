import React from "react";
import { focusRect } from "../config/focus";
import { Stub } from "./Stub";

export interface PanelFlagsState {
  formReveal: number;
  category: string;
  flagged: number;
  matchReveal: number;
  exportReveal: number;
}

export const FLAGS_DEFAULT: PanelFlagsState = { formReveal: 0, category: "asteroid", flagged: 0, matchReveal: 0, exportReveal: 0 };

export const PanelFlags: React.FC<{ state: PanelFlagsState }> = () => <Stub name="PanelFlags (stub)" rect={focusRect("flagForm")} />;
