import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { FilmStatePatch } from "../config/filmState";
import { kf, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { s6 } from "../config/copy";
import { focusRect, type FocusName } from "../config/focus";
import { alpha, fonts, theme } from "../config/theme";
import { CUES, SCENES, STAGE } from "../config/timeline";
import { selectPair, selectPallas, selectPallasFrames, selectShift, selectSixMonth, selectTargetPosition } from "../data/select";
import type { FrameInfo } from "../data/types";
import { Callout } from "../fx/Callout";
import { Caption } from "../fx/Caption";
import { getCameraState, worldToStage } from "../fx/Camera";
import { clamp01, signature } from "../lib/ease";
import { ParallaxDiagram } from "../gfx/ParallaxDiagram";
import { tileToApp } from "../ui/viewer/geometry";

const START = SCENES.S6.start;
const END = SCENES.S6.end;

const CLICK_LEAD = 4;
const MAX_SCALE = 2.0;
const FIT_PADDING = 96;

const DIAGRAM_PROGRESS_AT = 2706;
const DIAGRAM_PROGRESS_FRAMES = 118;
const DIAGRAM_DISTANCE_AT = 2716;
const DIAGRAM_DISTANCE_FRAMES = 50;
const DIAGRAM_IN_FRAMES = 24;
const DIAGRAM_OUT_AT = 2796;
const DIAGRAM_OUT_FRAMES = 22;
const DIAGRAM_W = 900;
const DIAGRAM_TOP = 150;
const DIM_FLOOR = 0.22;
const DIM_UP_AT = 2800;
const DIM_UP_FRAMES = 24;

const TAB_FRAMES = 20;
const LAB_AT = 2820;
const SLIDER_CLICK_AT = LAB_AT - CLICK_LEAD;
const SLIDER_FRAMES = 45;
const OUT_FRAMES = 30;
const DRAW_AT = 2850;
const DRAW_AU = 500;
const SLIDER_FROM_AU = 30;
const SLIDER_TO_AU = 500;

const SHIFT_AT = CUES.s6.calloutShift;
const SPECK_ZOOM_AT = 2920;
const SPECK_ZOOM_FRAMES = 36;
const SPECK_ZOOM = 6;

const SIX_AT = CUES.s6.calloutSix;
const SIX_FRAMES = 24;
const SIX_SWEEP_AT = 3004;
const SIX_SWEEP_FRAMES = 52;

const MEASURE_AT = CUES.s6.captionMeasure;
const MEASURE_FRAMES = 24;
const A_CLICK_AT = 3068;
const MARK_A_CLICK_AT = 3086;
const STEP_AT = 3100;
const STEP_FRAMES = 12;
const B_CLICK_AT = 3114;
const MARK_B_CLICK_AT = 3132;
const SELECT_A_AT = A_CLICK_AT + CLICK_LEAD;
const MARK_A_AT = MARK_A_CLICK_AT + CLICK_LEAD;
const SELECT_B_AT = B_CLICK_AT + CLICK_LEAD;
const MARK_B_AT = MARK_B_CLICK_AT + CLICK_LEAD;
const MARK_FRAMES = 8;
const NUMS_FRAMES = 10;
const PULSE_FRAMES = 18;
const COACH_FROM = MARK_A_AT;
const COACH_TO = 3128;
const FIT_AT = 3150;
const FIT_FRAMES = 30;

const NEAR_AT = CUES.s6.calloutNear;
const HONEST_AT = CUES.s6.captionHonest;
const ORRERY_FRAMES = 24;
const DIR_AT = HONEST_AT + 24;
const DIR_FRAMES = 30;
const ORRERY_DAYS = 60;
const ORRERY_MOVE_FRAMES = 110;

const CLEAR_AT = 3390;
const CLEAR_CLICK_AT = CLEAR_AT - CLICK_LEAD;
const CLEAR_FRAMES = 8;
const RESET_FRAMES = 24;

const CAPTION_END = 2800;
const SHIFT_END = 2955;
const SIX_END = 3056;
const MEASURE_END = 3146;
const NEAR_END = 3290;
const HONEST_END = 3405;

const PAIR = selectPair();
const TARGET_A = selectTargetPosition(PAIR.info.a);
const TARGET_B = selectTargetPosition(PAIR.info.b);
const TILE = selectPallas().tile;
const SIX_PX = selectShift(500).sixMonthPx;

const OVERVIEW = { zoom: 1, cx: 0.5, cy: 0.5 } as const;
const SPECK_VIEW = { zoom: SPECK_ZOOM, cx: 0.5, cy: 0.5 } as const;
const MEASURE_VIEW = {
  zoom: 2,
  cx: ((TARGET_A.col + TARGET_B.col) / 2 + 0.5) / TILE.width,
  cy: ((TARGET_A.row + TARGET_B.row) / 2 + 0.5) / TILE.height,
} as const;

const byTime = (a: FrameInfo, b: FrameInfo): number => a.mjd - b.mjd || a.id.localeCompare(b.id);
const PALLAS_TICKS = [...selectPallasFrames()].sort(byTime);
const SIX_TICKS = [...selectSixMonth().frames].sort(byTime);

const tickPosition = (ticks: readonly FrameInfo[], id: string, band: string): number => {
  const i = ticks.findIndex((f) => f.id === id && f.band === band);
  if (i < 0) throw new Error(`S6: frame ${id} (${band}) is not on the time bar`);
  return i / (ticks.length - 1);
};

const POS_A = tickPosition(PALLAS_TICKS, PAIR.info.a, PAIR.info.band);
const POS_B = tickPosition(PALLAS_TICKS, PAIR.info.b, PAIR.info.band);

const SIX_D1 = SIX_TICKS.map((f, i) => ({ frame: f, pos: i / (SIX_TICKS.length - 1) })).filter((x) => x.frame.band === "D1");
const sixShown = (pos: number): FrameInfo => {
  let hit = SIX_D1[0];
  for (const x of SIX_D1) if (x.pos <= pos + 1e-9) hit = x;
  return hit.frame;
};

const BRACKET_ROW = TILE.height / 2 - 0.5;
const BRACKET_MID = TILE.width / 2 - 0.5;
const bracketLeft = tileToApp(OVERVIEW, BRACKET_MID - SIX_PX / 2, BRACKET_ROW);
const bracketRight = tileToApp(OVERVIEW, BRACKET_MID + SIX_PX / 2, BRACKET_ROW);

const speckAt = tileToApp(OVERVIEW, TILE.width / 2 - 0.5, TILE.height / 2 - 0.5);
const aAt = tileToApp(MEASURE_VIEW, TARGET_A.col, TARGET_A.row);
const bAt = tileToApp(MEASURE_VIEW, TARGET_B.col, TARGET_B.row);

const SLIDER = { x0: 1235, x1: 1575, y: 229 } as const;
const MARK_A_BTN = { x: 1289, y: 464.5 } as const;
const MARK_B_BTN = { x: 1405, y: 464.5 } as const;
const CLEAR_BTN = { x: 1521, y: 464.5 } as const;
const FIT_TARGET = { x: 1240, y: 575 } as const;

function bias(name: FocusName, scale: number): number {
  if (scale > MAX_SCALE) throw new Error(`S6: camera scale ${scale} is above the limit ${MAX_SCALE}`);
  const r = focusRect(name);
  const fit = Math.min((STAGE.w - 2 * FIT_PADDING) / r.w, (STAGE.h - 2 * FIT_PADDING) / r.h);
  return scale / fit;
}

export const S6_CAMERA: CameraKeyframe[] = [
  kf(START, "fullWindow", { scaleBias: bias("fullWindow", 1.19) }),
  kf(2712, "fullWindow", { scaleBias: bias("fullWindow", 1.22), ease: "linear", frames: 108 }),
  kf(LAB_AT, "pxLab", { scaleBias: bias("pxLab", 1.6), ease: "signature", frames: 36 }),
  kf(2856, "pxLab", { scaleBias: bias("pxLab", 1.66), ease: "linear", frames: 24 }),
  kf(SHIFT_AT, "fullWindow", { scaleBias: bias("fullWindow", 1.19), ease: "signature", frames: 36 }),
  kf(2916, "fullWindow", { scaleBias: bias("fullWindow", 1.222), ease: "linear", frames: 234 }),
  kf(FIT_AT, "pxMeasure", { scaleBias: bias("pxMeasure", 1.8), ease: "signature", frames: 36 }),
  kf(3186, "pxMeasure", { scaleBias: bias("pxMeasure", 1.88), ease: "linear", frames: 114 }),
  kf(HONEST_AT, "orreryCard", { scaleBias: bias("orreryCard", 1.25), ease: "signature", frames: 36 }),
  kf(3336, "orreryCard", { scaleBias: bias("orreryCard", 1.29), ease: "linear", frames: 39 }),
  kf(3375, "fullWindow", { scaleBias: bias("fullWindow", 1.19), ease: "signature", frames: 36 }),
];

const ramp = (frame: number, at: number, frames: number): number => signature(clamp01((frame - at) / frames));

const sliderDistance = (frame: number): number => SLIDER_FROM_AU + (SLIDER_TO_AU - SLIDER_FROM_AU) * ramp(frame, LAB_AT, SLIDER_FRAMES);

const thumbAt = (distanceAu: number): { x: number; y: number } => ({
  x: SLIDER.x0 + (SLIDER.x1 - SLIDER.x0) * ((distanceAu - 30) / (1000 - 30)),
  y: SLIDER.y,
});

const slideLeg = (frame: number): CursorWaypoint => {
  const p = thumbAt(sliderDistance(frame));
  return { frame, x: p.x, y: p.y };
};

export const S6_CURSOR: CursorWaypoint[] = [
  { frame: 2808, x: thumbAt(SLIDER_FROM_AU).x + 60, y: SLIDER.y + 46 },
  { frame: SLIDER_CLICK_AT, x: thumbAt(SLIDER_FROM_AU).x, y: SLIDER.y, click: true },
  slideLeg(2835),
  slideLeg(2850),
  slideLeg(2866),
  { frame: 2872, x: thumbAt(SLIDER_TO_AU).x + 10, y: SLIDER.y + 14, hide: true },
  { frame: 3050, x: aAt.x + 150, y: aAt.y - 100 },
  { frame: A_CLICK_AT, x: aAt.x, y: aAt.y, click: true },
  { frame: MARK_A_CLICK_AT, x: MARK_A_BTN.x, y: MARK_A_BTN.y, click: true },
  { frame: B_CLICK_AT, x: bAt.x, y: bAt.y, click: true },
  { frame: MARK_B_CLICK_AT, x: MARK_B_BTN.x, y: MARK_B_BTN.y, click: true },
  { frame: 3148, x: MARK_B_BTN.x + 14, y: MARK_B_BTN.y + 18, hide: true },
  { frame: CLEAR_CLICK_AT - 12, x: CLEAR_BTN.x - 60, y: CLEAR_BTN.y + 90 },
  { frame: CLEAR_CLICK_AT, x: CLEAR_BTN.x, y: CLEAR_BTN.y, click: true },
  { frame: CLEAR_AT + 10, x: CLEAR_BTN.x + 16, y: CLEAR_BTN.y + 26, hide: true },
];

const pulseAt = (frame: number, start: number): number => {
  const t = (frame - start) / PULSE_FRAMES;
  if (t < 0 || t >= 1) return 0;
  const v = Math.sin(Math.PI * t);
  return v * v;
};

const marksAt = (frame: number): number => {
  const up1 = ramp(frame, MARK_A_AT, MARK_FRAMES);
  const up2 = ramp(frame, MARK_B_AT, NUMS_FRAMES);
  const down = ramp(frame, CLEAR_AT, CLEAR_FRAMES);
  return (up1 + up2) * (1 - down);
};

const playheadAt = (frame: number): number => {
  if (frame < SIX_AT) return 0;
  if (frame < MEASURE_AT) return ramp(frame, SIX_SWEEP_AT, SIX_SWEEP_FRAMES);
  const toB = ramp(frame, STEP_AT, STEP_FRAMES);
  const reset = ramp(frame, CLEAR_AT, RESET_FRAMES);
  return (POS_A + (POS_B - POS_A) * toB) * (1 - reset);
};

const viewAt = (frame: number): { zoom: number; cx: number; cy: number } => {
  if (frame < SPECK_ZOOM_AT) return OVERVIEW;
  if (frame < SIX_AT) {
    const t = ramp(frame, SPECK_ZOOM_AT, SPECK_ZOOM_FRAMES);
    return { zoom: 1 + (SPECK_VIEW.zoom - 1) * t, cx: 0.5, cy: 0.5 };
  }
  if (frame < MEASURE_AT) return OVERVIEW;
  const back = ramp(frame, CLEAR_AT, RESET_FRAMES);
  return {
    zoom: MEASURE_VIEW.zoom + (OVERVIEW.zoom - MEASURE_VIEW.zoom) * back,
    cx: MEASURE_VIEW.cx + (OVERVIEW.cx - MEASURE_VIEW.cx) * back,
    cy: MEASURE_VIEW.cy + (OVERVIEW.cy - MEASURE_VIEW.cy) * back,
  };
};

export const S6_STATE = (frame: number): FilmStatePatch => {
  const six = frame >= SIX_AT && frame < MEASURE_AT;
  const measuring = frame >= MEASURE_AT;
  const fieldId = six ? "pallas-6mo" : "pallas";
  const position = playheadAt(frame);
  const shown = six ? sixShown(position).id : "";
  const stepped = frame >= STEP_AT && frame < CLEAR_AT;
  const marked = frame >= MARK_A_AT && frame < CLEAR_AT;
  const bothMarked = frame >= MARK_B_AT && frame < CLEAR_AT;
  const view = viewAt(frame);
  const sweeping = six && frame >= SIX_SWEEP_AT && frame < MEASURE_AT - 2;
  const epochSeg = sweeping ? (position < 1 / 3 ? 1 : position < 2 / 3 ? 2 : 3) : null;
  const dim = 1 - (1 - DIM_FLOOR) * (ramp(frame, START, DIAGRAM_IN_FRAMES) - ramp(frame, DIM_UP_AT, DIM_UP_FRAMES));
  const selection =
    frame >= SELECT_A_AT && frame < MARK_A_AT + 6
      ? { col: TARGET_A.col, row: TARGET_A.row }
      : frame >= SELECT_B_AT && frame < CLEAR_AT
        ? { col: TARGET_B.col, row: TARGET_B.row }
        : null;
  return {
    appOpacity: dim,
    header: { fieldId, badge: "real" },
    rail: { fieldId, band: "D1", mode: "static", rateHz: 3, showKnown: true, showMask: true, hot: null },
    viewer: {
      fieldId,
      pairA: six ? shown : PAIR.info.a,
      pairB: six ? shown : PAIR.info.b,
      blinkPhase: stepped ? 1 : 0,
      zoom: view.zoom,
      cx: view.cx,
      cy: view.cy,
      selection,
      overlayAB: false,
      view: "sky",
      refBlend: 0,
      pxDrawAu: frame >= DRAW_AT && frame < CLEAR_AT ? DRAW_AU : null,
      markA: marked ? { col: TARGET_A.col, row: TARGET_A.row } : null,
      markB: bothMarked ? { col: TARGET_B.col, row: TARGET_B.row } : null,
      reveal: 1,
      coach: frame >= COACH_FROM && frame < COACH_TO,
    },
    time: { fieldId, position, epochSeg, reveal: 1 },
    tabs: { tab: "planetx", reveal: 1 },
    planetx: {
      distanceAu: sliderDistance(frame),
      reveal: ramp(frame, START, TAB_FRAMES),
      outReveal: ramp(frame, LAB_AT, OUT_FRAMES),
      sixReveal: ramp(frame, SIX_AT, SIX_FRAMES),
      measureReveal: measuring ? ramp(frame, MEASURE_AT, MEASURE_FRAMES) : 0,
      fitReveal: ramp(frame, FIT_AT, FIT_FRAMES),
      marks: marksAt(frame),
      markPulse: pulseAt(frame, MARK_A_CLICK_AT),
    },
    orrery: {
      reveal: ramp(frame, HONEST_AT, ORRERY_FRAMES),
      day: ORRERY_DAYS * ramp(frame, HONEST_AT, ORRERY_MOVE_FRAMES),
      playing: frame >= HONEST_AT && frame < CLEAR_AT,
      dirReveal: ramp(frame, DIR_AT, DIR_FRAMES),
    },
  };
};

const DiagramLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const opacity = ramp(frame, START, DIAGRAM_IN_FRAMES) * (1 - ramp(frame, DIAGRAM_OUT_AT, DIAGRAM_OUT_FRAMES));
  if (opacity <= 0) return null;
  const progress = ramp(frame, DIAGRAM_PROGRESS_AT, DIAGRAM_PROGRESS_FRAMES);
  const distance = SLIDER_FROM_AU + (SLIDER_TO_AU - SLIDER_FROM_AU) * ramp(frame, DIAGRAM_DISTANCE_AT, DIAGRAM_DISTANCE_FRAMES);
  const drift = 1 + 0.03 * clamp01((frame - START) / (DIAGRAM_OUT_AT + DIAGRAM_OUT_FRAMES - START));
  return (
    <div
      style={{
        position: "absolute",
        left: (STAGE.w - DIAGRAM_W) / 2,
        top: DIAGRAM_TOP,
        opacity,
        transform: `scale(${drift.toFixed(5)})`,
        transformOrigin: "50% 50%",
      }}
    >
      <ParallaxDiagram progress={progress} distanceAu={distance} />
    </div>
  );
};

