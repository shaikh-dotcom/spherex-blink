---
id: 19
title: Scene S6 Planet X
group: scene
weight: 12
frames: 720
needs: 03, 09, 12
owns: src/scenes/S6PlanetX.tsx
paste: src/config/filmState.ts, src/config/timeline.ts, src/config/copy.ts, src/config/focus.ts, src/config/camera.ts, src/data/select.ts, src/scenes/Placeholder.tsx, src/scenes/index.ts, src/fx/Caption.tsx, src/fx/Callout.tsx, src/lib/ease.ts, src/lib/spring.ts, src/scenes/S6PlanetX.tsx
ref: web/index.html:193-215, web/js/motion.js, web/js/parallax.js, web/js/orrery.js
bible: 01, 02, 03, 04, 06, 07, 08, 10
appendix: A
---
Common rules for every scene patch: replace the stub file completely. Export exactly `SN_CAMERA`, `SN_CURSOR`, `SN_STATE` and the overlay component named in the stub, with the same signatures (see bible-04 section 3). Everything is a pure function of the GLOBAL frame; cues come from CUES in timeline.ts and text from copy.ts, never retyped. Set every slice field the scene depends on in its first frame, and reach the exit state of bible-04 in the last 30 frames. Read the owners' final slice fields in docs/LEDGER.md Handoff entries; if an owner patch is not finished, code against the slice table in bible-04 and say so in your ledger entry. Camera: moves 24 frames or longer, a hold never longer than 60 frames without a small drift (see docs/guide/motion-rules.md), key moves land on beats (multiples of 15). Cursor positions are logical app coordinates; derive them from the focus rects (rectCenter, rectPoint in focus.ts) and from `tileToFigure` of SkyViewer when aiming at a tile pixel. No timers, no Math.random, no code comments.

When finished, add a ledger block listing: the file, the cue frames used, the slice fields set, the entry and exit states reached, and Requests for shared files (never edit them).

PATCH 19 - Scene S6 Planet X, frames 2700-3419 (720 frames). The full beat sheet is the S6 section of docs/bible/bible-06.md (pasted above). Implement it frame for frame.

File: src/scenes/S6PlanetX.tsx. Uses ParallaxDiagram (patch 03) as an overlay element from f2700 to f2860 (progress eased 0 to 1, distanceAu eased 30 to 500; label stays "Illustration"). f2700: tabs.tab "planetx". f2820: planetx.outReveal rises and distanceAu eases 30 to 500 over 45 frames; viewer.pxDrawAu = 500 from f2850; calloutShift at CUES.s6.calloutShift. f3000: calloutSix; viewer.fieldId "pallas-6mo" until f3060 (then back to "pallas"), output shows the six-month numbers. f3060: caption captionMeasure; cursor clicks the mover in frame A (markA set), steps to frame B (viewer.pairB shown, blinkPhase 1) clicks (markB set), planetx.measureReveal rises. f3150: planetx.fitReveal rises with the "near" wording; calloutNear at CUES.s6.calloutNear; f3300: captionHonest, orrery.reveal 1, orrery.day eases 0 to 60. Exit: markA/markB null, pxDrawAu null, viewer.fieldId "pallas". The scene must NEVER imply a detection; the near verdict is the app's real output and stays on screen for at least 90 frames.
  Verify: npx tsc --noEmit; node tools/audit-motion.mjs (if patch 06 is done); render stills at the scene's first, middle and last frame and at each cue frame with node scripts/check-stills.mjs --frames <list> (if patch 05 is done), else npx remotion still SpherexFilm --frame=<n>.
