import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../../ui/theme.css";
import { focusRect } from "../../config/focus";
import { fonts, theme } from "../../config/theme";
import { LOGICAL, STAGE } from "../../config/timeline";
import { FontsReady } from "../../lib/fonts";
import { CONTEXT_DEFAULT, PanelContext, type PanelContextState } from "../../ui/PanelContext";
import { PanelTabs, type PanelTabsState } from "../../ui/PanelTabs";
import { SKYMAP_DEFAULT, SkyMapCard, type SkyMapCardState } from "../../ui/SkyMapCard";
import type { DevSheet } from "../registry";

const STEP = 20;
const SCALE = 1.2;

interface Case {
  label: string;
  context: PanelContextState;
  skymap: SkyMapCardState;
}

const tabs: PanelTabsState = { tab: "context", reveal: 1 };
const base: PanelContextState = { ...CONTEXT_DEFAULT, reveal: 1 };
const staged: PanelContextState = { ...base, acrossReveal: 0, strictReveal: 0 };
const mapOn: SkyMapCardState = { ...SKYMAP_DEFAULT, reveal: 1, showKnown: true };
const mapOff: SkyMapCardState = { ...mapOn, showKnown: false };

const CASES: Case[] = [
  { label: "validationReveal 0", context: { ...staged, validationReveal: 0 }, skymap: mapOn },
  { label: "validationReveal 0.5", context: { ...staged, validationReveal: 0.5 }, skymap: mapOn },
  { label: "validationReveal 1, found 13 of 13", context: { ...staged, validationReveal: 1 }, skymap: mapOn },
  { label: "across fields line", context: { ...staged, validationReveal: 1, acrossReveal: 1 }, skymap: mapOn },
  { label: "strict line half", context: { ...staged, validationReveal: 1, acrossReveal: 1, strictReveal: 0.5 }, skymap: mapOn },
  { label: "strict line shown, blend 0", context: { ...base, validationReveal: 1, referenceBlend: 0 }, skymap: mapOn },
  { label: "referenceBlend 0.6", context: { ...base, validationReveal: 1, referenceBlend: 0.6 }, skymap: mapOn },
  { label: "referenceBlend 0.6, 2MASS", context: { ...base, validationReveal: 1, referenceBlend: 0.6, refLayer: "2mass" }, skymap: mapOn },
  { label: "skymap showKnown false", context: { ...base, validationReveal: 1 }, skymap: mapOff },
  { label: "pane half revealed", context: { ...base, reveal: 0.5, validationReveal: 1, referenceBlend: 0.3 }, skymap: { ...mapOn, reveal: 0.5 } },
];

const DevContext: React.FC = () => {
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
            <PanelTabs state={tabs} />
            <PanelContext state={c.context} />
            <SkyMapCard state={c.skymap} />
          </div>
          <div style={{ position: "absolute", left: 40, top: 40, color: theme.ink2, fontFamily: fonts.mono, fontSize: 22 }}>{`${i + 1}/${CASES.length} ${c.label}`}</div>
        </div>
      </AbsoluteFill>
    </FontsReady>
  );
};

export const devSheet: DevSheet = { id: "DevContext", component: DevContext, durationInFrames: STEP * CASES.length };
