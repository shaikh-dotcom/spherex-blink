import { selectFields, selectPallas } from "../../data/select";

const D = Math.PI / 180;

export interface WcsParams {
  width: number;
  height: number;
  crval: [number, number];
  crpix: [number, number];
  cdelt: [number, number];
}

export interface SkyPoint {
  ra: number;
  dec: number;
}

export interface Wcs {
  width: number;
  height: number;
  toSky(col: number, row: number): SkyPoint;
  toPix(ra: number, dec: number): { col: number; row: number };
  toDraw(ra: number, dec: number): { x: number; y: number };
}

export function makeWcs(j: WcsParams): Wcs {
  const a0 = j.crval[0] * D;
  const d0 = j.crval[1] * D;
  const [px, py] = j.crpix;
  const [sx, sy] = j.cdelt;
  const sd0 = Math.sin(d0);
  const cd0 = Math.cos(d0);
  const wcs: Wcs = {
    width: j.width,
    height: j.height,
    toSky(col, row) {
      const xi = sx * D * (col + 1 - px);
      const eta = sy * D * (j.height - row - py);
      const r = Math.hypot(xi, eta);
      const c = Math.atan(r);
      const sc = Math.sin(c);
      const cc = Math.cos(c);
      const dec = Math.asin(cc * sd0 + (r ? (eta * sc * cd0) / r : 0));
      const ra = a0 + Math.atan2(xi * sc, r * cd0 * cc - eta * sd0 * sc);
      return { ra: (((ra / D) % 360) + 360) % 360, dec: dec / D };
    },
    toPix(ra, dec) {
      const a = ra * D;
      const d = dec * D;
      const da = a - a0;
      const cc = sd0 * Math.sin(d) + cd0 * Math.cos(d) * Math.cos(da);
      const xi = (Math.cos(d) * Math.sin(da)) / cc;
      const eta = (cd0 * Math.sin(d) - sd0 * Math.cos(d) * Math.cos(da)) / cc;
      return { col: xi / (sx * D) + px - 1, row: j.height - (eta / (sy * D) + py) };
    },
    toDraw(ra, dec) {
      const p = wcs.toPix(ra, dec);
      return { x: p.col + 0.5, y: p.row + 0.5 };
    },
  };
  return wcs;
}

export function offsetArcsec(ra1: number, dec1: number, ra2: number, dec2: number): { e: number; n: number } {
  return { e: (ra2 - ra1) * Math.cos(((dec1 + dec2) / 2) * D) * 3600, n: (dec2 - dec1) * 3600 };
}

const cache = new Map<string, Wcs>();

export function fieldWcs(fieldId: string = "pallas"): Wcs {
  const hit = cache.get(fieldId);
  if (hit) return hit;
  const pallas = selectPallas();
  const info = selectFields().find((x) => x.id === fieldId);
  const ra = info ? info.ra : pallas.centre.ra;
  const dec = info ? info.dec : pallas.centre.dec;
  const size = info ? info.sizeDeg : pallas.sizeDeg;
  const { width, height } = pallas.tile;
  const wcs = makeWcs({
    width,
    height,
    crval: [ra, dec],
    crpix: [width / 2 + 0.5, height / 2 + 0.5],
    cdelt: [-size / width, size / width],
  });
  cache.set(fieldId, wcs);
  return wcs;
}
