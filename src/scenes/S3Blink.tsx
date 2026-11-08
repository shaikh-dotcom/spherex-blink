import React from "react";
import { useCurrentFrame } from "remotion";
import type { FilmStatePatch } from "../config/filmState";
import { kf, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { badges, s3 } from "../config/copy";
import { FOCUS, focusRect, type FocusName } from "../config/focus";
import { CUES, SCENES, STAGE } from "../config/timeline";
import { selectPair, selectTargetPosition } from "../data/select";
import { Badge, badgeReveal } from "../fx/Badge";
import { Callout } from "../fx/Callout";
import { Caption } from "../fx/Caption";
import { clamp01, signature } from "../lib/ease";
import { VIEW_BOX, tileToApp } from "../ui/viewer/geometry";

const START = SCENES.S3.start;
const END = SCENES.S3.end;

const BLINK_FROM = 1140;
const BLINK_HALF = 10;
const OVERLAY_FROM = CUES.s3.calloutAmber;
const STATIC_BACK = 1650;
const CLICK_LEAD = 4;

const BADGE_END = 1170;
const STARS_END = 1230;
const JUMP_END = 1260;
const PLUTO_END = 1290;
const AMBER_END = 1350;
const PAIR_END = 1530;
const WARN_END = 1650;

const HOT_BLINK = { from: 1110, to: 1200 } as const;
const HOT_PAIR = { from: 1395, to: 1470 } as const;
const COACH = { from: 1260, to: 1380 } as const;

const MAX_SCALE = 1.6;
const FIT_PADDING = 96;

const VIEW = { zoom: 1, cx: 0.5, cy: 0.5 } as const;
const STAR_TILE = { col: 299, row: 277 } as const;

function bias(name: FocusName, scale: number): number {
  if (scale > MAX_SCALE) throw new Error(`S3: camera scale ${scale} is above the limit ${MAX_SCALE} for this scene`);
  const r = focusRect(name);
  const fit = Math.min((STAGE.w - 2 * FIT_PADDING) / r.w, (STAGE.h - 2 * FIT_PADDING) / r.h);
  return scale / fit;
}

export const S3_CAMERA: CameraKeyframe[] = [
  kf(START, "figure", { scaleBias: bias("figure", 1.283), ease: "signature", frames: 30 }),
  kf(1110, "figure", { scaleBias: bias("figure", 1.32), ease: "linear", frames: 30 }),
  kf(BLINK_FROM, "skyImage", { scaleBias: bias("skyImage", 1.46), ease: "signature", frames: 45 }),
  kf(1200, "skyImage", { scaleBias: bias("skyImage", 1.53), ease: "linear", frames: 150 }),
  kf(1365, "figure", { scaleBias: bias("figure", 1.283), ease: "signature", frames: 45 }),
  kf(CUES.s3.captionPair, "figure", { scaleBias: bias("figure", 1.34), ease: "linear", frames: 180 }),
  kf(CUES.s3.calloutWarn, "figure", { scaleBias: bias("figure", 1.386), ease: "linear", frames: 60 }),
  kf(STATIC_BACK, "figure", { scaleBias: bias("figure", 1.283), ease: "signature", frames: END - STATIC_BACK }),
];

const blinkBox = focusRect("blinkControls");
const BLINK_BTN = { x: blinkBox.x + blinkBox.w / 2, y: blinkBox.y + 45 } as const;
const PAIR_BTN = { x: blinkBox.x + blinkBox.w / 2, y: blinkBox.y + 157 } as const;

export const S3_CURSOR: CursorWaypoint[] = [
  { frame: 1104, x: 330, y: 340 },
  { frame: BLINK_FROM - CLICK_LEAD, x: BLINK_BTN.x, y: BLINK_BTN.y, click: true },
  { frame: 1196, x: 560, y: 520 },
  { frame: CUES.s3.captionPair - CLICK_LEAD, x: PAIR_BTN.x, y: PAIR_BTN.y, click: true },
  { frame: 1444, x: 330, y: 470, hide: true },
];

const within = (frame: number, w: { from: number; to: number }): boolean => frame >= w.from && frame < w.to;

const blinkPhaseAt = (frame: number): number => {
  if (frame < BLINK_FROM || frame >= OVERLAY_FROM) return 0;
  return Math.floor((frame - BLINK_FROM) / BLINK_HALF) % 2;
};

export const S3_STATE = (frame: number): FilmStatePatch => {
  const pair = selectPair();
  const mode = frame >= STATIC_BACK ? "static" : frame >= OVERLAY_FROM ? "overlay" : frame >= BLINK_FROM ? "blink" : "static";
  const hot = within(frame, HOT_BLINK) ? "blink" : within(frame, HOT_PAIR) ? "pair" : null;
  return {
    appOpacity: 1,
    header: { fieldId: "pallas", badge: "real" },
    rail: { fieldId: "pallas", band: pair.info.band, mode, rateHz: 3, showKnown: true, showMask: true, hot },
    viewer: {
      fieldId: "pallas",
      pairA: pair.info.a,
      pairB: pair.info.b,
      blinkPhase: blinkPhaseAt(frame),
      zoom: VIEW.zoom,
      cx: VIEW.cx,
      cy: VIEW.cy,
      selection: null,
      overlayAB: frame >= OVERLAY_FROM && frame < STATIC_BACK,
      view: "sky",
      refBlend: 0,
      pxDrawAu: null,
      markA: null,
      markB: null,
      reveal: 1,
      coach: within(frame, COACH),
    },
    time: { fieldId: "pallas", position: 0, epochSeg: null, reveal: 1 },
    tabs: { tab: "inspect", reveal: 1 },
  };
};

const reveal = (frame: number, at: number, span = 14): number => signature(clamp01((frame - at) / span));

export const S3Blink: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < START || frame > END) return null;
  const pair = selectPair();
  const star = tileToApp(VIEW, STAR_TILE.col, STAR_TILE.row);
  const posA = selectTargetPosition(pair.info.a);
  const posB = selectTargetPosition(pair.info.b);
  const asteroid = tileToApp(VIEW, (posA.col + posB.col) / 2, (posA.row + posB.row) / 2);
  const keyX = FOCUS.figure.x + VIEW_BOX.left + VIEW_BOX.outer - 13 - 60;
  const keyY = FOCUS.figure.y + VIEW_BOX.top + 1 + 12 + 30 + 6 + 14;
  const badgeOut = 1 - reveal(frame, BADGE_END - 12, 12);
  return (
    <>
      {frame < BADGE_END ? (
        <div style={{ position: "absolute", left: 0, width: STAGE.w, top: 62, display: "flex", justifyContent: "center", opacity: badgeOut }}>
          <Badge label={badges.real} tone="accent" reveal={badgeReveal(frame, CUES.s3.badge)} pulse={1} />
        </div>
      ) : null}
      <Callout text={s3.calloutStars} target={star} camera={S3_CAMERA} side="top" startFrame={CUES.s3.calloutStars} endFrame={STARS_END} />
      <Callout text={s3.calloutJump} target={asteroid} camera={S3_CAMERA} side="top" startFrame={CUES.s3.calloutJump} endFrame={JUMP_END} />
      <Caption text={s3.captionPluto} highlight="Pluto" size={64} startFrame={CUES.s3.captionPluto} endFrame={PLUTO_END} />
      <Callout text={s3.calloutAmber} target={{ x: keyX, y: keyY }} camera={S3_CAMERA} side="bottom" startFrame={CUES.s3.calloutAmber} endFrame={AMBER_END} />
      <Caption text={s3.captionPair} highlight="Best pair" size={64} startFrame={CUES.s3.captionPair} endFrame={PAIR_END} />
      <Callout text={s3.calloutWarn} target={star} camera={S3_CAMERA} side="top" startFrame={CUES.s3.calloutWarn} endFrame={WARN_END} />
    </>
  );
};
