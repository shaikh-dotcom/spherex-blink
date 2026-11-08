import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import "../../ui/theme.css";
import { theme } from "../../config/theme";
import { LOGICAL, STAGE } from "../../config/timeline";
import { FontsReady } from "../../lib/fonts";
import { Header, type HeaderState } from "../../ui/Header";
import { TimeBar, type TimeBarState } from "../../ui/TimeBar";
import type { DevSheet } from "../registry";

const STEP = 30;

const HEADERS: HeaderState[] = [
  { fieldId: "pallas", badge: "real", tourPulse: 0 },
  { fieldId: "synthetic", badge: "simulated", tourPulse: 0 },
  { fieldId: "pallas", badge: "real", tourPulse: 1 },
  { fieldId: "pallas-6mo", badge: "real", tourPulse: 0.5 },
];

const TIMES: TimeBarState[] = [
  { position: 0, epochSeg: null, reveal: 1, fieldId: "pallas" },
  { position: 0.5, epochSeg: null, reveal: 1, fieldId: "pallas" },
  { position: 0.5, epochSeg: 2, reveal: 1, fieldId: "pallas-6mo" },
  { position: 1, epochSeg: 3, reveal: 0.5, fieldId: "pallas-6mo" },
];

const DevHeaderTime: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(HEADERS.length - 1, Math.floor(frame / STEP));
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
            <Header state={HEADERS[i]} />
            <TimeBar state={TIMES[i]} />
          </div>
        </div>
      </AbsoluteFill>
    </FontsReady>
  );
};

export const devSheet: DevSheet = { id: "DevHeaderTime", component: DevHeaderTime, durationInFrames: STEP * HEADERS.length };
