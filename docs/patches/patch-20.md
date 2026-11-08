---
id: 20
title: Scene S7 Flag
group: scene
weight: 8
frames: 360
needs: 09, 10
owns: src/scenes/S7Flag.tsx
paste: src/config/filmState.ts, src/config/timeline.ts, src/config/copy.ts, src/config/focus.ts, src/config/camera.ts, src/data/select.ts, src/scenes/Placeholder.tsx, src/scenes/index.ts, src/fx/Caption.tsx, src/fx/Callout.tsx, src/lib/ease.ts, src/lib/spring.ts, src/scenes/S7Flag.tsx
ref: web/index.html:153-168, web/js/flagging.js, web/js/controls.js:325-380
bible: 01, 02, 03, 04, 06, 07, 08, 10
appendix: A
---
Common rules for every scene patch: replace the stub file completely. Export exactly `SN_CAMERA`, `SN_CURSOR`, `SN_STATE` and the overlay component named in the stub, with the same signatures (see bible-04 section 3). Everything is a pure function of the GLOBAL frame; cues come from CUES in timeline.ts and text from copy.ts, never retyped. Set every slice field the scene depends on in its first frame, and reach the exit state of bible-04 in the last 30 frames. Read the owners' final slice fields in docs/LEDGER.md Handoff entries; if an owner patch is not finished, code against the slice table in bible-04 and say so in your ledger entry. Camera: moves 24 frames or longer, a hold never longer than 60 frames without a small drift (see docs/guide/motion-rules.md), key moves land on beats (multiples of 15). Cursor positions are logical app coordinates; derive them from the focus rects (rectCenter, rectPoint in focus.ts) and from `tileToFigure` of SkyViewer when aiming at a tile pixel. No timers, no Math.random, no code comments.

When finished, add a ledger block listing: the file, the cue frames used, the slice fields set, the entry and exit states reached, and Requests for shared files (never edit them).

PATCH 20 - Scene S7 Flag, frames 3420-3779 (360 frames). The full beat sheet is the S7 section of docs/bible/bible-06.md (pasted above). Implement it frame for frame.

File: src/scenes/S7Flag.tsx. f3420 tabs.tab "inspect", viewer.selection = pick, viewer.zoom 1. f3450 flags.formReveal 0 to 1, category "asteroid"; cursor to Flag it, click at f3475, flags.flagged 1 at f3478, flags.matchReveal rises from f3480 with calloutCross. f3540 flags.exportReveal rises, caption captionExport, buttons pulse via state if the owner exposed a pulse field (else do not pulse). f3660 captionState: camera pushes onto the flag-mode pill/status area. The real wording must show "saved in this browser only" and "Saved in this browser (no shared store is configured)." Exit: tabs.tab "inspect", flags.flagged 1.
  Verify: npx tsc --noEmit; node tools/audit-motion.mjs (if patch 06 is done); render stills at the scene's first, middle and last frame and at each cue frame with node scripts/check-stills.mjs --frames <list> (if patch 05 is done), else npx remotion still SpherexFilm --frame=<n>.
