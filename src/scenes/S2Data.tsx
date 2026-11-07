import React from "react";
import type { FilmStatePatch } from "../config/filmState";
import { kf, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { SCENES } from "../config/timeline";
import { ScenePlaceholder } from "./Placeholder";

export const S2_CAMERA: CameraKeyframe[] = [kf(SCENES.S2.start, "fullWindow")];

export const S2_CURSOR: CursorWaypoint[] = [];

export const S2_STATE = (frame: number): FilmStatePatch => {
  void frame;
  return {};
};

export const S2Data: React.FC = () => <ScenePlaceholder scene="S2" />;
