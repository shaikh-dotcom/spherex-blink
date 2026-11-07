import React from "react";
import type { FilmStatePatch } from "../config/filmState";
import { kf, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { SCENES } from "../config/timeline";
import { ScenePlaceholder } from "./Placeholder";

export const S6_CAMERA: CameraKeyframe[] = [kf(SCENES.S6.start, "fullWindow")];

export const S6_CURSOR: CursorWaypoint[] = [];

export const S6_STATE = (frame: number): FilmStatePatch => {
  void frame;
  return {};
};

export const S6PlanetX: React.FC = () => <ScenePlaceholder scene="S6" />;
