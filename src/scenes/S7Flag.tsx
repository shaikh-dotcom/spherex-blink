import React from "react";
import type { FilmStatePatch } from "../config/filmState";
import { kf, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { SCENES } from "../config/timeline";
import { ScenePlaceholder } from "./Placeholder";

export const S7_CAMERA: CameraKeyframe[] = [kf(SCENES.S7.start, "fullWindow")];

export const S7_CURSOR: CursorWaypoint[] = [];

export const S7_STATE = (frame: number): FilmStatePatch => {
  void frame;
  return {};
};

export const S7Flag: React.FC = () => <ScenePlaceholder scene="S7" />;
