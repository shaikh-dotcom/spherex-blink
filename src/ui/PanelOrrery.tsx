import React from "react";
import { alpha, theme } from "../config/theme";
import { focusRect } from "../config/focus";
import { selectOrrery, selectPallas } from "../data/select";
import { clamp01 } from "../lib/ease";

export interface PanelOrreryState {
  reveal: number;
  day: number;
  playing: boolean;
  dirReveal: number;
}

export const ORRERY_DEFAULT: PanelOrreryState = { reveal: 0, day: 0, playing: false, dirReveal: 1 };

const RAD = Math.PI / 180;
const OUTER_AU = 31;
const SIZE = 184;
const SCALE = SIZE / 316;
const RING = SIZE / 2 - SIZE * 0.05;
const MID = SIZE / 2;
const FONT = 9.5;
const MARGIN = 3;
const SUN_R = 4.4;
const MJD_UNIX_EPOCH = 40587;

const PLANET_COLOR: Record<string, string> = {
  mercury: "#b8b8b8",
  venus: "#f0e0a0",
  earth: "#4da3ff",
  mars: "#ee6a4f",
  jupiter: "#e0a468",
  saturn: "#ead58f",
  uranus: "#7fd8e6",
  neptune: "#6b88ff",
};

const DOT_R: Record<string, number> = {
  mercury: 1.7,
  venus: 2.3,
  earth: 2.5,
  mars: 2,
  jupiter: 3.8,
  saturn: 3.3,
  uranus: 2.7,
  neptune: 2.7,
};

const APP_SIZE: Record<string, number> = {
  mercury: 9,
  venus: 12,
  earth: 13,
  mars: 10,
  jupiter: 28,
  saturn: 42,
  uranus: 20,
  neptune: 20,
};

const EARTH_ORBIT = "#7aa7ff";
const EARTH_LABEL = "#cfe0ff";
const DIRECTION_TEXT = "direction of this field";
const NOTE =
  "Top-down view, square-root distance scale. The violet dashed line is the direction of this field from Earth: a distant Planet X would lie somewhere along it.";

const STARS: [number, number, number][] = Array.from({ length: 170 }, (_, i) => {
  const a = Math.sin(i * 127.1) * 43758.5453;
  const b = Math.sin(i * 311.7) * 12543.853;
  return [a - Math.floor(a), b - Math.floor(b), 0.15 + ((((a * 7) % 1) + 1) % 1) * 0.5];
});

const lift = (v: number): React.CSSProperties => ({ opacity: v, transform: `translateY(${((1 - v) * 6).toFixed(2)}px)` });

const titleCase = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

function radius(au: number): number {
  return RING * (0.1 + 0.9 * Math.sqrt(au / OUTER_AU));
}

function project(x: number, y: number): [number, number] {
  const r = Math.hypot(x, y);
  if (r === 0) return [MID, MID];
  const k = radius(r) / r;
  return [MID + x * k, MID - y * k];
}

function positionAt(track: number[][], index: number): [number, number, number] {
  const last = track.length - 1;
  const t = Math.min(last, Math.max(0, index));
  const i = Math.min(last - 1, Math.floor(t));
  const f = t - i;
  const a = track[i];
  const b = track[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, (a[2] ?? 0) + ((b[2] ?? 0) - (a[2] ?? 0)) * f];
}

function textWidth(text: string): number {
  let em = 0;
  for (const ch of text) {
    if (ch === " ") em += 0.25;
    else if (/[A-Z]/.test(ch)) em += 0.62;
    else if (/[mw]/.test(ch)) em += 0.7;
    else if (/[ijlt.,']/.test(ch)) em += 0.28;
    else em += 0.44;
  }
  return em * FONT;
}

interface Disc {
  x: number;
  y: number;
  r: number;
}

interface LabelItem extends Disc {
  text: string;
  w: number;
  color: string;
  prio: number;
  ignoreLine: boolean;
}

interface Placed {
  text: string;
  x: number;
  y: number;
  color: string;
  leader: [number, number, number, number] | null;
}

type Box = [number, number, number, number];

const overlap = (a: Box, b: Box): number =>
  Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));

