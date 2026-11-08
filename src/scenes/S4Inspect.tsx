import React from "react";
import { useCurrentFrame } from "remotion";
import type { FilmStatePatch } from "../config/filmState";
import { kf, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { s4 } from "../config/copy";
import { focusRect, type FocusName } from "../config/focus";
import { CUES, SCENES, STAGE } from "../config/timeline";
import { selectPair, selectPick } from "../data/select";
import { Callout } from "../fx/Callout";
import { Caption } from "../fx/Caption";
import { clamp01, signature } from "../lib/ease";
import { TILE, tileToApp } from "../ui/viewer/geometry";

const START = SCENES.S4.start;
const END = SCENES.S4.end;

const CLICK_LEAD = 4;
const UNTICK_AT = CUES.s4.calloutBlind;
const CLICK_AT = 1770;
const SNAP_AT = CUES.s4.calloutSnap;
const SNAP_FRAMES = 12;
const REVEAL_AT = 1800;
const REVEAL_FRAMES = 45;
const VERDICT_AT = CUES.s4.calloutMover;
const VERDICT_FRAMES = 30;
const RETICK_AT = CUES.s4.captionKnown;

const ZOOM_IN_AT = 1740;
const ZOOM_IN_FRAMES = 24;
const ZOOM_OUT_AT = 2004;
const ZOOM_OUT_FRAMES = 36;
const VIEW_ZOOM = 2.4;

const CAPTION_END = 1755;
const BLIND_END = 1770;
const SNAP_END = 1860;
const MOVER_END = 1950;
const KNOWN_CAPTION_END = 2190;

const HOT_UNTICK = { from: 1690, to: 1770 } as const;
const HOT_RETICK = { from: 2084, to: 2150 } as const;

const MAX_SCALE = 2.0;
const CARD_MAX_SCALE = 2.3;
const FIT_PADDING = 96;

const PICK = selectPick();
const CENTROID = { col: PICK.centroid[0], row: PICK.centroid[1] } as const;
const CLICK = { col: PICK.pixel[0] + 4, row: PICK.pixel[1] + 4 } as const;
const CX = (PICK.centroid[0] + 0.5) / TILE.w;
const CY = (PICK.centroid[1] + 0.5) / TILE.h;

function bias(name: FocusName, scale: number, max: number = MAX_SCALE): number {
  if (scale > max) throw new Error(`S4: camera scale ${scale} is above the limit ${max} for this shot`);
  const r = focusRect(name);
  const fit = Math.min((STAGE.w - 2 * FIT_PADDING) / r.w, (STAGE.h - 2 * FIT_PADDING) / r.h);
  return scale / fit;
}

export const S4_CAMERA: CameraKeyframe[] = [
  kf(START, "fullWindow", { scaleBias: bias("fullWindow", 1.16), ease: "signature", frames: 36 }),
  kf(1716, "fullWindow", { scaleBias: bias("fullWindow", 1.19), ease: "linear", frames: 24 }),
  kf(1740, "skyImage", { scaleBias: bias("skyImage", 1.6), ease: "signature", frames: 36 }),
  kf(1776, "skyImage", { scaleBias: bias("skyImage", 1.66), ease: "linear", frames: 24 }),
  kf(1800, "fullWindow", { scaleBias: bias("fullWindow", 1.16), ease: "signature", frames: 36 }),
  kf(1836, "fullWindow", { scaleBias: bias("fullWindow", 1.19), ease: "linear", frames: 24 }),
  kf(1875, "moverCheck", { scaleBias: bias("moverCheck", 2.1, CARD_MAX_SCALE), ease: "signature", frames: 36 }),
  kf(1935, "inspectMeta", { scaleBias: bias("inspectMeta", 1.85), ease: "signature", frames: 36 }),
  kf(1971, "inspectMeta", { scaleBias: bias("inspectMeta", 1.93), ease: "linear", frames: 39 }),
  kf(2010, "fullWindow", { scaleBias: bias("fullWindow", 1.16), ease: "signature", frames: 36 }),
  kf(2046, "fullWindow", { scaleBias: bias("fullWindow", 1.19), ease: "linear", frames: END - 2046 }),
];

const viewAt = (frame: number): { zoom: number; cx: number; cy: number } => {
  const zin = signature(clamp01((frame - ZOOM_IN_AT) / ZOOM_IN_FRAMES));
  const zout = signature(clamp01((frame - ZOOM_OUT_AT) / ZOOM_OUT_FRAMES));
  const p = zin * (1 - zout);
  return { zoom: 1 + (VIEW_ZOOM - 1) * p, cx: 0.5 + (CX - 0.5) * p, cy: 0.5 + (CY - 0.5) * p };
};

const ZOOMED = viewAt(ZOOM_IN_AT + ZOOM_IN_FRAMES);

const layersBox = focusRect("layers");
const KNOWN_BOX = { x: layersBox.x + 8, y: layersBox.y + 35 } as const;
const KNOWN_LABEL = { x: layersBox.x + 36, y: layersBox.y + 35 } as const;
const clickDot = tileToApp(ZOOMED, CLICK.col, CLICK.row);

export const S4_CURSOR: CursorWaypoint[] = [
  { frame: 1684, x: 420, y: 610 },
  { frame: UNTICK_AT - CLICK_LEAD, x: KNOWN_LABEL.x, y: KNOWN_LABEL.y, click: true },
  { frame: CLICK_AT - CLICK_LEAD, x: clickDot.x, y: clickDot.y, click: true },
  { frame: 1812, x: clickDot.x + 70, y: clickDot.y + 56 },
  { frame: RETICK_AT - CLICK_LEAD, x: KNOWN_LABEL.x, y: KNOWN_LABEL.y, click: true },
  { frame: 2160, x: 330, y: 560, hide: true },
];

const within = (frame: number, w: { from: number; to: number }): boolean => frame >= w.from && frame < w.to;

const selectionAt = (frame: number): { col: number; row: number } | null => {
  if (frame < CLICK_AT) return null;
  const t = signature(clamp01((frame - SNAP_AT) / SNAP_FRAMES));
  return {
    col: CLICK.col + (CENTROID.col - CLICK.col) * t,
    row: CLICK.row + (CENTROID.row - CLICK.row) * t,
  };
};

export const S4_STATE = (frame: number): FilmStatePatch => {
  const pair = selectPair();
  const view = viewAt(frame);
  const blind = frame >= UNTICK_AT && frame < RETICK_AT;
  const hot = within(frame, HOT_UNTICK) || within(frame, HOT_RETICK) ? "layers" : null;
  return {
    appOpacity: 1,
    header: { fieldId: "pallas", badge: "real" },
    rail: { fieldId: "pallas", band: pair.info.band, mode: "static", rateHz: 3, showKnown: !blind, showMask: true, hot },
    viewer: {
      fieldId: "pallas",
      pairA: pair.info.a,
      pairB: pair.info.b,
      blinkPhase: 0,
      zoom: view.zoom,
      cx: view.cx,
      cy: view.cy,
      selection: selectionAt(frame),
      overlayAB: false,
      view: "sky",
      refBlend: 0,
      pxDrawAu: null,
      markA: null,
      markB: null,
      reveal: 1,
      coach: false,
    },
    time: { fieldId: "pallas", position: 0, epochSeg: null, reveal: 1 },
    tabs: { tab: "inspect", reveal: 1 },
    inspect: {
      reveal: signature(clamp01((frame - REVEAL_AT) / REVEAL_FRAMES)),
      verdict: "moves",
      verdictReveal: signature(clamp01((frame - VERDICT_AT) / VERDICT_FRAMES)),
    },
  };
};

export const S4Inspect: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < START || frame > END) return null;
  const centroid = tileToApp(ZOOMED, CENTROID.col, CENTROID.row);
  return (
    <>
      <Caption text={s4.caption} highlight="Click the dot" startFrame={CUES.s4.caption} endFrame={CAPTION_END} />
      <Callout text={s4.calloutBlind} target={KNOWN_BOX} camera={S4_CAMERA} side="right" lead={290} startFrame={CUES.s4.calloutBlind} endFrame={BLIND_END} />
      <Callout text={s4.calloutSnap} target={centroid} camera={S4_CAMERA} side="top" startFrame={CUES.s4.calloutSnap} endFrame={SNAP_END} />
      <Callout text={s4.calloutMover} target="moverCheck" camera={S4_CAMERA} side="left" startFrame={CUES.s4.calloutMover} endFrame={MOVER_END} />
      <Caption text={s4.captionKnown} highlight="sky" startFrame={CUES.s4.captionKnown} endFrame={KNOWN_CAPTION_END} />
    </>
  );
};
