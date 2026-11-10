import React from "react";
import { useCurrentFrame } from "remotion";
import type { FilmStatePatch } from "../config/filmState";
import { kf, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { s7 } from "../config/copy";
import { focusRect, type FocusName } from "../config/focus";
import { CUES, SCENES, STAGE } from "../config/timeline";
import { selectFlagCategories, selectPair, selectPick } from "../data/select";
import { Callout } from "../fx/Callout";
import { Caption } from "../fx/Caption";
import { clamp01, signature } from "../lib/ease";
import { INSPECT_SPLIT } from "../ui/PanelInspect";

const START = SCENES.S7.start;
const END = SCENES.S7.end;

const CLICK_LEAD = 4;
const TAB_FRAMES = 20;
const FORM_AT = 3450;
const FORM_FRAMES = 30;
const FLAG_AT = 3478;
const CLICK_AT = FLAG_AT - CLICK_LEAD;
const MATCH_AT = CUES.s7.calloutCross;
const MATCH_FRAMES = 30;
const EXPORT_AT = CUES.s7.captionExport;
const EXPORT_FRAMES = 30;

const CAPTION_END = 3495;
const CROSS_END = 3540;
const EXPORT_CAPTION_END = 3650;
const STATE_CAPTION_END = 3770;

const PULSE_FRAMES = 24;
const EXPORT_PULSES: readonly number[] = [3558, 3588];
const STATE_PULSES: readonly number[] = [3690, 3720];

const MAX_SCALE = 2.0;
const FIT_PADDING = 96;

const FLAG_IT_DY = 85.5;
const MATCH_DY = 166.5;
const ASIDE = { x: 1150, y: 590 } as const;

const CATEGORY = ((): string => {
  const hit = selectFlagCategories().find((c) => c === "asteroid");
  if (hit === undefined) throw new Error("S7: the flag category \"asteroid\" is not in selectFlagCategories()");
  return hit;
})();

const PICK = selectPick();
const SELECTION = { col: PICK.centroid[0], row: PICK.centroid[1] } as const;
const OVERVIEW = { zoom: 1, cx: 0.5, cy: 0.5 } as const;

function bias(name: FocusName, scale: number): number {
  if (scale > MAX_SCALE) throw new Error(`S7: camera scale ${scale} is above the limit ${MAX_SCALE}`);
  const r = focusRect(name);
  const fit = Math.min((STAGE.w - 2 * FIT_PADDING) / r.w, (STAGE.h - 2 * FIT_PADDING) / r.h);
  return scale / fit;
}

export const S7_CAMERA: CameraKeyframe[] = [
  kf(START, "fullWindow", { scaleBias: bias("fullWindow", 1.16), ease: "signature", frames: 36 }),
  kf(3456, "fullWindow", { scaleBias: bias("fullWindow", 1.19), ease: "linear", frames: 24 }),
  kf(3480, "flagForm", { scaleBias: bias("flagForm", 1.8), ease: "signature", frames: 36 }),
  kf(3516, "flagForm", { scaleBias: bias("flagForm", 1.86), ease: "linear", frames: 24 }),
  kf(3540, "flagList", { scaleBias: bias("flagList", 1.8), ease: "signature", frames: 36 }),
  kf(3576, "flagList", { scaleBias: bias("flagList", 1.88), ease: "linear", frames: 84 }),
  kf(3660, "flagList", { scaleBias: bias("flagList", 1.94), ease: "linear", frames: END - 3660 }),
];

const panel = focusRect("panel");
const FLAG_IT = { x: panel.x + panel.w / 2, y: INSPECT_SPLIT + FLAG_IT_DY } as const;
const MATCH_TARGET = { x: panel.x + 26, y: INSPECT_SPLIT + MATCH_DY } as const;

export const S7_CURSOR: CursorWaypoint[] = [
  { frame: CLICK_AT, x: FLAG_IT.x, y: FLAG_IT.y, click: true },
  { frame: 3500, x: ASIDE.x, y: ASIDE.y },
  { frame: 3516, x: ASIDE.x - 12, y: ASIDE.y - 10, hide: true },
];

const pulseTrain = (frame: number, starts: readonly number[]): number => {
  let best = 0;
  for (const s of starts) {
    const t = (frame - s) / PULSE_FRAMES;
    if (t < 0 || t >= 1) continue;
    const v = Math.sin(Math.PI * t);
    best = Math.max(best, v * v);
  }
  return best;
};

export const S7_STATE = (frame: number): FilmStatePatch => {
  const pair = selectPair();
  return {
    appOpacity: 1,
    header: { fieldId: "pallas", badge: "real" },
    rail: { fieldId: "pallas", band: pair.info.band, mode: "static", rateHz: 3, showKnown: true, showMask: true, hot: null },
    viewer: {
      fieldId: "pallas",
      pairA: pair.info.a,
      pairB: pair.info.b,
      blinkPhase: 0,
      zoom: OVERVIEW.zoom,
      cx: OVERVIEW.cx,
      cy: OVERVIEW.cy,
      selection: { col: SELECTION.col, row: SELECTION.row },
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
    inspect: { reveal: signature(clamp01((frame - START) / TAB_FRAMES)), verdict: "moves", verdictReveal: signature(clamp01((frame - START) / TAB_FRAMES)) },
    flags: {
      formReveal: signature(clamp01((frame - FORM_AT) / FORM_FRAMES)),
      category: CATEGORY,
      flagged: frame >= FLAG_AT ? 1 : 0,
      matchReveal: signature(clamp01((frame - MATCH_AT) / MATCH_FRAMES)),
      exportReveal: signature(clamp01((frame - EXPORT_AT) / EXPORT_FRAMES)),
      exportPulse: pulseTrain(frame, EXPORT_PULSES),
      statePulse: pulseTrain(frame, STATE_PULSES),
    },
  };
};

export const S7Flag: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < START || frame > END) return null;
  return (
    <>
      <Caption text={s7.caption} highlight="Flag it" startFrame={CUES.s7.caption} endFrame={CAPTION_END} />
      <Callout text={s7.calloutCross} variant="ok" target={MATCH_TARGET} camera={S7_CAMERA} side="left" lead={110} startFrame={CUES.s7.calloutCross} endFrame={CROSS_END} />
      <Caption text={s7.captionExport} highlight="CSV or JSON" startFrame={CUES.s7.captionExport} endFrame={EXPORT_CAPTION_END} />
      <Caption text={s7.captionState} highlight="where flags go" startFrame={CUES.s7.captionState} endFrame={STATE_CAPTION_END} />
    </>
  );
};
