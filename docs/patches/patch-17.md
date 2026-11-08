---
id: 17
title: Scene S4 Inspect
group: scene
weight: 10
frames: 540
needs: 09, 10
owns: src/scenes/S4Inspect.tsx
paste: src/config/filmState.ts, src/config/timeline.ts, src/config/copy.ts, src/config/focus.ts, src/config/camera.ts, src/data/select.ts, src/scenes/Placeholder.tsx, src/scenes/index.ts, src/fx/Caption.tsx, src/fx/Callout.tsx, src/lib/ease.ts, src/lib/spring.ts, src/scenes/S4Inspect.tsx
ref: web/index.html:81-168, web/js/controls.js:236-300, web/js/known.js
bible: 01, 02, 03, 04, 06, 07, 08, 10
appendix: A
---
Common rules for every scene patch: replace the stub file completely. Export exactly `SN_CAMERA`, `SN_CURSOR`, `SN_STATE` and the overlay component named in the stub, with the same signatures (see bible-04 section 3). Everything is a pure function of the GLOBAL frame; cues come from CUES in timeline.ts and text from copy.ts, never retyped. Set every slice field the scene depends on in its first frame, and reach the exit state of bible-04 in the last 30 frames. Read the owners' final slice fields in docs/LEDGER.md Handoff entries; if an owner patch is not finished, code against the slice table in bible-04 and say so in your ledger entry. Camera: moves 24 frames or longer, a hold never longer than 60 frames without a small drift (see docs/guide/motion-rules.md), key moves land on beats (multiples of 15). Cursor positions are logical app coordinates; derive them from the focus rects (rectCenter, rectPoint in focus.ts) and from `tileToFigure` of SkyViewer when aiming at a tile pixel. No timers, no Math.random, no code comments.

When finished, add a ledger block listing: the file, the cue frames used, the slice fields set, the entry and exit states reached, and Requests for shared files (never edit them).

PATCH 17 - Scene S4 Inspect, frames 1680-2219 (540 frames). The full beat sheet is the S4 section of docs/bible/bible-06.md (pasted above). Implement it frame for frame.

File: src/scenes/S4Inspect.tsx. Sequence: rail.showKnown false at f1710 (cursor unticks Known objects, rail.hot "layers"), cursor travels to the dot near the pick (use the pick pixel (602,318) via tileToFigure), click at f1770 sets viewer.selection to the click point (a deliberate 4 to 6 pixel offset from the centroid), at f1800 the selection slides to pick.centroid over 12 frames (callout calloutSnap), inspect.reveal rises from f1800, verdict "moves" with verdictReveal from f1890 (callout calloutMover). Zoom: viewer.zoom pushes to about 2.4 around the pick from f1740 and back to 1 by f2040; the card focus (panel inspect card) is the only place the camera may exceed zoom 2.0 on the STAGE and for at most 60 frames. f2100: cursor re-ticks Known objects, rail.showKnown true; the layer draws itself. Exit: selection = pick, verdict "moves", tabs.tab "inspect".
  Verify: npx tsc --noEmit; node tools/audit-motion.mjs (if patch 06 is done); render stills at the scene's first, middle and last frame and at each cue frame with node scripts/check-stills.mjs --frames <list> (if patch 05 is done), else npx remotion still SpherexFilm --frame=<n>.
