# HANDOFF: spherex-blink-film

Deterministic Remotion motion video (1920x1080, 30 fps, 4500 frames = 150 s) for the NASA Space Apps 2026 project spherex-blink (https://github.com/Unavailable4u/spherex-blink). Structure mirrors the minilocker-film repo (https://github.com/Unavailable4u/minilocker-film). Rules for every contributor: no code comments, no author or tool attribution anywhere, no Co-Authored-By trailers.

## 1. Status (snapshot)

| Part | State |
|---|---|
| Patch 00 starter (scaffold, config, FX toolkit, evidence, frozen contract, tools, bible, guides) | DONE |
| Patches 01-06 (assets, gfx, audio, tooling) | prompts WRITTEN in docs/patches/, code NOT started |
| Patches 07-25 (UI, scenes, integration) | prompt files NOT written yet, code NOT started |
| docs/LEDGER.md, README.md, docs/guide/00-read-first.md, docs/patches/status.json | NOT written yet |

Rough progress by planned weight: about 2 percent of the film is built (only the stub shell renders). The foundation that lets everything else run in parallel is finished. Remaining: about 98 percent, split into 25 patches below.

The shell compiles (`npx tsc --noEmit` clean) and `remotion still` renders; every UI component, graphic and scene is currently a labelled stub with its final exports and props.

## 2. What exists

- `src/config/`: theme.ts (dark palette), timeline.ts (SCENES, CUT_FRAMES, CUES), copy.ts (all on-screen text), camera.ts, focus.ts (27 named focus rects), filmState.ts (frozen contract).
- `src/data/`: evidence.json (REAL capture from spherex-blink commit f525fd5b, 68 KB), types.ts, select.ts (typed selectors; all on-screen numbers must come from here).
- `src/fx/`: Camera, Cursor, Caption, KineticText, Callout, StatNumeral, Glow, Grain, Vignette, Spotlight, GridPaper, Toast, KeyCap, Badge.
- `src/lib/`: ease, spring, prng, fonts, useFilmState.
- `src/ui/`: stub for Header, Rail, SkyViewer, TimeBar, PanelTabs, PanelInspect, PanelFlags, PanelContext, SkyMapCard, PanelPlanetX, PanelOrrery, FilmApp (already wired by focus rects), theme.css. Each exports `XState`, `X_DEFAULT`, the component.
- `src/gfx/`: HookField, Mark, ParallaxDiagram, LimitsCard (stubs).
- `src/scenes/`: S0Hook ... S9Outro stubs, each exports `SN_CAMERA`, `SN_CURSOR`, `SN_STATE` and an overlay; `index.ts` wires them and `sceneState(frame)`.
- `scripts/`: capture-evidence.mjs, validate-evidence.mjs (`--final`), fetch-assets.mjs.
- `tools/`: lib.mjs (patch front-matter parser, waves, status), ledger.mjs (`sync|status|next|start|done|block|reset|check`), make-prompt.mjs (builds `prompts-out/patch-NN.md`: context header + ledger + pasted files + references + bible sections + patch body).
- `docs/guide/`: context-header.md, motion-rules.md, checklist.md. `docs/bible/`: 00-bible-intro, bible-01..11, appendix-A. Bible 04 = frozen contract, 06 = per-scene frame beats, 07 = copy, 08 = camera/focus, 09 = audio plan, 10 = honesty, 11 = source map into the spherex-blink app with line ranges.

## 3. Frozen rules

- Timeline: S0 Hook 0-299, S1 Title 300-599, S2 Data 600-1079, S3 Blink 1080-1679, S4 Inspect 1680-2219, S5 Check 2220-2699, S6 PlanetX 2700-3419, S7 Flag 3420-3779, S8 Limits 3780-4199, S9 Outro 4200-4499. 120 BPM: beat = 15 f, bar = 60 f. App is 1600x900 logical on the 1920x1080 stage with a virtual camera.
- Each UI file owns only its slice (`XState`, `X_DEFAULT`, component). Each scene file owns only its `SN_CAMERA`, `SN_CURSOR`, `SN_STATE`, overlay. Scenes never edit UI files; UI never edits scenes. Shared files (filmState.ts, focus.ts, timeline.ts, copy.ts, scenes/index.ts, theme.ts) are changed only by an integration patch.
- Determinism: no timers, CSS transitions, `Date.now`, `backdrop-filter`, unseeded `Math.random`.
- Honesty: prototype, no discovery claims; Pallas measure shows the app verdict "Nearby object: asteroid or comet"; the simulated field is always labelled; no coverage is a hatch, not black.
- Key evidence: 20 real fields, 1 simulated, 219 real frames, 16 asteroid fields; Pallas bands D1/D2/D4/D5, 13 frames, 6.1488 arcsec/px; pair 2025-10-07_2337 to 2025-10-09_0811 (D1, 1.357 d; chosen by rule, CONFIRM against the live app's Best pair); pick pixel (602,318); 13/13 Pallas detected at 0.57 px; 148/150 over 16 fields; 107/150 strict; parallax at 500 AU 3.49 px in window vs 127.1 px over six months; measured pair 908.9 arcsec, fit kind `near`.

## 4. Patch plan (what is left)

Patch file format (docs/patches/patch-NN.md, parsed by tools/lib.mjs), then the prompt body:
```
---
id: NN
title: ...
group: ui|gfx|audio|tooling|scene|integration|human
weight: N
frames: N          (scene patches only)
human: yes         (patch 01 only)
needs: 00, 01
owns: file, file
paste: files shown to the model in full
ref: path:start-end ranges (spherex-blink paths relative to web/, or @film/ for minilocker-film)
bible: 01, 04, 06
appendix: A
---
```
Each body ends with a ledger block and `node tools/ledger.mjs done NN "note"`. Existing patch-02 to patch-06 are good models of the style. `paste` for UI patches: filmState.ts, theme.ts, focus.ts, timeline.ts, types.ts, select.ts, ease.ts, spring.ts, FilmApp.tsx, Stub.tsx, plus the stub being replaced.

| ID | Title | Group | Weight | Needs | Owns |
|---|---|---|---|---|---|
| 00 | Starter | foundation | 3 | none | DONE |
| 01 | Fetch assets (human: `npm run assets -- --from ../spherex-blink`, confirm Best pair) | human | 1 | 00 | public/* |
| 02 | HookField + Mark | gfx | 4 | 00 | src/gfx/HookField.tsx, Mark.tsx |
| 03 | ParallaxDiagram + LimitsCard | gfx | 6 | 00 | src/gfx/ParallaxDiagram.tsx, LimitsCard.tsx |
| 04 | Audio (sfx.ts, FilmAudio, make-sfx.mjs) | audio | 6 | 00 | src/config/sfx.ts, src/audio/FilmAudio.tsx, scripts/make-sfx.mjs |
| 05 | render.mjs (+4k, frames, cut30), check-stills.mjs | tooling | 5 | 00 | scripts/render.mjs, check-stills.mjs |
| 06 | make-sheets.mjs, audit-motion.mjs | tooling | 5 | 00 | scripts/make-sheets.mjs, tools/audit-motion.mjs |
| 07 | UI Header + TimeBar | ui | 6 | 00, 01 | src/ui/Header.tsx, TimeBar.tsx |
| 08 | UI Rail (band plates, layers, keys) | ui | 6 | 00, 01 | src/ui/Rail.tsx |
| 09 | UI SkyViewer (blink canvas, stars, overlays, cursor target) | ui | 10 | 00, 01 | src/ui/SkyViewer.tsx |
| 10 | UI Inspect pane (PanelTabs, PanelInspect, PanelFlags) | ui | 10 | 00, 01 | those three files |
| 11 | UI Context pane (PanelContext, SkyMapCard) | ui | 8 | 00, 01 | those two files |
| 12 | UI Planet X pane (PanelPlanetX, PanelOrrery) | ui | 10 | 00, 01 | those two files |
| 13 | Scene S0 Hook | scene | 5 (frames 300) | 02 | src/scenes/S0Hook.tsx |
| 14 | Scene S1 Title | scene | 3 (300) | 02 | S1Title.tsx |
| 15 | Scene S2 Data | scene | 8 (480) | 07, 08, 09 | S2Data.tsx |
| 16 | Scene S3 Blink | scene | 10 (600) | 07, 08, 09 | S3Blink.tsx |
| 17 | Scene S4 Inspect | scene | 10 (540) | 09, 10 | S4Inspect.tsx |
| 18 | Scene S5 Check | scene | 8 (480) | 09, 11 | S5Check.tsx |
| 19 | Scene S6 Planet X | scene | 12 (720) | 03, 09, 12 | S6PlanetX.tsx |
| 20 | Scene S7 Flag | scene | 8 (360) | 09, 10 | S7Flag.tsx |
| 21 | Scene S8 Limits | scene | 6 (420) | 03 | S8Limits.tsx |
| 22 | Scene S9 Outro | scene | 3 (300) | 02 | S9Outro.tsx |
| 23 | Continuity + motion pass (all handoffs, audit-motion clean) | integration | 8 | 13-22, 06 | shared files only |
| 24 | Audio sync and mix | integration | 6 | 04, 23 | src/config/sfx.ts, src/audio/FilmAudio.tsx |
| 25 | Final QA, render 1080p/4k, 30 s cut, submission assets | integration | 6 | 05, 06, 24 | out/, docs/submission/* |

Total weight 173; done 3.

Parallel waves (from the needs above):
- Wave 0: 00 done.
- Wave 1 (all parallel): 01, 02, 03, 04, 05, 06, and UI patches 07-12 (they need 01 only for real tiles in stills, code can start now). Scenes S0 (13), S1 (14), S9 (22) need only 02; S8 (21) needs only 03.
- Wave 2: S2 (15), S3 (16) after 07+08+09; S4 (17), S7 (20) after 09+10; S5 (18) after 09+11; S6 (19) after 03+09+12.
- Wave 3: 23. Wave 4: 24. Wave 5: 25.
Critical path: 01 -> 09 -> 16/19 -> 23 -> 24 -> 25.

Scene specs: docs/bible/bible-06.md. Component source ranges in spherex-blink web/: index.html header 17-40, rail 41-80, work/figure 81-124, timeline 125-137, panel/tabs 138-144, inspect 145-168, context 169-192, planetx 193-215, footer 216-223, help 224-237, about 238-256; controls.js persistence/verdict 239-259, moverCheck 260-; style.css sections by markers; parallax.js, wcs.js. Full map: docs/bible/bible-11.md.

## 5. Still to write for the ledger system

1. docs/patches/patch-07.md ... patch-25.md in the format above (copy the style of patch-02/03). Per-patch body: exact files to replace, frozen props/exports, the exact slice fields (from bible-04), per-frame behaviour (from bible-06), CHECK line (tsc, still at named frames).
2. docs/LEDGER.md: read order, parallel rules, `<!-- STATUS:BEGIN -->` / `<!-- STATUS:END -->` markers (ledger.mjs rewrites between them), a "Contract (frozen)" pointer to bible-04, and a `## Handoff entries` heading with the PATCH 00 entry (make-prompt reads everything after it).
3. docs/patches/status.json with patch 00 done; then `node tools/ledger.mjs sync` and `check` (must show no file-ownership conflicts).
4. README.md and docs/guide/00-read-first.md (human workflow: install, assets, `node tools/make-prompt.mjs NN`, paste prompts-out/patch-NN.md to a model, apply, `npx tsc --noEmit`, `ledger done NN`).
5. Final checks: grep for `//`, `/*`, "Claude", "Anthropic", "generated", "co-author" in the repo; `npx tsc --noEmit`; `npm run studio`.

## 6. How to resume

```
npm install
npx tsc --noEmit
npm run studio
```
Then finish section 5, run `npm run assets -- --from ../spherex-blink`, and work patches in wave order, each by `node tools/make-prompt.mjs NN`.

Open items: confirm the evidence pair against the live app's Best pair (or rerun `npm run evidence -- --repo ../spherex-blink --pair idA,idB`); the Space Apps page states no video length limit, so check the submission page (`cut30` exists for a 30 s cut).
