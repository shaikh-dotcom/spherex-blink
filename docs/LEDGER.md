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

- Work done: **34%** by effort weight (59 of 173 units; 0 more in progress)
- Patches: 13 done, 0 in progress, 0 blocked, 13 not started (of 26)
- Film scenes finished: 1320 of 4500 frames (29%)
- Work left: 114 effort units. Longest remaining chain: 09 -> 19 -> 23 -> 24 -> 25

### Ready now (all needs done, nobody started)

These can all run at the same time in separate sessions: they need only finished patches and they own different files.

- **09** UI: SkyViewer (blink canvas, overlays, selection, Planet X track) (weight 10; owns src/ui/SkyViewer.tsx, src/ui/viewer/*, src/dev/sheets/DevSkyViewer.tsx)
- **10** UI: Inspect pane (PanelTabs, PanelInspect, PanelFlags) (weight 10; owns src/ui/PanelTabs.tsx, src/ui/PanelInspect.tsx, src/ui/PanelFlags.tsx, src/dev/sheets/DevInspect.tsx)
- **11** UI: Context pane (PanelContext, SkyMapCard) (weight 8; owns src/ui/PanelContext.tsx, src/ui/SkyMapCard.tsx, src/dev/sheets/DevContext.tsx)
- **12** UI: Planet X pane (PanelPlanetX, PanelOrrery) (weight 10; owns src/ui/PanelPlanetX.tsx, src/ui/PanelOrrery.tsx, src/dev/sheets/DevPlanetX.tsx)

### Every patch

| ID | Wave | State | Weight | Needs | Title | Owner / note |
|----|------|-------|--------|-------|-------|--------------|
| 00 | 0 | done | 3 | - | Starter repo (scaffold, config, FX toolkit, evidence, contract, tools) | starter repo |
| 01 | 1 | done | 1 | 00 | Fetch assets: fonts, tiles, reference pictures (human step, no model) | assets fetched, pair confirmed by re-implementing bestPair |
| 02 | 1 | done | 4 | 00 | Graphics: HookField (S0 star field) and Mark (logo) | HookField and Mark |
| 03 | 1 | done | 6 | 00 | Graphics: ParallaxDiagram (S6) and LimitsCard (S8) | ParallaxDiagram and LimitsCard |
| 04 | 1 | done | 6 | 00 | Audio engine: sfx cue list, generator script, FilmAudio | audio engine |
| 05 | 1 | done | 5 | 00 | Tooling: render.mjs (full, 4k, frames, 30 s cut) and check-stills.mjs | render and check-stills; audited, cut30 verified at 900 frames, 4k verified |
| 06 | 1 | done | 5 | 00 | Tooling: contact sheets and motion audit | make-sheets and audit-motion; audited |
| 07 | 2 | done | 6 | 00, 01 | UI: Header and TimeBar | Header and TimeBar, stills checked |
| 08 | 2 | done | 6 | 00, 01 | UI: Rail (band plates, Blink controls, Layers, Keys) | Rail, stills checked |
| 09 | 2 | todo | 10 | 00, 01 | UI: SkyViewer (blink canvas, overlays, selection, Planet X track) | - |
| 10 | 2 | todo | 10 | 00, 01 | UI: Inspect pane (PanelTabs, PanelInspect, PanelFlags) | - |
| 11 | 2 | todo | 8 | 00, 01 | UI: Context pane (PanelContext, SkyMapCard) | - |
| 12 | 2 | todo | 10 | 00, 01 | UI: Planet X pane (PanelPlanetX, PanelOrrery) | - |
| 13 | 2 | done | 5 | 02 | Scene S0 Hook | S0 Hook scene |
| 14 | 2 | done | 3 | 02 | Scene S1 Title | S1 Title scene |
| 15 | 3 | todo | 8 | 07, 08, 09 | Scene S2 Data | - |
| 16 | 3 | todo | 10 | 07, 08, 09 | Scene S3 Blink | - |
| 17 | 3 | todo | 10 | 09, 10 | Scene S4 Inspect | - |
| 18 | 3 | todo | 8 | 09, 11 | Scene S5 Check | - |
| 19 | 3 | todo | 12 | 03, 09, 12 | Scene S6 Planet X | - |
| 20 | 3 | todo | 8 | 09, 10 | Scene S7 Flag | - |
| 21 | 2 | done | 6 | 03 | Scene S8 Limits | S8 Limits scene |
| 22 | 2 | done | 3 | 02 | Scene S9 Outro | S9 Outro scene |
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

### PATCH 06 (contact sheets, motion audit) - done

- Files: scripts/make-sheets.mjs, tools/audit-motion.mjs (npm scripts `sheets` and `motion`).
- `node scripts/make-sheets.mjs --scene S3 --every 4` or `--from N --to M`: renders low-resolution stills and tiles them with ffmpeg into out/sheets/sheet-<from>-<to>.png plus a .txt listing each cell's frame. Options: `--cols 8`, `--scale 0.25`, `--browser <chrome path>`.
- `node tools/audit-motion.mjs [--scene S3]`: loads the real scene camera through a TypeScript loader and checks holds (over 60 frames with no camera change), moves (under 24 frames), gaps, pan speed (over 160 px per frame), zoom above 2.0 for over 60 frames, first keyframe at the scene start, and moves off the beat. It exits 1 on any failure.
- Tested on the stub scenes: the audit runs and reports the expected "hold of N frames" failure for all ten scenes (they have one keyframe each); the sheet test wrote sheet-0-299.png with 3 cells.

### PATCH 21 (Scene S8 Limits) - done

- File: src/scenes/S8Limits.tsx (exports `S8_CAMERA`, `S8_CURSOR`, `S8_STATE`, `S8Limits`).
- Cue frames used: caption 3780, columns 3810, captionHatch 3900, captionClaim 4080, lift 4170-4199. The overlay returns null outside 3780-4199.
- Slice fields set: appOpacity only, 1 to 0.15 over 3780-3810, held, then to 0 over 4170-4199 (exit state reached on the last frame).
- LimitsCard progress is a piecewise map from the global frame: heads 3810-3825, row slots start on beats 3825, 3855, 3885, 3915, 3945, the card's own No coverage swatch lands 4050-4080. The card drifts 1.00 to 1.02 and lifts 70 px while fading over 4170-4199.
- A larger hatch tile (same theme.hatchNoData on theme.sunken as LimitsCard) with the word "no data" sits above captionHatch from 3900 to 4080. LimitsCard's own smaller swatch appears at 4050, so both show for about 30 frames. No Ceres row was added.
- Badge badges.prototype (tone warn) reveals at 4080 above captionClaim.
- Camera: holdShot on fullWindow, arrive 24, push 0.03. Cursor: one hide waypoint at 3780.
- Motion audit (`node tools/audit-motion.mjs --scene S8`): 0 failures, 0 warnings.
- Checked: `npx tsc --noEmit` clean; check-stills passes at 3780, 3825, 3900, 3990, 4080, 4140, 4185, 4199; stills reviewed.
- Requests for shared files: none.

### PATCH 22 (Scene S9 Outro) - done

- File: src/scenes/S9Outro.tsx (exports `S9_CAMERA`, `S9_CURSOR`, `S9_STATE`, `S9Outro`).
- Cue frames used: lockup 4260 (Mark draws 4260-4290), tagline 4275, link 4290 with an accent rule from 4296, repo 4305, tail 4320, ack 4350, fade to paper 4470-4499. The overlay returns null outside 4200-4499.
- Slice fields set: appOpacity 0 for the whole scene. Entry state matches the S8 exit state.
- The acknowledgement comes from selectAcknowledgement and is drawn only when evidence has one. The content block drifts 1.00 to 1.03 over 4260-4470. Camera: holdShot on fullWindow starting at scaleBias 1.03 (the S8 end pose), push 0.03.
- Final frame 4499 measures mean RGB 5.1, 6.1, 10.0 (range 4-6, 5-7, 9-11) against theme paper 5, 6, 10; the remaining variation is Grain and Vignette, which sit above the scene overlays.
- Motion audit (`node tools/audit-motion.mjs --scene S9`): 0 failures, 0 warnings.
- Checked: `npx tsc --noEmit` clean; check-stills passes at 4200, 4275, 4300, 4360, 4440, 4499; stills reviewed.
- Requests for shared files: patch 23 may fade Grain and Vignette to zero over 4470-4499 so the last frame is exactly the paper colour.

### PATCH 13 (Scene S0 Hook) - done

- File: src/scenes/S0Hook.tsx (exports `S0_CAMERA`, `S0_CURSOR`, `S0_STATE`, `S0Hook`).
- Cue frames used: caption 60 (leaves at 150, before the flicker), HookField flicker 150-209 and settle 210 (frames inside the field itself), callout 210 (leaves at 282), tag 240 (fades up over 18 frames and holds to 299), the "Illustration" label from 240 is drawn by HookField. The overlay returns null outside 0-299.
- Slice fields set: appOpacity 0 for the whole scene. Cursor: empty waypoint list (the cursor stays hidden).
- The overlay renders HookField (start 0, end 299) behind the caption, callout and tag. The callout targets hookDotPoints().p2 in stage coordinates with no camera, so it stays on the dot during the 1.00 to 1.04 push inside HookField.
- Camera: holdShot on fullWindow, arrive 30, push 0.04. The app is hidden, so the camera only decides the pose S1 starts from.
- Checked: `npx tsc --noEmit` clean; `node tools/audit-motion.mjs --scene S0` 0 failures, 0 warnings; check-stills passes at 0, 60, 120, 150, 180, 210, 240, 270, 299; stills reviewed.
- Requests for shared files: none.

### PATCH 14 (Scene S1 Title) - done

- File: src/scenes/S1Title.tsx (exports `S1_CAMERA`, `S1_CURSOR`, `S1_STATE`, `S1Title`).
- Cue frames used: eyebrow 300 (fades up over 24 frames), Mark draw 315-345 with the lockup at 315, tagline 420 (two lines, 4 frame stagger). The block drifts 1.00 to 1.02 over 315-570. Title, Mark, eyebrow and tagline lift 90 px and fade together over 570-599. The overlay returns null outside 300-599.
- The lockup is two KineticText blocks next to the Mark: SPHEREx at 315 (plain) and Blink Comparator at 321 (italic, accentInk), because KineticText can only italicise a whole text.
- Slice fields set from the first frame: header.fieldId "pallas"; rail.band the pair band; viewer.fieldId "pallas", pairA and pairB from selectPair(), zoom 1, reveal 1; time.reveal 1; tabs.tab "inspect", tabs.reveal 1. appOpacity is 0 until 570, then a signature ramp that is exactly 1 on 599. HeaderState has no reveal field, so none is set. Patches 07 to 12 are not finished: this was coded against the slice table in bible-04 and must be rechecked by patch 23.
- Camera: eases from the S0 end pose over 300-329, linear push to scaleBias 1.03 over 330-569, then eases back to fullWindow at scaleBias 1 over 570-599, landing exactly on frame 599.
- Exit state: appOpacity 1 on 599, the pose equals the S2 stub's first keyframe (`kf(600, "fullWindow")`).
- Checked: `npx tsc --noEmit` clean; `node tools/audit-motion.mjs --scene S1` 0 failures, 0 warnings; check-stills passes at 300, 315, 330, 345, 420, 450, 570, 585, 599; stills reviewed.
- Requests for shared files: none. For patch 15 (S2): its first camera keyframe at 600 must be fullWindow at scaleBias 1, or it must open with a keyframe at 600 that matches the S1 end pose.

### AUDIT of patches 05 and 06 - 2026-11-08

- Scope: scripts/render.mjs, scripts/check-stills.mjs, scripts/make-sheets.mjs, tools/audit-motion.mjs. Fixes are in commit 8a6d99c (patch-05-06-fixes.patch).
- Fix 1 (render.mjs): `--cut30` produced 903 frames and 30.1 s because each part's AAC audio ran a few ms longer than its video and the concat step padded the video. Now each part has an `outpoint` in the concat list, `-fps_mode passthrough` (falls back to `-vsync 0` on old ffmpeg) and `-shortest`, and the script asserts the real frame count with `ffprobe -count_frames` and fails if it is not 900. Verified: 900 frames, video 30.000 s, audio 30.011 s, fade to ink at the end (last frame about RGB 7,5,8), audio fade -31.8 dB to -56.4 dB over the last half second.
- Fix 2 (render.mjs): output pixel format was yuvj420p (full range, untagged); the spec says yuv420p. Added `colorSpace: "bt709"` to the render options and matching colour flags in the cut30 ffmpeg call. Verified: yuv420p, tv range, bt709 tagged, on normal renders and on the cut.
- Fix 3 (render.mjs): `--frames` crashed on every run (also in the original code) because renderMedia cannot write image sequences. Switched to `renderFrames` from @remotion/renderer. An existing out/frames folder is renamed with a timestamp before a new run, and the PNG count is checked. Verified: 1920x1080 PNGs named element-N.png; a second run keeps the first in out/frames-<timestamp>.
- Fix 4 (audit-motion.mjs): a camera drift shorter than 24 frames was never flagged, and any tiny zoom change (for example 0.1 percent) reset the hold counter. Now every move, drifts included, must be 24 frames or longer, and a drift under 2 percent no longer breaks a hold and prints a WARN. Verified with two synthetic camera tracks; real film results unchanged.
- Checks that passed: check-stills `--frames 0,300` and the default list (33 stills: first, middle, last of every scene plus CUT_FRAMES); render `--from 0 --to 59` gives h264 plus aac with exactly 60 frames, re-running renames the old file with a timestamp, `--from 10 --to 5` exits 1 with a Fix message; `--4k --from 0 --to 14` gives 3840x2160, 15 frames, yuv420p; make-sheets `--scene S0 --every 20` writes a labelled sheet (partial last row, exact grid, unknown scene and no arguments all behave; ffmpeg has drawtext and tile); audit-motion passes S0, S1, S8, S9, and S2 to S7 fail only with the expected stub holds; exit codes are 0 clean and 1 on failure or unknown scene.
- Open, low priority: the audit-motion `short` column now includes drifts; make-sheets writes the same file name for different `--every` or `--cols` values and overwrites.
- Requests for shared files: none.

### PATCH 07 (Header, TimeBar) - done

- Files: src/ui/Header.tsx, src/ui/TimeBar.tsx, src/dev/sheets/DevHeaderTime.tsx, CSS blocks `.sb-header-begin{}` and `.sb-time-begin{}` at the end of src/ui/theme.css.
- Both components position themselves absolutely at their focus rect (`header`, `timeBar`), like the stubs, because FilmApp does not wrap them.
- Header slice (final): `fieldId: string` ("pallas"; the select shows the title from selectFields), `badge: "real" | "simulated"` ("real"; texts from badges in copy.ts), `tourPulse: number` (0; 0..1 amber ring and glow on Tour, computed from the value, no animation). Logo is Mark at size 38. Anchors: fieldSelect, badge, tourBtn, aboutBtn, helpBtn.
- TimeBar slice (final): `position: number` (0, playhead 0..1), `epochSeg: null | number` (null; 1..3 highlights that pass band), `reveal: number` (1; fades and lifts the bar), ADDED `fieldId: string` ("pallas"; use "pallas-6mo" for the three-pass bar). One tick per frame in date order, equally spaced like the app's #ftick, tick colour by pass (1 muted, 2 teal, 3 violet), the tick nearest the playhead is amber and taller, UTC date labels at each pass start and at the end. The Pallas field has a single pass, so epochSeg 2 or 3 only highlights something with fieldId "pallas-6mo". Anchors: epoch1..epoch3, playhead.
- Focus names occupied: header, timeBar.
- Requests for shared files: none.

### PATCH 08 (Rail) - done

- Files: src/ui/Rail.tsx, src/dev/sheets/DevRail.tsx, CSS block `.sb-rail-begin{}` at the end of src/ui/theme.css.
- The four sections are placed at the focus rects bandPlates, blinkControls, layers and keys (relative to the rail), so cursor and camera targets from focus.ts land on the real elements.
- Rail slice (final): `band: string` ("D1"), `mode: "static" | "blink" | "overlay"` ("static"), `rateHz: 1 | 2 | 3 | 5` (3), `showKnown`, `showMask`, `snap`, `showFlags: boolean` (all true), `hot: null | "band" | "blink" | "pair" | "layers" | "keys"` (null; amber outline plus Glow; "blink" ringed the mode and rate controls, "pair" ringed Best pair), ADDED `fieldId: string` ("pallas"; only that field's bands are enabled, frame counts shown for pallas and pallas-6mo).
- Real wording kept from the app: "Blink the shared footprint only" is the showMask layer, "Snap clicks to sources" is snap. A "Static" button was added next to Overlay so mode "static" has a visible control; Best pair shows the pair band and days apart from selectPair.
- Anchors (data-anchor): bandD1..bandD6, bandPlates, blinkControls, blinkAB, modeStatic, modeOverlay, rate, rate1..rate5, bestPair, layers, layerKnown, layerMask, layerSnap, layerFlags, keys.
- KeyCap is used with startFrame -1000 so keys are fully settled on any frame.
- Focus names occupied: rail, bandPlates, blinkControls, layers, keys.
- Requests for shared files: none. Note for patch 09: FilmApp passes SkyViewer only `state.viewer`, so read `showKnown`, `showMask` and `band` through useFilmState (import it carefully: filmState.ts imports SkyViewer, so move VIEWER_DEFAULT and the state type into src/ui/viewer/ and re-export them to avoid an import cycle).