const hitsDisc = (r: Box, d: Disc, pad: number): boolean =>
  Math.hypot(Math.max(r[0], Math.min(d.x, r[2])) - d.x, Math.max(r[1], Math.min(d.y, r[3])) - d.y) < d.r + pad;

function layoutLabels(items: LabelItem[], discs: Disc[], line: Disc[]): Placed[] {
  const taken: Box[] = [];
  const out: Placed[] = [];
  const h = FONT;
  const pad = 1.5 * SCALE;
  for (const it of items) {
    let best: { cost: number; box: Box } | null = null;
    for (const extra of [0, 7 * SCALE, 15 * SCALE, 26 * SCALE, 40 * SCALE]) {
      const g = it.r + 4 * SCALE + extra;
      for (let k = 0; k < 12; k++) {
        const ang = (k * Math.PI) / 6;
        const cx = Math.cos(ang);
        const cy = -Math.sin(ang);
        const px = it.x + g * cx;
        const py = it.y + g * cy;
        const x0 = cx > 0.3 ? px : cx < -0.3 ? px - it.w : px - it.w / 2;
        const y0 = cy > 0.3 ? py : cy < -0.3 ? py - h : py - h / 2;
        const box: Box = [x0, y0, x0 + it.w, y0 + h];
        let cost = extra * 2.2 + (k === 0 ? 0 : k === 6 ? 6 : 10 + Math.abs(k - 3));
        const outside =
          Math.max(0, MARGIN - box[0]) + Math.max(0, box[2] - (SIZE - MARGIN)) + Math.max(0, MARGIN - box[1]) + Math.max(0, box[3] - (SIZE - MARGIN));
        if (outside > 0) cost += 5000 + outside * 60;
        for (const p of taken) cost += overlap(box, [p[0] - 2 * SCALE, p[1] - SCALE, p[2] + 2 * SCALE, p[3] + SCALE]) * 3;
        for (const d of discs) if (hitsDisc(box, d, pad)) cost += 3000;
        if (!it.ignoreLine) for (const d of line) if (hitsDisc(box, d, 0)) cost += 25;
        if (!best || cost < best.cost) best = { cost, box };
        if (cost < 1) break;
      }
      if (best && best.cost < 1) break;
    }
    if (!best) continue;
    const pick = best.box;
    taken.push(pick);
    const gap = Math.max(pick[0] - it.x - it.r, it.x - it.r - pick[2], pick[1] - it.y - it.r, it.y - it.r - pick[3]);
    let leader: [number, number, number, number] | null = null;
    if (gap > 12 * SCALE) {
      const ax = Math.max(pick[0], Math.min(it.x, pick[2]));
      const ay = Math.max(pick[1], Math.min(it.y, pick[3]));
      const d = Math.hypot(ax - it.x, ay - it.y) || 1;
      leader = [it.x + ((ax - it.x) / d) * (it.r + 1.5 * SCALE), it.y + ((ay - it.y) / d) * (it.r + 1.5 * SCALE), ax, ay];
    }
    out.push({ text: it.text, x: pick[0], y: pick[1] + h * 0.8, color: it.color, leader });
  }
  return out;
}

function sightLine(earthX: number, earthY: number, lon: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let u = 0; u <= 80; u += 0.25) {
    const x = earthX + u * Math.cos(lon * RAD);
    const y = earthY + u * Math.sin(lon * RAD);
    if (Math.hypot(x, y) > OUTER_AU) break;
    pts.push(project(x, y));
  }
  return pts;
}

const pathOf = (pts: [number, number][]): string => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");

