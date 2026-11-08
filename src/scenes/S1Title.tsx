import React from "react";
import { useCurrentFrame } from "remotion";
import type { FilmStatePatch } from "../config/filmState";
import { kf, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { brand, s1 } from "../config/copy";
import { CUES, SCENES, STAGE } from "../config/timeline";
import { alpha, fonts, theme } from "../config/theme";
import { KineticText } from "../fx/KineticText";
import { Mark } from "../gfx/Mark";
import { selectPair } from "../data/select";
import { clamp01, signature } from "../lib/ease";

const START = SCENES.S1.start;
const END = SCENES.S1.end;
const PUSH_FROM = 330;
const LIFT_START = 570;
const MARK_DRAW_END = 345;
const ACCENT_AT = CUES.s1.lockup + 6;
const PUSH = 0.03;

export const S1_CAMERA: CameraKeyframe[] = [
  kf(START, "fullWindow", { ease: "signature", frames: 30 }),
  kf(PUSH_FROM, "fullWindow", { scaleBias: 1 + PUSH, ease: "linear", frames: LIFT_START - PUSH_FROM }),
  kf(LIFT_START, "fullWindow", { ease: "signature", frames: END - LIFT_START }),
];

export const S1_CURSOR: CursorWaypoint[] = [];

export const S1_STATE = (frame: number): FilmStatePatch => {
  const pair = selectPair();
  const emerge = signature(clamp01((frame - LIFT_START) / (END - LIFT_START)));
  return {
    appOpacity: emerge,
    header: { fieldId: "pallas" },
    rail: { band: pair.info.band },
    viewer: { fieldId: "pallas", pairA: pair.info.a, pairB: pair.info.b, zoom: 1, reveal: 1 },
    time: { reveal: 1 },
    tabs: { tab: "inspect", reveal: 1 },
  };
};

const reveal = (frame: number, at: number, span = 18): number => signature(clamp01((frame - at) / span));

export const S1Title: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < START || frame > END) return null;
  const lift = signature(clamp01((frame - LIFT_START) / (END - LIFT_START)));
  const drift = 1 + 0.02 * clamp01((frame - CUES.s1.lockup) / (LIFT_START - CUES.s1.lockup));
  const eyebrow = reveal(frame, CUES.s1.eyebrow, 24);
  const glow = reveal(frame, CUES.s1.lockup, 45);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: STAGE.w,
        height: STAGE.h,
        opacity: 1 - lift,
        transform: `translateY(${-90 * lift}px)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: STAGE.w,
          height: STAGE.h,
          background: `radial-gradient(900px 520px at 50% 44%, ${alpha(theme.accent, 0.05 * glow)}, transparent 70%)`,
        }}
      />
      <div style={{ position: "absolute", left: 0, top: 0, width: STAGE.w, height: STAGE.h, transform: `scale(${drift})`, transformOrigin: "50% 46%" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            width: STAGE.w,
            top: 226,
            display: "flex",
            justifyContent: "center",
            fontFamily: fonts.mono,
            fontWeight: 500,
            fontSize: 26,
            letterSpacing: "0.2em",
            color: theme.ink2,
            whiteSpace: "nowrap",
            opacity: eyebrow,
            transform: `translateY(${(1 - eyebrow) * 18}px)`,
          }}
        >
          {brand.eyebrow}
        </div>
        <div style={{ position: "absolute", left: 0, width: STAGE.w, top: 330, display: "flex", justifyContent: "center", alignItems: "center", columnGap: 72 }}>
          <Mark size={210} draw={clamp01((frame - CUES.s1.lockup) / (MARK_DRAW_END - CUES.s1.lockup))} color={theme.ink} />
          <div style={{ display: "flex", flexDirection: "column", rowGap: 6 }}>
            <KineticText text={brand.nameLead} startFrame={CUES.s1.lockup} fontSize={140} align="left" />
            <KineticText text={brand.nameAccent} startFrame={ACCENT_AT} fontSize={140} align="left" italic color={theme.accentInk} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, width: STAGE.w, top: 714, display: "flex", justifyContent: "center" }}>
          <KineticText text={s1.tagline} startFrame={CUES.s1.tagline} fontSize={52} weight={500} italic color={theme.ink2} stagger={4} />
        </div>
      </div>
    </div>
  );
};
