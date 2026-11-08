---
id: 21
title: Scene S8 Limits
group: scene
weight: 6
frames: 420
needs: 03
owns: src/scenes/S8Limits.tsx
paste: src/config/filmState.ts, src/config/timeline.ts, src/config/copy.ts, src/config/focus.ts, src/config/camera.ts, src/data/select.ts, src/scenes/Placeholder.tsx, src/scenes/index.ts, src/fx/Caption.tsx, src/fx/Callout.tsx, src/lib/ease.ts, src/lib/spring.ts, src/scenes/S8Limits.tsx
ref: web/index.html:238-256
bible: 01, 02, 03, 04, 06, 07, 08, 10
appendix: A
---
Common rules for every scene patch: replace the stub file completely. Export exactly `SN_CAMERA`, `SN_CURSOR`, `SN_STATE` and the overlay component named in the stub, with the same signatures (see bible-04 section 3). Everything is a pure function of the GLOBAL frame; cues come from CUES in timeline.ts and text from copy.ts, never retyped. Set every slice field the scene depends on in its first frame, and reach the exit state of bible-04 in the last 30 frames. Read the owners' final slice fields in docs/LEDGER.md Handoff entries; if an owner patch is not finished, code against the slice table in bible-04 and say so in your ledger entry. Camera: moves 24 frames or longer, a hold never longer than 60 frames without a small drift (see docs/guide/motion-rules.md), key moves land on beats (multiples of 15). Cursor positions are logical app coordinates; derive them from the focus rects (rectCenter, rectPoint in focus.ts) and from `tileToFigure` of SkyViewer when aiming at a tile pixel. No timers, no Math.random, no code comments.

When finished, add a ledger block listing: the file, the cue frames used, the slice fields set, the entry and exit states reached, and Requests for shared files (never edit them).

PATCH 21 - Scene S8 Limits, frames 3780-4199 (420 frames). The full beat sheet is the S8 section of docs/bible/bible-06.md (pasted above). Implement it frame for frame.

File: src/scenes/S8Limits.tsx. SN_STATE: appOpacity eases 1 to 0.15 over 3780-3810, holds, then to 0 over 4170-4199. Overlay: Caption copy.s8.caption, LimitsCard (patch 03) with progress eased 0 to 1 over 3810-4080 (rows land on beats), captionHatch at CUES.s8.captionHatch next to a real hatch swatch (use the same hatch helper as LimitsCard), captionClaim at CUES.s8.captionClaim with Badge badges.prototype; columns lift away 4170-4199. Camera: a calm hold on fullWindow with a 1.00 to 1.03 push. Cursor hidden.
  Verify: npx tsc --noEmit; node tools/audit-motion.mjs (if patch 06 is done); render stills at the scene's first, middle and last frame and at each cue frame with node scripts/check-stills.mjs --frames <list> (if patch 05 is done), else npx remotion still SpherexFilm --frame=<n>.
