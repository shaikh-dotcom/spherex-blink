import React from "react";
import { theme } from "../config/theme";

export interface MarkProps {
  size: number;
  color?: string;
  draw?: number;
}

export const Mark: React.FC<MarkProps> = ({ size, color = theme.ink }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" aria-hidden="true" style={{ color }}>
    <circle cx="19" cy="19" r="17.5" fill="none" stroke="currentColor" strokeOpacity={0.28} />
    <ellipse cx="19" cy="19" rx="14.5" ry="5.6" transform="rotate(-24 19 19)" fill="none" stroke="currentColor" strokeWidth={1.3} />
    <ellipse cx="19" cy="19" rx="14.5" ry="5.6" transform="rotate(36 19 19)" fill="none" stroke="currentColor" strokeOpacity={0.35} strokeWidth={1} />
    <circle cx="19" cy="19" r="3.3" fill="currentColor" />
    <circle cx="30.8" cy="13.6" r="2.3" fill={theme.accent} />
  </svg>
);
