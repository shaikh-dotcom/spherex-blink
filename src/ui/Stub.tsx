import React from "react";
import { alpha, fonts, theme } from "../config/theme";
import type { Rect } from "../config/focus";

export const Stub: React.FC<{ name: string; rect: Rect; note?: string }> = ({ name, rect, note }) => (
  <div
    style={{
      position: "absolute",
      left: rect.x,
      top: rect.y,
      width: rect.w,
      height: rect.h,
      border: `1px dashed ${alpha(theme.accent, 0.3)}`,
      color: theme.ink3,
      fontFamily: fonts.mono,
      fontSize: 13,
      padding: 4,
      overflow: "hidden",
    }}
  >
    {name}
    {note ? <div style={{ color: theme.faint }}>{note}</div> : null}
  </div>
);
