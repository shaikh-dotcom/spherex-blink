import React from "react";
import { useCurrentFrame } from "remotion";
import { fonts, halo, layout, theme, type } from "../config/theme";
import { STAGE } from "../config/timeline";
import { SERIF_ADVANCE, checkRange, estimateWidth, inOut, splitHighlight } from "./util";
export interface CaptionProps {
    text: string | readonly string[];
    highlight?: string;
    sub?: string;
    startFrame: number;
    endFrame: number;
    size?: number;
}
const IN_FRAMES = 20;
const OUT_FRAMES = 12;
const LINE_STAGGER = 4;
export const Caption: React.FC<CaptionProps> = ({ text, highlight, sub, startFrame, endFrame, size = 72 }) => {
    checkRange("Caption", startFrame, endFrame);
    const frame = useCurrentFrame();
    if (frame < startFrame || frame >= endFrame)
        return null;
    const lines = typeof text === "string" ? [text] : [...text];
    const safeW = STAGE.w - 2 * layout.safeMargin;
    const longest = lines.reduce((m, l) => Math.max(m, estimateWidth(l, 1, SERIF_ADVANCE)), 0);
    const wanted = Math.min(type.captionMax, Math.max(type.captionMin, size));
    const fit = longest > 0 ? safeW / longest : wanted;
    const fontSize = Math.max(type.captionMin, Math.min(wanted, Math.floor(fit)));
    const subSize = 24;
    const subLineIn = (lines.length) * LINE_STAGGER;
    const row = (content: React.ReactNode, i: number, rowSize: number, extra: React.CSSProperties) => {
        const { inP, outP } = inOut(frame, startFrame + i * LINE_STAGGER, endFrame, IN_FRAMES, OUT_FRAMES);
        const y = (1 - inP) * 105 - outP * 105;
        return (<div key={i} style={{
                overflow: "hidden",
                padding: `${rowSize * 0.14}px ${rowSize * 0.4}px`,
                margin: `${-rowSize * 0.14}px ${-rowSize * 0.4}px`,
                lineHeight: 1.1,
            }}>
        <div style={{ transform: `translateY(${y}%)`, willChange: "transform", ...extra }}>{content}</div>
      </div>);
    };
    return (<div style={{
            position: "absolute",
            left: 0,
            width: STAGE.w,
            bottom: layout.captionBottom,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: fontSize * 0.1,
            pointerEvents: "none",
        }}>
      {lines.map((line, i) => row(splitHighlight(line, highlight).map((piece, j) => (<span key={j} style={piece.hl ? { color: theme.accentInk } : undefined}>
              {piece.text}
            </span>)), i, fontSize, {
            fontFamily: fonts.serif,
            fontWeight: 700,
            fontSize,
            letterSpacing: "-0.01em",
            color: theme.ink,
            whiteSpace: "nowrap",
            textShadow: `0 2px 28px ${halo(0.65)}, 0 1px 2px ${halo(0.5)}`,
        }))}
      {sub
            ? row(sub, subLineIn, subSize, {
                fontFamily: fonts.mono,
                fontWeight: 500,
                fontSize: subSize,
                letterSpacing: "0.02em",
                color: theme.ink2,
                whiteSpace: "nowrap",
                textShadow: `0 1px 12px ${halo(0.7)}`,
            })
            : null}
    </div>);
};
