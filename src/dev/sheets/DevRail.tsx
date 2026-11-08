import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../../ui/theme.css";
import { theme } from "../../config/theme";
import { LOGICAL, STAGE } from "../../config/timeline";
import { FontsReady } from "../../lib/fonts";
import { Rail, RAIL_DEFAULT, type RailState } from "../../ui/Rail";
import type { DevSheet } from "../registry";

const STEP = 20;

const STATES: RailState[] = [
  { ...RAIL_DEFAULT, mode: "static", hot: null },
  { ...RAIL_DEFAULT, mode: "blink", band: "D2", hot: "band" },
  { ...RAIL_DEFAULT, mode: "overlay", hot: "blink", rateHz: 5 },
  { ...RAIL_DEFAULT, mode: "blink", hot: "pair", band: "D4", rateHz: 1 },
  { ...RAIL_DEFAULT, mode: "static", hot: "layers", showKnown: false, snap: false },
  { ...RAIL_DEFAULT, mode: "static", hot: "keys", band: "D5", rateHz: 2 },
];

const DevRail: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(STATES.length - 1, Math.floor(frame / STEP));
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
              transform: "scale(1.2)",
              transformOrigin: "0 0",
              background: theme.paper,
              backgroundImage: theme.appBackground,
            }}
          >
            <Rail state={STATES[i]} />
          </div>
        </div>
      </AbsoluteFill>
    </FontsReady>
  );
};

export const devSheet: DevSheet = { id: "DevRail", component: DevRail, durationInFrames: STEP * STATES.length };
