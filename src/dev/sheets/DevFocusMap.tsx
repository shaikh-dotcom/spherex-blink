import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import "../../ui/theme.css";
import { kf, type CameraKeyframe, type CursorWaypoint } from "../../config/camera";
import { theme } from "../../config/theme";
import { STAGE } from "../../config/timeline";
import { FontsReady } from "../../lib/fonts";
import { Camera, getCameraState } from "../../fx/Camera";
import { Callout } from "../../fx/Callout";
import { Caption } from "../../fx/Caption";
import { Cursor } from "../../fx/Cursor";
import { Grain } from "../../fx/Grain";
import { Vignette } from "../../fx/Vignette";
import { FilmApp } from "../../ui/FilmApp";
import type { DevSheet } from "../registry";

const CAMERA: CameraKeyframe[] = [
  kf(0, "fullWindow"),
  kf(60, "rail", { padding: 120 }),
  kf(150, "figure", { padding: 110 }),
  kf(240, "panel", { padding: 140 }),
  kf(330, "fullWindow"),
];

const CURSOR: CursorWaypoint[] = [
  { frame: 60, x: 120, y: 300 },
  { frame: 120, x: 700, y: 400, click: true },
  { frame: 220, x: 1400, y: 300 },
];

const DevFocusMap: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = getCameraState(frame, CAMERA, fps).scale;
  return (
    <FontsReady>
      <AbsoluteFill style={{ background: "#000" }}>
        <div className="film-root" style={{ position: "relative", width: STAGE.w, height: STAGE.h, overflow: "hidden", background: theme.stageGradient }}>
          <Camera keyframes={CAMERA}>
            <FilmApp />
            <Cursor waypoints={CURSOR} zoom={zoom} />
          </Camera>
          <Callout text="Dev focus map" target="figure" camera={CAMERA} startFrame={150} endFrame={230} />
          <Caption text="Focus rectangles of the viewer window." startFrame={30} endFrame={300} />
          <Vignette />
          <Grain />
        </div>
      </AbsoluteFill>
    </FontsReady>
  );
};

export const devSheet: DevSheet = { id: "DevFocusMap", component: DevFocusMap, durationInFrames: 360 };
