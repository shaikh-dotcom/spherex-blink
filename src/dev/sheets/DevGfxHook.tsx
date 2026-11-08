import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FontsReady } from "../../lib/fonts";
import { HookField } from "../../gfx/HookField";
import { Mark } from "../../gfx/Mark";
import { theme } from "../../config/theme";
import { STAGE } from "../../config/timeline";
import type { DevSheet } from "../registry";

const DevGfxHook: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [30, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <FontsReady>
      <AbsoluteFill style={{ background: "#000" }}>
        <div style={{ position: "relative", width: STAGE.w, height: STAGE.h, background: theme.hookBg }}>
          <HookField frame={frame} start={0} end={299} />
          <div style={{ position: "absolute", right: 96, top: 80 }}>
            <Mark size={120} draw={draw} />
          </div>
        </div>
      </AbsoluteFill>
    </FontsReady>
  );
};

export const devSheet: DevSheet = { id: "DevGfxHook", component: DevGfxHook, durationInFrames: 300 };
