import { selectOrrery } from "../../data/select";

const D = Math.PI / 180;
const AS = 206264.806;
const EPS = 23.4392911 * D;

type Vec = [number, number, number];

function earthAt(mjd: number): Vec | null {
  const o = selectOrrery();
  const pos = o.bodies.earth;
  if (!pos || pos.length < 2) return null;
  const t = (mjd - o.mjd0) / o.step;
  if (!(t >= 0 && t <= pos.length - 1)) return null;
  const i = Math.min(pos.length - 2, Math.floor(t));
  const f = t - i;
  const a = pos[i];
  const b = pos[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}

const eqToEcl = (v: Vec): Vec => [v[0], v[1] * Math.cos(EPS) + v[2] * Math.sin(EPS), -v[1] * Math.sin(EPS) + v[2] * Math.cos(EPS)];
const eclToEq = (v: Vec): Vec => [v[0], v[1] * Math.cos(EPS) - v[2] * Math.sin(EPS), v[1] * Math.sin(EPS) + v[2] * Math.cos(EPS)];
const unitEq = (ra: number, dec: number): Vec => [Math.cos(dec * D) * Math.cos(ra * D), Math.cos(dec * D) * Math.sin(ra * D), Math.sin(dec * D)];
const dot = (a: Vec, b: Vec): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export function parallaxOffset(distanceAu: number, mjdRef: number, mjd: number, ra: number, dec: number): { e: number; n: number } | null {
  const e0 = earthAt(mjdRef);
  const e1 = earthAt(mjd);
  if (!e0 || !e1) return null;
  const nEq = unitEq(ra, dec);
  const nEc = eqToEcl(nEq);
  const p: Vec = [e0[0] + distanceAu * nEc[0], e0[1] + distanceAu * nEc[1], e0[2] + distanceAu * nEc[2]];
  const u0: Vec = [p[0] - e1[0], p[1] - e1[1], p[2] - e1[2]];
  const len = Math.hypot(u0[0], u0[1], u0[2]);
  const u: Vec = [u0[0] / len, u0[1] / len, u0[2] / len];
  const uq = eclToEq(u);
  const a = ra * D;
  const de = dec * D;
  const east: Vec = [-Math.sin(a), Math.cos(a), 0];
  const north: Vec = [-Math.sin(de) * Math.cos(a), -Math.sin(de) * Math.sin(a), Math.cos(de)];
  const l = dot(uq, nEq);
  return { e: (dot(uq, east) / l) * AS, n: (dot(uq, north) / l) * AS };
}
