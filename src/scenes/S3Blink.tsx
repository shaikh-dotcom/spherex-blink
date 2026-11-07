import React from "react";
import type { FilmStatePatch } from "../config/filmState";
import { kf, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { SCENES } from "../config/timeline";
import { ScenePlaceholder } from "./Placeholder";

export const S3_CAMERA: CameraKeyframe[] = [kf(SCENES.S3.start, "fullWindow")];

export const S3_CURSOR: CursorWaypoint[] = [];

export const S3_STATE = (frame: number): FilmStatePatch => {
  void frame;
  return {};
};

export const S3Blink: React.FC = () => <ScenePlaceholder scene="S3" />;
