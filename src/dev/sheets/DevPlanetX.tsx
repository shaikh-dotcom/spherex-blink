import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../../ui/theme.css";
import { focusRect } from "../../config/focus";
import { fonts, theme } from "../../config/theme";
import { LOGICAL, STAGE } from "../../config/timeline";
import { FontsReady } from "../../lib/fonts";
import { ORRERY_DEFAULT, PanelOrrery, type PanelOrreryState } from "../../ui/PanelOrrery";
import { PanelPlanetX, PLANETX_DEFAULT, type PanelPlanetXState } from "../../ui/PanelPlanetX";
import { PanelTabs, type PanelTabsState } from "../../ui/PanelTabs";
import type { DevSheet } from "../registry";

const STEP = 20;
const SCALE = 1.2;

interface Case {
  label: string;
  planetx: PanelPlanetXState;
  orrery: PanelOrreryState;
}

const tabs: PanelTabsState = { tab: "planetx", reveal: 1 };
const lab: PanelPlanetXState = { ...PLANETX_DEFAULT, outReveal: 1 };
const full: PanelPlanetXState = { ...lab, measureReveal: 1, marks: 2, fitReveal: 1 };
const orr: PanelOrreryState = { ...ORRERY_DEFAULT, reveal: 1 };

const CASES: Case[] = [
  { label: "distance 30, orrery day 0", planetx: { ...lab, distanceAu: 30 }, orrery: { ...orr, day: 0 } },
  { label: "distance 100, orrery day 90", planetx: { ...lab, distanceAu: 100 }, orrery: { ...orr, day: 90 } },
  { label: "distance 500, orrery day 180", planetx: { ...lab, distanceAu: 500 }, orrery: { ...orr, day: 180 } },
  { label: "distance 1000, playing, day 180", planetx: { ...lab, distanceAu: 1000 }, orrery: { ...orr, day: 180, playing: true } },
  { label: "distance 160 snaps to 200, day 35", planetx: { ...lab, distanceAu: 160 }, orrery: { ...orr, day: 35 } },
  { label: "six-month line hidden", planetx: { ...lab, sixReveal: 0 }, orrery: { ...orr, day: 35 } },
  { label: "measure block, nothing marked", planetx: { ...lab, measureReveal: 1, marks: 0 }, orrery: { ...orr, day: 35 } },
  { label: "Mark A pressed (pulse)", planetx: { ...lab, measureReveal: 1, marks: 1, markPulse: 0.8 }, orrery: { ...orr, day: 36 } },
  { label: "Mark B pressed (pulse)", planetx: { ...lab, measureReveal: 1, marks: 2, markPulse: 0.8 }, orrery: { ...orr, day: 37 } },
  { label: "fit reveal 0", planetx: { ...lab, measureReveal: 1, marks: 2, fitReveal: 0 }, orrery: { ...orr, day: 37 } },
  { label: "fit reveal 0.5", planetx: { ...lab, measureReveal: 1, marks: 2, fitReveal: 0.5 }, orrery: { ...orr, day: 37 } },
  { label: "fit reveal 1, near", planetx: full, orrery: { ...orr, day: 37 } },
  { label: "fit kind still", planetx: { ...full, fitKind: "still" }, orrery: { ...orr, day: 37 } },
  { label: "fit kind distant", planetx: { ...full, fitKind: "distant" }, orrery: { ...orr, day: 37 } },
  { label: "fit kind misfit", planetx: { ...full, fitKind: "misfit" }, orrery: { ...orr, day: 37 } },
  { label: "orrery direction line 0.4, day 300", planetx: full, orrery: { ...orr, day: 300, dirReveal: 0.4 } },
  { label: "orrery last day 486", planetx: full, orrery: { ...orr, day: 486 } },
  { label: "pane half revealed", planetx: { ...full, reveal: 0.5, outReveal: 0.5, measureReveal: 0.5 }, orrery: { ...orr, reveal: 0.5, day: 90 } },
];

const DevPlanetX: React.FC = () => {
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
            <PanelPlanetX state={c.planetx} />
            <PanelOrrery state={c.orrery} />
          </div>
          <div style={{ position: "absolute", left: 40, top: 40, color: theme.ink2, fontFamily: fonts.mono, fontSize: 22 }}>{`${i + 1}/${CASES.length} ${c.label}`}</div>
        </div>
      </AbsoluteFill>
    </FontsReady>
  );
};

export const devSheet: DevSheet = { id: "DevPlanetX", component: DevPlanetX, durationInFrames: STEP * CASES.length };
