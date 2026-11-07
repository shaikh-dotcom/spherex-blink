import React from "react";
import { focusRect } from "../config/focus";
import { Stub } from "./Stub";

export interface PanelTabsState {
  tab: "inspect" | "context" | "planetx";
  reveal: number;
}

export const TABS_DEFAULT: PanelTabsState = { tab: "inspect", reveal: 1 };

export const PanelTabs: React.FC<{ state: PanelTabsState }> = () => <Stub name="PanelTabs (stub)" rect={focusRect("tabs")} />;
