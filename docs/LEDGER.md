# LEDGER: spherex-blink-film

Single source of truth for how the work is going. Every session reads this file first and updates it last.

## Read order for any session

1. docs/guide/context-header.md (rules, honesty, judging criteria)
2. This file (status below, handoff entries at the bottom)
3. docs/bible/bible-04.md (the frozen contract) and the bible sections named in your patch
4. Your patch file docs/patches/patch-NN.md (or the prompt built by `node tools/make-prompt.mjs NN`)

## How the work flows

- The film is split into 26 patches (00 to 25). Each patch OWNS specific files and no two patches own the same file (`node tools/ledger.mjs check` verifies it).
- A patch may start when every patch in its `needs:` is done. Patches in the same wave have no dependency on each other and run in parallel in separate sessions or models.
- UI and graphics patches (02, 03, 07 to 12) and audio/tooling patches (04, 05, 06) do not touch scenes. Scene patches (13 to 22) do not touch UI. Shared files (config, fx, lib, data, FilmApp, scenes/index.ts, Root) are changed only by integration patch 23.
- If a patch needs a change in a shared file, it writes a Request in its handoff entry. Patch 23 applies all Requests.
- Scenes can be written while UI patches are unfinished by coding against the slice table in bible-04; patch 23 reconciles.

Waves (what runs in parallel versus in order):
- Wave 0: 00 (done).
- Wave 1, all parallel: 01 (human), 02, 03, 04, 05, 06. UI patches 07 to 12 formally need 01 (real tiles for stills) but their code can be written at the same time as 01.
- Wave 2: 13 (needs 02), 14 (needs 02), 21 (needs 03), 22 (needs 02), then 15 and 16 (need 07, 08, 09), 17 and 20 (need 09, 10), 18 (needs 09, 11), 19 (needs 03, 09, 12).
- Wave 3: 23 (needs all scenes and 06). Wave 4: 24 (needs 04, 23). Wave 5: 25 (needs 05, 06, 24).
- Critical path: 01/09 -> 16 or 19 -> 23 -> 24 -> 25.

## Commands

```
node tools/ledger.mjs status       progress, ready-now list, waves
node tools/ledger.mjs next         patches that can start now
node tools/ledger.mjs start NN     mark in progress
node tools/ledger.mjs done NN "x"  mark done (after the check passes)
node tools/ledger.mjs block NN "x" mark blocked with a reason
node tools/make-prompt.mjs NN      build prompts-out/patch-NN.md for a model
```

## Contract (frozen)

See docs/bible/bible-04.md: FilmState slices per UI file, the scene file contract (`SN_CAMERA`, `SN_CURSOR`, `SN_STATE`, overlay), entry and exit states per scene, the list of shared files nobody edits inside a patch.

## Status

<!-- STATUS:BEGIN -->
Updated by `node tools/ledger.mjs sync` on 2026-11-08. Do not edit by hand; run the command after every state change.

### Progress

- Work done: **14%** by effort weight (25 of 173 units; 0 more in progress)
- Patches: 6 done, 0 in progress, 0 blocked, 20 not started (of 26)
- Film scenes finished: 0 of 4500 frames (0%)
- Work left: 148 effort units. Longest remaining chain: 09 -> 19 -> 23 -> 24 -> 25

### Ready now (all needs done, nobody started)

These can all run at the same time in separate sessions: they need only finished patches and they own different files.

