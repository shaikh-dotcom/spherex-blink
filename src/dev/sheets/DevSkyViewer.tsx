import React from "react";
import { AbsoluteFill } from "remotion";
import "../../ui/theme.css";
import { FOCUS } from "../../config/focus";
import { fonts, theme } from "../../config/theme";
import { selectPair, selectPick } from "../../data/select";
import { STAGE } from "../../config/timeline";
import { FontsReady } from "../../lib/fonts";
import { SkyViewer, VIEWER_DEFAULT, type SkyViewerState } from "../../ui/SkyViewer";
import type { DevSheet } from "../registry";

const SCALE = 0.68;
const GAP = 14;

const pair = selectPair();
const pick = selectPick();

const BASE: SkyViewerState = { ...VIEWER_DEFAULT, fieldId: "pallas", pairA: pair.a.id, pairB: pair.b.id };

const PANELS: { label: string; state: SkyViewerState }[] = [
  { label: "zoom 1, phase 0 (A), known on", state: { ...BASE, blinkPhase: 0 } },
  { label: "zoom 1, phase 0.9 (B)", state: { ...BASE, blinkPhase: 0.9 } },
  { label: "overlay A amber, B cyan, coach", state: { ...BASE, overlayAB: true, coach: true } },
  {
    label: "zoom 3 at the pick, selection, Planet X 500 AU, marks A and B",
    state: {
      ...BASE,
      zoom: 3,
      cx: pick.pixel[0] / 1024,
      cy: pick.pixel[1] / 1024,
      selection: { col: pick.pixel[0], row: pick.pixel[1] },
      pxDrawAu: 500,
      markA: { col: pick.pixel[0], row: pick.pixel[1] },
      markB: { col: pick.pixel[0] + 40, row: pick.pixel[1] - 25 },
    },
  },
];

const DevSkyViewer: React.FC = () => {
  const w = FOCUS.figure.w * SCALE;
  const total = PANELS.length * w + (PANELS.length - 1) * GAP;
  const x0 = (STAGE.w - total) / 2;
  return (
    <FontsReady>
      <AbsoluteFill style={{ background: "#000" }}>
        <div className="film-root" style={{ position: "relative", width: STAGE.w, height: STAGE.h, overflow: "hidden", background: theme.stageGradient }}>
          {PANELS.map((p, i) => (
            <div key={p.label} style={{ position: "absolute", left: x0 + i * (w + GAP), top: 150, width: w, height: FOCUS.figure.h * SCALE }}>
              <div style={{ position: "absolute", left: 0, top: -34, width: w, color: theme.ink2, fontFamily: fonts.mono, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden" }}>{p.label}</div>
              <div style={{ position: "absolute", left: -FOCUS.figure.x * SCALE, top: -FOCUS.figure.y * SCALE, width: 1600, height: 900, transform: `scale(${SCALE})`, transformOrigin: "0 0" }}>
                <SkyViewer state={p.state} showKnown showMask />
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </FontsReady>
  );
};

export const devSheet: DevSheet = { id: "DevSkyViewer", component: DevSkyViewer, durationInFrames: 30 };
