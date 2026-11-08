---
id: 05
title: Tooling: render.mjs (full, 4k, frames, 30 s cut) and check-stills.mjs
group: tooling
weight: 5
needs: 00
owns: scripts/render.mjs, scripts/check-stills.mjs
paste: package.json, remotion.config.ts, src/config/timeline.ts, scripts/validate-evidence.mjs, scripts/fetch-assets.mjs, src/Root.tsx
ref: none
bible: 03
appendix: 
---
PATCH 05 - Render tooling. Create scripts/render.mjs and scripts/check-stills.mjs (Node 20 ESM, uses @remotion/bundler and @remotion/renderer, already in package.json; no other dependencies).

render.mjs: `node scripts/render.mjs` renders composition "SpherexFilm" to out/spherex-blink-film-1080p.mp4 (H.264, crf 18, `-preset veryfast` equivalent via x264Preset "veryfast", yuv420p, AAC 192k). Flags: `--4k` (scale 2 to 3840x2160, out/...-4k.mp4), `--frames` (PNG sequence in out/frames/), `--cut30` (a 30 second cut: render only these frame ranges and concatenate with ffmpeg: 0-119, 1170-1289, 1800-1919, 2310-2429, 2880-2999, 3150-3269, 3480-3539, 4260-4379 with the last 15 frames faded to ink by ffmpeg; total must be 900 frames; assert it), `--allow-sample` (otherwise refuse when evidence meta.sample is true), `--from N --to M`. Before rendering it must: run `node scripts/validate-evidence.mjs --final` and stop on failure; read public/assets-manifest.json and stop if `complete` is false; warn (not fail) if public/audio/drone.wav is missing, and say "rendering SILENT". Print frame progress on one line, the output path, size, duration, and an `ffprobe` summary. Never overwrite a file silently: if the output exists, rename the old one with a timestamp suffix. Windows-safe paths.

check-stills.mjs: `node scripts/check-stills.mjs [--frames 100,1200,...] [--scale 0.5]` renders PNG stills of composition "SpherexFilm" to out/stills/f<frame>.png at the given frames; with no --frames it uses: first, middle and last frame of every scene (from SCENES in src/config/timeline.ts) plus every CUT_FRAMES entry. After rendering it prints a table with frame, scene, and three automatic checks per still: (a) not blank (mean luminance above 0.01 except the last frame), (b) no 96 px edge band is more than 30 percent bright (nothing crawling to the margin), (c) file written. Exit 1 if any check fails. Use sharp ONLY if it is already installed; otherwise decode with a tiny PNG reader or use ffmpeg `signalstats`; do not add a dependency to package.json (this patch does not own package.json).

CHECK: node scripts/render.mjs --from 0 --to 59 renders 60 frames; node scripts/check-stills.mjs --frames 0,300 passes; node scripts/render.mjs --cut30 with the stub scenes produces a 900 frame file (report its frame count with ffprobe).
