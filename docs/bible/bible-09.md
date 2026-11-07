# 09 - Audio

No voice-over. Music-free film with designed sound: an ambient bed plus precise hits, all generated deterministically by `scripts/make-sfx.mjs` (patch 04) as 48 kHz 16-bit WAV files in `public/audio/`. No external audio, no samples, nothing copyrighted.

Layers: (1) a low drone, very quiet, that rises slowly through the film and ducks under captions' hits; (2) a 120 BPM pulse that is only felt in S1 and S9; (3) hits: `tick` (each blink flip in S3, very short, soft), `click` (UI clicks), `whoosh` (camera whips and scene changes), `chime` (verdict "moves", Reality check found, flag saved), `thud` (stat numerals landing), `riser` (the 2 beats before S1, S6 and S9 starts), `hatch` (S8 columns). Every hit lands on a beat or on the frame of a UI event.

Cue source of truth: `src/config/sfx.ts` (a list of `{frame, name, gain}`), built from `CUES`, `CUT_FRAMES` and the scenes' own events. Patch 04 builds the engine and a first cue list from CUES; patch 24 completes it from the finished scenes.

Mix target: dialogue-free, so integrated loudness about -20 LUFS, true peak under -1 dB. Fades: 1 s in at frame 0 of the drone, 3 s out to the last frame.
