import React from "react";
import { focusRect } from "../config/focus";

export interface PanelTabsState {
  tab: "inspect" | "context" | "planetx";
  reveal: number;
}

export const TABS_DEFAULT: PanelTabsState = { tab: "inspect", reveal: 1 };

const TABS: { id: PanelTabsState["tab"]; label: string; anchor: string }[] = [
  { id: "inspect", label: "Inspect", anchor: "tabInspect" },
  { id: "context", label: "Context", anchor: "tabContext" },
  { id: "planetx", label: "Planet X", anchor: "tabPlanetX" },
];

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

export const PanelTabs: React.FC<{ state: PanelTabsState }> = ({ state }) => {
  const r = focusRect("tabs");
  const reveal = clamp01(state.reveal);
  return (
    <nav
      className="sb-tabs"
      style={{ left: r.x, top: r.y, width: r.w, height: r.h, opacity: reveal, transform: `translateY(${(1 - reveal) * -6}px)` }}
      data-anchor="tabs"
    >
      {TABS.map((t) => (
        <div key={t.id} className={state.tab === t.id ? "tb on" : "tb"} data-anchor={t.anchor}>
          {t.label}
        </div>
      ))}
    </nav>
  );
};
