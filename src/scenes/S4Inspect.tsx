import React from "react";
import type { FilmStatePatch } from "../config/filmState";
import { kf, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { SCENES } from "../config/timeline";
import { ScenePlaceholder } from "./Placeholder";

export const S4_CAMERA: CameraKeyframe[] = [kf(SCENES.S4.start, "fullWindow")];

export const S4_CURSOR: CursorWaypoint[] = [];

export const S4_STATE = (frame: number): FilmStatePatch => {
  void frame;
  return {};
};

export const S4Inspect: React.FC = () => <ScenePlaceholder scene="S4" />;
