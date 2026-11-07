import React from "react";
import type { FilmStatePatch } from "../config/filmState";
import { kf, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { SCENES } from "../config/timeline";
import { ScenePlaceholder } from "./Placeholder";

export const S5_CAMERA: CameraKeyframe[] = [kf(SCENES.S5.start, "fullWindow")];

export const S5_CURSOR: CursorWaypoint[] = [];

export const S5_STATE = (frame: number): FilmStatePatch => {
  void frame;
  return {};
};

export const S5Check: React.FC = () => <ScenePlaceholder scene="S5" />;
