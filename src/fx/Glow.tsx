import React from "react";
import { useCurrentFrame } from "remotion";
import { theme } from "../config/theme";
import { clamp01, signature } from "../lib/ease";
export interface GlowProps {
    x: number;
    y: number;
    radius?: number;
    color?: string;
    intensity?: number;
    period?: number;
    depth?: number;
    startFrame?: number;
    endFrame?: number;
    fadeFrames?: number;
}
export const Glow: React.FC<GlowProps> = ({ x, y, radius = 320, color = theme.accent, intensity = 0.35, period = 60, depth = 0.4, startFrame = 0, endFrame, fadeFrames = 15, }) => {
    const frame = useCurrentFrame();
    const inP = signature(clamp01((frame - startFrame) / Math.max(1, fadeFrames)));
    const outP = endFrame === undefined ? 1 : 1 - signature(clamp01((frame - (endFrame - fadeFrames)) / Math.max(1, fadeFrames)));
    const env = inP * outP;
    if (env <= 0.001)
        return null;
    const breath = 0.5 + 0.5 * Math.cos((Math.PI * 2 * (frame - startFrame)) / Math.max(1, period));
    const o = intensity * env * (1 - depth + depth * breath);
    return (<div style={{
            position: "absolute",
            left: x - radius,
            top: y - radius,
            width: radius * 2,
            height: radius * 2,
            borderRadius: "50%",
            pointerEvents: "none",
            background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
            opacity: o,
            mixBlendMode: "screen",
        }}/>);
};
