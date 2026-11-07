import React from "react";
import type { FilmStatePatch } from "../config/filmState";
import { kf, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { SCENES } from "../config/timeline";
import { ScenePlaceholder } from "./Placeholder";

export const S1_CAMERA: CameraKeyframe[] = [kf(SCENES.S1.start, "fullWindow")];

export const S1_CURSOR: CursorWaypoint[] = [];

export const S1_STATE = (frame: number): FilmStatePatch => {
  void frame;
  return {};
};

export const S1Title: React.FC = () => <ScenePlaceholder scene="S1" />;
