import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { edgeLight, fonts, shade, theme } from "../config/theme";
import { clamp01 } from "../lib/ease";
import { spr } from "../lib/spring";
export interface KeyCapProps {
    label: string;
    startFrame?: number;
    pressAt?: readonly number[];
    size?: number;
}
const PRESS_FRAMES = 6;
function pressDepth(frame: number, pressAt: readonly number[]): number {
    let d = 0;
    for (const p of pressAt) {
        const local = frame - p;
        if (local < 0 || local >= PRESS_FRAMES)
            continue;
        const t = local / PRESS_FRAMES;
        d = Math.max(d, t < 0.33 ? t / 0.33 : 1 - (t - 0.33) / 0.67);
    }
    return clamp01(d);
}
export const KeyCap: React.FC<KeyCapProps> = ({ label, startFrame = 0, pressAt = [], size = 28 }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    if (frame < startFrame)
        return null;
    const pop = Math.max(0, spr(frame, fps, startFrame, "uiPop"));
    const d = pressDepth(frame, pressAt);
    const depth = 5 * (1 - d);
    const dip = 5 - depth;
    const minW = size * 1.9;
    return (<div style={{
            display: "inline-block",
            transform: `scale(${0.8 + 0.2 * pop})`,
            opacity: clamp01(pop * 1.5),
            transformOrigin: "50% 100%",
        }}>
      <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: minW,
            height: size * 1.9,
            padding: `0 ${size * 0.6}px`,
            borderRadius: size * 0.34,
            border: `1px solid ${theme.rule2}`,
            background: `linear-gradient(180deg, ${theme.raised}, ${theme.sheet})`,
            boxShadow: `0 ${depth}px 0 ${theme.rule2}, 0 ${depth + 10}px 20px -8px ${shade(0.8)}, 0 1px 0 ${edgeLight(0.07)} inset`,
            transform: `translateY(${dip}px)`,
            fontFamily: fonts.mono,
            fontWeight: 700,
            fontSize: size,
            color: theme.ink,
            letterSpacing: "0.02em",
            whiteSpace: "nowrap",
        }}>
        {label}
      </div>
    </div>);
};
