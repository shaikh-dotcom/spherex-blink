---
id: 14
title: Scene S1 Title
group: scene
weight: 3
frames: 300
needs: 02
owns: src/scenes/S1Title.tsx
paste: src/config/filmState.ts, src/config/timeline.ts, src/config/copy.ts, src/config/focus.ts, src/config/camera.ts, src/data/select.ts, src/scenes/Placeholder.tsx, src/scenes/index.ts, src/fx/Caption.tsx, src/fx/Callout.tsx, src/lib/ease.ts, src/lib/spring.ts, src/scenes/S1Title.tsx
ref: web/index.html:17-40
bible: 01, 02, 03, 04, 06, 07, 08, 10
appendix: A
---
Common rules for every scene patch: replace the stub file completely. Export exactly `SN_CAMERA`, `SN_CURSOR`, `SN_STATE` and the overlay component named in the stub, with the same signatures (see bible-04 section 3). Everything is a pure function of the GLOBAL frame; cues come from CUES in timeline.ts and text from copy.ts, never retyped. Set every slice field the scene depends on in its first frame, and reach the exit state of bible-04 in the last 30 frames. Read the owners' final slice fields in docs/LEDGER.md Handoff entries; if an owner patch is not finished, code against the slice table in bible-04 and say so in your ledger entry. Camera: moves 24 frames or longer, a hold never longer than 60 frames without a small drift (see docs/guide/motion-rules.md), key moves land on beats (multiples of 15). Cursor positions are logical app coordinates; derive them from the focus rects (rectCenter, rectPoint in focus.ts) and from `tileToFigure` of SkyViewer when aiming at a tile pixel. No timers, no Math.random, no code comments.

When finished, add a ledger block listing: the file, the cue frames used, the slice fields set, the entry and exit states reached, and Requests for shared files (never edit them).

PATCH 14 - Scene S1 Title, frames 300-599 (300 frames). The full beat sheet is the S1 section of docs/bible/bible-06.md (pasted above). Implement it frame for frame.

File: src/scenes/S1Title.tsx. Uses Mark with draw from 0 to 1 over f315-f345 and KineticText for the lockup (brand.nameLead plain and brand.nameAccent italic amber), the eyebrow brand.eyebrow, tagline copy.s1.tagline at CUES.s1.tagline. SN_STATE: appOpacity 0 until f570, then ramps to 1 by f599 and sets the S1 exit state from bible-04 (header.fieldId "pallas", viewer.fieldId "pallas", viewer.pairA/pairB from selectPair(), tabs.tab "inspect", rail.band = pair band, viewer.zoom 1, viewer.reveal 1, time.reveal 1, tabs.reveal 1, header.reveal if present) from the FIRST frame so the app is correct as soon as it appears. Camera: fullWindow hold with a slow push, ending exactly on the pose S2 starts from (S2_CAMERA first keyframe: read it if finished, otherwise fullWindow). Title lifts away upward over f570-f599.
  Verify: npx tsc --noEmit; node tools/audit-motion.mjs (if patch 06 is done); render stills at the scene's first, middle and last frame and at each cue frame with node scripts/check-stills.mjs --frames <list> (if patch 05 is done), else npx remotion still SpherexFilm --frame=<n>.
