import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FontsReady } from "../../lib/fonts";
import { ParallaxDiagram } from "../../gfx/ParallaxDiagram";
import { LimitsCard } from "../../gfx/LimitsCard";
import { theme } from "../../config/theme";
import { STAGE } from "../../config/timeline";
import type { DevSheet } from "../registry";

const SPLIT = 120;

const DevGfxExplain: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, SPLIT - 1], [0, 1], { extrapolateRight: "clamp" });
  const distance = interpolate(frame, [0, SPLIT - 1], [500, 500], { extrapolateRight: "clamp" });
  const limits = interpolate(frame, [SPLIT + 10, SPLIT + 160], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <FontsReady>
      <AbsoluteFill style={{ background: "#000" }}>
        <div style={{ position: "relative", width: STAGE.w, height: STAGE.h, background: theme.stageGradient }}>
          {frame < SPLIT ? (
            <div style={{ position: "absolute", left: (STAGE.w - 900) / 2, top: (STAGE.h - 520) / 2 }}>
              <ParallaxDiagram progress={progress} distanceAu={distance} />
            </div>
          ) : (
            <div style={{ position: "absolute", left: (STAGE.w - 1500) / 2, top: (STAGE.h - 560) / 2 }}>
              <LimitsCard progress={limits} />
            </div>
          )}
        </div>
      </AbsoluteFill>
    </FontsReady>
  );
};

export const devSheet: DevSheet = { id: "DevGfxExplain", component: DevGfxExplain, durationInFrames: 300 };
