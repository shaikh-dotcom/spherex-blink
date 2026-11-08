import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../../ui/theme.css";
import { focusRect } from "../../config/focus";
import { fonts, theme } from "../../config/theme";
import { LOGICAL, STAGE } from "../../config/timeline";
import { FontsReady } from "../../lib/fonts";
import { FLAGS_DEFAULT, PanelFlags, type PanelFlagsState } from "../../ui/PanelFlags";
import { INSPECT_DEFAULT, PanelInspect, type PanelInspectState } from "../../ui/PanelInspect";
import { PanelTabs, TABS_DEFAULT, type PanelTabsState } from "../../ui/PanelTabs";
import type { DevSheet } from "../registry";

const STEP = 20;
const SCALE = 1.2;

interface Case {
  label: string;
  tabs: PanelTabsState;
  inspect: PanelInspectState;
  flags: PanelFlagsState;
}

const selected: PanelInspectState = { reveal: 1, verdict: "moves", verdictReveal: 1 };
const formShown: PanelFlagsState = { ...FLAGS_DEFAULT, formReveal: 1 };
const flaggedState: PanelFlagsState = { ...formShown, flagged: 1, matchReveal: 1 };

const CASES: Case[] = [
  { label: "nothing selected", tabs: TABS_DEFAULT, inspect: INSPECT_DEFAULT, flags: FLAGS_DEFAULT },
  { label: "selected, verdict moves", tabs: TABS_DEFAULT, inspect: selected, flags: FLAGS_DEFAULT },
  { label: "form shown", tabs: TABS_DEFAULT, inspect: selected, flags: formShown },
  { label: "flagged, match note shown", tabs: TABS_DEFAULT, inspect: selected, flags: flaggedState },
  { label: "export shown, buttons pulsing", tabs: TABS_DEFAULT, inspect: selected, flags: { ...flaggedState, exportReveal: 1, exportPulse: 0.8 } },
  { label: "state pill pulsing", tabs: TABS_DEFAULT, inspect: selected, flags: { ...flaggedState, exportReveal: 1, statePulse: 0.8 } },
  { label: "verdict fixed, tab context", tabs: { tab: "context", reveal: 1 }, inspect: { reveal: 1, verdict: "fixed", verdictReveal: 1 }, flags: formShown },
  { label: "verdict unclear, tab planetx", tabs: { tab: "planetx", reveal: 1 }, inspect: { reveal: 1, verdict: "unclear", verdictReveal: 1 }, flags: formShown },
  { label: "verdict none, half revealed", tabs: { tab: "inspect", reveal: 0.5 }, inspect: { reveal: 0.5, verdict: "none", verdictReveal: 0.5 }, flags: { ...formShown, formReveal: 0.5 } },
];

const DevInspect: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(CASES.length - 1, Math.floor(frame / STEP));
  const c = CASES[i];
  const panel = focusRect("panel");
  const left = (STAGE.w - panel.w * SCALE) / 2 - panel.x * SCALE;
  const top = (STAGE.h - panel.h * SCALE) / 2 - panel.y * SCALE;
  return (
    <FontsReady>
      <AbsoluteFill style={{ background: "#000" }}>
        <div className="film-root" style={{ position: "relative", width: STAGE.w, height: STAGE.h, overflow: "hidden", background: theme.stageGradient }}>
          <div
            className="film-app-layer"
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: LOGICAL.w,
              height: LOGICAL.h,
              transform: `translate(${left}px, ${top}px) scale(${SCALE})`,
              transformOrigin: "0 0",
              background: theme.paper,
              backgroundImage: theme.appBackground,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: panel.x,
                top: panel.y,
                width: panel.w,
                height: panel.h,
                boxSizing: "border-box",
                borderLeft: `1px solid ${theme.rule2}`,
                background: "linear-gradient(180deg, rgba(11,13,20,0.9), rgba(6,7,11,0.96))",
              }}
            />
            <PanelTabs state={c.tabs} />
            <PanelInspect state={c.inspect} />
            <PanelFlags state={c.flags} />
          </div>
          <div style={{ position: "absolute", left: 40, top: 40, color: theme.ink2, fontFamily: fonts.mono, fontSize: 22 }}>{`${i + 1}/${CASES.length} ${c.label}`}</div>
        </div>
      </AbsoluteFill>
    </FontsReady>
  );
};

export const devSheet: DevSheet = { id: "DevInspect", component: DevInspect, durationInFrames: STEP * CASES.length };