- **06** Tooling: contact sheets and motion audit (weight 5; owns scripts/make-sheets.mjs, tools/audit-motion.mjs)
- **07** UI: Header and TimeBar (weight 6; owns src/ui/Header.tsx, src/ui/TimeBar.tsx, src/dev/sheets/DevHeaderTime.tsx)
- **08** UI: Rail (band plates, Blink controls, Layers, Keys) (weight 6; owns src/ui/Rail.tsx, src/dev/sheets/DevRail.tsx)
- **09** UI: SkyViewer (blink canvas, overlays, selection, Planet X track) (weight 10; owns src/ui/SkyViewer.tsx, src/ui/viewer/*, src/dev/sheets/DevSkyViewer.tsx)
- **10** UI: Inspect pane (PanelTabs, PanelInspect, PanelFlags) (weight 10; owns src/ui/PanelTabs.tsx, src/ui/PanelInspect.tsx, src/ui/PanelFlags.tsx, src/dev/sheets/DevInspect.tsx)
- **11** UI: Context pane (PanelContext, SkyMapCard) (weight 8; owns src/ui/PanelContext.tsx, src/ui/SkyMapCard.tsx, src/dev/sheets/DevContext.tsx)
- **12** UI: Planet X pane (PanelPlanetX, PanelOrrery) (weight 10; owns src/ui/PanelPlanetX.tsx, src/ui/PanelOrrery.tsx, src/dev/sheets/DevPlanetX.tsx)
- **13** Scene S0 Hook (weight 5; owns src/scenes/S0Hook.tsx)
- **14** Scene S1 Title (weight 3; owns src/scenes/S1Title.tsx)
- **21** Scene S8 Limits (weight 6; owns src/scenes/S8Limits.tsx)
- **22** Scene S9 Outro (weight 3; owns src/scenes/S9Outro.tsx)

### Every patch

| ID | Wave | State | Weight | Needs | Title | Owner / note |
|----|------|-------|--------|-------|-------|--------------|
| 00 | 0 | done | 3 | - | Starter repo (scaffold, config, FX toolkit, evidence, contract, tools) | starter repo |
| 01 | 1 | done | 1 | 00 | Fetch assets: fonts, tiles, reference pictures (human step, no model) | assets fetched, pair confirmed by re-implementing bestPair |
| 02 | 1 | done | 4 | 00 | Graphics: HookField (S0 star field) and Mark (logo) | HookField and Mark |
| 03 | 1 | done | 6 | 00 | Graphics: ParallaxDiagram (S6) and LimitsCard (S8) | ParallaxDiagram and LimitsCard |
| 04 | 1 | done | 6 | 00 | Audio engine: sfx cue list, generator script, FilmAudio | audio engine |
| 05 | 1 | done | 5 | 00 | Tooling: render.mjs (full, 4k, frames, 30 s cut) and check-stills.mjs | render and check-stills; cut30 untested |
| 06 | 1 | todo | 5 | 00 | Tooling: contact sheets and motion audit | - |
| 07 | 2 | todo | 6 | 00, 01 | UI: Header and TimeBar | - |
| 08 | 2 | todo | 6 | 00, 01 | UI: Rail (band plates, Blink controls, Layers, Keys) | - |
| 09 | 2 | todo | 10 | 00, 01 | UI: SkyViewer (blink canvas, overlays, selection, Planet X track) | - |
| 10 | 2 | todo | 10 | 00, 01 | UI: Inspect pane (PanelTabs, PanelInspect, PanelFlags) | - |
| 11 | 2 | todo | 8 | 00, 01 | UI: Context pane (PanelContext, SkyMapCard) | - |
| 12 | 2 | todo | 10 | 00, 01 | UI: Planet X pane (PanelPlanetX, PanelOrrery) | - |
| 13 | 2 | todo | 5 | 02 | Scene S0 Hook | - |
| 14 | 2 | todo | 3 | 02 | Scene S1 Title | - |
| 15 | 3 | todo | 8 | 07, 08, 09 | Scene S2 Data | - |
| 16 | 3 | todo | 10 | 07, 08, 09 | Scene S3 Blink | - |
| 17 | 3 | todo | 10 | 09, 10 | Scene S4 Inspect | - |
| 18 | 3 | todo | 8 | 09, 11 | Scene S5 Check | - |
| 19 | 3 | todo | 12 | 03, 09, 12 | Scene S6 Planet X | - |
| 20 | 3 | todo | 8 | 09, 10 | Scene S7 Flag | - |
| 21 | 2 | todo | 6 | 03 | Scene S8 Limits | - |
| 22 | 2 | todo | 3 | 02 | Scene S9 Outro | - |
| 23 | 4 | todo | 8 | 06, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22 | Continuity and motion pass (scenes joined, audit clean) | - |
| 24 | 5 | todo | 6 | 04, 23 | Audio sync and mix | - |
| 25 | 6 | todo | 6 | 05, 06, 24 | Final QA, renders and submission assets | - |

### Waves: what runs in parallel and what runs in order

**Wave 0**

- 00 Starter repo (scaffold, config, FX toolkit, evidence, contract, tools)

**Wave 1** (starts when its needs are done; these run in parallel)

- 01 Fetch assets: fonts, tiles, reference pictures (human step, no model) <- needs 00
- 02 Graphics: HookField (S0 star field) and Mark (logo) <- needs 00
- 03 Graphics: ParallaxDiagram (S6) and LimitsCard (S8) <- needs 00
- 04 Audio engine: sfx cue list, generator script, FilmAudio <- needs 00
- 05 Tooling: render.mjs (full, 4k, frames, 30 s cut) and check-stills.mjs <- needs 00
- 06 Tooling: contact sheets and motion audit <- needs 00

**Wave 2** (starts when its needs are done; these run in parallel)

- 07 UI: Header and TimeBar <- needs 00, 01
- 08 UI: Rail (band plates, Blink controls, Layers, Keys) <- needs 00, 01
- 09 UI: SkyViewer (blink canvas, overlays, selection, Planet X track) <- needs 00, 01
- 10 UI: Inspect pane (PanelTabs, PanelInspect, PanelFlags) <- needs 00, 01
- 11 UI: Context pane (PanelContext, SkyMapCard) <- needs 00, 01
- 12 UI: Planet X pane (PanelPlanetX, PanelOrrery) <- needs 00, 01
- 13 Scene S0 Hook <- needs 02
- 14 Scene S1 Title <- needs 02
- 21 Scene S8 Limits <- needs 03
- 22 Scene S9 Outro <- needs 02

**Wave 3** (starts when its needs are done; these run in parallel)

- 15 Scene S2 Data <- needs 07, 08, 09
- 16 Scene S3 Blink <- needs 07, 08, 09
- 17 Scene S4 Inspect <- needs 09, 10
- 18 Scene S5 Check <- needs 09, 11
- 19 Scene S6 Planet X <- needs 03, 09, 12
- 20 Scene S7 Flag <- needs 09, 10

**Wave 4** (starts when its needs are done; single patch)

- 23 Continuity and motion pass (scenes joined, audit clean) <- needs 06, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22

**Wave 5** (starts when its needs are done; single patch)

- 24 Audio sync and mix <- needs 04, 23

**Wave 6** (starts when its needs are done; single patch)

- 25 Final QA, renders and submission assets <- needs 05, 06, 24

A wave number is only the earliest wave a patch could run in. A patch may start as soon as ITS OWN needs are done, even if its wave-mates are not.

### File ownership (no two patches write the same file)

No ownership conflicts: every file or folder below is written by exactly one patch.

- 00: (the starter zip)
- 01: public/*
- 02: src/gfx/HookField.tsx, src/gfx/Mark.tsx, src/dev/sheets/DevGfxHook.tsx
- 03: src/gfx/ParallaxDiagram.tsx, src/gfx/LimitsCard.tsx, src/dev/sheets/DevGfxExplain.tsx
- 04: src/config/sfx.ts, src/audio/FilmAudio.tsx, scripts/make-sfx.mjs
- 05: scripts/render.mjs, scripts/check-stills.mjs
- 06: scripts/make-sheets.mjs, tools/audit-motion.mjs
- 07: src/ui/Header.tsx, src/ui/TimeBar.tsx, src/dev/sheets/DevHeaderTime.tsx
- 08: src/ui/Rail.tsx, src/dev/sheets/DevRail.tsx
- 09: src/ui/SkyViewer.tsx, src/ui/viewer/*, src/dev/sheets/DevSkyViewer.tsx
- 10: src/ui/PanelTabs.tsx, src/ui/PanelInspect.tsx, src/ui/PanelFlags.tsx, src/dev/sheets/DevInspect.tsx
- 11: src/ui/PanelContext.tsx, src/ui/SkyMapCard.tsx, src/dev/sheets/DevContext.tsx
- 12: src/ui/PanelPlanetX.tsx, src/ui/PanelOrrery.tsx, src/dev/sheets/DevPlanetX.tsx
- 13: src/scenes/S0Hook.tsx
- 14: src/scenes/S1Title.tsx
- 15: src/scenes/S2Data.tsx
- 16: src/scenes/S3Blink.tsx
- 17: src/scenes/S4Inspect.tsx
- 18: src/scenes/S5Check.tsx
- 19: src/scenes/S6PlanetX.tsx
- 20: src/scenes/S7Flag.tsx
- 21: src/scenes/S8Limits.tsx
- 22: src/scenes/S9Outro.tsx
- 23: src/config/timeline.ts, src/config/copy.ts, src/config/focus.ts, src/config/theme.ts, src/config/filmState.ts, src/scenes/index.ts, src/SpherexFilm.tsx
- 24: docs/bible/bible-09.md
- 25: docs/submission/*, out/*
<!-- STATUS:END -->

## Handoff entries

Append one block per finished patch: files, public API, FINAL slice fields, cue frames, Requests for shared files. Never rewrite another patch's block.

### PATCH 00 (starter) - done

- Files: package.json, tsconfig.json, remotion.config.ts, src/config/*, src/data/*, src/fx/*, src/lib/*, src/ui/* (stubs plus FilmApp, theme.css), src/gfx/* (stubs), src/scenes/* (stubs plus index.ts), src/dev/*, scripts/capture-evidence.mjs, scripts/validate-evidence.mjs, scripts/fetch-assets.mjs, tools/*, docs/*.
- State: `npx tsc --noEmit` is clean; `remotion still` renders the dashed focus map with stub scenes.
- Evidence: real capture from spherex-blink commit f525fd5be8ccfb3a929337d0add8c1be287bdde6 (sample false). The pair (2025-10-07_2337 to 2025-10-09_0811, band D1, 1.357 days) was chosen by rule: confirm it with the live app's Best pair (patch 01).
- Public API: each UI stub exports `XState`, `X_DEFAULT`, `X`; each scene stub exports `SN_CAMERA`, `SN_CURSOR`, `SN_STATE` and its overlay; gfx stubs keep the props listed in patches 02 and 03.
- Notes: npm scripts `evidence`, `assets`, `sfx`, `render`, `sheets`, `cut30`, `submission` point to files created by later patches.

### PATCH 01 (assets) - done

- Ran `npm run assets -- --from <spherex-blink clone>`: 61 files, 17.9 MB in public/ (public/ is gitignored, re-run on each machine).
- Best pair confirmed by re-implementing the app's bestPair score (controls.js 135-148) with exact no-data overlap on the four D1 frames: 2025-10-07_2337 + 2025-10-09_0811 ranks first (score 0.318, shared 60.5%, 1.357 days). evidence.json keeps pair.source "rule", so `evidence:final-check` still prints two WARN lines; they are expected.

### PATCH 02 (HookField, Mark) - done

- Files: src/gfx/HookField.tsx, src/gfx/Mark.tsx, src/dev/sheets/DevGfxHook.tsx.
- API: `HookField({frame,start,end})`; `hookDotPoints(): {p1,p2}` in stage coordinates (p1 1260,330; p2 1344,414). The field pushes 1.00 to 1.04 around p2, so p2 stays fixed and a Callout can target `hookDotPoints().p2` exactly. Flicker f150-209 (5 frames per epoch), settle f210, ring and trail from f210, label "Illustration" from f240 (frames relative to `start`).
- `Mark({size,color?,draw?})`: draw 0..1, default 1 renders the exact logo.

### PATCH 03 (ParallaxDiagram, LimitsCard) - done

- Files: src/gfx/ParallaxDiagram.tsx, src/gfx/LimitsCard.tsx, src/dev/sheets/DevGfxExplain.tsx.
- ParallaxDiagram `{progress,distanceAu}` 900x520: distance snaps to the nearest evidence table row; progress 0-0.5 is the short window arc, 0.5-1 continues to half an orbit; prints the six-month shift from selectShift (at 500 AU: 781.6 arcsec).
- LimitsCard `{progress}` 1500x560: all numbers from selectors. The Ceres row was NOT added: the app does not explain Ceres, so the LIMITED column uses the app's own wording ("slow asteroids barely move in their window, so they cannot pass it"). The hatch swatch "No coverage" appears at the bottom of the LIMITED column from progress 0.86. S8 scene (patch 21) must therefore not draw its own duplicate swatch unless it wants the larger real-tile one.

### PATCH 04 (audio) - done

- Files: scripts/make-sfx.mjs, src/config/sfx.ts, src/audio/FilmAudio.tsx. `npm run sfx` writes 9 WAV files plus manifest.json into public/audio (byte-identical on repeat runs); `npm run sfx:check` passes.
- Added a ninth sound `pulse` (120 BPM thump, S1 and S9 beats) beyond the seven in the plan. SFX_CUES has 71 cues: whooshes at S1-S9 starts, risers 60 frames before S1/S6/S9, thud on the S2 counter, chimes on 6 callouts, hatch on S8 columns, ticks every 10 frames f1140-f1280, pulses in S1 and S9 (last at 4425).
- FilmAudio reads public/audio/manifest.json and renders silent (one console warning) if it is missing.
- Patch 24 takes over src/config/sfx.ts and FilmAudio.tsx.

### PATCH 05 (render, check-stills) - done, one test pending

- Files: scripts/render.mjs, scripts/check-stills.mjs. Both accept `--browser <path to chrome>` (or env REMOTION_BROWSER); in the cloud sandbox use /opt/pw-browsers/chromium-1243/chrome-linux64/chrome because Remotion's own Chrome download is blocked.
- Tested: check-stills on 4 frames passes; a 60-frame render has h264 video plus aac audio.
- NOT yet tested: `--cut30` (the 30 s cut). The range list was corrected to total exactly 900 frames: 0-119, 1170-1289, 1800-1919, 2310-2429, 2880-2999, 3150-3269, 3480-3539, 4260-4379 (the original list in the patch summed to 780). Run `node scripts/render.mjs --cut30` and confirm 900 frames with ffprobe -count_frames.
