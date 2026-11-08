---
id: 25
title: Final QA, renders and submission assets
group: integration
weight: 6
needs: 05, 06, 24
owns: docs/submission/*, out/*
paste: package.json, scripts/render.mjs, scripts/check-stills.mjs, docs/guide/checklist.md, src/config/timeline.ts, src/config/copy.ts
ref: none
bible: 01, 03, 10
appendix: A
---
PATCH 25 - Ship it. Run docs/guide/checklist.md end to end.

1. `npm run check` (typecheck, evidence final check, audit) must be clean; `npm run evidence:final-check` zero failures. Confirm the pair still matches the live app's Best pair (open https://unavailable4u.github.io/spherex-blink/, field Pallas patch, band D1); if not, re-capture (`npm run evidence -- --repo ../spherex-blink --pair idA,idB`), re-fetch assets and re-run stills for S3, S4, S5, S6, S7.
2. `node scripts/check-stills.mjs` default frames: all pass; look at every still yourself.
3. Render: `node scripts/render.mjs` (1080p), `node scripts/render.mjs --4k` if time permits, `node scripts/render.mjs --cut30` (30 s). Probe each: duration 150.00 s (4500 frames), 30 fps, H.264 yuv420p, AAC audio present; cut30 exactly 900 frames.
4. Write docs/submission/: `README.md` (what the video shows, 150 s, scene list with timestamps = frame/30), `captions.srt` (from copy.ts and CUES, every on-screen caption with its start and end time), `credits.md` (data: NASA SPHEREx Quick Release 2 via IRSA, with the acknowledgement text exactly from evidence.acknowledgement; fonts CMU Serif and Typewriter Text under OFL; the live app and repo URLs from copy.ts), `honesty.md` (the prototype and no-discovery statements, what is real, simulated, limited; copy from bible-10). No author or tool credits. Check the Space Apps submission page for any video length or format limit and note it in README.md.
5. Final scan: no code comments, no attribution text, no secrets, repo clean; zip the project without node_modules and out for the team.
