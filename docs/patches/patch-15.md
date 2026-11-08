---
id: 15
title: Scene S2 Data
group: scene
weight: 8
frames: 480
needs: 07, 08, 09
owns: src/scenes/S2Data.tsx
paste: src/config/filmState.ts, src/config/timeline.ts, src/config/copy.ts, src/config/focus.ts, src/config/camera.ts, src/data/select.ts, src/scenes/Placeholder.tsx, src/scenes/index.ts, src/fx/Caption.tsx, src/fx/Callout.tsx, src/lib/ease.ts, src/lib/spring.ts, src/scenes/S2Data.tsx
ref: web/index.html:17-124, web/js/controls.js:1-120
bible: 01, 02, 03, 04, 06, 07, 08, 10
appendix: A
---
Common rules for every scene patch: replace the stub file completely. Export exactly `SN_CAMERA`, `SN_CURSOR`, `SN_STATE` and the overlay component named in the stub, with the same signatures (see bible-04 section 3). Everything is a pure function of the GLOBAL frame; cues come from CUES in timeline.ts and text from copy.ts, never retyped. Set every slice field the scene depends on in its first frame, and reach the exit state of bible-04 in the last 30 frames. Read the owners' final slice fields in docs/LEDGER.md Handoff entries; if an owner patch is not finished, code against the slice table in bible-04 and say so in your ledger entry. Camera: moves 24 frames or longer, a hold never longer than 60 frames without a small drift (see docs/guide/motion-rules.md), key moves land on beats (multiples of 15). Cursor positions are logical app coordinates; derive them from the focus rects (rectCenter, rectPoint in focus.ts) and from `tileToFigure` of SkyViewer when aiming at a tile pixel. No timers, no Math.random, no code comments.

When finished, add a ledger block listing: the file, the cue frames used, the slice fields set, the entry and exit states reached, and Requests for shared files (never edit them).

PATCH 15 - Scene S2 Data, frames 600-1079 (480 frames). The full beat sheet is the S2 section of docs/bible/bible-06.md (pasted above). Implement it frame for frame.

File: src/scenes/S2Data.tsx. Camera path: header 600-689, skyImage 690, bandPlates 780, figure 960-1079 (use kf and holdShot). Cursor trails the camera subject. StatNumeral count-ups for selectOverview().realFields and realFrames at CUES.s2.counter (two numerals side by side at stage coordinates, mono, with labels copy.s2.counterLabel and counterFrames). Badge badges.real at f720 aimed near the header (the header already shows its own badge; the Badge here is the film's callout form of it, keep it small). Band highlight sequence from f780: rail.band steps D1, D2, D4, D5 every 45 frames (the bands in selectPallasBands order), rail.hot "band", viewer shows the first frame of each band (set viewer.pairA to that frame id, pairB the same, blinkPhase 0). CUES.s2.bands: tag copy.s2.bandsTag. CUES.s2.captionPatch: caption copy.s2.captionPatch; time.position sweeps 0 to 1 over 960-1040 then returns to 0 by 1079; time.epochSeg cycles 1, 2, 3. Exit: viewer pairA = pair.a, band = pair band, zoom 1, time.position 0.
  Verify: npx tsc --noEmit; node tools/audit-motion.mjs (if patch 06 is done); render stills at the scene's first, middle and last frame and at each cue frame with node scripts/check-stills.mjs --frames <list> (if patch 05 is done), else npx remotion still SpherexFilm --frame=<n>.
