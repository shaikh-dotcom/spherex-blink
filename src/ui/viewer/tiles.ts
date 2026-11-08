import { useLayoutEffect, useState } from "react";
import { continueRender, delayRender } from "remotion";

export interface Tile {
  url: string;
  w: number;
  h: number;
  gray: Uint8Array;
  nd: Uint8Array;
}

export interface TilePair {
  A: HTMLCanvasElement;
  B: HTMLCanvasElement;
  O: HTMLCanvasElement;
}

const AMBER = [1.0, 0.62, 0.22] as const;
const CYAN = [0.2, 0.74, 1.0] as const;

const tiles = new Map<string, Tile>();
const loading = new Map<string, Promise<Tile | null>>();
const pairs = new Map<string, TilePair>();
const failed = new Set<string>();

function boxFilter(src: Uint8Array, w: number, h: number, r: number, wantMin: boolean): Uint8Array {
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  const k = wantMin ? 1 : 0;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      let v = k;
      for (let dx = -r; dx <= r; dx++) {
        const xx = x + dx;
        const s = xx < 0 || xx >= w ? (wantMin ? 1 : 0) : src[row + xx];
        if (wantMin ? s === 0 : s === 1) {
          v = wantMin ? 0 : 1;
          break;
        }
      }
      tmp[row + x] = v;
    }
  }
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let v = k;
      for (let dy = -r; dy <= r; dy++) {
        const yy = y + dy;
        const s = yy < 0 || yy >= h ? (wantMin ? 1 : 0) : tmp[yy * w + x];
        if (wantMin ? s === 0 : s === 1) {
          v = wantMin ? 0 : 1;
          break;
        }
      }
      out[y * w + x] = v;
    }
  }
  return out;
}

function decode(img: HTMLImageElement, url: string): Tile {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) throw new Error("viewer: 2d canvas is not available");
  x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, w, h).data;
  const gray = new Uint8Array(w * h);
  const zero = new Uint8Array(w * h);
  let nz = 0;
  for (let i = 0; i < w * h; i++) {
    const g = d[i * 4];
    gray[i] = g;
    if (g === 0) {
      zero[i] = 1;
      nz++;
    }
  }
  const nd = nz > 25 ? boxFilter(boxFilter(zero, w, h, 2, true), w, h, 2, false) : new Uint8Array(w * h);
  return { url, w, h, gray, nd };
}

function load(url: string): Promise<Tile | null> {
  const hit = tiles.get(url);
  if (hit) return Promise.resolve(hit);
  const pending = loading.get(url);
  if (pending) return pending;
  const p = new Promise<Tile | null>((resolve) => {
    const im = new Image();
    im.onload = () => {
      try {
        const t = decode(im, url);
        tiles.set(url, t);
        resolve(t);
      } catch {
        failed.add(url);
        resolve(null);
      }
    };
    im.onerror = () => {
      failed.add(url);
      console.warn(`[spherex-blink-film] tile not found: ${url}. Run "npm run assets -- --from <clone of spherex-blink>".`);
      resolve(null);
    };
    im.src = url;
  });
  loading.set(url, p);
  return p;
}

export function useTiles(urls: string[]): (Tile | null)[] {
  const key = urls.join("|");
  const [, setVersion] = useState(0);
  useLayoutEffect(() => {
    const missing = urls.filter((u) => !tiles.has(u) && !failed.has(u));
    if (!missing.length) return undefined;
    const handle = delayRender(`Decoding ${missing.length} SPHEREx tile(s)`);
    let live = true;
    Promise.all(missing.map(load)).then(() => {
      if (live) setVersion((v) => v + 1);
      continueRender(handle);
    });
    return () => {
      live = false;
    };
  }, [key]);
  return urls.map((u) => tiles.get(u) ?? null);
}

function surface(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

export function buildPair(A: Tile, B: Tile, common: boolean): TilePair {
  const key = [A.url, B.url, common ? 1 : 0].join("|");
  const hit = pairs.get(key);
  if (hit) return hit;
  const w = A.w;
  const h = A.h;
  const n = w * h;
  const nd = new Uint8Array(n);
  for (let i = 0; i < n; i++) nd[i] = common ? A.nd[i] | B.nd[i] : 0;
  const side = (T: Tile): HTMLCanvasElement => {
    const c = surface(w, h);
    const x = c.getContext("2d");
    if (!x) throw new Error("viewer: 2d canvas is not available");
    const px = x.createImageData(w, h);
    const d = px.data;
    for (let i = 0; i < n; i++) {
      const g = T.gray[i];
      const o = i * 4;
      d[o] = d[o + 1] = d[o + 2] = g;
      d[o + 3] = (common ? nd[i] : T.nd[i]) ? 0 : 255;
    }
    x.putImageData(px, 0, 0);
    return c;
  };
  const overlay = (): HTMLCanvasElement => {
    const c = surface(w, h);
    const x = c.getContext("2d");
    if (!x) throw new Error("viewer: 2d canvas is not available");
    const px = x.createImageData(w, h);
    const d = px.data;
    for (let i = 0; i < n; i++) {
      const a = A.gray[i];
      const b = B.gray[i];
      const o = i * 4;
      const hole = common ? nd[i] : A.nd[i] & B.nd[i];
      d[o] = Math.min(255, a * AMBER[0] + b * CYAN[0]);
      d[o + 1] = Math.min(255, a * AMBER[1] + b * CYAN[1]);
      d[o + 2] = Math.min(255, a * AMBER[2] + b * CYAN[2]);
      d[o + 3] = hole ? 0 : 255;
    }
    x.putImageData(px, 0, 0);
    return c;
  };
  const out: TilePair = { A: side(A), B: side(B), O: overlay() };
  if (pairs.size > 6) {
    const first = pairs.keys().next().value;
    if (first !== undefined) pairs.delete(first);
  }
  pairs.set(key, out);
  return out;
}
