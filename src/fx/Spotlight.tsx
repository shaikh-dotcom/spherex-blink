import React from "react";
import { useCurrentFrame } from "remotion";
import { STAGE } from "../config/timeline";
import { clamp01, signature } from "../lib/ease";
export interface SpotlightProps {
    startFrame: number;
    durationFrames?: number;
    rect?: {
        x: number;
        y: number;
        w: number;
        h: number;
    };
    angle?: number;
    band?: number;
    intensity?: number;
    radius?: number;
}
export const Spotlight: React.FC<SpotlightProps> = ({ startFrame, durationFrames = 40, rect = { x: 0, y: 0, w: STAGE.w, h: STAGE.h }, angle = 18, band = 0.22, intensity = 0.14, radius = 0, }) => {
    const frame = useCurrentFrame();
    if (frame < startFrame || frame > startFrame + durationFrames)
        return null;
    const t = clamp01((frame - startFrame) / Math.max(1, durationFrames));
    const p = signature(t);
    const bandW = rect.w * band;
    const slant = Math.tan((angle * Math.PI) / 180) * rect.h;
    const x = -bandW - slant + (rect.w + bandW * 2 + slant * 2) * p;
    const envelope = Math.sin(Math.PI * t);
    return (<div style={{
            position: "absolute",
            left: rect.x,
            top: rect.y,
            width: rect.w,
            height: rect.h,
            overflow: "hidden",
            borderRadius: radius,
            pointerEvents: "none",
        }}>
      <div style={{
            position: "absolute",
            left: x,
            top: -rect.h * 0.25,
            width: bandW,
            height: rect.h * 1.5,
            transform: `skewX(${-angle}deg)`,
            background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,1) 50%, rgba(255,255,255,0))",
            opacity: intensity * envelope,
            mixBlendMode: "soft-light",
            filter: "blur(6px)",
        }}/>
    </div>);
};
