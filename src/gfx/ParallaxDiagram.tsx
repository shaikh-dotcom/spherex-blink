import React from "react";
import { alpha, fonts, theme } from "../config/theme";

export interface ParallaxDiagramProps {
  progress: number;
  distanceAu: number;
}

export const ParallaxDiagram: React.FC<ParallaxDiagramProps> = ({ progress, distanceAu }) => (
  <div
    style={{
      width: 900,
      height: 520,
      border: `1px dashed ${alpha(theme.accent, 0.3)}`,
      color: theme.ink3,
      fontFamily: fonts.mono,
      fontSize: 20,
      padding: 16,
    }}
  >
    {`ParallaxDiagram (stub) progress ${progress.toFixed(2)} at ${distanceAu} AU`}
  </div>
);
