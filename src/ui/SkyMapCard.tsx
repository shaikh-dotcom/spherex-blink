import React, { useLayoutEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { focusRect } from "../config/focus";
import { theme } from "../config/theme";
import { selectFields, selectOverview, selectPallas } from "../data/select";
import { clamp01 } from "../lib/ease";

export interface SkyMapCardState {
  reveal: number;
  showKnown: boolean;
}

export const SKYMAP_DEFAULT: SkyMapCardState = { reveal: 0, showKnown: true };

const D = Math.PI / 180;
const W = 316;
const H = 158;
const SCALE = 3;
const SOURCE_W = 2048;
const SOURCE_H = 1024;
const MAP_PX = 216;
const OBLIQUITY = 23.4393;
const WRAP_BREAK = 40;

const GAL = [
  [-0.0548755604, -0.8734370902, -0.4838350155],
  [0.4941094279, -0.4448296300, 0.7469822445],
  [-0.8676661490, -0.1980763734, 0.4559837762],
];

type Vec = [number, number, number];

function proj(ra: number, dec: number): [number, number] {
  const lam = (180 - ra) * D;
  const phi = dec * D;
  const k = Math.sqrt(1 + Math.cos(phi) * Math.cos(lam / 2));
  return [W / 2 + ((Math.cos(phi) * Math.sin(lam / 2)) / k) * (W / 2), H / 2 - (Math.sin(phi) / k) * (H / 2)];
}

function toRaDec(v: Vec): [number, number] {
  return [(((Math.atan2(v[1], v[0]) / D) % 360) + 360) % 360, Math.asin(Math.max(-1, Math.min(1, v[2]))) / D];
}

function vec(ra: number, dec: number): Vec {
  return [Math.cos(dec * D) * Math.cos(ra * D), Math.cos(dec * D) * Math.sin(ra * D), Math.sin(dec * D)];
}

function galToEq(l: number, b: number): [number, number] {
  const g = [Math.cos(b * D) * Math.cos(l * D), Math.cos(b * D) * Math.sin(l * D), Math.sin(b * D)];
  const out = [0, 1, 2].map((i) => GAL[0][i] * g[0] + GAL[1][i] * g[1] + GAL[2][i] * g[2]) as Vec;
  return toRaDec(out);
}

function eclToEq(lon: number): [number, number] {
  const e = OBLIQUITY * D;
  const x = Math.cos(lon * D);
  const y = Math.sin(lon * D);
  return toRaDec([x, y * Math.cos(e), y * Math.sin(e)]);
}

function path(points: [number, number][]): string {
  let d = "";
  let prev: [number, number] | null = null;
  for (const [ra, dec] of points) {
    const p = proj(ra, dec);
    const jump = !prev || Math.hypot(p[0] - prev[0], p[1] - prev[1]) > WRAP_BREAK;
    d += `${jump ? "M" : "L"}${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
    prev = p;
  }
  return d;
}

const parallels = (): string[] => {
  const out: string[] = [];
  for (let dec = -60; dec <= 60; dec += 30) out.push(path(Array.from({ length: 73 }, (_, i) => [i * 5, dec] as [number, number])));
  return out;
};

const meridians = (): string[] => {
  const out: string[] = [];
  for (let ra = 0; ra < 360; ra += 30) out.push(path(Array.from({ length: 37 }, (_, i) => [ra, -90 + i * 5] as [number, number])));
  return out;
};

const GRATICULE = [...parallels(), ...meridians()].join("");
const ECLIPTIC = path(Array.from({ length: 181 }, (_, i) => eclToEq(i * 2)));
const GALACTIC_CENTRE = galToEq(0, 0);

let milky: string | null = null;
let milkyFailed = false;
let milkyLoading: Promise<void> | null = null;

function reproject(img: HTMLImageElement): string {
  const src = document.createElement("canvas");
  src.width = SOURCE_W;
  src.height = SOURCE_H;
  const sc = src.getContext("2d", { willReadFrequently: true });
  if (!sc) throw new Error("skymap: 2d canvas is not available");
  sc.drawImage(img, 0, 0, SOURCE_W, SOURCE_H);
  const sd = sc.getImageData(0, 0, SOURCE_W, SOURCE_H).data;
  const ow = W * SCALE;
  const oh = H * SCALE;
  const out = document.createElement("canvas");
  out.width = ow;
  out.height = oh;
  const oc = out.getContext("2d");
  if (!oc) throw new Error("skymap: 2d canvas is not available");
  const od = oc.createImageData(ow, oh);
  const o = od.data;
  for (let py = 0; py < oh; py++) {
    for (let px = 0; px < ow; px++) {
      const X = ((px + 0.5) / ow) * 2 - 1;
      const Y = 1 - ((py + 0.5) / oh) * 2;
      const q = X * X + Y * Y;
      if (q > 1) continue;
      const x = 2 * Math.SQRT2 * X;
      const y = Math.SQRT2 * Y;
      const z = Math.sqrt(1 - q / 2);
      const lam = 2 * Math.atan2(z * x, 2 * (2 * z * z - 1));
      const phi = Math.asin(z * y);
      const eq = vec(180 - lam / D, phi / D);
      const gx = GAL[0][0] * eq[0] + GAL[0][1] * eq[1] + GAL[0][2] * eq[2];
      const gy = GAL[1][0] * eq[0] + GAL[1][1] * eq[1] + GAL[1][2] * eq[2];
      const gz = GAL[2][0] * eq[0] + GAL[2][1] * eq[1] + GAL[2][2] * eq[2];
      const l = Math.atan2(gy, gx) / D;
      const b = Math.asin(Math.max(-1, Math.min(1, gz))) / D;
      const u = ((((0.5 - l / 360) % 1) + 1) % 1) * (SOURCE_W - 1);
      const v = (0.5 - b / 180) * (SOURCE_H - 1);
      const u0 = Math.floor(u);
      const v0 = Math.floor(v);
      const fu = u - u0;
      const fv = v - v0;
      const u1 = Math.min(SOURCE_W - 1, u0 + 1);
      const v1 = Math.min(SOURCE_H - 1, v0 + 1);
      const i00 = (v0 * SOURCE_W + u0) * 4;
      const i10 = (v0 * SOURCE_W + u1) * 4;
      const i01 = (v1 * SOURCE_W + u0) * 4;
      const i11 = (v1 * SOURCE_W + u1) * 4;
      const oi = (py * ow + px) * 4;
      for (let k = 0; k < 3; k++) {
        o[oi + k] = (sd[i00 + k] * (1 - fu) + sd[i10 + k] * fu) * (1 - fv) + (sd[i01 + k] * (1 - fu) + sd[i11 + k] * fu) * fv;
      }
      o[oi + 3] = 255;
    }
  }
  oc.putImageData(od, 0, 0);
  return out.toDataURL("image/png");
}

function loadMilky(): Promise<void> {
  if (milkyLoading) return milkyLoading;
  milkyLoading = new Promise<void>((resolve) => {
    const im = new Image();
    im.onload = () => {
      try {
        milky = reproject(im);
      } catch {
        milkyFailed = true;
      }
      resolve();
    };
    im.onerror = () => {
      milkyFailed = true;
      console.warn('[spherex-blink-film] public/sky/milkyway.jpg not found. Run "npm run assets -- --from <clone of spherex-blink>". The map falls back to vector lines.');
      resolve();
    };
    im.src = staticFile("sky/milkyway.jpg");
  });
  return milkyLoading;
}

function useMilkyWay(): string | null {
  const [, setVersion] = useState(0);
  useLayoutEffect(() => {
    if (milky || milkyFailed) return undefined;
    const handle = delayRender("Reprojecting the Milky Way");
    let live = true;
    loadMilky().then(() => {
      if (live) setVersion((v) => v + 1);
      continueRender(handle);
    });
    return () => {
      live = false;
    };
  }, []);
  return milky;
}

const GAL_FALLBACK = path(Array.from({ length: 181 }, (_, i) => galToEq(i * 2, 0)));

export const SkyMapCard: React.FC<{ state: SkyMapCardState }> = ({ state }) => {
  const r = focusRect("skyMapCard");
  const mw = useMilkyWay();
  const reveal = clamp01(state.reveal);
  const overview = selectOverview();
  const here = selectPallas();
  const fields = selectFields().filter((f) => f.kind === "real");
  const hereInfo = fields.find((f) => f.id === here.id);
  const hereAt = hereInfo ? proj(hereInfo.ra, hereInfo.dec) : null;
  const mapH = Math.round((MAP_PX * H) / W);
  return (
    <div
      className="sb-pan sb-skymap"
      style={{ left: r.x, top: r.y, width: r.w, height: r.h, opacity: reveal, transform: `translateY(${((1 - reveal) * 6).toFixed(2)}px)` }}
      data-anchor="skyMapCard"
    >
      <section className="card">
        <h2 className="lbl">Where are we looking?</h2>
        <div className="skybody">
          <svg className="skysvg" width={MAP_PX} height={mapH} viewBox={`0 0 ${W} ${H}`} data-anchor="skyMap">
            <defs>
              <clipPath id="sbSkyClip">
                <ellipse cx={W / 2} cy={H / 2} rx={W / 2 - 1} ry={H / 2 - 1} />
              </clipPath>
            </defs>
            <ellipse cx={W / 2} cy={H / 2} rx={W / 2 - 1} ry={H / 2 - 1} fill="#06080d" />
            <g clipPath="url(#sbSkyClip)">
              <path d={GRATICULE} fill="none" stroke={mw ? "rgba(255,255,255,.10)" : "#1b2233"} strokeWidth="0.6" />
              {mw ? (
                <image href={mw} x="0" y="0" width={W} height={H} opacity="0.95" preserveAspectRatio="none" />
              ) : (
                <>
                  <path d={GAL_FALLBACK} fill="none" stroke="rgba(150,170,255,.22)" strokeWidth="9" />
                  <path d={GAL_FALLBACK} fill="none" stroke="rgba(190,205,255,.35)" strokeWidth="2" />
                </>
              )}
              <path d={ECLIPTIC} fill="none" stroke="rgba(255,200,120,.5)" strokeWidth="1" />
            </g>
            <ellipse cx={W / 2} cy={H / 2} rx={W / 2 - 1} ry={H / 2 - 1} fill="none" stroke="#2a3248" strokeWidth="1" />
            <circle cx={proj(GALACTIC_CENTRE[0], GALACTIC_CENTRE[1])[0]} cy={proj(GALACTIC_CENTRE[0], GALACTIC_CENTRE[1])[1]} r="2.5" fill="#9fb4ff" />
            <text
              x={proj(GALACTIC_CENTRE[0], GALACTIC_CENTRE[1])[0] - 4}
              y={proj(GALACTIC_CENTRE[0], GALACTIC_CENTRE[1])[1] + 17}
              fill={theme.ink}
              fontSize="12.5"
              fontStyle="italic"
              fontFamily="inherit"
            >
              Galactic centre
            </text>
            {fields.map((f) => {
              const p = proj(f.ra, f.dec);
              const known = state.showKnown && f.target !== null;
              return <circle key={f.id} cx={p[0]} cy={p[1]} r={known ? 2.6 : 2.2} fill={known ? theme.accent : theme.ink} opacity={known ? 1 : 0.85} />;
            })}
            {hereAt ? (
              <>
                <circle cx={hereAt[0]} cy={hereAt[1]} r="6" fill="none" stroke={theme.ink} strokeWidth="1.2" />
                {state.showKnown ? (
                  <text x={hereAt[0] + 9} y={hereAt[1] - 7} fill={theme.accentInk} fontSize="13" fontStyle="italic" fontFamily="inherit">
                    {here.target}
                  </text>
                ) : null}
              </>
            ) : null}
          </svg>
          <ul className="skylegend small">
            <li>
              <i className="sw dot" />
              {`${overview.realFields} real fields`}
            </li>
            <li>
              <i className="sw ring" />
              this field
            </li>
            <li style={{ opacity: state.showKnown ? 1 : 0.35 }}>
              <i className="sw known" />
              known asteroid
            </li>
            <li>
              <i className="sw ecl" />
              ecliptic
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};
