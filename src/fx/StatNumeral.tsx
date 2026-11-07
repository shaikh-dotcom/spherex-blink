import React from "react";
import { useCurrentFrame } from "remotion";
import { fonts, theme } from "../config/theme";
import { clamp01, signature, stepPulse } from "../lib/ease";
export interface StatNumeralProps {
    value: number;
    from?: number;
    unit?: string;
    startFrame: number;
    durationFrames?: number;
    decimals?: number;
    group?: boolean;
    size?: number;
    color?: string;
    hideBefore?: boolean;
}
function format(v: number, decimals: number, group: boolean): string {
    const fixed = v.toFixed(decimals);
    if (!group)
        return fixed;
    const [int, frac] = fixed.split(".");
    const neg = int.startsWith("-");
    const digits = neg ? int.slice(1) : int;
    let out = "";
    for (let i = 0; i < digits.length; i++) {
        if (i > 0 && (digits.length - i) % 3 === 0)
            out += ",";
        out += digits[i];
    }
    return (neg ? "-" : "") + out + (frac !== undefined ? "." + frac : "");
}
export const StatNumeral: React.FC<StatNumeralProps> = ({ value, from = 0, unit, startFrame, durationFrames = 45, decimals = 0, group = false, size = 120, color = theme.ink, hideBefore = false, }) => {
    const frame = useCurrentFrame();
    if (hideBefore && frame < startFrame)
        return null;
    const t = clamp01((frame - startFrame) / Math.max(1, durationFrames));
    const current = from + (value - from) * signature(t);
    const done = t >= 1;
    const finalStr = format(value, decimals, group);
    const curStr = done ? finalStr : format(current, decimals, group);
    const width = Math.max(finalStr.length, curStr.length);
    const cur = curStr.padStart(width, " ");
    const fin = finalStr.padStart(width, " ");
    let lockedUpTo = 0;
    while (lockedUpTo < width && cur[lockedUpTo] === fin[lockedUpTo])
        lockedUpTo++;
    const punch = 1 + 0.025 * stepPulse(frame, startFrame + durationFrames, 8);
    return (<div style={{
            display: "inline-flex",
            alignItems: "baseline",
            gap: size * 0.12,
            fontFamily: fonts.mono,
            fontWeight: 700,
            fontSize: size,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums",
            color,
            transform: `scale(${punch})`,
            transformOrigin: "0 100%",
            whiteSpace: "pre",
        }}>
      <span>
        {cur.split("").map((ch, i) => (<span key={i} style={{ opacity: done || i < lockedUpTo ? 1 : 0.55 }}>
            {ch}
          </span>))}
      </span>
      {unit ? (<span style={{ fontSize: size * 0.34, fontWeight: 500, letterSpacing: "0.02em", color: theme.ink2 }}>{unit}</span>) : null}
    </div>);
};
