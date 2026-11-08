import React, { useEffect, useState } from "react";
import { Audio, Sequence, continueRender, delayRender, staticFile } from "remotion";
import { FPS } from "../config/timeline";
import { DRONE_FILE, DRONE_GAIN, SFX_CUES, SFX_FILES, SFX_SECONDS } from "../config/sfx";

interface Manifest {
  files: string[];
}

let warned = false;

function warnOnce(): void {
  if (warned) return;
  warned = true;
  console.warn("[spherex-blink-film] public/audio/manifest.json not found: the film will play silent. Run: npm run sfx");
}

export const FilmAudio: React.FC = () => {
  const [handle] = useState(() => delayRender("audio manifest"));
  const [manifest, setManifest] = useState<Manifest>({ files: [] });
  useEffect(() => {
    let live = true;
    fetch(staticFile("audio/manifest.json"))
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("missing"))))
      .then((m: Manifest) => {
        if (live) setManifest(m);
      })
      .catch(() => warnOnce())
      .finally(() => continueRender(handle));
    return () => {
      live = false;
    };
  }, [handle]);
  const has = (file: string): boolean => manifest.files.includes(file.replace("audio/", ""));
  return (
    <>
      {has(DRONE_FILE) ? <Audio src={staticFile(DRONE_FILE)} volume={DRONE_GAIN} /> : null}
      {SFX_CUES.filter((c) => has(SFX_FILES[c.name])).map((c, i) => (
        <Sequence key={`${c.name}-${c.frame}-${i}`} from={c.frame} durationInFrames={Math.ceil(SFX_SECONDS[c.name] * FPS) + 2} layout="none">
          <Audio src={staticFile(SFX_FILES[c.name])} volume={c.gain} />
        </Sequence>
      ))}
    </>
  );
};
