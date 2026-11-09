import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { FilmStatePatch } from "../config/filmState";
import { kf, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { s5 } from "../config/copy";
import { focusRect, type FocusName } from "../config/focus";
import { theme } from "../config/theme";
import { CUES, SCENES, STAGE } from "../config/timeline";
import { selectPair, selectPallas, selectPick, selectTargetPosition } from "../data/select";
import { Callout } from "../fx/Callout";
import { Caption } from "../fx/Caption";
import { getCameraState, worldToStage } from "../fx/Camera";
import { clamp01, signature } from "../lib/ease";
import { tileToApp } from "../ui/viewer/geometry";

const START = SCENES.S5.start;
const END = SCENES.S5.end;

const TAB_AT = START;
const TAB_CLICK_AT = TAB_AT - 4;
const FIELD_FRAMES = 20;
const CHECK_AT = CUES.s5.calloutChecked;
const CHECK_FRAMES = 30;
const FIELDS_AT = CUES.s5.captionFields;
const STRICT_AT = CUES.s5.captionStrict;
const ACROSS_FRAMES = 30;
const STRICT_FRAMES = 30;
const REF_AT = 2628;
const REF_FRAMES = 18;
const BLEND_UP_AT = 2640;
const BLEND_UP_FRAMES = 30;
const BLEND_DOWN_AT = 2676;
const BLEND_DOWN_FRAMES = END - BLEND_DOWN_AT;
const BLEND_MAX = 0.6;
const GRAB_AT = BLEND_UP_AT - 4;

const CAPTION_END = 2300;
const CHECKED_END = 2400;
const FIELDS_END = 2570;
const STRICT_END = 2628;

const CROSS_AT = CHECK_AT;
const CROSS_STAGGER = 8;
const CROSS_FRAMES = 14;
const CROSS_OUT_AT = 2604;
const CROSS_OUT_FRAMES = 20;
const CROSS_ARM = 11;

const MAX_SCALE = 2.0;
const FIT_PADDING = 96;

const SLIDER = { x0: 1284, x1: 1528, y: 680 } as const;
const TAB = { x: 1404, y: 95 } as const;

const PAIR = selectPair();
const PICK = selectPick();
const OVERVIEW = { zoom: 1, cx: 0.5, cy: 0.5 } as const;
const SELECTION = { col: PICK.centroid[0], row: PICK.centroid[1] } as const;

function bias(name: FocusName, scale: number): number {
  if (scale > MAX_SCALE) throw new Error(`S5: camera scale ${scale} is above the limit ${MAX_SCALE}`);
  const r = focusRect(name);
  const fit = Math.min((STAGE.w - 2 * FIT_PADDING) / r.w, (STAGE.h - 2 * FIT_PADDING) / r.h);
  return scale / fit;
}

export const S5_CAMERA: CameraKeyframe[] = [
  kf(START, "fullWindow", { scaleBias: bias("fullWindow", 1.19) }),
  kf(2250, "fullWindow", { scaleBias: bias("fullWindow", 1.215), ease: "linear", frames: 60 }),
  kf(2340, "fullWindow", { scaleBias: bias("fullWindow", 1.16), ease: "signature", frames: 36 }),
  kf(2376, "fullWindow", { scaleBias: bias("fullWindow", 1.19), ease: "linear", frames: 54 }),
  kf(2430, "realityCheck", { scaleBias: bias("realityCheck", 1.7), ease: "signature", frames: 36 }),
  kf(2466, "realityCheck", { scaleBias: bias("realityCheck", 1.74), ease: "linear", frames: 60 }),
  kf(2526, "realityCheck", { scaleBias: bias("realityCheck", 1.78), ease: "linear", frames: 60 }),
  kf(2586, "realityCheck", { scaleBias: bias("realityCheck", 1.82), ease: "linear", frames: 54 }),
  kf(2640, "fullWindow", { scaleBias: bias("fullWindow", 1.16), ease: "signature", frames: 30 }),
  kf(2670, "fullWindow", { scaleBias: bias("fullWindow", 1.19), ease: "linear", frames: 30 }),
];

const thumbAt = (blend: number): { x: number; y: number } => ({
  x: SLIDER.x0 + (SLIDER.x1 - SLIDER.x0) * blend,
  y: SLIDER.y,
});

const pickAt = tileToApp(OVERVIEW, SELECTION.col, SELECTION.row);

export const S5_CURSOR: CursorWaypoint[] = [
  { frame: TAB_CLICK_AT - 20, x: pickAt.x + 120, y: pickAt.y + 40 },
  { frame: TAB_CLICK_AT, x: TAB.x, y: TAB.y, click: true },
  { frame: 2244, x: TAB.x - 70, y: TAB.y + 30, hide: true },
  { frame: GRAB_AT, x: thumbAt(0).x, y: thumbAt(0).y, click: true },
  { frame: BLEND_UP_AT + 15, x: thumbAt(BLEND_MAX / 2).x, y: thumbAt(BLEND_MAX / 2).y },
  { frame: BLEND_UP_AT + BLEND_UP_FRAMES, x: thumbAt(BLEND_MAX).x, y: thumbAt(BLEND_MAX).y },
  { frame: BLEND_DOWN_AT, x: thumbAt(BLEND_MAX).x, y: thumbAt(BLEND_MAX).y },
  { frame: BLEND_DOWN_AT + 12, x: thumbAt(BLEND_MAX / 2).x, y: thumbAt(BLEND_MAX / 2).y },
  { frame: END, x: thumbAt(0).x, y: thumbAt(0).y, hide: true },
];

const blendAt = (frame: number): number => {
  const up = signature(clamp01((frame - BLEND_UP_AT) / BLEND_UP_FRAMES));
  const down = signature(clamp01((frame - BLEND_DOWN_AT) / BLEND_DOWN_FRAMES));
  return BLEND_MAX * up * (1 - down);
};

export const S5_STATE = (frame: number): FilmStatePatch => {
  const blend = blendAt(frame);
  return {
    appOpacity: 1,
    header: { fieldId: "pallas", badge: "real" },
    rail: { fieldId: "pallas", band: PAIR.info.band, mode: "static", rateHz: 3, showKnown: true, showMask: true, hot: null },
    viewer: {
      fieldId: "pallas",
      pairA: PAIR.info.a,
      pairB: PAIR.info.b,
      blinkPhase: 0,
      zoom: OVERVIEW.zoom,
      cx: OVERVIEW.cx,
      cy: OVERVIEW.cy,
      selection: { col: SELECTION.col, row: SELECTION.row },
      overlayAB: false,
      view: "sky",
      refBlend: blend,
      pxDrawAu: null,
      markA: null,
      markB: null,
      reveal: 1,
      coach: false,
    },
    time: { fieldId: "pallas", position: 0, epochSeg: null, reveal: 1 },
    tabs: { tab: frame >= TAB_AT ? "context" : "inspect", reveal: 1 },
    context: {
      reveal: signature(clamp01((frame - TAB_AT) / FIELD_FRAMES)),
      validationReveal: signature(clamp01((frame - CHECK_AT) / CHECK_FRAMES)),
      acrossReveal: signature(clamp01((frame - FIELDS_AT) / ACROSS_FRAMES)),
      strictReveal: signature(clamp01((frame - STRICT_AT) / STRICT_FRAMES)),
      refReveal: signature(clamp01((frame - REF_AT) / REF_FRAMES)),
      referenceBlend: blend,
      refLayer: "dss2",
    },
  };
};

const FRAMES = selectPallas().frames.map((f) => ({ id: f.id, ...selectTargetPosition(f.id) }));

const CrossLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const state = getCameraState(frame, S5_CAMERA, fps);
  const out = 1 - signature(clamp01((frame - CROSS_OUT_AT) / CROSS_OUT_FRAMES));
  return (
    <svg width={STAGE.w} height={STAGE.h} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      {FRAMES.map((p, i) => {
        const t = clamp01((frame - (CROSS_AT + i * CROSS_STAGGER)) / CROSS_FRAMES);
        if (t <= 0 || out <= 0) return null;
        const e = signature(t);
        const c = worldToStage(state, tileToApp(OVERVIEW, p.col, p.row));
        const arm = CROSS_ARM * (0.6 + 0.4 * e);
        const ring = 4 + 14 * t;
        return (
          <g key={p.id} opacity={out}>
            <circle cx={c.x} cy={c.y} r={ring} fill="none" stroke={theme.ink} strokeWidth={1.5} opacity={0.35 * (1 - t)} />
            <g stroke={theme.ink} strokeWidth={2} strokeLinecap="round" opacity={0.55 * e}>
              <line x1={c.x - arm} y1={c.y} x2={c.x + arm} y2={c.y} />
              <line x1={c.x} y1={c.y - arm} x2={c.x} y2={c.y + arm} />
            </g>
          </g>
        );
      })}
    </svg>
  );
};

export const S5Check: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < START || frame > END) return null;
  return (
    <>
      <CrossLayer />
      <Caption text={s5.caption} highlight="not drawn" startFrame={CUES.s5.caption} endFrame={CAPTION_END} />
      <Callout text={s5.calloutChecked} variant="ok" target="realityCheck" camera={S5_CAMERA} side="left" lead={70} startFrame={CHECK_AT} endFrame={CHECKED_END} />
      <Caption text={s5.captionFields} highlight="Sixteen" startFrame={FIELDS_AT} endFrame={FIELDS_END} />
      <Caption text={s5.captionStrict} highlight="honest" startFrame={STRICT_AT} endFrame={STRICT_END} />
    </>
  );
};
