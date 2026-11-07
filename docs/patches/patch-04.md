---
id: 04
title: Audio engine: sfx cue list, generator script, FilmAudio
group: audio
weight: 6
needs: 00
owns: src/config/sfx.ts, src/audio/FilmAudio.tsx, scripts/make-sfx.mjs
paste: src/config/timeline.ts, src/audio/FilmAudio.tsx, src/SpherexFilm.tsx, package.json
ref: none
bible: 09
appendix: 
---
PATCH 04 - Audio. Create src/config/sfx.ts, replace src/audio/FilmAudio.tsx completely, create scripts/make-sfx.mjs. (package.json already has the scripts `sfx` and `sfx:check`.)

scripts/make-sfx.mjs (Node 20, no dependencies, deterministic, fixed seed): synthesises 48 kHz 16-bit mono WAV files into public/audio/ : drone.wav (150 s, a very quiet low pad made from detuned sine and filtered noise, slow swell to 0.6 of full by 120 s, 1 s fade in, 3 s fade out), and hit files tick.wav, click.wav, whoosh.wav, chime.wav, thud.wav, riser.wav, hatch.wav (see docs/bible/bible-09.md for what each is; all under 2.5 s, riser 2 s, no clipping, normalised to -3 dBFS peak). `--check` verifies every file exists, has the right sample rate, duration and no clipping, prints a table, and exits 1 on failure. Write WAVs by hand (RIFF header + Int16 samples). Same inputs must give byte-identical files.

src/config/sfx.ts: `export interface SfxCue { frame: number; name: SfxName; gain: number }`, `export type SfxName = "tick" | "click" | "whoosh" | "chime" | "thud" | "riser" | "hatch"`, `export const SFX_CUES: SfxCue[]` sorted by frame, built from CUES and CUT_FRAMES in src/config/timeline.ts (a `thud` on each stat numeral cue, a `chime` on calloutJump/calloutMover/calloutChecked/calloutNear/calloutCross, a `whoosh` on each scene start, a `riser` two beats before S1, S6, S9, `hatch` on s8.columns). Also `export const SFX_FILES: Record<SfxName, string>` mapping to "audio/<name>.wav". The blink flicker `tick` cues in S3 are generated here by a loop: one tick every 10 frames between frame 1140 and frame 1290 and again between 1650 and 1679 is NOT wanted; stop at 1290. Patch 24 completes the list from the finished scenes, so make it easy to extend (one array, no magic).

src/audio/FilmAudio.tsx: renders `<Audio src={staticFile("audio/drone.wav")} volume={...}/>` for the whole film and one Remotion <Sequence from={cue.frame} durationInFrames={...}> with <Audio> per cue (volume = cue.gain). If a file is missing, render nothing for it and `console.warn` once (never throw: the studio must still open before `npm run sfx` has been run).

CHECK: npx tsc --noEmit; node scripts/make-sfx.mjs && node scripts/make-sfx.mjs --check; run it twice and confirm the files are byte-identical (sha256sum); npm run studio plays the sounds; print the first 12 cues.
