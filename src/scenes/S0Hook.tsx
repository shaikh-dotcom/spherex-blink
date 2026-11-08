import React from "react";
import { useCurrentFrame } from "remotion";
import type { FilmStatePatch } from "../config/filmState";
import { holdShot, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { s0 } from "../config/copy";
import { CUES, SCENES, STAGE } from "../config/timeline";
import { fonts, halo, layout, theme } from "../config/theme";
import { Callout } from "../fx/Callout";
import { Caption } from "../fx/Caption";
import { HookField, hookDotPoints } from "../gfx/HookField";
import { clamp01, signature } from "../lib/ease";

const START = SCENES.S0.start;
const END = SCENES.S0.end;
const CAPTION_END = 150;
const CALLOUT_END = 282;
const TAG_AT = 240;

export const S0_CAMERA: CameraKeyframe[] = holdShot(START, END, "fullWindow", { arrive: 30, push: 0.04 });

export const S0_CURSOR: CursorWaypoint[] = [];

export const S0_STATE = (frame: number): FilmStatePatch => {
  void frame;
  return { appOpacity: 0 };
};

export const S0Hook: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < START || frame > END) return null;
  const tag = signature(clamp01((frame - TAG_AT) / 18));
  return (
    <>
      <HookField frame={frame} start={START} end={END} />
      <Caption text={s0.caption} startFrame={CUES.s0.caption} endFrame={CAPTION_END} />
      <Callout text={s0.calloutJump} target={hookDotPoints().p2} side="top" lead={96} startFrame={CUES.s0.calloutJump} endFrame={CALLOUT_END} />
      <div
        style={{
          position: "absolute",
          left: 0,
          width: STAGE.w,
          bottom: layout.captionBottom,
          display: "flex",
          justifyContent: "center",
          opacity: tag,
          transform: `translateY(${(1 - tag) * 20}px)`,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: "0.22em",
            color: theme.accentInk,
            whiteSpace: "nowrap",
            textShadow: `0 2px 20px ${halo(0.7)}`,
          }}
        >
          {s0.tag}
        </div>
      </div>
    </>
  );
};
