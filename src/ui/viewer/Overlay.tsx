import React from "react";
import { selectPallas, selectParallax, selectShift } from "../../data/select";
import type { FrameInfo } from "../../data/types";
import { theme } from "../../config/theme";
import { bandFrames, type FieldKind } from "./data";
import { TILE, VIEW_BOX, type ViewTransform } from "./geometry";
import { parallaxOffset } from "./parallax";
import type { SkyViewerState } from "./state";
import type { Wcs } from "./wcs";

const KNOWN = "#ffb347";
const KNOWN_INK = "#ffd9a0";
const PX = theme.planetX;
const PX_INK = "#ecc9ff";
const GLYPH = 0.47;

interface LabelProps {
  x: number;
  y: number;
  k: number;
  text: string;
  fill: string;
  view: ViewTransform;
}

const Label: React.FC<LabelProps> = ({ x, y, k, text, fill, view }) => {
  const fs = 14.5 * k;
  const width = text.length * GLYPH * fs;
  const m = 8 * k;
  const left = (-view.tx / view.s / VIEW_BOX.inner) * TILE.w;
  const right = ((VIEW_BOX.inner - view.tx) / view.s / VIEW_BOX.inner) * TILE.w;
  const top = (-view.ty / view.s / VIEW_BOX.inner) * TILE.h;
  const bottom = ((VIEW_BOX.inner - view.ty) / view.s / VIEW_BOX.inner) * TILE.h;
  let tx = x;
  let ty = y;
  let anchor: "start" | "end" = "start";
  if (tx + width > right - m) {
    anchor = "end";
    tx = x - 30 * k;
  }
  if (ty - fs < top + m) ty = y + 34 * k;
  if (ty > bottom - m) ty = y - 8 * k;
  if (anchor === "end" && tx - width < left + m) {
    anchor = "start";
    tx = left + m;
  }
  if (anchor === "start" && tx < left + m) tx = left + m;
  return (
    <text x={tx} y={ty} fontSize={fs} fill={fill} stroke="#000" strokeWidth={3 * k} paintOrder="stroke" textAnchor={anchor}>
      {text}
    </text>
  );
};

const Known: React.FC<{ frame: FrameInfo; wcs: Wcs; k: number; view: ViewTransform }> = ({ frame, wcs, k, view }) => {
  const p = selectPallas();
  const frames = [...p.frames].sort((a, b) => a.mjd - b.mjd);
  const track = frames
    .map((f) => {
      const t = p.target_positions[f.id];
      if (!t) return null;
      const q = wcs.toDraw(t.ra, t.dec);
      return { id: f.id, x: q.x, y: q.y };
    })
    .filter((x): x is { id: string; x: number; y: number } => x !== null);
  const here = track.find((q) => q.id === frame.id);
  return (
    <g>
      {track.length > 1 ? (
        <polyline points={track.map((q) => `${q.x},${q.y}`).join(" ")} fill="none" stroke={KNOWN} strokeOpacity={0.55} strokeWidth={1.2 * k} strokeDasharray={`${5 * k},${4 * k}`} />
      ) : null}
      {track.map((q) => (
        <circle key={q.id} cx={q.x} cy={q.y} r={2.2 * k} fill={KNOWN} fillOpacity={q.id === frame.id ? 1 : 0.45} />
      ))}
      {here ? (
        <>
          <circle cx={here.x} cy={here.y} r={11 * k} fill="none" stroke={KNOWN} strokeWidth={1.8 * k} />
          <Label x={here.x + 15 * k} y={here.y - 12 * k} k={k} text={`${p.target} (known asteroid)`} fill={KNOWN_INK} view={view} />
        </>
      ) : null}
    </g>
  );
};

const Selection: React.FC<{ col: number; row: number; k: number }> = ({ col, row, k }) => {
  const x = col + 0.5;
  const y = row + 0.5;
  const w = TILE.w;
  const h = TILE.h;
  const st = { stroke: KNOWN, strokeOpacity: 0.55, strokeWidth: k } as const;
  const tick = 4 * k;
  return (
    <g>
      <line x1={x} y1={0} x2={x} y2={y - 10} {...st} />
      <line x1={x} y1={y + 10} x2={x} y2={h} {...st} />
      <line x1={0} y1={y} x2={x - 10} y2={y} {...st} />
      <line x1={x + 10} y1={y} x2={w} y2={y} {...st} />
      <circle cx={x} cy={y} r={10} fill="none" {...st} />
      <line x1={x - tick} y1={y} x2={x + tick} y2={y} stroke={KNOWN} strokeWidth={k} />
      <line x1={x} y1={y - tick} x2={x} y2={y + tick} stroke={KNOWN} strokeWidth={k} />
    </g>
  );
};

