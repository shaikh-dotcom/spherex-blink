---
id: 13
title: Scene S0 Hook
group: scene
weight: 5
frames: 300
needs: 02
owns: src/scenes/S0Hook.tsx
paste: src/config/filmState.ts, src/config/timeline.ts, src/config/copy.ts, src/config/focus.ts, src/config/camera.ts, src/data/select.ts, src/scenes/Placeholder.tsx, src/scenes/index.ts, src/fx/Caption.tsx, src/fx/Callout.tsx, src/lib/ease.ts, src/lib/spring.ts, src/scenes/S0Hook.tsx
ref: web/index.html:17-40
bible: 01, 02, 03, 04, 06, 07, 08, 10
appendix: A
---
Common rules for every scene patch: replace the stub file completely. Export exactly `SN_CAMERA`, `SN_CURSOR`, `SN_STATE` and the overlay component named in the stub, with the same signatures (see bible-04 section 3). Everything is a pure function of the GLOBAL frame; cues come from CUES in timeline.ts and text from copy.ts, never retyped. Set every slice field the scene depends on in its first frame, and reach the exit state of bible-04 in the last 30 frames. Read the owners' final slice fields in docs/LEDGER.md Handoff entries; if an owner patch is not finished, code against the slice table in bible-04 and say so in your ledger entry. Camera: moves 24 frames or longer, a hold never longer than 60 frames without a small drift (see docs/guide/motion-rules.md), key moves land on beats (multiples of 15). Cursor positions are logical app coordinates; derive them from the focus rects (rectCenter, rectPoint in focus.ts) and from `tileToFigure` of SkyViewer when aiming at a tile pixel. No timers, no Math.random, no code comments.

When finished, add a ledger block listing: the file, the cue frames used, the slice fields set, the entry and exit states reached, and Requests for shared files (never edit them).

PATCH 13 - Scene S0 Hook, frames 0-299 (300 frames). The full beat sheet is the S0 section of docs/bible/bible-06.md (pasted above). Implement it frame for frame.

File: src/scenes/S0Hook.tsx. Uses HookField (patch 02) and hookDotPoints() for the callout target (stage coordinates: pass the point as the Callout target and do not use the camera for this scene: camera is a single hold on fullWindow with the slow 1.00 to 1.04 push). SN_STATE returns appOpacity 0. Overlay: Caption copy.s0.caption at CUES.s0.caption; Callout copy.s0.calloutJump at CUES.s0.calloutJump aimed at the jumping dot; the tag copy.s0.tag and the label "Illustration" from f240; the overlay renders HookField itself (props frame, start 0, end 299) behind the captions. Cursor: none (return an empty waypoint list that keeps the cursor hidden; check Cursor.tsx for the hidden convention).
  Verify: npx tsc --noEmit; node tools/audit-motion.mjs (if patch 06 is done); render stills at the scene's first, middle and last frame and at each cue frame with node scripts/check-stills.mjs --frames <list> (if patch 05 is done), else npx remotion still SpherexFilm --frame=<n>.
