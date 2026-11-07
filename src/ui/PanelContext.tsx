import React from "react";
import { focusRect } from "../config/focus";
import { Stub } from "./Stub";

export interface PanelContextState {
  reveal: number;
  validationReveal: number;
  referenceBlend: number;
}

export const CONTEXT_DEFAULT: PanelContextState = { reveal: 0, validationReveal: 0, referenceBlend: 0 };

export const PanelContext: React.FC<{ state: PanelContextState }> = () => <Stub name="PanelContext (stub)" rect={focusRect("contextField")} />;
