import React from "react";
import { useCurrentFrame } from "remotion";
import type { FilmStatePatch } from "../config/filmState";
import { holdShot, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { s9, urls } from "../config/copy";
import { CUES, SCENES, STAGE } from "../config/timeline";
import { fonts, theme } from "../config/theme";
import { Mark } from "../gfx/Mark";
import { selectAcknowledgement } from "../data/select";
import { clamp01, signature } from "../lib/ease";

const START = SCENES.S9.start;
const END = SCENES.S9.end;
const MARK_DRAW_END = 4290;
const FADE_START = CUES.s9.fade;
const TAGLINE_AT = CUES.s9.lockup + 15;
const REPO_AT = CUES.s9.link + 15;
const TAIL_AT = CUES.s9.link + 30;

export const S9_CAMERA: CameraKeyframe[] = holdShot(START, END, "fullWindow", { arrive: 24, push: 0.03, scaleBias: 1.03 });

export const S9_CURSOR: CursorWaypoint[] = [];

export const S9_STATE = (frame: number): FilmStatePatch => {
  void frame;
  return { appOpacity: 0 };
};

const reveal = (frame: number, at: number, span = 18): number => signature(clamp01((frame - at) / span));

const rise = (t: number, px = 24): React.CSSProperties => ({ opacity: t, transform: `translateY(${(1 - t) * px}px)` });

const center: React.CSSProperties = {
  position: "absolute",
  left: 0,
  width: STAGE.w,
  display: "flex",
  justifyContent: "center",
  textAlign: "center",
};

export const S9Outro: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < START || frame > END) return null;
  const draw = clamp01((frame - CUES.s9.lockup) / (MARK_DRAW_END - CUES.s9.lockup));
  const lockup = reveal(frame, CUES.s9.lockup);
  const tagline = reveal(frame, TAGLINE_AT);
  const link = reveal(frame, CUES.s9.link);
  const rule = reveal(frame, CUES.s9.link + 6, 24);
  const repo = reveal(frame, REPO_AT);
  const tail = reveal(frame, TAIL_AT);
  const ack = reveal(frame, CUES.s9.ack, 24);
  const cover = signature(clamp01((frame - FADE_START) / (END - FADE_START)));
  const drift = 1 + 0.03 * clamp01((frame - CUES.s9.lockup) / (FADE_START - CUES.s9.lockup));
  const acknowledgement = (() => {
    try {
      return selectAcknowledgement();
    } catch {
      return null;
    }
  })();
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 0, width: STAGE.w, height: STAGE.h, transform: `scale(${drift})`, transformOrigin: "50% 46%" }}>
        <div style={{ ...center, top: 170 }}>
          <Mark size={160} draw={draw} color={theme.ink} />
        </div>
        <div style={{ ...center, top: 372, fontFamily: fonts.serif, fontWeight: 700, fontSize: 92, letterSpacing: "-0.01em", color: theme.ink, ...rise(lockup) }}>
          {s9.lockup}
        </div>
        <div style={{ ...center, top: 490, fontFamily: fonts.serif, fontStyle: "italic", fontWeight: 500, fontSize: 54, color: theme.accentInk, ...rise(tagline) }}>
          {s9.tagline}
        </div>
        <div style={{ ...center, top: 636, fontFamily: fonts.mono, fontWeight: 500, fontSize: 48, color: theme.ink, ...rise(link) }}>{urls.live}</div>
        <div style={{ ...center, top: 700 }}>
          <div style={{ width: 1120 * rule, height: 2, background: theme.accent, opacity: 0.8 }} />
        </div>
        <div style={{ ...center, top: 722, fontFamily: fonts.mono, fontWeight: 500, fontSize: 30, color: theme.ink2, ...rise(repo, 16) }}>{urls.repo}</div>
        <div style={{ ...center, top: 796, fontFamily: fonts.serif, fontWeight: 500, fontSize: 40, color: theme.ink2, ...rise(tail, 16) }}>{s9.tail}</div>
        {acknowledgement ? (
          <div style={{ ...center, bottom: 70, opacity: ack }}>
            <div style={{ maxWidth: 1520, fontFamily: fonts.serif, fontWeight: 500, fontSize: 22, lineHeight: 1.32, color: theme.ink3 }}>{acknowledgement}</div>
          </div>
        ) : null}
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: STAGE.w, height: STAGE.h, background: theme.paper, opacity: cover }} />
    </>
  );
};
