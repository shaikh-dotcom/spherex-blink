---
id: 16
title: Scene S3 Blink
group: scene
weight: 10
frames: 600
needs: 07, 08, 09
owns: src/scenes/S3Blink.tsx
paste: src/config/filmState.ts, src/config/timeline.ts, src/config/copy.ts, src/config/focus.ts, src/config/camera.ts, src/data/select.ts, src/scenes/Placeholder.tsx, src/scenes/index.ts, src/fx/Caption.tsx, src/fx/Callout.tsx, src/lib/ease.ts, src/lib/spring.ts, src/scenes/S3Blink.tsx
ref: web/index.html:41-124, web/js/controls.js:1-120
bible: 01, 02, 03, 04, 06, 07, 08, 10
appendix: A
---
Common rules for every scene patch: replace the stub file completely. Export exactly `SN_CAMERA`, `SN_CURSOR`, `SN_STATE` and the overlay component named in the stub, with the same signatures (see bible-04 section 3). Everything is a pure function of the GLOBAL frame; cues come from CUES in timeline.ts and text from copy.ts, never retyped. Set every slice field the scene depends on in its first frame, and reach the exit state of bible-04 in the last 30 frames. Read the owners' final slice fields in docs/LEDGER.md Handoff entries; if an owner patch is not finished, code against the slice table in bible-04 and say so in your ledger entry. Camera: moves 24 frames or longer, a hold never longer than 60 frames without a small drift (see docs/guide/motion-rules.md), key moves land on beats (multiples of 15). Cursor positions are logical app coordinates; derive them from the focus rects (rectCenter, rectPoint in focus.ts) and from `tileToFigure` of SkyViewer when aiming at a tile pixel. No timers, no Math.random, no code comments.

When finished, add a ledger block listing: the file, the cue frames used, the slice fields set, the entry and exit states reached, and Requests for shared files (never edit them).

PATCH 16 - Scene S3 Blink, frames 1080-1679 (600 frames). The full beat sheet is the S3 section of docs/bible/bible-06.md (pasted above). Implement it frame for frame.

File: src/scenes/S3Blink.tsx. blinkPhase must be exactly: frame-based square wave, 10 frames per half period (A for 10 frames, B for 10 frames) while rail.mode is "blink" (from the click at f1140 to f1290); static A before and after. The overlay amber/cyan period (mode "overlay", viewer.overlayAB true) runs f1290-f1650; f1650-1679 returns to static A (exit state). Ring and callouts: the asteroid position for A and B from selectTargetPosition and tileToFigure; the ring jumps (no tween) with blinkPhase. Callouts at CUES.s3: calloutStars (aim at a bright star; choose one star by a fixed tile pixel you pick from the tile, record it in your ledger block), calloutJump, calloutAmber (aim at the HUD key), calloutWarn. Captions captionPluto and captionPair at their cues. The Badge badges.real at CUES.s3.badge. Cursor: to the Blink A-B control, click at f1140 (a click pulse; use the Cursor's click convention), to Best pair at f1410 with rail.hot "pair", back. Camera: figure/skyImage slow pushes, never above zoom 1.6 here. 3 Hz flicker is the only fast thing on screen; keep everything else calm.
  Verify: npx tsc --noEmit; node tools/audit-motion.mjs (if patch 06 is done); render stills at the scene's first, middle and last frame and at each cue frame with node scripts/check-stills.mjs --frames <list> (if patch 05 is done), else npx remotion still SpherexFilm --frame=<n>.
