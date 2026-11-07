import React from "react";
import { useCurrentFrame } from "remotion";
import { SCENES, type SceneKey } from "../config/timeline";
import { alpha, fonts, theme } from "../config/theme";

export const ScenePlaceholder: React.FC<{ scene: SceneKey }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const s = SCENES[scene];
  if (frame < s.start || frame > s.end) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 96,
        bottom: 60,
        fontFamily: fonts.mono,
        fontSize: 24,
        color: theme.accentInk,
        background: alpha(theme.paper, 0.8),
        padding: "6px 14px",
        border: `1px solid ${theme.rule2}`,
      }}
    >
      {`${s.id} ${s.name}  f${s.start}-${s.end}  now f${frame}  (stub)`}
    </div>
  );
};
