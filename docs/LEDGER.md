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
Updated by `node tools/ledger.mjs sync` on 2026-11-10. Do not edit by hand; run the command after every state change.

### Progress

- Work done: **97%** by effort weight (167 of 173 units; 0 more in progress)
- Patches: 25 done, 0 in progress, 0 blocked, 1 not started (of 26)
- Film scenes finished: 4500 of 4500 frames (100%)
- Work left: 6 effort units. Longest remaining chain: 25

### Ready now (all needs done, nobody started)

These can all run at the same time in separate sessions: they need only finished patches and they own different files.

- **25** Final QA, renders and submission assets (weight 6; owns docs/submission/*, out/*)

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
| 09 | 2 | done | 10 | 00, 01 | UI: SkyViewer (blink canvas, overlays, selection, Planet X track) | SkyViewer: tile canvases, blink, overlay, known layer, selection, marks, Planet X track, rulers, HUD, caption |
| 10 | 2 | done | 10 | 00, 01 | UI: Inspect pane (PanelTabs, PanelInspect, PanelFlags) | Inspect pane: PanelTabs, PanelInspect, PanelFlags; stills checked |
| 11 | 2 | done | 8 | 00, 01 | UI: Context pane (PanelContext, SkyMapCard) | Context pane: PanelContext, SkyMapCard; stills checked |
| 12 | 2 | done | 10 | 00, 01 | UI: Planet X pane (PanelPlanetX, PanelOrrery) | Planet X pane: PanelPlanetX, PanelOrrery; stills checked |
| 13 | 2 | done | 5 | 02 | Scene S0 Hook | S0 Hook scene |
| 14 | 2 | done | 3 | 02 | Scene S1 Title | S1 Title scene |
| 15 | 3 | done | 8 | 07, 08, 09 | Scene S2 Data | Scene S2 Data |
| 16 | 3 | done | 10 | 07, 08, 09 | Scene S3 Blink | Scene S3 Blink |
| 17 | 3 | done | 10 | 09, 10 | Scene S4 Inspect | Scene S4 Inspect |
| 18 | 3 | done | 8 | 09, 11 | Scene S5 Check | Scene S5 Check |
| 19 | 3 | done | 12 | 03, 09, 12 | Scene S6 Planet X | Scene S6 Planet X; tsc clean; motion audit passes on all 10 scenes; stills at the cue frames checked; diagram ends before the lab text reveals; six-month bracket drawn by the scene overlay; orrery shot lifted clear of the caption |
| 20 | 3 | done | 8 | 09, 10 | Scene S7 Flag | Scene S7 Flag |
| 21 | 2 | done | 6 | 03 | Scene S8 Limits | S8 Limits scene |
| 22 | 2 | done | 3 | 02 | Scene S9 Outro | S9 Outro scene |
| 23 | 4 | done | 8 | 06, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22 | Continuity and motion pass (scenes joined, audit clean) | Continuity and motion pass, all four stages |
| 24 | 5 | done | 6 | 04, 23 | Audio sync and mix | Audio sync and mix: SFX_CUES rebuilt from the finished scenes (70 hits and 36 pulses), drone fade ends at f4480, cue table in bible-09 |
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

- Files: package.json, tsconfig.json, remotion.config.ts, src/config/_, src/data/_, src/fx/_, src/lib/_, src/ui/_ (stubs plus FilmApp, theme.css), src/gfx/_ (stubs), src/scenes/_ (stubs plus index.ts), src/dev/_, scripts/capture-evidence.mjs, scripts/validate-evidence.mjs, scripts/fetch-assets.mjs, tools/_, docs/_.
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

### PATCH 15 (Scene S2 Data) - done

- File: src/scenes/S2Data.tsx (replaces the stub; exports S2_CAMERA, S2_CURSOR, S2_STATE, S2Data).
- Camera (holdShot, every move 36 frames, moves start on f600, f690, f780, f960): header f600-689, skyImage f690-779, bandPlates f780-959 with scaleBias 0.27 (zoom 1.87, under the 2.0 limit), then `centre` with scaleBias 1.22 (zoom 1.3) from f960 to f1079. Deviation: the beat sheet says figure for the last shot, but at figure framing the time bar is cropped out, so the sweep would be invisible; `centre` keeps the figure and the whole time bar in frame and puts the bar below the caption. `node tools/audit-motion.mjs --scene S2` passes (0 failures, 0 warnings).
- Cue frames used: CUES.s2.caption 600 (s2.caption, out at 765), counter 690 (StatNumeral count-up over 45 frames for realFields and realFrames, cards fade out f762-780), badge f720 (Badge badges.real, tone ok, small, centred at the top of the stage, out at 774), bands 780 (Callout s2.bandsTag on bandPlates, out at 945), captionPatch 960 (out at 1065).
- Slice fields set every frame: appOpacity 1; header fieldId "pallas", badge "real", tourPulse 0; rail fieldId "pallas", band, mode "static", hot, showKnown true; viewer fieldId "pallas", pairA, pairB, blinkPhase 0, zoom 1, cx, cy 0.5, selection null, overlayAB false, view "sky", reveal 1; time fieldId "pallas", position, epochSeg, reveal 1; tabs tab "inspect", reveal 1.
- f600-779: band D1, viewer on pair A (pair.info.a). f780-959: rail.hot "band" and rail.band steps D1, D2, D4, D5 every 45 frames (f780, f825, f870, f915), viewer pairA = pairB = the first frame of each band in file order, blinkPhase 0. f960-1079: rail.hot null, band D1; time.position eases 0 to 1 over f960-1040 and back to 0 over f1040-1070; the viewer shows the D1 frame at the playhead (the latest D1 frame at or before the nearest tick, the first D1 frame before any), so the footprint changes across the days and the viewer is back on pair A when the playhead is under tick 5 of 13 (about f1060); time.epochSeg is 1, 2, 3 in thirds of f960-1040 then null (the Pallas field has one pass, so only segment 1 draws a highlight).
- Entry state: as S1 exit. Exit state reached by f1079: rail.band = pair band D1, viewer pairA = pair.a at zoom 1, time.position 0, tabs.tab "inspect", rail.mode "static", overlayAB false.
- Cursor: no clicks. Appears at f648 beside the header badge, crosses the sky image (f738), hovers the plates D1, D2, D4, D5 about 21 frames after each highlight starts (f822, f846, f891, f936), rests above the time bar (f984) and ends mid-image (f1056).
- Stat numerals sit in two glass cards at stage x 96 and 1450, flanking the sky image at f690-780; the cards use an opaque glass fill, no backdrop-filter.
- Captions over the figure shots overlap the app's own figure caption text; that is unavoidable with a lower-third caption on these shots.
- Checked: `npx tsc --noEmit` clean; motion audit clean; stills at f600, 690, 720, 740, 780, 825, 870, 915, 960, 1000, 1020, 1040, 1079 reviewed.
- Requests for shared files: none.

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

### PATCH 09 (SkyViewer) - done

- Files: src/ui/SkyViewer.tsx, src/ui/viewer/{state,geometry,data,wcs,parallax,tiles,rail,Rulers,Hud,Overlay}, src/dev/sheets/DevSkyViewer.tsx, and a CSS block at the end of src/ui/theme.css between `.sb-viewer-begin{}` and `.sb-viewer-end{}`.
- Public API: `SkyViewer({state, showKnown?, showMask?})`, `VIEWER_DEFAULT`, `SkyViewerState`, `tileToFigure(state, col, row)` (position inside the figure box) and `tileToApp(state, col, row)` (logical app coordinates 0..1600 x 0..900). `col,row` are tile pixel-centre coordinates, the same convention as the pick (602, 318); everything is drawn at col+0.5.
- FINAL slice fields: fieldId string "pallas"; pairA, pairB frame ids "" (empty means the evidence pair for pallas, first and last D1 frame for pallas-6mo); blinkPhase 0 (below 0.5 shows A, otherwise B, hard switch); zoom 1; cx, cy 0.5; selection null; overlayAB false; view "sky"; refBlend 0; pxDrawAu null; markA, markB null; reveal 1; ADDED refLayer "dss2" ("dss2", "2mass" or "wise", file public/ref/<fieldId>/<refLayer>.jpg); ADDED coach false (the Space / O / arrows hint bar of the app).
- Focus names occupied: figure (the component positions itself at FOCUS.figure; the sky picture is skyImage and the caption is caption).
- Tiles are decoded once with the app's own no-data mask (5x5 opening of the zero pixels) and drawn pixelated; the shared-footprint mask follows rail.showMask and the A and B pair is built with the app's pair() rules (amber 1.0, 0.62, 0.22 and cyan 0.2, 0.74, 1.0, additive). Known object ring, dashed track and label "(2) Pallas (known asteroid)" follow rail.showKnown and the displayed frame (field pallas only, evidence has no track for pallas-6mo).
- Planet X track: the app's exact parallax model (Earth from evidence.orrery, linear in time) from the field centre over the band's frames, label "Planet X @ <n> AU (simulated)". When the band spans the evidence window the track is scaled so its length equals selectShift(n).windowArcsec (the model agrees with the table to 0.09 percent); other distances use the model alone. Drawn solid violet like the app, not dashed.
- Selection: the app's crosshair (gap 10 tile px, ring r 10) plus a small centre cross. markA and markB: amber and cyan rings with an A or B badge and a faint dashed line between them. All strokes are constant in screen pixels (width times tile pixels per screen pixel), so zoom does not thicken them.
- Rulers, compass, scale bar and caption are ports of axes.js. The WCS is built from the evidence field centre and size (TAN, crpix 512.5); it reproduces the 13 target positions of evidence within 0.006 px and the pick centroid to the printed RA and Dec. view "solar" dims the rulers, hides the sky furniture and shows a dark orrery placeholder; PanelOrrery owns anything drawn there.
- Checked: `npx tsc --noEmit` clean; `node tools/ledger.mjs check` clean; DevSkyViewer renders zoom 1 phase 0 and 0.9 (the Pallas ring jumps, stars identical), overlay with coach bar, zoom 3 at the pick with selection, marks and Planet X 500 AU; extra states checked: reference blend, practice field, solar. SpherexFilm frames 598 and 1100 render with the viewer in place.
- Requests for shared files: none. The Rail flags are read inside the viewer with useFilmState because FilmApp passes only the viewer slice; src/ui/viewer/rail.ts is the only place that does it and the circular import with filmState is safe because SkyViewer.tsx re-exports the slice from viewer/state first.

### PATCH 10 (Inspect pane) - done

- Files: src/ui/PanelTabs.tsx, src/ui/PanelInspect.tsx, src/ui/PanelFlags.tsx, src/dev/sheets/DevInspect.tsx, CSS block `.sb-inspect-begin{}` at the end of src/ui/theme.css.
- Public API: `PanelTabs`, `TABS_DEFAULT`, `PanelTabsState`; `PanelInspect`, `INSPECT_DEFAULT`, `PanelInspectState`, `INSPECT_SPLIT` (556, the y where the Inspect card ends and the flag section starts); `PanelFlags`, `FLAGS_DEFAULT`, `PanelFlagsState`.
- Layout: each component positions itself absolutely in the panel, like the other UI patches. PanelTabs fills the `tabs` rect. PanelInspect runs from the bottom of the tabs (y 120) to INSPECT_SPLIT; PanelFlags runs from INSPECT_SPLIT to the panel bottom (y 900). The Selected point card keeps the app's real spacing (the 8 rows end at about y 396, inside inspectMeta; the Mover check box ends at about y 511 for "moves", inside moverCheck). The flag section is compacted to fit the 344 px left under the panel: Flag a mover card about y 556-748, Flags in this field card about y 748-896.
- PanelTabs slice (final): `tab: "inspect" | "context" | "planetx"` ("inspect"; the underline is drawn under the active tab, no motion), `reveal: number` (1; fades and lifts the strip).
- PanelInspect slice (final): `reveal: number` (0; 0 shows the app's empty-state sentence, 1 shows the Selected point rows from selectPick; the empty sentence is gone by 0.5), `verdict: null | "none" | "fixed" | "moves" | "unclear"` (null; null draws nothing in the Mover check block), `verdictReveal: number` (0; fades and lifts the Mover check block). Verdict wording is the app's (controls.js verdict()). "moves" and "fixed" use pick.moverCheck.otherFrames as n. "unclear" uses the app's cosmic-ray sentence with the same n, because the same-frame and fainter-frame counts the other unclear wording needs are not in the evidence. "none" is the app's no-source sentence. Only "moves" is used in the film.
- PanelFlags slice (final): `formReveal: number` (0; fades the Flag a mover card and the Flags in this field card, with the flag-mode pill), `category: string` ("asteroid"; must be in selectFlagCategories, else it throws), `flagged: number` (0; 0 or 1, more throws because only the pick has evidence; 1 adds the list row, the status line and the match note), `matchReveal: number` (0; fades the match note, shown only when flagged is 1), `exportReveal: number` (0; fades the Export CSV, Export JSON buttons and the CSV preview strip), ADDED `exportPulse: number` (0; 0..1 amber ring and glow on both export buttons), ADDED `statePulse: number` (0; 0..1 ring around the pill and status line).
- Wording from the app: pill "saved in this browser only", status "Saved in this browser (no shared store is configured)." (shown once flagged is 1), match note "This matches a known object: (2) Pallas (1″ away). Good catch. It is catalogued, so it is not a new discovery." The distance is built the way the app builds it: distance between the pick centroid and selectTargetPosition(pick.frame) times pixscaleArcsec, rounded to whole arcseconds; the bible quote leaves the "(N″ away)" part out, the app prints it. Nothing says flags are shared.
- Flag row: category from state, band, frame id with the underscore as a space, verdict "moves" from pick.moverCheck.goneFromAll, coordinates to four decimals, as the app builds them. CSV preview: the header is selectFlagColumns; the data row is built from the pick and stops before `created`, because the app writes a wall-clock ISO time there and the evidence has none. Nothing is invented for that cell.
- Anchors (data-anchor): tabs, tabInspect, tabContext, tabPlanetX, inspectCard, inspectMeta, moverCheck, flagPanel, flagForm, categorySelect, noteField, flagIt, flagState, flagMatch, flagList, exportCsv, exportJson, csvPreview.
- Focus names occupied: tabs, inspectMeta, moverCheck, flagForm, flagList.
- Checked: `npx tsc --noEmit` clean; `node tools/ledger.mjs check` clean; DevInspect stills reviewed at 0.6 and 1.0 scale: nothing selected, selected with verdict "moves", form shown, flagged with match note, export shown with pulse, state pill pulse, verdicts fixed, unclear and none, half reveal; the four-line "unclear" verdict fits above the split.
- Requests for shared files: (1) src/config/focus.ts: the flag rects do not match the real layout, set flagForm to {x: 1208, y: 556, w: 392, h: 192} and flagList to {x: 1208, y: 748, w: 392, h: 148}; inspectMeta and moverCheck are fine. (2) src/ui/FilmApp.tsx: the empty `panel` div draws nothing, so the right panel has no background or left rule; give it `boxSizing: "border-box"`, `borderLeft: 1px solid theme.rule2` and `background: linear-gradient(180deg, rgba(11,13,20,0.9), rgba(6,7,11,0.96))` (no backdrop-filter), as DevInspect does.

### PATCH 11 (Context pane) - done

- Files: src/ui/PanelContext.tsx, src/ui/SkyMapCard.tsx, src/dev/sheets/DevContext.tsx, CSS block `.sb-context-begin{}` at the end of src/ui/theme.css.
- Public API: `PanelContext`, `CONTEXT_DEFAULT`, `PanelContextState`; `SkyMapCard`, `SKYMAP_DEFAULT`, `SkyMapCardState`.
- Layout: PanelContext is one absolute box from the top of `contextField` (y 130) to the bottom of `referenceBlend` (y 740) holding three cards with exactly the focus heights: This field (200), Reality check (260), Compare with other eyes (150). SkyMapCard fills the `skyMapCard` rect (y 740, h 150).
- PanelContext slice (final): `reveal: number` (0; fades and lifts the This field card and the Compare with other eyes card), `validationReveal: number` (0; fades the Reality check card, multiplied by `reveal`), `referenceBlend: number` (0; fills the slider and prints it as a percentage, the credit line fades in over the first 0.2), `acrossReveal: number` (1; opens the across-fields stat 148/150 under the first three stats), `strictReveal: number` (1; opens the 107/150 stat and the app's explanatory sentence, and folds the intro sentence away so the card still fits 260), `refReveal: number` (1; extra fade for the Compare with other eyes card, multiplied by `reveal`), `refLayer: string` ("dss2"; one of dss2, 2mass, wise, picks the select text and the credit).
- Staging for patch 18: the defaults of the three new fields show the complete card as soon as `validationReveal` is 1, so a scene that only sets the frozen fields still shows every number. For the S5 beat sheet set `acrossReveal: 0, strictReveal: 0` from f2220, then ramp `validationReveal` at f2310, `acrossReveal` at f2460 and `strictReveal` at f2580, and `refReveal` if the reference card should wait for f2640.
- SkyMapCard slice (final, unchanged): `reveal: number` (0), `showKnown: boolean` (true; amber dots for the fields built around a known asteroid and the label of the Pallas target, off draws every field in ivory and dims the legend row).
- Data: field rows from selectFields and selectPallas (target, frames in bands, dates and duration from the frame mjd, passes with the app's one-pass hint, size and tile pixels); Reality check from selectPallasValidation (13/13, 0.57 px, 3.5″, 13/13) and selectValidationAll totals (148/150 across 16 fields, 107/150 stricter). The map plots the 20 real fields from selectFields and rings the Pallas field.
- Ported from the app: card wording and layout from controls.js fieldInfo and valCard, the explanatory sentence verbatim, the Hammer projection, graticule, ecliptic, galactic centre and the Milky Way re-projection from skymap.js (milkyway.jpg is re-projected once per page into a cached PNG; overlays are SVG so they stay sharp under the camera).
- Deviations: the rms line prints 3.5″ from rms_offset_arcsec (the app rounds to 4″) to match the bible; the app's blurb and the verify_target.py line are left out (no evidence field, no room); the Sun, planets and 90 degree ring of the app's map are not drawn because the evidence has no per-frame sky positions; the this-field marker is a ring, not the app's white box.
- Anchors (data-anchor): contextCard, contextField, realityCheck, referenceBlend, skyMapCard, skyMap.
- Focus names occupied: contextField, realityCheck, referenceBlend, skyMapCard.
- Checked: `npx tsc --noEmit` clean; `node tools/ledger.mjs check` clean; DevContext stills at validationReveal 0, 0.5 and 1, with the across and strict stages, referenceBlend 0 and 0.6, another reference layer, showKnown true and false, and a half revealed pane: nothing clipped, the strict note ends inside the 260 card.
- Requests for shared files: (1) src/data/select.ts: add a selector for the reference layers (id, label, credit) from tiles/<field>/ref/ref.json; PanelContext keeps a three-entry table copied from that file because public/sky/credits.json holds only the planet and Milky Way credits.

### PATCH 12 (Planet X pane) - done

- Files: src/ui/PanelPlanetX.tsx, src/ui/PanelOrrery.tsx, src/dev/sheets/DevPlanetX.tsx, CSS block `.sb-planetx-begin{}` at the end of src/ui/theme.css.
- Public API: `PanelPlanetX`, `PLANETX_DEFAULT`, `PanelPlanetXState`, `FitKind`; `PanelOrrery`, `ORRERY_DEFAULT`, `PanelOrreryState`.
- Layout: both components position themselves absolutely at their focus rects. PanelPlanetX is one box, the union of `pxLab` and `pxMeasure` (y 130 to 630, h 500); PanelOrrery fills `orreryCard` (y 640, h 250). The lab text is tightened (12 to 14.5 px type, 12 px notes) so the longest fit wording ("still", 4 lines) ends inside the 500 px box; the A and B timestamps share one row and the six-month cell puts its label and value on one line.
- PanelPlanetXState slice (final): `distanceAu: number` (500; the slider readout prints it rounded to 10, the output lines use the nearest of the 8 table rows through selectShift), `outReveal: number` (0; fades the output block), `measureReveal: number` (0; fades the Measure a mover block), `fitReveal: number` (0; fades and lifts the fit verdict), ADDED `reveal: number` (1; fades the whole lab), ADDED `sixReveal: number` (1; fades the violet six-month cell and its sentence), ADDED `marks: number` (2; 0, 1 or 2 marks set, fractions cross-fade the hint and the numbers), ADDED `markPulse: number` (0; amber ring on Mark A while marks is 0 or 1, on Mark B when marks is 2), ADDED `fitKind: null | "still" | "near" | "distant" | "misfit"` (null uses pair.fit.kind from the evidence, the others override it for dev sheets).
- PanelOrreryState slice (final): `reveal: number` (0; fades the card), `day: number` (0; days after mjd0, clamped to 0..486), `playing: boolean` (false; Play or Pause glyph only), ADDED `dirReveal: number` (1; fades the violet direction line, arrow and label).
- Wording from the app (motion.js, parallax.js): the output sentence, the error and limit cells, the six-month cell and the 36x sentence, the Pallas rate line, the Mark A and Mark B hint, and the four fit wordings (still, near, distant, misfit). Numbers go through `fmt()` (half-up rounding, like the app: the evidence stores 21.45 and `toFixed(1)` would print 21.4 where the app prints 21.5). Do not replace `fmt` with `toFixed`.
- Measure block: error is `measuredPair.sigmaArcsec * sqrt 2` (sigmaArcsec is the app's per-axis sigma), the duration comes from the two frames' mjd, the rate is moved over hours. The app's "direction N to E" cell is replaced by the pixel figure in the moved cell (the evidence has no direction). Left out: the app's "Selected: ra, dec" line, its grey error-bar note and the "Draw its track on the sky" checkbox (no room, no selection data; the scene drives `viewer.pxDrawAu`). The "distant" and "misfit" wordings omit the angle sentences because the evidence has no measured or predicted angle.
- Orrery: radial sqrt scale like the app, orbit trails from the sampled positions (the evidence has no full orbit polylines, so outer planets show only the arc covered by the 487 days), Earth highlighted, violet dashed direction line from `pallas.pick.ecliptic.lon`, labels placed by a port of the app's collision solver with label widths estimated from character classes (no canvas measureText, so it stays deterministic). Planets are interpolated linearly between the 5-day samples (like the app's `at()`), not snapped to a rounded index, to avoid visible stepping; the spec said rounded index. Planet colours are the app's palette kept as a local table in PanelOrrery.tsx (theme.ts has none). The app's table and speed select are left out.
- Anchors (data-anchor): pxLab, pxDistance, pxOutput, pxSixMonth, pxMeasure, markA, markB, clearMk, pxMoved, pxFit, orreryCard, orrery, orDate, orPlay, orSlider.
- Focus names occupied: pxLab, pxDistance, pxOutput, pxMeasure, orreryCard.
- Checked: `npx tsc --noEmit` clean; `node tools/ledger.mjs check` clean; all 18 DevPlanetX cases rendered at scale 1: distance 30, 100, 500, 1000 and the 160 to 200 snap, six-month line hidden, measure block empty, Mark A and Mark B pulses, fit reveal 0, 0.5 and 1, the four fit kinds, orrery day 0, 90, 180, 300 (direction line at 0.4) and 486, and the half revealed pane. Nothing is clipped (the 4-line "still" verdict ends inside the lab box) and no orrery labels collide.
- Requests for shared files: (1) src/config/focus.ts: `pxLab` (y 130, h 460) and `pxMeasure` (y 460, h 170) overlap by 130 px; the pane draws as one box from y 130 to 630, so for aiming callouts set `pxLab` to {y: 130, h: 330} and keep `pxMeasure` at y 460, h 170; `pxOutput` (y 225, h 230) is approximate (the output block runs from about y 215 to 330, the six-month cell sits at about y 270). (2) src/data/select.ts and the evidence: add the full orbit polyline per body (the app's orrery.json has `orbit`) and the measured and predicted angles in `parallax.measuredPair.fit`, so the orrery trails and the "distant" and "misfit" wordings can be complete. The current "distant" evidence prints a range of "25–25 AU", worth checking in the capture.

### PATCH 16 (Scene S3 Blink) - done

- File: src/scenes/S3Blink.tsx (replaces the stub; exports exactly S3_CAMERA, S3_CURSOR, S3_STATE, S3Blink).
- Camera (every move 24 frames or longer, longest hold 15 frames, max zoom 1.53, under the 1.6 limit that `bias()` enforces by throwing): figure 1.283 at f1080, figure 1.32 at f1110, skyImage 1.46 at f1140 (45 frame move), skyImage 1.53 at f1200 (slow push, 150 frames), figure 1.283 at f1365, figure 1.34 at f1410 (180 frame drift), figure 1.386 at f1590, figure 1.283 at f1650 until the end. `node tools/audit-motion.mjs --scene S3` passes (0 failures, 0 warnings); the full audit now fails only on the S4 to S7 stubs.
- Cue frames used: CUES.s3.badge 1080 (Badge badges.real, tone accent, centred at stage y 62, fades out over f1158-1170), calloutStars 1170 (out at 1230), calloutJump 1200 (out at 1260), captionPluto 1230 (out at 1290), calloutAmber 1290 (aimed at the A amber / B cyan key in the viewer HUD, out at 1350), captionPair 1410 (out at 1530), calloutWarn 1590 (out at 1650). Captions are 64 px.
- Slice fields set every frame: appOpacity 1; header fieldId "pallas", badge "real"; rail fieldId "pallas", band = pair band (D1), mode "static" before f1140, "blink" f1140-1289, "overlay" f1290-1649, "static" from f1650, rateHz 3, showKnown true, showMask true, hot "blink" f1110-1199 and "pair" f1395-1469 (else null); viewer fieldId "pallas", pairA and pairB from selectPair, blinkPhase a frame-based square wave (A for 10 frames, B for 10 frames) from f1140 to f1289 and 0 elsewhere, zoom 1, cx and cy 0.5, selection null, overlayAB true only f1290-1649, view "sky", refBlend 0, pxDrawAu null, markA and markB null, reveal 1, coach true f1260-1379; time fieldId "pallas", position 0, epochSeg null, reveal 1; tabs tab "inspect", reveal 1.
- Entry state: as S2 exit (band D1, pair A at zoom 1, mode "static"). Exit state reached at f1650 and held to f1679: rail.mode "static", viewer.overlayAB false, viewer.blinkPhase 0 (A shown), zoom 1, rail.showKnown true.
- Cursor: appears at f1104, clicks Blink A to B at f1136 (4 frames before the f1140 state change), drifts across the image (f1196), clicks Best pair at f1406 (4 frames before captionPair at f1410), leaves and hides at f1444. Click targets are derived from the blinkControls focus rect (centre x, y + 45 and y + 157).
- Star for "Stars stay put": fixed tile pixel (299, 277), a bright isolated star about 306 px from the asteroid track, aimed with tileToApp. The arrow lands on the star in the stills at f1215 and f1605.
- Jump callout: aimed at the midpoint of the asteroid's A and B positions (selectTargetPosition for both frames, then tileToApp), not at A. Callout has one fixed target for chip and anchor, so following the blink phase would make the label box hop about 135 px at 3 Hz, and aiming at A left the arrow on empty sky and the anchor dot looking like a fixed star whenever frame B was shown. The known-object ring still jumps between the two positions with blinkPhase (drawn by SkyViewer).
- Checked: `npx tsc --noEmit` clean; motion audit as above; stills at f1080, 1110, 1136, 1140, 1170, 1200, 1215, 1230, 1250, 1290, 1380, 1410, 1440, 1590, 1605, 1630, 1650, 1679 pass check-stills and the unreviewed ones were looked at (jump callout at an A frame and a B frame, Pluto caption, Best pair caption with the rail pair line "D1 - 1.36 days apart" lit, Judge by position callout). Stills were rendered with audio missing (`npm run sfx` not run), which only logs a 404 for the manifest.
- Deviations: (1) the Best pair caption has no sub line with the pair dates and wavelengths; it collided with the app's own figure caption and was unreadable, so it was removed. (2) The Pluto and Best pair captions sit over the figure caption and the viewer toolbar row; they stay legible at 64 px, same situation as S2, so the size was not lowered.
- Requests for shared files: none to edit. For patch 23 to judge: (1) the Overlay button is not clicked by the cursor, the mode switches by state only at f1290; (2) the badge is placed top-centre at stage y 62 and does not follow the header badge position; (3) no caption sub line for the pair (see Deviations); (4) if a callout variant with a separate chip anchor and dot anchor is ever added to src/fx/Callout.tsx, the jump callout could keep the chip still and put the dot on the live asteroid.

### PATCH 17 (Scene S4 Inspect) - done

- File: src/scenes/S4Inspect.tsx (replaces the stub; exports exactly S4_CAMERA, S4_CURSOR, S4_STATE, S4Inspect).
- Camera (real moves 36 frames each on beats f1680, 1740, 1800, 1875, 1935, 2010, drifts of 24 to 173 frames between them, longest hold 24 frames, gaps 24 or more): fullWindow 1.16 at f1680 (from the S3 exit pose), drift to 1.19; skyImage 1.6 at f1740, drift to 1.66; fullWindow 1.16 at f1800, drift to 1.19; moverCheck 2.1 at f1875 (the card shot, the only one above 2.0, audit max 2.11, under the 60 frame limit); inspectMeta 1.85 at f1935, drift to 1.93; fullWindow 1.16 at f2010, slow push to 1.19 at f2219. `bias()` throws above 2.0 (2.3 for the card shot). `node tools/audit-motion.mjs --scene S4` passes (0 failures, 0 warnings); the full audit now fails only on the S5, S6 and S7 stubs.
- Cue frames used: CUES.s4.caption 1680 (s4.caption, out at 1755), calloutBlind 1710 (aimed at the Known objects tick box, side right, lead 290 so the chip clears the rail, out at 1770), calloutSnap 1800 (aimed at the centroid, out at 1860), calloutMover 1890 (focus moverCheck, side left, out at 1950), captionKnown 2100 (out at 2190). Other frames: viewer zoom in f1740-1764, click selection f1770, snap slide f1800-1812, inspect.reveal f1800-1845, verdictReveal f1890-1920, viewer zoom out f2004-2040.
- Slice fields set every frame: appOpacity 1; header fieldId "pallas", badge "real"; rail fieldId "pallas", band = pair band (D1), mode "static", rateHz 3, showKnown false f1710-2099 and true otherwise, showMask true, hot "layers" f1690-1769 and f2084-2149 (else null); viewer fieldId "pallas", pairA and pairB from selectPair, blinkPhase 0 (frame A, which is the pick's frame), zoom 1 to 2.4 and back with cx and cy moving to the centroid (cx = (602.38 + 0.5) / 1024, cy = (318.21 + 0.5) / 1024), selection null before f1770, then the click point, then the centroid, overlayAB false, view "sky", refBlend 0, pxDrawAu null, markA and markB null, reveal 1, coach false; time fieldId "pallas", position 0, epochSeg null, reveal 1; tabs tab "inspect", reveal 1; inspect reveal 0 to 1, verdict "moves" (constant; invisible until verdictReveal rises), verdictReveal 0 to 1.
- Entry state: as S3 exit. Exit state reached by the last 30 frames: viewer.selection = the pick centroid, inspect verdict "moves" with reveal 1 and verdictReveal 1, rail.showKnown true, tabs.tab "inspect", viewer zoom 1.
- Click pixel: pick.pixel plus (4, 4) = (606, 322), 5.2 tile pixels from the centroid (602.38, 318.21); the selection slides to the centroid with the signature ease over 12 frames.
- Cursor (clicks 4 frames before each reaction): appears at f1684, clicks the Known objects label at f1706 (tick box clears at f1710), travels to the click pixel and clicks at f1766 (selection at f1770), moves aside at f1812 so it does not cover the snap, returns and clicks the label at f2096 (known layer back at f2100), hides at f2160. The tick box position is derived from the layers focus rect (label row 18 px plus 8 px gap, so the box centre is at layers.y + 35); there is no focus rect of its own.
- Checked: `npx tsc --noEmit` clean; stills at f1680, 1706, 1712, 1745, 1768, 1772, 1800, 1806, 1830, 1895, 1905, 1950, 2025, 2090, 2102, 2130, 2219 pass check-stills and the key ones were looked at (untick with callout and no ring or track, click with the crosshair on the dot, snap with the card revealed beside it, the verdict close-up with the app's own wording, zoom-out, re-tick with ring, track and label back, final hold). Stills were rendered without audio files (`npm run sfx` not run).
- Deviations: (1) the untick, the snap with the card reveal, and the re-tick use whole-window shots (fullWindow, scale 1.16 to 1.19) instead of `figure` or a tight `skyImage` framing: the Known objects tick box sits in the rail, which a figure or skyImage framing crops out, and the snap and the card reveal land on the same beat so they need to be in one frame; the last shot stays wide to f2219 for the same reason. (2) The known layer comes back in one frame at f2100: the viewer has no draw-on progress, so "the layer draws itself" is a hard appearance with the caption and the ticking cursor. (3) The captions sit over the app's figure caption, as in S2 and S3.
- Requests for shared files: none to edit. For patch 23 to judge: (1) add a `knownReveal` field (0 to 1) to the viewer slice and have Overlay draw the ring, track and label progressively, so the re-tick can draw the layer on; (2) a dedicated focus rect for the Known objects tick box would replace the offsets derived from `layers` in this file.

### PATCH 20 (Scene S7 Flag) - done

- File: src/scenes/S7Flag.tsx (replaces the stub; exports exactly S7_CAMERA, S7_CURSOR, S7_STATE, S7Flag).
- Camera (every move 24 frames or longer, longest hold 1 frame, max zoom 1.94, max pan 82.1 px per frame): fullWindow 1.16 at f3420 (36 frame move from the S6 exit pose), push to 1.19 over f3456-3479; flagForm 1.8 at f3480 (36 frames), push to 1.86 over f3516-3539; flagList 1.8 at f3540 (36 frames), push to 1.88 over f3576-3659, then to 1.94 over f3660-3779. `bias()` throws above 2.0. `node tools/audit-motion.mjs --scene S7` passes (0 failures, 0 warnings); the full audit now fails only on the S5 and S6 stubs.
- Cue frames used: CUES.s7.caption 3420 (s7.caption, out at 3495), calloutCross 3480 (variant ok, aimed at the left edge of the match note, side left, lead 110, out at 3540), captionExport 3540 (out at 3650), captionState 3660 (out at 3770). Other frames: flags.formReveal f3450-3480, cursor click f3474, flags.flagged 1 from f3478, matchReveal f3480-3510, exportReveal f3540-3570, exportPulse two 24 frame bumps starting f3558 and f3588, statePulse two 24 frame bumps starting f3690 and f3720.
- Slice fields set every frame: appOpacity 1; header fieldId "pallas", badge "real"; rail fieldId "pallas", band = pair band (D1), mode "static", rateHz 3, showKnown true, showMask true, hot null; viewer fieldId "pallas", pairA and pairB from selectPair, blinkPhase 0, zoom 1, cx and cy 0.5, selection = the pick centroid for the whole scene, overlayAB false, view "sky", refBlend 0, pxDrawAu null, markA and markB null, reveal 1, coach false; time fieldId "pallas", position 0, epochSeg null, reveal 1; tabs tab "inspect", reveal 1; inspect reveal 1, verdict "moves", verdictReveal 1; flags category "asteroid" (looked up in selectFlagCategories, throws if missing), formReveal, flagged, matchReveal, exportReveal, exportPulse, statePulse as above.
- Entry state: tabs.tab "inspect" set in the first frame, viewer.fieldId "pallas", selection = the pick, zoom 1, inspect card already revealed. Exit state held from f3540 to f3779: tabs.tab "inspect", flags.flagged 1, matchReveal 1, exportReveal 1, pulses 0.
- Cursor: fades in to f3438 near the selection in the viewer, travels in an eased arc to the Flag it button and clicks at f3474 (flags.flagged 1 at f3478, a 4 frame lead), moves aside at f3500 so it clears the callout chip, hides at f3516. The button position comes from the panel focus rect and INSPECT_SPLIT (centre x of the panel, INSPECT_SPLIT + 85.5); the match note anchor is panel.x + 26, INSPECT_SPLIT + 166.5. Both offsets were measured from a headless render of PanelFlags.
- Wording on screen is the app's own: pill "saved in this browser only", status "Saved in this browser (no shared store is configured).", the match note with "(1″ away)", the CSV header from selectFlagColumns and the one row from the pick. Nothing says flags are shared.
- Checked: `npx tsc --noEmit` clean; `node tools/ledger.mjs check` clean; stills at f3420, 3450, 3470, 3474, 3478, 3486, 3510, 3540, 3558, 3600, 3660, 3696, 3726, 3770, 3779 pass check-stills; the key ones were looked at (form about to reveal in the wide shot, cursor on Flag it at the click, callout with the match note and status line, export buttons pulsing with the CSV strip, pill ring pulse with a clean caption, final hold). Stills were rendered without audio files (`npm run sfx` not run).
- Deviations: (1) the click is at f3474 and the flag lands at f3478 (4 frame lead from motion rule 11) where the patch text said click f3475. (2) The last shot (f3660-3779) stays on flagList instead of pushing onto flagForm: with the form centred, the Export buttons and the CSV strip sit under the lower-third caption; framed on flagList the pill and status line are in the upper half and the caption sits on clear ground. (3) The "Flag it." caption sits over the app's figure caption in the wide shot, as in S2 to S4.
- Requests for shared files: none to edit. For patch 23 to judge: (1) src/config/focus.ts flagForm and flagList rects are the ones patch 10 already asked to correct; S7 sets absolute camera scales through `bias()`, so correcting the rects keeps the scales and moves the centres by about 12 logical px. (2) S8_CURSOR starts with a waypoint `hide: true` at f3780; after S7 hides the cursor at f3516 the cursor logic fades it in at the window centre over f3772-3780 and out again, so drop that waypoint or give S8 no cursor waypoints.

### PATCH 18 (Scene S5 Check) - done

- File: src/scenes/S5Check.tsx (replaces the stub; exports exactly S5_CAMERA, S5_CURSOR, S5_STATE, S5Check).
- Camera (real moves on f2430 and f2640, every drift 24 frames or longer and 2 percent or more, longest hold 30 frames, max zoom 1.81, max pan 94.2 px per frame): fullWindow 1.19 at f2220 (the S4 exit pose), drift to 1.215 over f2250-2309, pull back to 1.16 over f2340-2375, push to 1.19 over f2376-2429; realityCheck 1.7 at f2430 (36 frame move), drifts to 1.74, 1.78 and 1.82 in 60, 60 and 54 frame steps ending f2639; fullWindow 1.16 at f2640 (30 frame move), push to 1.19 over f2670-2699. `bias()` throws above 2.0. `node tools/audit-motion.mjs --scene S5` passes (0 failures, 0 warnings); the full audit now fails only on the S6 stub.
- Cue frames used: CUES.s5.caption 2220 (s5.caption, out at 2300), calloutChecked 2310 (variant ok, focus realityCheck, side left, lead 70, out at 2400), captionFields 2460 (out at 2570), captionStrict 2580 (out at 2628). Other frames: cursor click on the Context tab f2216, tabs.tab "context" and context.reveal 0 to 1 from f2220 (20 frames), validationReveal f2310-2340, crosses f2310 onward, acrossReveal f2460-2490, strictReveal f2580-2610, refReveal f2628-2646, cursor click on the slider thumb f2636, referenceBlend 0 to 0.6 over f2640-2670, held to f2675, back to 0 over f2676-2699 (exactly 0 on the last frame).
- Predicted-position crosses: drawn by the scene overlay (CrossLayer), not by the viewer. Each of the 13 Pallas frames gets a small ivory cross at selectTargetPosition(frame) through tileToApp (viewer at zoom 1, centred) and then getCameraState plus worldToStage, so the crosses follow the camera. One cross every 8 frames in time order from f2310, each with a 14 frame draw-on and a ring pulse; all fade out over f2604-2623, before the reference blend. Frames taken minutes apart sit within about 0.5 px of each other, so the 13 crosses make 6 visible clusters along the track. The viewer shows only frame A, so the crosses of the 2025-10-13 and 2025-10-14 frames fall on the hatched no-data area of frame A; each frame's own tile is what the 13/13 check used.
- Slice fields set every frame: appOpacity 1; header fieldId "pallas", badge "real"; rail fieldId "pallas", band = pair band (D1), mode "static", rateHz 3, showKnown true, showMask true, hot null; viewer fieldId "pallas", pairA and pairB from selectPair, blinkPhase 0, zoom 1, cx and cy 0.5, selection = the pick centroid, overlayAB false, view "sky", refBlend as below, pxDrawAu null, markA and markB null, reveal 1, coach false (refLayer is left at the viewer default "dss2"); time fieldId "pallas", position 0, epochSeg null, reveal 1; tabs tab "context" from f2220 ("inspect" before), reveal 1; context reveal, validationReveal, acrossReveal, strictReveal and refReveal as above, referenceBlend the same value as viewer.refBlend, refLayer "dss2". The inspect and flags slices are not set: FilmApp draws only the Context pane while tabs.tab is "context".
- Entry state: as S4 exit (selection on the pick centroid, showKnown true, band D1, pair A at zoom 1), tabs.tab "inspect" until f2219. Exit state at f2699: tabs.tab "context", all five context reveal fields at 1, referenceBlend 0 and viewer.refBlend 0, viewer on pair A at zoom 1, camera at fullWindow absolute scale 1.19 (scaleBias 1.2061, reached on f2700). For patch 19: the S6 stub opens at `kf(2700, "fullWindow")`, which is scale 1.0 and would jump from 1.19; the first S6 keyframe should be fullWindow at scaleBias 1.2061 (or a move from it).
- Cursor: first waypoint f2196 (fades in over f2188-2196, so about 30 frames before S5 starts; S4's cursor hides at f2160), eased arc to the Context tab centre (stage centre of the tabs rect, middle third), click at f2216, hides at f2244 so it does not sit on the field card; reappears on the slider thumb at f2628 (fade-in on the spot), clicks at f2636 (4 frames before the blend moves at f2640), follows the thumb to 0.3 at f2655 and 0.6 at f2670, holds, follows back down at f2676-2699 and hides on the last frame. The slider track is x 1284 to 1528 at y 680 and the Context tab is at x 1404, y 95 in app coordinates; both were measured from stills (the cursor lands on the thumb and the tab).
- Wording on screen is the app's own: the Reality check card with 13/13, 0.57 px (3.5″), 13/13, the across line 148/150 "frames found across 16 asteroid fields", the stricter 107/150 "also gone from that pixel in the other frames" and the app's sentence "Not every frame can show it gone from that pixel: ..."; both numbers are on screen at f2540 and f2600 in the card shot, and the strict note is complete by f2610. Compare with other eyes: DSS2 optical, Blend 0 to 60 percent, credit "Digitized Sky Survey, STScI/NASA, via CDS hips2fits" fading in over the first 20 percent of the blend.
- Checked: `npx tsc --noEmit` clean; `node tools/ledger.mjs check` clean; check-stills passes at f2220, 2244, 2310, 2340, 2376, 2430, 2460, 2520, 2580, 2610, 2640, 2660, 2676, 2699; stills reviewed at f2216, 2230, 2250, 2316, 2400, 2480, 2540, 2600, 2625, 2645, 2662, 2690 (tab switch with the cursor on Context, crosses and card at the callout, 148/150 line, 107/150 with the strict note, reference card with the cursor on the thumb, blend and credit visible, blend almost back to 0 at the exit pose). Stills were rendered after `npm run sfx` and `npm run assets`.
- Deviations: (1) the Context tab click is at f2216 (4 frames before the tab changes at f2220, motion rule 11), so the cursor is on screen from f2188, inside the last 32 frames of S4's range. (2) The card shot starts at f2430, 30 frames before captionFields (f2460), so the camera has landed before the across line rises; the wide shots before it are fullWindow at 1.16 to 1.215 because the panel's right edge is cropped above about 1.22 and the 2 percent drift rule needs a change every 60 frames (the f2340 pull back is that change). (3) refReveal waits until f2628 and captionStrict ends at f2628, so the Compare with other eyes card never sits under a caption; the beat sheet's f2640 blend start is unchanged. (4) The viewer is not stepped through the 13 frames: a second flicker would break motion rule 7; the crosses carry the per-frame idea instead. (5) The known-object ring and dashed track stay on (showKnown true, as in the S4 exit state), so the crosses sit on the amber track.
- Requests for shared files: none to edit. For patch 23 to judge: (1) S6 opening pose, see the exit state above. (2) If a focus rect for the Blend slider is ever added to src/config/focus.ts, the thumb positions in this file (derived from the slider measurements above) could come from it. (3) Crosses over the no-data hatch in frame A (see the crosses paragraph) are accurate but may read oddly; a viewer option to show the frame under each cross would remove that.

### PATCH 19 (Scene S6 Planet X) - done

- File: src/scenes/S6PlanetX.tsx (replaces the stub; exports exactly S6_CAMERA, S6_CURSOR, S6_STATE, S6PlanetX).
- Camera (real moves on f2820, f2880, f3150, f3300 and f3375, every drift 24 frames or longer and 2 percent or more, longest hold 12 frames, max zoom 1.87, max pan 79.4 px per frame): fullWindow 1.19 at f2700 (the S5 exit pose), drift to 1.22 over f2712-2819; pxLab 1.6 at f2820 (36 frame move), drift to 1.66 over f2856-2879; fullWindow 1.19 at f2880 (36 frames), drift to 1.222 over f2916-3149; pxMeasure 1.8 at f3150 (36 frames), drift to 1.88 over f3186-3299; orreryCard 1.25 at f3300 (36 frames), drift to 1.29 over f3336-3374; fullWindow 1.19 at f3375 (36 frames, reached f3411, held to the end). `bias()` throws above 2.0. `node tools/audit-motion.mjs` passes on all 10 scenes (0 failures, 0 warnings); the full audit is clean for the first time.
- Cue frames used: CUES.s6.caption 2700 (s6.caption, out at 2800), calloutShift 2880 (aimed at the Planet X speck, side top, lead 150, out at 2955), calloutSix 3000 (aimed at the right end of the six-month bracket, side top, lead 120, out at 3056), captionMeasure 3060 (out at 3146), calloutNear 3200 (aimed at the verdict card, side left, lead 90, out at 3290), captionHonest 3300 (out at 3405). Other frames: ParallaxDiagram overlay f2700-2818 (opacity in over 24 frames, out f2796-2818, progress 0 to 1 from f2706 over 118 frames, distanceAu 30 to 500 from f2716 over 50 frames); app dimmed to 0.22 while the diagram is up and restored f2800-2824; slider click f2816, planetx.distanceAu 30 to 500 f2820-2865, planetx.outReveal from f2820, viewer.pxDrawAu 500 from f2850 to f3389; viewer speck zoom 1 to 6 over f2920-2955; viewer.fieldId "pallas-6mo" f3000-3059 with planetx.sixReveal from f3000 (24 frames), the 127 px bracket f3004-3045 (out by f3055) and a time-bar sweep over the three D1 passes f3004-3055; fieldId back to "pallas" at f3060 with planetx.measureReveal f3060-3083; click on the mover in frame A f3068 (selection f3072), Mark A click f3086 (markA f3090), step to frame B f3100 (viewer.blinkPhase 1, playhead A to B over 12 frames), click on the mover in B f3114 (selection f3118), Mark B click f3132 (markB f3136), coach hint f3090-3127; planetx.fitReveal f3150-3179; orrery.reveal f3300-3323, orrery.day 0 to 60 over f3300-3409, orrery.dirReveal f3324-3353; Clear click f3386, marks and pxDrawAu cleared f3390, viewer back to zoom 1 over f3390-3413.
- Six-month bracket: drawn by the scene overlay (BracketLayer), not by the viewer. The Planet X model has no Earth position for the 2025-04 to 2026-04 dates (the orrery evidence covers 60919-61409 only), so the viewer cannot draw the six-month track. The bracket is a horizontal scale bar of selectShift(500).sixMonthPx (127.1 px) at the tile centre, placed with tileToApp and then getCameraState plus worldToStage so it follows the camera, labelled "127 px". It is a size comparison for the 3.5 px shift, not a track of the body.
- Slice fields set every frame: appOpacity (1 except while the diagram is up); header fieldId and badge "real"; rail fieldId (same as header), band "D1", mode "static", rateHz 3, showKnown true, showMask true, hot null; viewer fieldId, pairA and pairB (the shown six-month D1 frame in both while on "pallas-6mo", otherwise the selectPair frames), blinkPhase, zoom, cx, cy, selection, overlayAB false, view "sky", refBlend 0, pxDrawAu, markA, markB, reveal 1, coach; time fieldId, position, epochSeg (1 to 3 during the sweep, else null), reveal 1; tabs tab "planetx", reveal 1; planetx distanceAu, reveal, outReveal, sixReveal, measureReveal, fitReveal, marks, markPulse (fitKind is left unset: the verdict comes from the two marks); orrery reveal, day, playing, dirReveal.
- Entry state: S5 exit pose (fullWindow absolute scale 1.19), tabs.tab "planetx" set in the first frame (the beat sheet says the scene switches the tab itself, so there is no tab click), planetx.reveal 0 to 1 over f2700-2719 under the dimmed app and the diagram. Exit state at f3419: tabs.tab "planetx", viewer.fieldId "pallas", viewer.pxDrawAu null, markA and markB null, zoom 1 centred, playhead 0, orrery.reveal 1 and day 60, camera fullWindow 1.19.
- Cursor: fades in near the slider at f2808, clicks the thumb at f2816 (4 frame lead), follows the thumb to 500 AU and hides at f2872; reappears at f3050 above the mover and clicks it in frame A at f3068, clicks Mark A at f3086, the mover in frame B at f3114 and Mark B at f3132, hides at f3148; returns at f3374 and clicks Clear at f3386, hides at f3400. Panel positions were measured from a headless render of the whole film app at f3200 (slider track x 1235 to 1575 at y 229; Mark A, Mark B and Clear centres x 1289, 1405, 1521 at y 464.5; verdict text near x 1240, y 575); there is no per-button focus rect, so these are constants, as in S5 and S7. The mover positions come from `tileToApp` at the measuring view.
- Wording on screen is the app's own: "782 arcsec = 127 px" six-month line, measured pair 909 arcsec (± 5.0) over 33 h, rate 27.91 ± 0.15 arcsec/hour, and "Nearby object: asteroid or comet. It moved far more than any body beyond 25 AU can through parallax (even at 25 AU the shift would be 94 arcsec)." The verdict is on screen from about f3180 to f3390 (more than 200 frames) and nothing in the scene says detection; the caption is "A distant fit is a candidate. Never a detection."
- Checked: `npx tsc --noEmit` clean; `node tools/ledger.mjs check` clean; `node tools/audit-motion.mjs` passes on all 10 scenes; check-stills passes at f2700, 2760, 2880, 3000, 3060, 3200, 3300, 3419; stills reviewed at f2760, 2822, 2850, 2885, 2920, 2960, 3030, 3075, 3140, 3200, 3300, 3335, 3372, 3388, 3398, 3419 (diagram over the dimmed app, slider thumb at 430 AU with the cursor on it, speck at 6x, six-month bracket with its callout, Mark A and B on the sky with the pair stepped, verdict card, orrery clear of the caption, Clear with the cursor on the button, exit pose). Stills were rendered after `npm run assets` and `npm run sfx`.
- Deviations: (1) the diagram ends at f2818, not f2860: it is a stage overlay that cannot follow the camera, and past f2820 it sat over the live lab text. (2) The viewer zoom and the playhead change on the field swaps at f3000 and f3060, so those two changes hide in the app's own field switch. (3) The six-month shift is shown as a bracket, not a track (see above). (4) The honest beat frames orreryCard at 1.25, not the panel, so the solar-system card sits above the lower-third caption and the Clear button stays in frame for the click. (5) The marks are cleared at f3390, not held to the end, so the exit state matches bible-04.
- Requests for shared files: none to edit. For patch 23 to judge: (1) S7 starts with tabs.tab "inspect" while S6 ends on "planetx"; S7 has no tab click, so check that cut. (2) If per-button focus rects for Mark A, Mark B, Clear and the distance slider are added to src/config/focus.ts, the cursor constants in this file could come from them (the pxDistance rect, y 150 to 220, sits above the real slider track at y 229). (3) Extending the orrery evidence to cover 2025-04 to 2026-04 would let the viewer draw the real six-month track in place of the bracket.

### PATCH 23 (Continuity and motion pass) - ALL 4 STAGES done, patch finished

Patch 23 is too large for one session, so it runs in four stages. Each stage ends with this block and HANDOFF.md updated. Later stages edit only the "Stage status" list and add their own "Stage N" paragraph; they do not rewrite earlier paragraphs.

Stage status:
- Stage 1 (spec step 1, plus the step 3 audit and the step 4 check on added lines): DONE.
- Stage 2 (spec step 2, the nine scene boundaries): DONE (three boundaries fixed, see "Stage 2" below).
- Stage 3 (spec steps 4 and 5 in full, and the decision on the deferred Requests below): DONE (see "Stage 3" below).
- Stage 4 (spec step 6, preview render and contact sheets, then `node tools/ledger.mjs done 23`): DONE (see "Stage 4" below).

Stage 1 - Requests applied (source patch in brackets):
- [22] Grain and Vignette fade to zero over 4470-4499. src/fx/Grain.tsx exports `GRAIN_OPACITY` (0.03) and src/fx/Vignette.tsx exports `VIGNETTE_STRENGTH` (0.12) as the defaults. src/SpherexFilm.tsx computes `finish = 1 - signature(clamp01((frame - CUES.s9.fade) / (SCENES.S9.end - CUES.s9.fade)))` and passes `GRAIN_OPACITY * finish` and `VIGNETTE_STRENGTH * finish`. New cue `CUES.s9.fade` = 4470 in src/config/timeline.ts (the value S9Outro already used; S9Outro now reads `FADE_START = CUES.s9.fade`). No scene range or cut changed, so bible-03 needs no edit. Measured result: f4470 identical to before, f4499 is exactly the paper colour with min = max on every channel (before: grain still visible).
- [10, 20] src/config/focus.ts: `flagForm` {y 556, h 192} and `flagList` {y 748, h 148} (x and w unchanged).
- [10] src/ui/FilmApp.tsx: the right panel div now has `boxSizing: "border-box"`, `borderLeft: 1px solid theme.rule2` and a vertical gradient background. The gradient is `theme.panelGradient` in src/config/theme.ts, built from new `colors.panelTopRgb` "11,13,20" (alpha 0.9) and `colors.panelBottomRgb` "6,7,11" (alpha 0.96). No backdrop-filter.
- [12] src/config/focus.ts: `pxLab` {y 130, h 330} and `pxOutput` {y 215, h 115}; `pxMeasure` and `pxDistance` unchanged.
- [20] src/scenes/S8Limits.tsx: `S8_CURSOR` is now an empty list and the unused focus import is removed. Checked with the real cursor code (`getCursorState` over `FILM_CURSOR` for all 4500 frames): the old list differed from the new one only on f3773-3787 (a fade up to full opacity at f3780 and back down at window centre, after S7 had already hidden the cursor at f3516); the cursor is now visible only in f641-1451, 1677-2167, 2189-2251, 2629-2706, 2801-2879, 3043-3155, 3367-3407 and 3431-3523.

Files outside patch 23's `owns` line that stage 1 touched, and why: src/fx/Grain.tsx, src/fx/Vignette.tsx and src/ui/FilmApp.tsx are shared files that only patch 23 may change; src/scenes/S8Limits.tsx (cursor list and its import) and src/scenes/S9Outro.tsx (one constant) were edited only on the lines the Requests named. Nothing else in the scenes changed, so no SN_STATE entry or exit value was touched yet.

Stage 1 - checked:
- `npx tsc --noEmit` clean. `node tools/ledger.mjs check` clean (26 patches). `node tools/audit-motion.mjs`: 10 scenes, 0 failures, 0 warnings, longest camera hold 30 frames (the focus rect changes did not break any scene).
- Added source lines grepped for comments, TODO, setTimeout, setInterval, requestAnimationFrame, Date.now, Math.random, backdrop-filter and transition: none. `git diff --check` clean.
- Stills at f700, 1800, 2850, 2900, 3500, 3600, 3776, 3790, 4440, 4470, 4485 and 4499 rendered before and after the edits (out/shots-before, out/shots-after, both gitignored). Looked at: f1800 (unchanged framing), f2850 (S6 lab shot, panel gradient and left rule visible, text readable), f3500 (S7 flag form, panel background visible, flag pill and match note in frame) and f3776 (before and after, the S7 final hold is correctly re-centred on the corrected flagList rect). f4485 and f4499 were measured, not looked at.
- Not rerun after the edits: check-stills at every scene start and end (stage 2), the full film render (stage 4).

Deferred Requests (NOT applied in stage 1; decide in stage 3, each only improves how faithfully a scene's content is drawn):
- [11] src/data/select.ts: a selector for the reference layers (id, label, credit); PanelContext keeps a three-entry copy.
- [12] src/data/select.ts and the evidence: the full orbit polyline per body and the measured and predicted angles in `parallax.measuredPair.fit`; also check why the "distant" evidence prints a range of "25-25 AU".
- [17] a `knownReveal` viewer slice field so the re-tick can draw the layer on, and a focus rect for the Known objects tick box. The viewer slice belongs to the frozen contract, so this one probably stays a note in the final handoff.
- [16, 18, 19] the "for patch 23 to judge" items (S3 Overlay click and badge position and jump callout anchors, S5 crosses over the no-data hatch, per-button focus rects for the S6 cursor constants, orrery evidence range). All optional.

Stage 2 - scene boundaries (spec step 2): DONE.
Method: a throwaway script (not committed) loaded the film modules with the loader from tools/audit-motion.mjs and compared frame b-1 with frame b at all nine boundaries for the camera (`getCameraState` over FILM_CAMERA), the cursor (`getCursorState` over FILM_CURSOR) and the merged app state (`mergeFilmState(DEFAULT_FILM_STATE, sceneState(f))`), next to the normal one-frame step on each side. Stills at f299, 300, 599, 600, 1079, 1080, 1679, 1680, 2219, 2220, 2699, 2700, 3419, 3420, 3779, 3780, 4199 and 4200 were rendered with tools/shots.mjs at 0.5 scale and compared as pixels and by eye; scripts/check-stills.mjs passes on the same 18 frames. Rule used: motion rule 6 (only S0 to S1 at f300 may be a hard cut; CUT_FRAMES is the beat list the audio is built from, not a list of permitted jumps).
- Camera and cursor are continuous at all nine boundaries (every jump is within the normal one-frame step), before and after the fixes.
- 299|300: allowed hard cut. 599|600, 1079|1080, 1679|1680: only invisible fields differ (viewer.pairB while blinkPhase is 0, inspect.verdict while inspect.reveal is 0); nothing changed. 2219|2220: the tab change is the authored click at f2216 followed by the context.reveal ramp from f2220; nothing changed.
- 2699|2700 FIXED. S6 opened with the tab on Planet X, an empty pane and the crosshair gone, all on its first frame at full brightness. S6_STATE now returns `{ ...S5_STATE(SCENES.S5.end), appOpacity: dim }` until `SWAP_AT = START + 20` (f2720), so the Context pane, the crosshair and the S5 cursor (fading out on the Blend slider thumb) carry on while the diagram rises and the app dims. The tab switches to Planet X at f2720, when the app is at about 30 percent opacity, and `planetx.reveal` now ramps from `SWAP_AT` instead of `START`. State across the cut is identical.
- 3419|3420 FIXED except one residual. S6 ended with the cursor hidden and S7 opened on a different pane with no trigger. S6_CURSOR now replaces its final hide waypoint with a click on the Inspect tab at f3416 (`INSPECT_TAB_CLICK_AT = SCENES.S7.start - 4`, motion rule 11), at the centre of the left third of the tabs focus rect (x 1273.3, y 95). S7 opens on Inspect as before, but `inspect.reveal` and `inspect.verdictReveal` now ramp over 20 frames from f3420 (the idiom S5 uses at f2220). S7_CURSOR lost its first waypoint (fade-in near the pick at f3438), so the cursor now goes from the tab to the Flag it button and clicks at f3474 exactly as before; the unused `pickAt` and its `tileToApp` import were removed. Residual: the selection crosshair on Pallas (`viewer.selection`) still appears on f3420 together with the tab change; the viewer has no fade for it.
- 3779|3780 FIXED. S8_STATE was the app defaults plus an opacity ramp, so at f3780 the flag panel, the selection and the pair vanished while the camera was still on the panel. S8_STATE now spreads `S7_STATE(SCENES.S7.end)` and sets `appOpacity` as before (dim over 30 frames, lift from f4170). State across the cut is identical; pixels differing by more than 23 levels went from 5.30 percent to 0.37 percent.
- 4199|4200: the app is at opacity 0 on both sides (S8 lift ends at 0), so the S8 state now differing from the S9 defaults is invisible; the two stills are still pixel-identical (mean difference 0.21, the grain).
- Pixel difference across the fixed cuts (percent of pixels differing by more than 23 levels): 2699|2700 4.49 to 2.80 (what remains is the S6 caption and diagram fading in), 3419|3420 3.36 to 2.82 (cursor click ripple, pane reveal beginning, crosshair), 3779|3780 5.30 to 0.37.
- Camera keyframes were not touched. `node tools/audit-motion.mjs`: 10 scenes, 0 failures, 0 warnings, longest hold still 30 frames. `npx tsc --noEmit` clean, `node tools/ledger.mjs check` clean, added source lines grepped clean (comments, TODO, timers, requestAnimationFrame, Date.now, Math.random, backdrop-filter, transition), `git diff --check` clean.
- Entry and exit lines changed in stage 2, and only those: src/scenes/S6PlanetX.tsx (import of S5_STATE, `SWAP_AT`, `INSPECT_TAB_CLICK_AT`, `INSPECT_TAB`, the last S6_CURSOR waypoint, the early return in S6_STATE, the `planetx.reveal` start), src/scenes/S7Flag.tsx (`TAB_FRAMES`, the first S7_CURSOR waypoint, the two inspect ramps) and src/scenes/S8Limits.tsx (import of S7_STATE, S8_STATE). Those scene blocks above (patches 19, 20, 21) still describe the old cursor and entry states; this block overrides them: S6 cursor now ends on the Inspect tab click at f3416 instead of hiding at f3400, and S7 no longer has a cursor fade-in at f3438.
- Judged and left alone: [14] S2 opens on the S1 end pose (camera and appOpacity continuous at 599|600); [18] S6 opens from fullWindow scale 1.19 (camera continuous at 2699|2700).

Stage 3 - hygiene, honesty check, deferred Requests (spec steps 4 and 5 in full): DONE.
Base: the stage 1 and 2 patch had already been committed as f8cfc30 on top of 033b689, so stage 3 is a patch against f8cfc30 and contains only the lines below.
- Step 4 over the whole repo: `npx tsc --noEmit` clean. grep over src, scripts and tools for setTimeout, setInterval, requestAnimationFrame, Date.now, Math.random, @keyframes, `transition:` and `animation:`: no hits; no comments in src. `new Date(` appears in src/ui/PanelContext.tsx:44 and src/ui/PanelOrrery.tsx:219 (each converts an MJD to a date string, deterministic) and, with no argument, in scripts/capture-evidence.mjs, scripts/render.mjs and tools/ledger.mjs (tooling, not film code); judged fine.
- Step 4, backdrop-filter: two real uses fixed. (1) src/fx/Camera.tsx, the depth-of-field veil: `backdropFilter` and `WebkitBackdropFilter` removed; the plain dim veil (`veil(CAMERA_LIMITS.dofDim)`) and its mask stay, which is the plain overlay motion rule 10 asks for, so the only visible change is that the area outside the focus hole is no longer softened by 1.2 px. `dofBlurPx` is removed from CAMERA_LIMITS in src/config/camera.ts (no other user). (2) src/fx/Callout.tsx, the chip: `blur(10px)` and its Webkit twin removed; the chip fill is unchanged (glass 0.72 to 0.78 alpha), because stills show the text still reads. src/ui/theme.css lines 43 and 44 only force `backdrop-filter: none` inside `.film-app-layer` and stay. `grep -rn -i backdrop src scripts tools` now returns only those two lines, so the "no backdrop-filter" claim for the S2 cards holds repo-wide.
- Files outside patch 23's `owns` line touched in stage 3, only on the lines named above: src/fx/Camera.tsx, src/fx/Callout.tsx, src/config/camera.ts.
- Before and after stills at f2920, f3230 and f3500 (0.5 scale, out/s3-before and out/s3-after, gitignored): the callout chips ("Parallax from Earth's orbit", "Nearby: asteroid or comet", "Cross-matched to known") read the same on the starfield and on the panel.
- `node tools/audit-motion.mjs` after the fix: 10 scenes, 0 failures, 0 warnings, longest camera hold 30 frames.
- Step 5, honesty list, looked at on stills rendered from the final code (out/s3-honesty): S5 f2560 shows 148/150 and f2600 shows 148/150 next to 107/150 with the explanation line; S6 f3230 shows the "Nearby object: asteroid or comet" verdict with its callout and f3340 shows the caption "A distant fit is a candidate. Never a detection."; S7 f3500 and f3700 show the "saved in this browser only" pill and the status line "Saved in this browser (no shared store is configured)."; S8 f3850 shows the REAL, SIMULATED and LIMITED columns with the "Prototype, not a discovery tool" footer text in the app layer, f4000 shows the "Simulated · practice field" pill, 148 of 150 and 107 of 150, and f4140 shows the prototype badge under the caption "Nothing here claims a detection." The strings exist in src/config/copy.ts (`badges.simulated`, `badges.prototype`), src/ui/PanelFlags.tsx and src/gfx/LimitsCard.tsx. No fix was needed.
- Deferred Requests, decisions:
  - [11] reference-layers selector in src/data/select.ts: NOT applied, left as a note. No scene reads it (PanelContext keeps its own three-entry copy) and select.ts is a typed contract over the captured evidence; adding an unused selector changes nothing on screen.
  - [12] orbit polyline and measured and predicted angles in `parallax.measuredPair.fit`: NOT applied, left as a note. It needs the evidence regenerated from real data (scripts/capture-evidence.mjs), and S6 already draws the six-month shift as a scale bracket. The "25-25 AU" range is the `rangeAu` of the measured pair, which is a near fit (`dminAu` 25); the range is printed only for the distant verdict, and the film shows the near verdict, so it never appears on screen.
  - [17] `knownReveal` viewer field and a Known objects tick-box focus rect: NOT applied, left as a note for the final handoff. The viewer slice of filmState is a frozen contract.
  - [16, 18, 19] optional "for patch 23 to judge" items: left unchanged. No defect from them showed in the stills reviewed in stages 2 and 3; the stage 4 contact sheets for S3, S5 and S6 are where one would show.

Stage 4 - preview render and contact sheets (spec step 6): DONE.
- Render: `npx remotion render src/index.ts SpherexFilm out/preview.mp4 --scale=0.25 --concurrency=2` with the sandbox Chromium. It finished with no warnings or errors in the log. ffprobe: h264 video 480x270, 4500 frames, 150.0 s, and an aac audio track of the same length (the audio files were built first with `npm run sfx`). out/ is gitignored, so the video is not in the patch.
- Contact sheets: `node scripts/make-sheets.mjs --scene S0` to `--scene S9`, every 15 frames, 6 columns, scale 0.25, written to out/sheets/ (gitignored). All ten sheets were looked at, sampled every 15 frames at that size, so they show scene flow, captions, framing and the scene joins, not fine detail.
- What the sheets show: S0 and S1 open on the star field and title, with the cue captions where the timeline puts them; S2 the counters, the colour-band card and the day-by-day field swap; S3 the Pluto-trick caption, blink and overlay, and the best-pair caption; S4 the hunt, the selected point and the mover check; S5 the check against the sky, 148/150 and then 107/150 under "The stricter check is honest too."; S6 the parallax diagram, the lab, the six-month bracket, the near verdict and the closing caption "A distant fit is a candidate. Never a detection."; S7 the flag, the cross-match chip, the export captions and the browser-only wording; S8 the three columns, the hatch, and the prototype badge under "Nothing here claims a detection."; S9 the lockup, links and credit text, fading to the dark ground by f4499. No blank stretch, no frozen scene and no jump at a scene start was seen in any sheet.
- Not checked by this stage: playback by eye at speed, and the audio mix (patch 24 owns it).
- Nothing in src changed in stage 4. `node tools/ledger.mjs done 23 "Continuity and motion pass, all four stages"` was run; patch 24 is now ready.

- Environment is not persistent. In a fresh container run `npm install` (not `npm ci`: the lock file is out of sync with package.json, restore it with `git checkout package-lock.json` afterwards), `git clone --depth 1 https://github.com/Unavailable4u/spherex-blink.git <dir>`, then `node scripts/fetch-assets.mjs --from <dir>` and `npm run sfx`. Chromium for stills is at /opt/pw-browsers/chromium-1243/chrome-linux64/chrome; `node tools/shots.mjs SpherexFilm <frames> <outdir> 0.5 <chrome>` renders named stills and `node scripts/check-stills.mjs --frames <list> --scale 0.5 --browser <chrome>` runs the pass checks.

### PATCH 24 (Audio sync and mix) - done

- Files: src/config/sfx.ts, src/audio/FilmAudio.tsx, docs/bible/bible-09.md. scripts/make-sfx.mjs and src/config/timeline.ts are unchanged: the nine WAV files are the same as before.
- SFX_CUES is now 106 cues (70 hits and 36 pulses) built from CUES and the cursor waypoints: 9 whooshes at the scene starts; 3 risers at f240, f2640 and f4140; 1 thud at f735 (both S2 stat numerals lock at 690 + 45); 1 hatch at f3810; 15 blink ticks f1140 to f1280 every 10 frames at gain 0.25; 15 clicks, one per click waypoint in FILM_CURSOR; 14 chimes, one per Callout (6 verdict callouts at 0.5, the other 8 at 0.32); 12 caption ticks at 0.22; the pulses as before. The full table is in docs/bible/bible-09.md.
- Changes from the spec: (1) caption ticks are 0.22, not very soft: at 0.1 they were only 3.5 dB over the drone at f3540, and 0.22 gives 10.3 dB at the worst frame, which the 10 dB rule needs. (2) 7 caption ticks are left out because a whoosh or a blink tick already marks the frame (f600, 1230, 1680, 2220, 2700, 3420, 3780). (3) The chimes for s3.calloutStars and s3.calloutJump move 3 frames later to clear the blink ticks on f1170 and f1200. (4) Drone gain stays 0.35 (set in patch 04). The fade-out is applied in FilmAudio through `droneGainAt` (smoothstep over 3 s, zero at f4480) so that the last 20 frames are silent; the WAV's own 3 s fade ends on the last frame and would have left sound there. The WAV is not changed.
- src/config/sfx.ts now imports FILM_CURSOR from ../scenes so that every click sound sits on the real click frame. It throws on load if two hits (the pulse excluded) are closer than 3 frames or if any cue sounds into the last 20 frames. Callout and caption frames come from CUES, not from the scenes; they match today (every Callout and Caption `startFrame` in the ten scenes was evaluated and compared). A scene that moves one of them off its CUES value needs the same edit in sfx.ts.
- Checked: `npx tsc --noEmit` clean; `node tools/ledger.mjs check` clean; `node scripts/make-sfx.mjs --check` passes; `node tools/audit-motion.mjs` 10 scenes, 0 failures, 0 warnings; added lines grepped clean (comments, TODO, timers, requestAnimationFrame, Date.now, Math.random, backdrop-filter, transition); `git diff --check` clean.
- Mix measured on an offline sum of the drone and every cue at these gains (throwaway script, not committed): true peak -6.0 dBFS, integrated -28.1 LUFS, loudness range 12.4 LU. Every hit is at least 10 dB above the drone's RMS in a 0.4 s window around it; lowest margins: caption tick 10.3 dB (f3540), note chime 14.3 dB (f3000), click 17.2 dB (f3114), blink tick 17.7 dB (f1220).
- Rendered with scripts/render.mjs: f1136-1195 (60 frames, h264 and aac, audio 2.005 s). Its audio matches the offline mix at lag 0 with correlation 1.000, and the click at f1136, the ticks at f1140 to f1190 and the chime at f1173 are where the cue list puts them. f4380-4499: the drone fades out and f4480-4499 are digital silence.
- Not checked: listening in the studio or on speakers (no audio output in the sandbox), so the balance is measured, not heard. The integrated loudness is about 8 LU under the bible-09 target of about -20 LUFS; raising it needs a drone gain above 0.35 or louder hits. Left for patch 25 to decide after listening.
- Requests: none.