const Glyph: React.FC<{ playing: boolean }> = ({ playing }) =>
  playing ? (
    <svg width="9" height="10" viewBox="0 0 9 10" aria-hidden="true">
      <rect x="1" y="1" width="2.5" height="8" fill="currentColor" />
      <rect x="5.5" y="1" width="2.5" height="8" fill="currentColor" />
    </svg>
  ) : (
    <svg width="9" height="10" viewBox="0 0 9 10" aria-hidden="true">
      <path d="M1 0.8 8.2 5 1 9.2Z" fill="currentColor" />
    </svg>
  );

export const PanelOrrery: React.FC<{ state: PanelOrreryState }> = ({ state }) => {
  const rect = focusRect("orreryCard");
  const orrery = selectOrrery();
  const lon = selectPallas().pick.ecliptic.lon;
  const reveal = clamp01(state.reveal);
  const dir = clamp01(state.dirReveal);
  const names = Object.keys(orrery.bodies);
  const day = Math.min(orrery.days - 1, Math.max(0, state.day));
  const index = day / orrery.step;
  const date = new Date((orrery.mjd0 + day - MJD_UNIX_EPOCH) * 864e5).toISOString().slice(0, 10);
  const frac = day / (orrery.days - 1);

  const now = names.map((n) => ({ name: n, pos: positionAt(orrery.bodies[n], index) }));
  const earth = now.find((b) => b.name === "earth");
  const trails = names.map((n) => ({ name: n, d: pathOf(orrery.bodies[n].map((p) => project(p[0], p[1]))) }));

  const discs: Disc[] = [{ x: MID, y: MID, r: SUN_R }];
  const items: LabelItem[] = [];
  const dots: Disc[] = [];
  let line: [number, number][] = [];
  if (earth && dir > 0) {
    line = sightLine(earth.pos[0], earth.pos[1], lon);
    if (line.length > 1) {
      const end = line[line.length - 1];
      items.push({ text: DIRECTION_TEXT, x: end[0], y: end[1], r: 3 * SCALE, w: textWidth(DIRECTION_TEXT), color: theme.violet, prio: 1, ignoreLine: true });
      let last: [number, number] | null = null;
      for (const p of line) {
        if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) > 9 * SCALE) {
          dots.push({ x: p[0], y: p[1], r: 2 * SCALE });
          last = p;
        }
      }
    }
  }

  const far = [...now].sort((p, q) => Math.hypot(q.pos[0], q.pos[1]) - Math.hypot(p.pos[0], p.pos[1]));
  const drawn = far.map((b) => {
    const [x, y] = project(b.pos[0], b.pos[1]);
    const r = DOT_R[b.name] ?? 2.2;
    const isEarth = b.name === "earth";
    const reach = r + (isEarth ? 2.6 : 0);
    discs.push({ x, y, r: reach });
    items.push({
      text: titleCase(b.name),
      x,
      y,
      r: reach,
      w: textWidth(titleCase(b.name)),
      color: isEarth ? EARTH_LABEL : alpha(theme.ink, 0.94),
      prio: isEarth ? 0 : 2 + (40 - (APP_SIZE[b.name] ?? 10)) / 100,
      ignoreLine: false,
    });
    return { name: b.name, x, y, r, isEarth };
  });
  items.sort((a, b) => a.prio - b.prio);
  const labels = layoutLabels(items, discs, dots);

  let arrow = "";
  if (line.length > 1) {
    const a = line[line.length - 2];
    const b = line[line.length - 1];
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const hd = 5;
    arrow = `${b[0].toFixed(1)},${b[1].toFixed(1)} ${(b[0] - hd * Math.cos(ang - 0.45)).toFixed(1)},${(b[1] - hd * Math.sin(ang - 0.45)).toFixed(1)} ${(b[0] - hd * Math.cos(ang + 0.45)).toFixed(1)},${(b[1] - hd * Math.sin(ang + 0.45)).toFixed(1)}`;
  }

  return (
    <div className="sb-pan sb-orr" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }} data-anchor="orreryCard">
      <section className="card" style={lift(reveal)}>
        <h2 className="lbl">
          <i>2.</i>
          Solar system
          <span className="small tt" data-anchor="orDate">
            {date}
          </span>
        </h2>
        <div className="orbody">
          <svg className="orsvg" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} data-anchor="orrery">
            <defs>
              <radialGradient id="sb-orr-glow">
                <stop offset="0" stopColor={alpha(theme.accent, 0.55)} />
                <stop offset="0.35" stopColor={alpha(theme.accent, 0.16)} />
                <stop offset="1" stopColor={alpha(theme.accent, 0)} />
              </radialGradient>
              <radialGradient id="sb-orr-core" cx="0.4" cy="0.35" r="0.75">
                <stop offset="0" stopColor="#fff8" />
                <stop offset="0.25" stopColor={theme.warn} />
                <stop offset="1" stopColor={theme.accentDeep} />
              </radialGradient>
            </defs>
            {STARS.map((s, i) => (
              <rect key={i} x={(s[0] * SIZE).toFixed(1)} y={(s[1] * SIZE).toFixed(1)} width={1} height={1} fill={alpha(theme.ink, s[2])} />
            ))}
            {trails.map((t) => (
              <path key={t.name} d={t.d} fill="none" stroke={t.name === "earth" ? alpha(EARTH_ORBIT, 0.5) : alpha(theme.ink, 0.15)} strokeWidth={1} />
            ))}
            <circle cx={MID} cy={MID} r={SUN_R * 3.6} fill="url(#sb-orr-glow)" />
            <circle cx={MID} cy={MID} r={SUN_R} fill="url(#sb-orr-core)" />
            {line.length > 1 && (
              <g opacity={dir}>
                <path d={pathOf(line)} fill="none" stroke={alpha(theme.violet, 0.85)} strokeWidth={1.2} strokeDasharray={`${(5 * SCALE).toFixed(2)} ${(4 * SCALE).toFixed(2)}`} />
                <polygon points={arrow} fill={alpha(theme.violet, 0.95)} />
              </g>
            )}
            {drawn.map((b) => (
              <g key={b.name}>
                <circle cx={b.x.toFixed(2)} cy={b.y.toFixed(2)} r={b.r} fill={PLANET_COLOR[b.name] ?? theme.ink} stroke={alpha("#000000", 0.5)} strokeWidth={0.5} />
                {b.isEarth && <circle cx={b.x.toFixed(2)} cy={b.y.toFixed(2)} r={b.r + 2.6} fill="none" stroke={alpha(PLANET_COLOR.earth, 0.55)} strokeWidth={1} />}
              </g>
            ))}
            {labels.map((l) => (
              <g key={l.text} opacity={l.text === DIRECTION_TEXT ? dir : 1}>
                {l.leader && <line x1={l.leader[0].toFixed(1)} y1={l.leader[1].toFixed(1)} x2={l.leader[2].toFixed(1)} y2={l.leader[3].toFixed(1)} stroke={alpha(theme.ink, 0.3)} strokeWidth={1} />}
                <text
                  x={l.x.toFixed(1)}
                  y={l.y.toFixed(1)}
                  fontSize={FONT}
                  fill={l.color}
                  stroke={alpha(theme.sunken, 0.92)}
                  strokeWidth={2.4}
                  strokeLinejoin="round"
                  paintOrder="stroke"
                >
                  {l.text}
                </text>
              </g>
            ))}
          </svg>
          <div className="orside">
            <div className={state.playing ? "btn ghost on" : "btn ghost"} data-anchor="orPlay">
              <Glyph playing={state.playing} />
              <span>{state.playing ? "Pause" : "Play"}</span>
            </div>
            <div className="rng" data-anchor="orSlider">
              <div className="track">
                <div className="fill" style={{ width: `${(frac * 100).toFixed(2)}%` }} />
              </div>
              <div className="thumb" style={{ left: `${(frac * 100).toFixed(2)}%` }} />
            </div>
            <div className="small ornote">{NOTE}</div>
          </div>
        </div>
      </section>
    </div>
  );
};
