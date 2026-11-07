import React from "react";
import type { FilmStatePatch } from "../config/filmState";
import { kf, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { SCENES } from "../config/timeline";
import { ScenePlaceholder } from "./Placeholder";

export const S0_CAMERA: CameraKeyframe[] = [kf(SCENES.S0.start, "fullWindow")];

export const S0_CURSOR: CursorWaypoint[] = [];

export const S0_STATE = (frame: number): FilmStatePatch => {
  void frame;
  return {};
};

export const S0Hook: React.FC = () => <ScenePlaceholder scene="S0" />;
