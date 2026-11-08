import React from "react";
import { fonts, theme, alpha } from "../config/theme";
import { clamp01, signature } from "../lib/ease";
import { selectParallax, selectShift } from "../data/select";

export interface ParallaxDiagramProps {
  progress: number;
  distanceAu: number;
}

const W = 900;
const H = 520;
const SUN = { x: 190, y: 270 } as const;
const R = 118;
const SHORT_ARC = 16;

function snapDistance(distanceAu: number): number {
  const rows = selectParallax().table.map((r) => r.distanceAu);
  return rows.reduce((best, d) => (Math.abs(d - distanceAu) < Math.abs(best - distanceAu) ? d : best), rows[0]);
}

function farOffset(distanceAu: number): number {
  const t = Math.sqrt(clamp01((distanceAu - 30) / 970));
  return 300 + 320 * t;
}

function earthDegrees(progress: number): number {
  const p = clamp01(progress);
  if (p <= 0.5) return -90 + SHORT_ARC * signature(p / 0.5);
  return -90 + SHORT_ARC + (180 - SHORT_ARC) * signature((p - 0.5) / 0.5);
}

const onOrbit = (deg: number): { x: number; y: number } => ({
  x: SUN.x + R * Math.cos((deg * Math.PI) / 180),
  y: SUN.y + R * Math.sin((deg * Math.PI) / 180),
});

const label: React.CSSProperties = { fontFamily: fonts.mono, fontSize: 20, letterSpacing: 0.4 };

export const ParallaxDiagram: React.FC<ParallaxDiagramProps> = ({ progress, distanceAu }) => {
  const p = clamp01(progress);
  const snapped = snapDistance(distanceAu);
  const row = selectShift(snapped);
  const body = { x: SUN.x + farOffset(snapped), y: SUN.y };
  const deg = earthDegrees(p);
  const e0 = onOrbit(-90);
  const e1 = onOrbit(deg);
  const a0 = Math.atan2(e0.y - body.y, e0.x - body.x);
  const a1 = Math.atan2(e1.y - body.y, e1.x - body.x);
  const arcR = 112;
  const arcVisible = signature(clamp01((p - 0.08) / 0.2));
  const arcStart = { x: body.x + arcR * Math.cos(a0), y: body.y + arcR * Math.sin(a0) };
  const arcEnd = { x: body.x + arcR * Math.cos(a1), y: body.y + arcR * Math.sin(a1) };
  const da = Math.atan2(Math.sin(a1 - a0), Math.cos(a1 - a0));
  const sweep = da > 0 ? 1 : 0;
  const midA = a0 + da / 2;
  const tinyAt = { x: body.x + (arcR + 14) * Math.cos(midA), y: body.y + (arcR + 14) * Math.sin(midA) };
  const trailEnd = onOrbit(deg);
  const trailStart = onOrbit(-90);
  const trailLarge = deg + 90 > 180 ? 1 : 0;
  const secondLine = signature(clamp01((p - 0.04) / 0.12));
  const laterLabel = signature(clamp01((p - 0.9) / 0.1));
  const tinyLabel = signature(clamp01((p - 0.5) / 0.25));
  const shiftLabel = signature(clamp01((p - 0.92) / 0.08));
  return (
    <div style={{ position: "relative", width: W, height: H }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <circle cx={SUN.x} cy={SUN.y} r={R} fill="none" stroke={theme.ink} strokeOpacity={0.22} strokeWidth={1.4} />
        {p > 0.001 ? (
          <path
            d={`M ${trailStart.x} ${trailStart.y} A ${R} ${R} 0 ${trailLarge} 1 ${trailEnd.x} ${trailEnd.y}`}
            fill="none"
            stroke={theme.frameB}
            strokeOpacity={0.55}
            strokeWidth={2.4}
          />
        ) : null}
        <line x1={e0.x} y1={e0.y} x2={body.x} y2={body.y} stroke={theme.frameA} strokeOpacity={0.7} strokeWidth={1.5} strokeDasharray="8 7" />
        <line
          x1={e1.x}
          y1={e1.y}
          x2={body.x}
          y2={body.y}
          stroke={theme.frameB}
          strokeOpacity={0.75 * secondLine}
          strokeWidth={1.5}
          strokeDasharray="8 7"
        />
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${arcR} ${arcR} 0 0 ${sweep} ${arcEnd.x} ${arcEnd.y}`}
          fill="none"
          stroke={theme.ink}
          strokeOpacity={0.8 * arcVisible}
          strokeWidth={2}
        />
        <circle cx={SUN.x} cy={SUN.y} r={26} fill={theme.accent} opacity={0.14} />
        <circle cx={SUN.x} cy={SUN.y} r={9} fill={theme.accent} />
        <circle cx={e0.x} cy={e0.y} r={7} fill="none" stroke={theme.frameA} strokeWidth={2} />
        <circle cx={e1.x} cy={e1.y} r={7} fill={theme.frameB} />
        <circle cx={body.x} cy={body.y} r={30} fill={theme.planetX} opacity={0.16} />
        <circle cx={body.x} cy={body.y} r={10} fill={theme.planetX} />
      </svg>
      <div style={{ ...label, position: "absolute", left: SUN.x - 60, top: SUN.y + 18, width: 120, textAlign: "center", color: theme.ink3 }}>Sun</div>
      <div style={{ ...label, position: "absolute", left: e0.x - 110, top: e0.y - 40, width: 220, textAlign: "center", color: theme.frameA }}>Earth, day 0</div>
      <div
        style={{
          ...label,
          position: "absolute",
          left: onOrbit(90).x - 150,
          top: onOrbit(90).y + 16,
          width: 300,
          textAlign: "center",
          color: theme.frameB,
          opacity: laterLabel,
        }}
      >
        Earth, six months later
      </div>
      <div style={{ ...label, position: "absolute", left: body.x - 260, top: body.y - 88, width: 280, textAlign: "right", color: theme.planetX }}>Planet X (simulated)</div>
      <div style={{ ...label, position: "absolute", left: body.x - 160, top: body.y + 40, width: 180, textAlign: "right", color: theme.ink3 }}>{`${snapped} AU`}</div>
      <div
        style={{
          ...label,
          position: "absolute",
          left: tinyAt.x - 130,
          top: tinyAt.y - 14,
          width: 120,
          textAlign: "right",
          color: theme.ink,
          opacity: tinyLabel,
        }}
      >
        tiny shift
      </div>
      <div
        style={{
          ...label,
          position: "absolute",
          right: 0,
          bottom: 28,
          textAlign: "right",
          color: theme.ink2,
          opacity: shiftLabel,
        }}
      >
        {`Six-month shift at ${snapped} AU: ${row.sixMonthArcsec.toFixed(1)}″`}
      </div>
      <div style={{ ...label, position: "absolute", left: 0, bottom: 0, color: alpha(theme.ink, 0.5) }}>Illustration</div>
    </div>
  );
};
