import type React from "react";
import type { CameraKeyframe, CursorWaypoint } from "../config/camera";
import type { FilmStatePatch } from "../config/filmState";
import { sceneAt, type SceneKey } from "../config/timeline";
import { S0_CAMERA, S0_CURSOR, S0_STATE, S0Hook } from "./S0Hook";
import { S1_CAMERA, S1_CURSOR, S1_STATE, S1Title } from "./S1Title";
import { S2_CAMERA, S2_CURSOR, S2_STATE, S2Data } from "./S2Data";
import { S3_CAMERA, S3_CURSOR, S3_STATE, S3Blink } from "./S3Blink";
import { S4_CAMERA, S4_CURSOR, S4_STATE, S4Inspect } from "./S4Inspect";
import { S5_CAMERA, S5_CURSOR, S5_STATE, S5Check } from "./S5Check";
import { S6_CAMERA, S6_CURSOR, S6_STATE, S6PlanetX } from "./S6PlanetX";
import { S7_CAMERA, S7_CURSOR, S7_STATE, S7Flag } from "./S7Flag";
import { S8_CAMERA, S8_CURSOR, S8_STATE, S8Limits } from "./S8Limits";
import { S9_CAMERA, S9_CURSOR, S9_STATE, S9Outro } from "./S9Outro";

export const FILM_CAMERA: CameraKeyframe[] = [
  ...S0_CAMERA,
  ...S1_CAMERA,
  ...S2_CAMERA,
  ...S3_CAMERA,
  ...S4_CAMERA,
  ...S5_CAMERA,
  ...S6_CAMERA,
  ...S7_CAMERA,
  ...S8_CAMERA,
  ...S9_CAMERA,
];

export const FILM_CURSOR: CursorWaypoint[] = [
  ...S0_CURSOR,
  ...S1_CURSOR,
  ...S2_CURSOR,
  ...S3_CURSOR,
  ...S4_CURSOR,
  ...S5_CURSOR,
  ...S6_CURSOR,
  ...S7_CURSOR,
  ...S8_CURSOR,
  ...S9_CURSOR,
];

export const SCENE_OVERLAYS: { id: SceneKey; Overlay: React.FC }[] = [
  { id: "S0", Overlay: S0Hook },
  { id: "S1", Overlay: S1Title },
  { id: "S2", Overlay: S2Data },
  { id: "S3", Overlay: S3Blink },
  { id: "S4", Overlay: S4Inspect },
  { id: "S5", Overlay: S5Check },
  { id: "S6", Overlay: S6PlanetX },
  { id: "S7", Overlay: S7Flag },
  { id: "S8", Overlay: S8Limits },
  { id: "S9", Overlay: S9Outro },
];

const STATE_BY_SCENE: Record<SceneKey, (frame: number) => FilmStatePatch> = {
  S0: S0_STATE,
  S1: S1_STATE,
  S2: S2_STATE,
  S3: S3_STATE,
  S4: S4_STATE,
  S5: S5_STATE,
  S6: S6_STATE,
  S7: S7_STATE,
  S8: S8_STATE,
  S9: S9_STATE,
};

export function sceneState(frame: number): FilmStatePatch {
  return STATE_BY_SCENE[sceneAt(frame).id](frame);
}
