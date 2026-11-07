---
id: 06
title: Tooling: contact sheets and motion audit
group: tooling
weight: 5
needs: 00
owns: scripts/make-sheets.mjs, tools/audit-motion.mjs
paste: package.json, src/config/camera.ts, src/config/focus.ts, src/config/timeline.ts, src/scenes/index.ts, docs/guide/motion-rules.md
ref: @film/tools/audit-motion.mjs, @film/scripts/make-sheets.mjs
bible: 03
appendix: 
---
PATCH 06 - Review tooling. Create scripts/make-sheets.mjs and tools/audit-motion.mjs. The optional reference files (from the sibling minilocker-film repo, via --film-repo) show the same tools in that project; port their approach, but this repo's scenes, camera and rules are the truth. If the references are not attached, build from the description below.

make-sheets.mjs: `node scripts/make-sheets.mjs --from 1080 --to 1679 --every 4` renders low-resolution stills (scale 0.25) of SpherexFilm every N frames in the range and tiles them into ONE PNG contact sheet `out/sheets/sheet-<from>-<to>.png` with a frame number label under each cell (use ffmpeg: image2 input, `tile` filter, `drawtext` for labels, or a small Node canvas if ffmpeg drawtext is unavailable; do not add dependencies). Also `--scene S3` as a shortcut for the scene's range. Default grid width 8 columns.

audit-motion.mjs: bundles `src/scenes/index.ts` with esbuild if available through @remotion/bundler's webpack, or, simpler, runs the film in a headless Remotion composition that dumps the camera state: choose the approach that works without new dependencies (suggestion: a dev composition `DevMotionDump` in src/dev/sheets is NOT owned by this patch, so instead call `getCompositions`/`selectComposition` and `renderStill` of a hidden composition is not possible; therefore implement the audit by transpiling `src/config/camera.ts`, `src/config/focus.ts`, `src/config/timeline.ts` and `src/scenes/index.ts` with the `typescript` package that is already a devDependency (ts.transpileModule to a temp folder in out/audit/, rewriting nothing, then dynamic import) and importing the camera keyframes; the Remotion/React imports in scenes are only needed by overlays, so import only what the audit needs: if scenes cannot be imported without React, shim `react` and `remotion` with empty modules via a custom ESM loader). The audit reports, per scene and for the whole film: (1) every hold longer than 60 frames with no camera change (fail), (2) every move shorter than 24 frames (fail; whips 26 or more allowed once per scene), (3) gaps under 10 frames between moves (warn), (4) pan speed over 160 px per frame at stage size (fail), (5) zoom above 2.0 held longer than 60 frames (fail), (6) any scene whose first keyframe is not at its first frame, or whose range has a gap in keyframes (fail), (7) keyframe frames not within 1 frame of a multiple of 15 (warn for the big moves). Prints a table and a one-paragraph summary; exits 1 on any fail. With the current stub scenes it must run and report the (expected) "no motion" failures without crashing.

CHECK: node tools/audit-motion.mjs prints a table for all 10 scenes; node scripts/make-sheets.mjs --scene S0 --every 20 writes out/sheets/sheet-0-299.png.
