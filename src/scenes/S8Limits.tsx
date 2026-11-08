import React from "react";
import { useCurrentFrame } from "remotion";
import type { FilmStatePatch } from "../config/filmState";
import { holdShot, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { focusRect, rectCenter } from "../config/focus";
import { badges, s8 } from "../config/copy";
import { CUES, SCENES, STAGE } from "../config/timeline";
import { fonts, theme } from "../config/theme";
import { Caption } from "../fx/Caption";
import { Badge, badgeReveal } from "../fx/Badge";
import { inOut } from "../fx/util";
import { LimitsCard } from "../gfx/LimitsCard";
import { clamp01, signature } from "../lib/ease";

const START = SCENES.S8.start;
const END = SCENES.S8.end;
const LIFT_START = 4170;
const CARD_W = 1500;
const CARD_H = 560;
const CARD_TOP = 130;

const PROGRESS_KNOTS: readonly (readonly [number, number])[] = [
  [CUES.s8.columns, 0],
  [3825, 0.1],
  [3855, 0.24],
  [3885, 0.38],
  [3915, 0.52],
  [3945, 0.66],
  [3971, 0.78],
  [4050, 0.86],
  [4080, 0.96],
  [LIFT_START, 1],
];

function cardProgress(frame: number): number {
  const first = PROGRESS_KNOTS[0];
  if (frame <= first[0]) return 0;
  for (let i = 1; i < PROGRESS_KNOTS.length; i++) {
    const [f1, p1] = PROGRESS_KNOTS[i];
    if (frame <= f1) {
      const [f0, p0] = PROGRESS_KNOTS[i - 1];
      return p0 + ((p1 - p0) * (frame - f0)) / (f1 - f0);
    }
  }
  return 1;
}

export const S8_CAMERA: CameraKeyframe[] = holdShot(START, END, "fullWindow", { arrive: 24, push: 0.03 });

export const S8_CURSOR: CursorWaypoint[] = [{ frame: START, ...rectCenter(focusRect("fullWindow")), hide: true }];

export const S8_STATE = (frame: number): FilmStatePatch => {
  const dim = signature(clamp01((frame - START) / 30));
  const lift = signature(clamp01((frame - LIFT_START) / (END - LIFT_START)));
  return { appOpacity: (1 - 0.85 * dim) * (1 - lift) };
};

const HatchPair: React.FC<{ frame: number }> = ({ frame }) => {
  const { inP, outP } = inOut(frame, CUES.s8.captionHatch, CUES.s8.captionClaim, 18, 12);
  const o = inP * (1 - outP);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: STAGE.w,
        top: 750,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 28,
        opacity: o,
        transform: `translateY(${(1 - o) * 16}px)`,
      }}
    >
      <div
        style={{
          width: 260,
          height: 90,
          background: theme.sunken,
          backgroundImage: theme.hatchNoData,
          border: `1.5px solid ${theme.rule3}`,
        }}
      />
      <div style={{ fontFamily: fonts.mono, fontSize: 32, color: theme.ink2, letterSpacing: 1 }}>no data</div>
    </div>
  );
};

export const S8Limits: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < START || frame > END) return null;
  const lift = signature(clamp01((frame - LIFT_START) / (END - LIFT_START)));
  const drift = 1 + 0.02 * clamp01((frame - CUES.s8.columns) / (LIFT_START - CUES.s8.columns));
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: (STAGE.w - CARD_W) / 2,
          top: CARD_TOP,
          width: CARD_W,
          height: CARD_H,
          opacity: 1 - lift,
          transform: `translateY(${-70 * lift}px) scale(${drift})`,
          transformOrigin: "50% 50%",
        }}
      >
        <LimitsCard progress={cardProgress(frame)} />
      </div>
      <Caption text={s8.caption} startFrame={CUES.s8.caption} endFrame={CUES.s8.captionHatch} />
      <HatchPair frame={frame} />
      <Caption text={s8.captionHatch} startFrame={CUES.s8.captionHatch} endFrame={CUES.s8.captionClaim} />
      <div
        style={{
          position: "absolute",
          left: 0,
          width: STAGE.w,
          top: 780,
          display: "flex",
          justifyContent: "center",
          opacity: 1 - lift,
        }}
      >
        <Badge label={badges.prototype} tone="warn" reveal={badgeReveal(frame, CUES.s8.captionClaim)} />
      </div>
      <Caption text={s8.captionClaim} startFrame={CUES.s8.captionClaim} endFrame={LIFT_START} />
    </>
  );
};
