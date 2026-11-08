import { selectPair, selectPallasFrames, selectSixMonth } from "../../data/select";
import type { FrameInfo } from "../../data/types";
import type { SkyViewerState } from "./state";

export type FieldKind = "pallas" | "pallas6mo" | "other";

export function fieldKind(fieldId: string): FieldKind {
  if (fieldId === "pallas") return "pallas";
  if (fieldId === "pallas-6mo") return "pallas6mo";
  return "other";
}

export function fieldFrames(kind: FieldKind): FrameInfo[] {
  if (kind === "pallas") return selectPallasFrames();
  if (kind === "pallas6mo") return selectSixMonth().frames;
  return [];
}

export function bandFrames(kind: FieldKind, band: string): FrameInfo[] {
  return fieldFrames(kind)
    .filter((x) => x.band === band)
    .sort((a, b) => a.mjd - b.mjd);
}

export function resolveFrame(state: SkyViewerState, which: "A" | "B"): FrameInfo | null {
  const kind = fieldKind(state.fieldId);
  if (kind === "other") return null;
  const all = fieldFrames(kind);
  const want = which === "A" ? state.pairA : state.pairB;
  const hit = all.find((x) => x.id === want);
  if (hit) return hit;
  if (kind === "pallas") {
    const pair = selectPair();
    return which === "A" ? pair.a : pair.b;
  }
  const d1 = bandFrames(kind, "D1");
  const list = d1.length ? d1 : all;
  return which === "A" ? list[0] : list[list.length - 1];
}
