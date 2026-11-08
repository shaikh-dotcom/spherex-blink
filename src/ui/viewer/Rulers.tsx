import React from "react";
import { GRID } from "../../config/focus";
import { VIEW_BOX, type ViewTransform } from "./geometry";
import type { Wcs } from "./wcs";

export interface Tick {
  v: number;
  p: number;
}

export interface TickSet {
  major: Tick[];
  minor: Tick[];
  d: number;
}

export interface RulerLayout {
  top: TickSet;
  left: TickSet;
  eastSide: "left" | "right";
}

function nice(span: number, target: number): { step: number; minors: number } {
  const raw = span / target;
  const p = Math.pow(10, Math.floor(Math.log10(raw)));
  const m = raw / p;
  const n = m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10;
  return { step: n * p, minors: n === 2 ? 4 : 5 };
}

const decimals = (step: number): number => Math.max(0, Math.ceil(-Math.log10(step) - 1e-9));

function ticks(v0: number, v1: number, len: number, target: number): TickSet {
  const span = Math.abs(v1 - v0);
  const { step, minors } = nice(span, target);
  const lo = Math.min(v0, v1);
  const hi = Math.max(v0, v1);
  const out: TickSet = { major: [], minor: [], d: decimals(step) };
  const sub = step / minors;
  for (let v = Math.ceil(lo / sub - 1e-9) * sub; v <= hi + 1e-9; v += sub) {
    const k = Math.round(v / step);
    const isMajor = Math.abs(v - k * step) < sub * 0.01;
    (isMajor ? out.major : out.minor).push({ v: isMajor ? k * step : v, p: ((v - v0) / (v1 - v0)) * len });
  }
  return out;
}

const mod360 = (v: number): number => ((v % 360) + 360) % 360;

export function eastSideOf(wcs: Wcs): "left" | "right" {
  const a = wcs.toSky(wcs.width / 2, wcs.height / 2);
  const b = wcs.toSky(wcs.width / 2 + 20, wcs.height / 2);
  let d = b.ra - a.ra;
  if (d > 180) d -= 360;
  else if (d < -180) d += 360;
  return d > 0 ? "right" : "left";
}

export function rulerLayout(wcs: Wcs, view: ViewTransform): RulerLayout {
  const W = VIEW_BOX.inner;
  const H = VIEW_BOX.inner;
  const { s, tx, ty } = view;
  const c0 = ((0 - tx) / s / W) * wcs.width;
  const c1 = ((W - tx) / s / W) * wcs.width;
  const r0 = ((0 - ty) / s / H) * wcs.height;
  const r1 = ((H - ty) / s / H) * wcs.height;
  const ra0 = wcs.toSky(c0 - 0.5, r0 - 0.5).ra;
  let ra1 = wcs.toSky(c1 - 0.5, r0 - 0.5).ra;
  if (ra1 - ra0 > 180) ra1 -= 360;
  else if (ra1 - ra0 < -180) ra1 += 360;
  const top = ticks(ra0, ra1, W, W / 118);
  const d0 = wcs.toSky(c0 - 0.5, r0 - 0.5).dec;
  const d1 = wcs.toSky(c0 - 0.5, r1 - 0.5).dec;
  const left = ticks(d0, d1, H, H / 100);
  return { top, left, eastSide: eastSideOf(wcs) };
}

export const TopRuler: React.FC<{ layout: RulerLayout; dim: number }> = ({ layout, dim }) => {
  const W = VIEW_BOX.inner;
  const th = GRID.rulerTop;
  const t = layout.top;
  return (
    <svg className="ax" style={{ left: VIEW_BOX.left + VIEW_BOX.border, top: 0, width: W, height: th, opacity: dim }} viewBox={`0 0 ${W} ${th}`} aria-hidden="true">
      <line className="base" x1={0} x2={W} y1={th - 0.5} y2={th - 0.5} />
      {t.minor.map((k, i) => (
        <line key={`n${i}`} className="min" x1={k.p} x2={k.p} y1={th - 4} y2={th} />
      ))}
      {t.major.map((k, i) => (
        <React.Fragment key={`j${i}`}>
          <line className="maj" x1={k.p} x2={k.p} y1={th - 8} y2={th} />
          {k.p > 20 && k.p < W - 20 ? (
            <text x={k.p} y={th - 12} textAnchor="middle">
              {`${mod360(k.v).toFixed(t.d)}\u00b0`}
            </text>
          ) : null}
        </React.Fragment>
      ))}
    </svg>
  );
};

export const LeftRuler: React.FC<{ layout: RulerLayout; dim: number }> = ({ layout, dim }) => {
  const H = VIEW_BOX.inner;
  const lw = GRID.rulerLeft;
  const t = layout.left;
  return (
    <svg className="ax" style={{ left: 0, top: VIEW_BOX.top + VIEW_BOX.border, width: lw, height: H, opacity: dim }} viewBox={`0 0 ${lw} ${H}`} aria-hidden="true">
      <line className="base" x1={lw - 0.5} x2={lw - 0.5} y1={0} y2={H} />
      {t.minor.map((k, i) => (
        <line key={`n${i}`} className="min" y1={k.p} y2={k.p} x1={lw - 4} x2={lw} />
      ))}
      {t.major.map((k, i) => (
        <React.Fragment key={`j${i}`}>
          <line className="maj" y1={k.p} y2={k.p} x1={lw - 8} x2={lw} />
          {k.p > 10 && k.p < H - 10 ? (
            <text x={lw - 12} y={k.p} dy=".32em" textAnchor="end">
              {`${k.v < 0 ? "\u2212" : "+"}${Math.abs(k.v).toFixed(t.d)}\u00b0`}
            </text>
          ) : null}
        </React.Fragment>
      ))}
    </svg>
  );
};
