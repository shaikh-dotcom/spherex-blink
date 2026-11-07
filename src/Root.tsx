import React from "react";
import { Composition } from "remotion";
import { SpherexFilm } from "./SpherexFilm";
import { FPS, STAGE, TOTAL } from "./config/timeline";
import { DEV_SHEETS } from "./dev/registry";

export const Root: React.FC = () => (
  <>
    <Composition id="SpherexFilm" component={SpherexFilm} durationInFrames={TOTAL} fps={FPS} width={STAGE.w} height={STAGE.h} />
    <Composition id="SpherexFilm-Preview" component={SpherexFilm} durationInFrames={TOTAL} fps={FPS} width={960} height={540} />
    {DEV_SHEETS.map((s) => (
      <Composition
        key={s.id}
        id={s.id}
        component={s.component}
        durationInFrames={s.durationInFrames}
        fps={FPS}
        width={s.width ?? STAGE.w}
        height={s.height ?? STAGE.h}
      />
    ))}
  </>
);
