import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import "./ui/theme.css";
import { theme } from "./config/theme";
import { CUES, SCENES, STAGE } from "./config/timeline";
import { FontsReady } from "./lib/fonts";
import { clamp01, signature } from "./lib/ease";
import { Camera, getCameraState } from "./fx/Camera";
import { Cursor } from "./fx/Cursor";
import { Grain, GRAIN_OPACITY } from "./fx/Grain";
import { Vignette, VIGNETTE_STRENGTH } from "./fx/Vignette";
import { FilmApp } from "./ui/FilmApp";
import { FILM_CAMERA, FILM_CURSOR, SCENE_OVERLAYS } from "./scenes";
import { FilmAudio } from "./audio/FilmAudio";
import { Subtitles } from "./ui/Subtitles";

const Stage: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { width } = useVideoConfig();
  const scale = width / STAGE.w;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div
        className="film-root"
        style={{
          position: "relative",
          flex: "none",
          width: STAGE.w,
          height: STAGE.h,
          transform: `scale(${scale})`,
          transformOrigin: "0 0",
          overflow: "hidden",
          background: theme.stageGradient,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

export const SpherexFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = getCameraState(frame, FILM_CAMERA, fps).scale;
  const finish = 1 - signature(clamp01((frame - CUES.s9.fade) / (SCENES.S9.end - CUES.s9.fade)));
  return (
    <FontsReady>
      <Stage>
        <Camera keyframes={FILM_CAMERA}>
          <div className="film-app-layer">
            <FilmApp />
          </div>
          <Cursor waypoints={FILM_CURSOR} zoom={zoom} />
        </Camera>
        {SCENE_OVERLAYS.map(({ id, Overlay }) => (
          <Overlay key={id} />
        ))}
        <Vignette strength={VIGNETTE_STRENGTH * finish} />
        <Grain opacity={GRAIN_OPACITY * finish} />
        <Subtitles />
        <FilmAudio />
      </Stage>
    </FontsReady>
  );
};
