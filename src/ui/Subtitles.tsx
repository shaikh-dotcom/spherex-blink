import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { alpha, fonts, theme } from "../config/theme";
import { subtitleCues } from "../config/subtitles";

const FADE = 4;

export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = subtitleCues.find((c) => frame >= c.from && frame < c.to);
  if (!cue) return null;
  const span = cue.to - cue.from;
  const fade = Math.min(FADE, Math.floor(span / 2));
  const opacity = interpolate(frame, [cue.from, cue.from + fade, cue.to - fade, cue.to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 30,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        opacity,
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          padding: "8px 24px 10px",
          borderRadius: 6,
          background: alpha(theme.sunken, 0.8),
          color: theme.ink,
          fontFamily: fonts.serif,
          fontWeight: 500,
          fontSize: 36,
          lineHeight: 1.25,
          textAlign: "center",
          textWrap: "balance",
        }}
      >
        {cue.text}
      </div>
    </div>
  );
};