const Mark: React.FC<{ col: number; row: number; k: number; letter: "A" | "B"; color: string }> = ({ col, row, k, letter, color }) => {
  const x = col + 0.5;
  const y = row + 0.5;
  const bw = 15 * k;
  const bh = 15 * k;
  const bx = x + 9 * k;
  const by = y - 9 * k - bh;
  return (
    <g>
      <circle cx={x} cy={y} r={9 * k} fill="none" stroke={color} strokeWidth={1.8 * k} />
      <rect x={bx} y={by} width={bw} height={bh} rx={2 * k} fill={color} />
      <text x={bx + bw / 2} y={by + bh / 2} dy=".35em" textAnchor="middle" fontSize={12 * k} fontWeight={700} fill={theme.onAccent} style={{ fontStyle: "normal" }}>
        {letter}
      </text>
    </g>
  );
};

function pxTrack(frame: FrameInfo, kind: FieldKind, distanceAu: number, wcs: Wcs): { pts: { x: number; y: number; id: string }[]; cur: number } | null {
  const list = bandFrames(kind, frame.band);
  if (list.length < 2) return null;
  const p = selectPallas();
  const { ra, dec } = p.centre;
  const t0 = list[0].mjd;
  const cosd = Math.cos((dec * Math.PI) / 180);
  const raw = list
    .map((f) => {
      const o = parallaxOffset(distanceAu, t0, f.mjd, ra, dec);
      return o ? { id: f.id, o } : null;
    })
    .filter((x): x is { id: string; o: { e: number; n: number } } => x !== null);
  if (!raw.length) return null;
  let scale = 1;
  const par = selectParallax();
  const last = raw[raw.length - 1];
  const total = Math.hypot(last.o.e, last.o.n);
  const sameWindow = Math.abs(list[0].mjd - par.window.mjdFrom) < 0.01 && Math.abs(list[list.length - 1].mjd - par.window.mjdTo) < 0.01;
  if (kind === "pallas" && sameWindow && total > 0) {
    try {
      scale = selectShift(distanceAu).windowArcsec / total;
    } catch {
      scale = 1;
    }
  }
  const pts = raw.map((r) => {
    const q = wcs.toDraw(ra + (r.o.e * scale) / cosd / 3600, dec + (r.o.n * scale) / 3600);
    return { x: q.x, y: q.y, id: r.id };
  });
  return { pts, cur: Math.max(0, raw.findIndex((r) => r.id === frame.id)) };
}

const PlanetX: React.FC<{ frame: FrameInfo; kind: FieldKind; wcs: Wcs; k: number; view: ViewTransform; distanceAu: number }> = ({ frame, kind, wcs, k, view, distanceAu }) => {
  const tr = pxTrack(frame, kind, distanceAu, wcs);
  if (!tr) return null;
  const cp = tr.pts[tr.cur] ?? tr.pts[0];
  return (
    <g>
      <polyline points={tr.pts.map((q) => `${q.x},${q.y}`).join(" ")} fill="none" stroke={PX} strokeWidth={1.5 * k} />
      {tr.pts.map((q, i) => (
        <circle key={q.id} cx={q.x} cy={q.y} r={(i === tr.cur ? 4 : 2) * k} fill={PX} fillOpacity={i === tr.cur ? 1 : 0.5} />
      ))}
      <Label x={cp.x + 10 * k} y={cp.y - 10 * k} k={k} text={`Planet X @ ${distanceAu} AU (simulated)`} fill={PX_INK} view={view} />
    </g>
  );
};

export const Overlay: React.FC<{ state: SkyViewerState; frame: FrameInfo; kind: FieldKind; wcs: Wcs; view: ViewTransform; showKnown: boolean }> = ({ state, frame, kind, wcs, view, showKnown }) => {
  const k = TILE.w / VIEW_BOX.inner / view.s;
  return (
    <svg className="overlay" viewBox={`0 0 ${TILE.w} ${TILE.h}`} xmlns="http://www.w3.org/2000/svg">
      {showKnown && kind === "pallas" ? <Known frame={frame} wcs={wcs} k={k} view={view} /> : null}
      {state.pxDrawAu !== null ? <PlanetX frame={frame} kind={kind} wcs={wcs} k={k} view={view} distanceAu={state.pxDrawAu} /> : null}
      {state.selection ? <Selection col={state.selection.col} row={state.selection.row} k={k} /> : null}
      {state.markA && state.markB ? (
        <line x1={state.markA.col + 0.5} y1={state.markA.row + 0.5} x2={state.markB.col + 0.5} y2={state.markB.row + 0.5} stroke={theme.ink} strokeOpacity={0.4} strokeWidth={k} strokeDasharray={`${4 * k},${3 * k}`} />
      ) : null}
      {state.markA ? <Mark col={state.markA.col} row={state.markA.row} k={k} letter="A" color={theme.frameA} /> : null}
      {state.markB ? <Mark col={state.markB.col} row={state.markB.row} k={k} letter="B" color={theme.frameB} /> : null}
    </svg>
  );
};
