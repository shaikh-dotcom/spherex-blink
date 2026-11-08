import React from "react";
import { theme } from "../config/theme";
import { clamp01, easeOutBack, signature } from "../lib/ease";

export interface MarkProps {
  size: number;
  color?: string;
  draw?: number;
}

const CIRCLE_LEN = 2 * Math.PI * 17.5;

function ellipseLen(a: number, b: number): number {
  const h = ((a - b) / (a + b)) ** 2;
  return Math.PI * (a + b) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

const ELLIPSE_LEN = ellipseLen(14.5, 5.6);

const segment = (draw: number, from: number, to: number): number => signature(clamp01((draw - from) / (to - from)));

function dashed(len: number, p: number): { strokeDasharray?: number; strokeDashoffset?: number } {
  if (p >= 1) return {};
  return { strokeDasharray: len, strokeDashoffset: len * (1 - p) };
}

export const Mark: React.FC<MarkProps> = ({ size, color = theme.ink, draw = 1 }) => {
  const d = clamp01(draw);
  const outer = segment(d, 0, 0.35);
  const e1 = segment(d, 0.2, 0.6);
  const e2 = segment(d, 0.35, 0.75);
  const core = segment(d, 0.7, 0.85);
  const pop = d <= 0.85 ? 0 : easeOutBack((d - 0.85) / 0.15);
  return (
    <svg width={size} height={size} viewBox="0 0 38 38" aria-hidden="true" style={{ color, overflow: "visible" }}>
      <circle cx="19" cy="19" r="17.5" fill="none" stroke="currentColor" strokeOpacity={0.28} {...dashed(CIRCLE_LEN, outer)} />
      <ellipse cx="19" cy="19" rx="14.5" ry="5.6" transform="rotate(-24 19 19)" fill="none" stroke="currentColor" strokeWidth={1.3} {...dashed(ELLIPSE_LEN, e1)} />
      <ellipse cx="19" cy="19" rx="14.5" ry="5.6" transform="rotate(36 19 19)" fill="none" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1} {...dashed(ELLIPSE_LEN, e2)} />
      <circle cx="19" cy="19" r={3.3 * core} fill="currentColor" />
      <circle cx="30.8" cy="13.6" r={Math.max(0, 2.3 * pop)} fill={theme.accent} />
    </svg>
  );
};
