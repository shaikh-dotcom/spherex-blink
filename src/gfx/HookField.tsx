import React from "react";
import { STAGE } from "../config/timeline";
import { alpha, fonts, theme } from "../config/theme";
import { clamp01, mapRange, signature } from "../lib/ease";
import { mulberry32 } from "../lib/prng";

export interface HookFieldProps {
  frame: number;
  start: number;
  end: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  phase: number;
  speed: number;
  glow: boolean;
}

const P1 = { x: 1260, y: 330 } as const;
const P2 = { x: 1344, y: 414 } as const;

const STAR_COUNT = 140;
const FLICKER_AT = 150;
const FLICKER_END = 210;
const FLICKER_HALF = 5;

export function hookDotPoints(): { p1: { x: number; y: number }; p2: { x: number; y: number } } {
  return { p1: { x: P1.x, y: P1.y }, p2: { x: P2.x, y: P2.y } };
}

const STARS: Star[] = (() => {
  const rnd = mulberry32(0x5b1e);
  const out: Star[] = [];
  while (out.length < STAR_COUNT) {
    const x = rnd() * STAGE.w;
    const y = rnd() * STAGE.h;
    const near = (p: { x: number; y: number }) => Math.hypot(x - p.x, y - p.y) < 90;
    const size = rnd();
    const r = 1 + size * size * 2.2;
    const a = 0.35 + rnd() * 0.6;
    const phase = rnd() * Math.PI * 2;
    const speed = 0.03 + rnd() * 0.06;
    const glow = size > 0.82;
    if (near(P1) || near(P2)) continue;
    out.push({ x, y, r, a, phase, speed, glow });
  }
  return out;
})();

export const HookField: React.FC<HookFieldProps> = ({ frame, start, end }) => {
  const t = frame - start;
  const span = Math.max(1, end - start);
  const push = 1 + 0.04 * clamp01(t / span);
  const flicker = t >= FLICKER_AT && t < FLICKER_END;
  const epoch = flicker ? Math.floor((t - FLICKER_AT) / FLICKER_HALF) % 2 : t >= FLICKER_END ? 1 : 0;
  const dot = epoch === 0 ? P1 : P2;
  const dotColor = flicker ? (epoch === 0 ? theme.frameA : theme.frameB) : theme.ink;
  const settled = t >= FLICKER_END;
  const ring = signature(clamp01((t - FLICKER_END) / 18));
  const ringR = 24;
  const ringLen = 2 * Math.PI * ringR;
  const trail = signature(clamp01((t - FLICKER_END) / 12));
  const label = signature(clamp01((t - 240) / 14));
  const transform = `translate(${P2.x} ${P2.y}) scale(${push}) translate(${-P2.x} ${-P2.y})`;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: STAGE.w,
        height: STAGE.h,
        overflow: "hidden",
        background: `radial-gradient(1300px 800px at 62% 36%, ${alpha(theme.accent, 0.035)}, transparent 70%), ${theme.hookBg}`,
      }}
    >
      <svg width={STAGE.w} height={STAGE.h} viewBox={`0 0 ${STAGE.w} ${STAGE.h}`} style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform={transform}>
          {STARS.map((s, i) => {
            const tw = 0.88 + 0.12 * Math.sin(frame * s.speed + s.phase);
            const o = s.a * tw;
            return (
              <g key={i}>
                {s.glow ? <circle cx={s.x} cy={s.y} r={s.r * 4.2} fill={theme.ink} opacity={o * 0.1} /> : null}
                <circle cx={s.x} cy={s.y} r={s.r} fill={theme.ink} opacity={o} />
              </g>
            );
          })}
          {settled ? (
            <line
              x1={P1.x}
              y1={P1.y}
              x2={P1.x + (P2.x - P1.x) * trail}
              y2={P1.y + (P2.y - P1.y) * trail}
              stroke={theme.accent}
              strokeOpacity={0.55}
              strokeWidth={1.4}
              strokeDasharray="6 7"
            />
          ) : null}
          <circle cx={dot.x} cy={dot.y} r={flicker ? 18 : 13} fill={dotColor} opacity={flicker ? 0.3 : 0.1} />
          <circle cx={dot.x} cy={dot.y} r={3.4} fill={dotColor} />
          {settled ? (
            <circle
              cx={P2.x}
              cy={P2.y}
              r={ringR}
              fill="none"
              stroke={theme.accent}
              strokeWidth={1.6}
              strokeDasharray={ringLen}
              strokeDashoffset={ringLen * (1 - ring)}
              transform={`rotate(-90 ${P2.x} ${P2.y})`}
            />
          ) : null}
        </g>
      </svg>
      <div
        style={{
          position: "absolute",
          left: 96,
          bottom: 40,
          fontFamily: fonts.mono,
          fontSize: 20,
          letterSpacing: 1,
          color: theme.ink3,
          opacity: label,
        }}
      >
        Illustration
      </div>
    </div>
  );
};

export const hookProgress = (frame: number, start: number, end: number): number => mapRange(frame, start, end, 0, 1);
