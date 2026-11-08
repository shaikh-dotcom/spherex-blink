---
id: 24
title: Audio sync and mix
group: integration
weight: 6
needs: 04, 23
owns: docs/bible/bible-09.md
paste: src/config/sfx.ts, src/audio/FilmAudio.tsx, src/config/timeline.ts, scripts/make-sfx.mjs
ref: none
bible: 09, 03
appendix: 
---
PATCH 24 - Finish the sound. Patch 04 is a prerequisite, so you take over editing src/config/sfx.ts and src/audio/FilmAudio.tsx (created by 04) for this pass. With the scenes complete, rebuild SFX_CUES in src/config/sfx.ts from the final CUES and the exact frames of: every blink flip in S3 (tick on every flip from f1140 to f1290, gain 0.25), every Callout appearance (chime), every StatNumeral lock (thud), Caption entries (a very soft tick), the click events in the cursor waypoints (click) of every scene, scene boundary whooshes, risers into S1, S6 and S9, and the end fade of drone.wav (-3 s). Rules: no two hits closer than 3 frames unless intended; hits on beats where possible; the music bed stays under hits by at least 10 dB (set drone gain to 0.35 of full); no sound in the last 20 frames. Export the final cue list as a table into docs/bible/bible-09.md. Verify with `node scripts/make-sfx.mjs --check` and listen in the studio; render a 60-frame sample around f1140-f1290 and check the audio stream exists with ffprobe.
