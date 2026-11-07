import React from "react";
import { STAGE } from "../config/timeline";
import { alpha, fonts, theme } from "../config/theme";

export interface HookFieldProps {
  frame: number;
  start: number;
  end: number;
}

export const HookField: React.FC<HookFieldProps> = ({ frame, start, end }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      top: 0,
      width: STAGE.w,
      height: STAGE.h,
      background: theme.hookBg,
      color: theme.ink3,
      fontFamily: fonts.mono,
      fontSize: 22,
      padding: 24,
      border: `1px dashed ${alpha(theme.accent, 0.3)}`,
    }}
  >
    {`HookField (stub) frame ${frame} in ${start}-${end}`}
  </div>
);
