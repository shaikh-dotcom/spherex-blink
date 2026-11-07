import React from "react";
import type { FilmStatePatch } from "../config/filmState";
import { kf, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { SCENES } from "../config/timeline";
import { ScenePlaceholder } from "./Placeholder";

export const S8_CAMERA: CameraKeyframe[] = [kf(SCENES.S8.start, "fullWindow")];

export const S8_CURSOR: CursorWaypoint[] = [];

export const S8_STATE = (frame: number): FilmStatePatch => {
  void frame;
  return {};
};

export const S8Limits: React.FC = () => <ScenePlaceholder scene="S8" />;
