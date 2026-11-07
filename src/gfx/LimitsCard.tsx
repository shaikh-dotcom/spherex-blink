import React from "react";
import { alpha, fonts, theme } from "../config/theme";

export interface LimitsCardProps {
  progress: number;
}

export const LimitsCard: React.FC<LimitsCardProps> = ({ progress }) => (
  <div
    style={{
      width: 1500,
      height: 560,
      border: `1px dashed ${alpha(theme.accent, 0.3)}`,
      color: theme.ink3,
      fontFamily: fonts.mono,
      fontSize: 20,
      padding: 16,
    }}
  >
    {`LimitsCard (stub) progress ${progress.toFixed(2)}`}
  </div>
);
