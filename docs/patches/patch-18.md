---
id: 18
title: Scene S5 Check
group: scene
weight: 8
frames: 480
needs: 09, 11
owns: src/scenes/S5Check.tsx
paste: src/config/filmState.ts, src/config/timeline.ts, src/config/copy.ts, src/config/focus.ts, src/config/camera.ts, src/data/select.ts, src/scenes/Placeholder.tsx, src/scenes/index.ts, src/fx/Caption.tsx, src/fx/Callout.tsx, src/lib/ease.ts, src/lib/spring.ts, src/scenes/S5Check.tsx
ref: web/index.html:169-192, web/js/controls.js:85-100, web/js/reference.js
bible: 01, 02, 03, 04, 06, 07, 08, 10
appendix: A
---
Common rules for every scene patch: replace the stub file completely. Export exactly `SN_CAMERA`, `SN_CURSOR`, `SN_STATE` and the overlay component named in the stub, with the same signatures (see bible-04 section 3). Everything is a pure function of the GLOBAL frame; cues come from CUES in timeline.ts and text from copy.ts, never retyped. Set every slice field the scene depends on in its first frame, and reach the exit state of bible-04 in the last 30 frames. Read the owners' final slice fields in docs/LEDGER.md Handoff entries; if an owner patch is not finished, code against the slice table in bible-04 and say so in your ledger entry. Camera: moves 24 frames or longer, a hold never longer than 60 frames without a small drift (see docs/guide/motion-rules.md), key moves land on beats (multiples of 15). Cursor positions are logical app coordinates; derive them from the focus rects (rectCenter, rectPoint in focus.ts) and from `tileToFigure` of SkyViewer when aiming at a tile pixel. No timers, no Math.random, no code comments.

When finished, add a ledger block listing: the file, the cue frames used, the slice fields set, the entry and exit states reached, and Requests for shared files (never edit them).

PATCH 18 - Scene S5 Check, frames 2220-2699 (480 frames). The full beat sheet is the S5 section of docs/bible/bible-06.md (pasted above). Implement it frame for frame.

File: src/scenes/S5Check.tsx. f2220 tabs.tab "context" (the previous scene left it "inspect"), context.reveal 0 to 1 over 20 frames. f2310 validationReveal 0 to 1 and calloutChecked; the faint predicted-position crosses on the figure are drawn by the scene overlay (positions from selectTargetPosition for each frame, via tileToFigure; draw as small stage-coordinate crosses following the camera through Callout-like transform: if the camera makes this hard, draw them with viewer features requested in your ledger entry instead). f2460 and f2580 captions, and BOTH numbers: 148 of 150 and 107 of 150 must be on screen when the app card shows them. f2640 referenceBlend 0 to 0.6 over 30 frames, back to 0 by f2699. Cursor to the reference slider.
  Verify: npx tsc --noEmit; node tools/audit-motion.mjs (if patch 06 is done); render stills at the scene's first, middle and last frame and at each cue frame with node scripts/check-stills.mjs --frames <list> (if patch 05 is done), else npx remotion still SpherexFilm --frame=<n>.