const BRACKET_AT = SIX_SWEEP_AT;
const BRACKET_FRAMES = 20;
const BRACKET_OUT_AT = 3046;
const BRACKET_OUT_FRAMES = 10;
const BRACKET_TICK = 9;

const BracketLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = ramp(frame, BRACKET_AT, BRACKET_FRAMES);
  const out = 1 - ramp(frame, BRACKET_OUT_AT, BRACKET_OUT_FRAMES);
  if (t <= 0 || out <= 0) return null;
  const state = getCameraState(frame, S6_CAMERA, fps);
  const left = worldToStage(state, bracketLeft);
  const right = worldToStage(state, bracketRight);
  const mid = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
  const half = ((right.x - left.x) / 2) * t;
  const tick = BRACKET_TICK * state.scale;
  const px = Math.round(SIX_PX);
  return (
    <svg width={STAGE.w} height={STAGE.h} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
      <g opacity={out} stroke={theme.planetX} strokeWidth={3} strokeLinecap="round">
        <line x1={mid.x - half} y1={mid.y} x2={mid.x + half} y2={mid.y} />
        <line x1={mid.x - half} y1={mid.y - tick} x2={mid.x - half} y2={mid.y + tick} />
        <line x1={mid.x + half} y1={mid.y - tick} x2={mid.x + half} y2={mid.y + tick} />
      </g>
      <text
        x={mid.x}
        y={mid.y + tick + 30}
        textAnchor="middle"
        fontFamily={fonts.mono}
        fontSize={24}
        fill={alpha(theme.planetX, 0.95 * t * out)}
        stroke={alpha(theme.paper, 0.85 * t * out)}
        strokeWidth={5}
        paintOrder="stroke"
      >
        {`${px} px`}
      </text>
    </svg>
  );
};

export const S6PlanetX: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < START || frame > END) return null;
  return (
    <>
      <DiagramLayer />
      <BracketLayer />
      <Caption text={s6.caption} highlight="Earth does." startFrame={CUES.s6.caption} endFrame={CAPTION_END} />
      <Callout text={s6.calloutShift} target={speckAt} camera={S6_CAMERA} side="top" lead={150} startFrame={SHIFT_AT} endFrame={SHIFT_END} />
      <Callout text={s6.calloutSix} target={bracketRight} camera={S6_CAMERA} side="top" lead={120} startFrame={SIX_AT} endFrame={SIX_END} />
      <Caption text={s6.captionMeasure} highlight="Fit a distance." startFrame={MEASURE_AT} endFrame={MEASURE_END} />
      <Callout text={s6.calloutNear} target={FIT_TARGET} camera={S6_CAMERA} side="left" lead={90} startFrame={NEAR_AT} endFrame={NEAR_END} />
      <Caption text={s6.captionHonest} highlight="Never a detection." startFrame={HONEST_AT} endFrame={HONEST_END} />
    </>
  );
};
