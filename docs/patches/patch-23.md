---
id: 23
title: Continuity and motion pass (scenes joined, audit clean)
group: integration
weight: 8
needs: 06, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22
owns: src/config/timeline.ts, src/config/copy.ts, src/config/focus.ts, src/config/theme.ts, src/config/filmState.ts, src/scenes/index.ts, src/SpherexFilm.tsx
paste: src/scenes/index.ts, src/config/focus.ts, src/config/timeline.ts, src/config/camera.ts, src/config/filmState.ts, tools/audit-motion.mjs, docs/guide/motion-rules.md
ref: @film/docs/guide/motion-rules.md
bible: 03, 04, 06, 08, 10
appendix: A
---
PATCH 23 - Join the scenes. This is the only patch allowed to edit shared files, and only to apply Requests written in the Handoff entries and to fix seams.

1. Read every scene's and UI patch's ledger block. Apply each Request to the shared file it names (focus rects, copy keys, selectors in src/data/select.ts if listed, FilmState fields), one at a time, and record each applied Request in your own ledger block.
2. For every scene boundary (299|300, 599|600, 1079|1080, 1679|1680, 2219|2220, 2699|2700, 3419|3420, 3779|3780, 4199|4200) render stills at the last frame of the scene and the first frame of the next with scripts/check-stills.mjs and compare: the app state, camera pose and cursor position must be continuous (no jump), except the intended hard cuts. Fix mismatches in SN_STATE entry/exit values by changing the scene files ONLY in the lines that set entry or exit state (you now own that, say so in the ledger).
3. Run `node tools/audit-motion.mjs` and fix every failure (long holds, short moves, speed, zoom) by editing the camera keyframes in the scene files.
4. Run `npx tsc --noEmit` and check nothing uses timers, transitions, Date.now, backdrop-filter, Math.random or comments (grep).
5. Verify honesty: S6 shows the near verdict, S5 shows both 148/150 and 107/150, S7 shows the browser-only wording, S8 shows the simulated label, all prototype text present.
6. Render the whole film at 0.25 scale with scripts/render.mjs (add `--scale` if missing? no: use npx remotion render with --scale=0.25 into out/preview.mp4) and watch the contact sheet from scripts/make-sheets.mjs for each scene.

Frame ranges of S0-S9 and the cut list in timeline.ts must stay unchanged unless a Request proves a cue is impossible; if a change is needed, apply it to CUES only and update docs/bible/bible-03.md.
