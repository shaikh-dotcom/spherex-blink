# HANDOFF: spherex-blink-film

Deterministic Remotion motion video (1920x1080, 30 fps, 4500 frames = 150 s) for the NASA Space Apps 2026 project spherex-blink (https://github.com/Unavailable4u/spherex-blink). Structure mirrors the minilocker-film repo. Rules for every contributor: no code comments, no author or tool attribution anywhere, no Co-Authored-By trailers, every on-screen number from src/data/select.ts, no timers, CSS transitions, Date.now, backdrop-filter or unseeded Math.random.

Read in this order: docs/guide/context-header.md, docs/LEDGER.md (live status and the handoff entries of finished patches), docs/bible/bible-04.md (frozen contract), then your patch in docs/patches/patch-NN.md. `node tools/make-prompt.mjs NN` builds a ready prompt in prompts-out/.

## 1. Status: 17 of 26 patches done (about 56 percent of the effort, 1320 of 4500 scene frames)

| Patch | What | State |
|---|---|---|
| 00 | Starter: config, FX toolkit, evidence, frozen contract, stubs, tools, bible | DONE |
| 01 | Assets fetched, Best pair confirmed | DONE (public/ is gitignored: run `npm run assets -- --from ../spherex-blink` on each machine) |
| 02 | gfx HookField + Mark | DONE |
| 03 | gfx ParallaxDiagram + LimitsCard | DONE |
| 04 | Audio: make-sfx.mjs, sfx.ts (71 cues), FilmAudio | DONE |
| 05 | render.mjs, check-stills.mjs | DONE and audited (`--cut30` verified at 900 frames, `--4k` verified) |
| 06 | make-sheets.mjs, tools/audit-motion.mjs | DONE and audited (audit passes on S0, S1, S8, S9; S2 to S7 are still stubs and fail the hold check) |
| 13, 14 | Scenes S0 Hook, S1 Title | DONE (stills checked, motion audit clean; S1 was coded against the bible-04 slice table because UI patches 07-12 are not finished, patch 23 rechecks it) |
| 21, 22 | Scenes S8 Limits, S9 Outro | DONE (stills checked, motion audit clean; Request for patch 23 in the ledger: fade Grain and Vignette over 4470-4499) |
| 07, 08 | UI: Header+TimeBar, Rail | DONE (stills checked on DevHeaderTime and DevRail; TimeBar and Rail slices gained a `fieldId` field, see the ledger) |
| 09 | UI: SkyViewer (tile canvases, blink, overlay, known layer, selection, marks, Planet X track, rulers, HUD, caption) | DONE (tsc clean; DevSkyViewer stills and film frames 598 and 1100 checked; adds slice fields `refLayer` and `coach`) |
| 10 | UI: Inspect pane (PanelTabs, PanelInspect, PanelFlags) | DONE (tsc clean; DevInspect stills checked; adds flags fields `exportPulse` and `statePulse`; Requests for patch 23 in the ledger: flag rects and panel background) |
| 11 | UI: Context pane (PanelContext, SkyMapCard) | DONE (tsc clean; DevContext stills checked; adds context fields `acrossReveal`, `strictReveal`, `refReveal` and `refLayer`, see the ledger) |
| 12 | UI: Planet X pane (PanelPlanetX, PanelOrrery) | DONE (tsc clean; DevPlanetX stills checked; adds planetx fields `reveal`, `sixReveal`, `marks`, `markPulse`, `fitKind` and orrery field `dirReveal`, see the ledger; Requests for patch 23 in the ledger: focus rects and orbit/angle evidence) |
| 15, 16 | Scenes S2, S3 | TODO, can start now (07, 08, 09 done) |
| 17, 20 | Scenes S4, S7 | TODO, can start now (09, 10 done) |
| 18 | Scene S5 | TODO, can start now (09, 11 done) |
| 19 | Scene S6 | TODO, can start now (03, 09, 12 done) |
| 23 | Continuity and motion pass | TODO after all scenes and 06 |
| 24 | Audio sync and mix | TODO after 04 (done) and 23 |
| 25 | Final QA, renders, submission files | TODO after 05, 06, 24 |

Remaining: 76 of 173 effort units. Longest remaining chain: 19 -> 23 -> 24 -> 25.

Ready now, all parallel (separate sessions or models): 15, 16, 17, 18, 19, 20. Run `node tools/ledger.mjs next` for the live list.

## 2. What exists

- src/config: theme, timeline (SCENES, CUT_FRAMES, CUES), copy, camera, focus (27 focus rects), filmState (frozen), sfx.
- src/data: evidence.json (REAL capture, spherex-blink commit f525fd5), types, select (typed selectors).
- src/fx, src/lib: motion toolkit. src/gfx: HookField, Mark, ParallaxDiagram, LimitsCard (finished). src/audio/FilmAudio.tsx (finished).
- src/ui: SkyViewer (+ src/ui/viewer/*) is FINISHED (patch 09; exports `tileToFigure` and `tileToApp` for aiming callouts). Header, TimeBar and Rail are FINISHED (patches 07, 08). PanelTabs, PanelInspect and PanelFlags are FINISHED (patch 10; PanelInspect exports `INSPECT_SPLIT`). PanelContext and SkyMapCard are FINISHED (patch 11). PanelPlanetX and PanelOrrery are FINISHED (patch 12). FilmApp.tsx is already wired.
- src/scenes: S0Hook, S1Title, S8Limits and S9Outro are FINISHED (patches 13, 14, 21, 22). S2Data ... S7Flag are STUBS exporting `SN_CAMERA`, `SN_CURSOR`, `SN_STATE` and an overlay; index.ts wires all of them.
- scripts: make-sheets (`npm run sheets -- --scene S3 --every 4`), capture-evidence, validate-evidence (`--final`), fetch-assets, make-sfx (`npm run sfx`, `sfx:check`), render (`--4k`, `--frames`, `--cut30`, `--from/--to`, `--browser`), check-stills.
- tools: audit-motion.mjs (`npm run motion`, run it after every scene patch), ledger.mjs (`sync|status|next|start|done|block|check`), make-prompt.mjs, lib.mjs, shots.mjs (render named stills of any composition: `node tools/shots.mjs SpherexFilm 300,600 out/shots 0.5 <chrome>`).
- docs: guide/ (context-header, motion-rules, checklist, 00-read-first), bible/ 01-11 + appendix-A, patches/ 00-25, LEDGER.md.

## 3. Frozen contract and facts (details in bible-04, bible-06, bible-10)

- Scenes: S0 0-299, S1 300-599, S2 600-1079, S3 1080-1679, S4 1680-2219, S5 2220-2699, S6 2700-3419, S7 3420-3779, S8 3780-4199, S9 4200-4499. 120 BPM: beat 15 f.
- Each UI file owns its slice; each scene file owns its `SN_*` exports. Shared files (config, fx, lib, data, FilmApp, scenes/index.ts, Root) change only in integration patch 23 via Requests written in ledger entries.
- Key evidence: 20 real fields, 1 simulated, 219 real frames, 16 asteroid fields; Pallas D1/D2/D4/D5, 13 frames; pair 2025-10-07_2337 to 2025-10-09_0811 (D1, 1.357 d; confirmed by re-implementing the app's bestPair score); pick pixel (602,318); 13/13 Pallas, 148/150 across fields, 107/150 strict; 500 AU parallax 3.49 px in window, 127.1 px (781.6 arcsec) over six months; measured pair 908.9 arcsec, fit kind `near` ("Nearby object: asteroid or comet").
- Honesty: prototype, no discovery claims; show the near verdict; flags are "saved in this browser only"; simulated field always labelled; no coverage is a hatch.

## 4. How to run things

```
npm install
npx tsc --noEmit
npm run assets -- --from ../spherex-blink     fonts, tiles, refs into public/
npm run sfx                                    audio into public/audio/
npm run studio
node scripts/check-stills.mjs --frames 0,300 --browser <chrome>
node scripts/render.mjs --from 0 --to 59 --browser <chrome>
```
In a sandbox without internet, Remotion cannot download its own Chrome: pass `--browser <path to chromium>` or set REMOTION_BROWSER.

## 5. Known issues and open items

1. `node scripts/render.mjs --cut30` is verified: 900 frames, video 30.000 s, audio 30.011 s, yuv420p tv range bt709, fade to ink at the end. The ranges are 0-119, 1170-1289, 1800-1919, 2310-2429, 2880-2999, 3150-3269, 3480-3539, 4260-4379. A full run takes about 5 minutes and asserts the frame count itself.
2. `evidence:final-check` prints two WARN lines (pair "chosen by rule"). Expected; the pair was verified by replication, not by clicking the live app. Optionally press Best pair in the live app (field Pallas patch, band D1) to confirm.
3. LimitsCard has no Ceres row on purpose (the app does not explain Ceres). Patch 21 did not add one.
4. Check the Space Apps submission page for any video length limit; none was found in the judging guide.
5. Patch 06 was audited on S0, S1, S8, S9 and on synthetic camera tracks; S2 to S7 are still stubs. Re-run `npm run motion` after each scene patch.

## 6. Next steps for whoever continues

1. `npm install`, `npm run assets -- --from ../spherex-blink`, `npm run sfx`.
2. Run the scenes S2, S3, S4, S5, S6 and S7 (15, 16, 17, 18, 19, 20; 19 is on the critical path), in parallel where possible: `node tools/ledger.mjs start NN`, build the prompt, apply the result, run the patch's CHECK, `node tools/ledger.mjs done NN "note"`, add a ledger block.
3. Then 23, 24, 25.
