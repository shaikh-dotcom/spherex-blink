# HANDOFF: spherex-blink-film

Deterministic Remotion motion video (1920x1080, 30 fps, 4500 frames = 150 s) for the NASA Space Apps 2026 project spherex-blink (https://github.com/Unavailable4u/spherex-blink). Structure mirrors the minilocker-film repo. Rules for every contributor: no code comments, no author or tool attribution anywhere, no Co-Authored-By trailers, every on-screen number from src/data/select.ts, no timers, CSS transitions, Date.now, backdrop-filter or unseeded Math.random.

Read in this order: docs/guide/context-header.md, docs/LEDGER.md (live status and the handoff entries of finished patches), docs/bible/bible-04.md (frozen contract), then your patch in docs/patches/patch-NN.md. `node tools/make-prompt.mjs NN` builds a ready prompt in prompts-out/.

## 1. Status: 23 of 26 patches done (about 88 percent of the effort, 4500 of 4500 scene frames)

| Patch | What | State |
|---|---|---|
| 00 | Starter: config, FX toolkit, evidence, frozen contract, stubs, tools, bible | DONE |
| 01 | Assets fetched, Best pair confirmed | DONE (public/ is gitignored: run `npm run assets -- --from ../spherex-blink` on each machine) |
| 02 | gfx HookField + Mark | DONE |
| 03 | gfx ParallaxDiagram + LimitsCard | DONE |
| 04 | Audio: make-sfx.mjs, sfx.ts (71 cues), FilmAudio | DONE |
| 05 | render.mjs, check-stills.mjs | DONE and audited (`--cut30` verified at 900 frames, `--4k` verified) |
| 06 | make-sheets.mjs, tools/audit-motion.mjs | DONE and audited (audit passes on all 10 scenes) |
| 13, 14 | Scenes S0 Hook, S1 Title | DONE (stills checked, motion audit clean; S1 was coded against the bible-04 slice table because UI patches 07-12 are not finished, patch 23 rechecks it) |
| 21, 22 | Scenes S8 Limits, S9 Outro | DONE (stills checked, motion audit clean; Request for patch 23 in the ledger: fade Grain and Vignette over 4470-4499) |
| 07, 08 | UI: Header+TimeBar, Rail | DONE (stills checked on DevHeaderTime and DevRail; TimeBar and Rail slices gained a `fieldId` field, see the ledger) |
| 09 | UI: SkyViewer (tile canvases, blink, overlay, known layer, selection, marks, Planet X track, rulers, HUD, caption) | DONE (tsc clean; DevSkyViewer stills and film frames 598 and 1100 checked; adds slice fields `refLayer` and `coach`) |
| 10 | UI: Inspect pane (PanelTabs, PanelInspect, PanelFlags) | DONE (tsc clean; DevInspect stills checked; adds flags fields `exportPulse` and `statePulse`; Requests for patch 23 in the ledger: flag rects and panel background) |
| 11 | UI: Context pane (PanelContext, SkyMapCard) | DONE (tsc clean; DevContext stills checked; adds context fields `acrossReveal`, `strictReveal`, `refReveal` and `refLayer`, see the ledger) |
| 12 | UI: Planet X pane (PanelPlanetX, PanelOrrery) | DONE (tsc clean; DevPlanetX stills checked; adds planetx fields `reveal`, `sixReveal`, `marks`, `markPulse`, `fitKind` and orrery field `dirReveal`, see the ledger; Requests for patch 23 in the ledger: focus rects and orbit/angle evidence) |
| 15 | Scene S2 Data | DONE (tsc clean; motion audit passes; stills at the cue frames checked; final shot is `centre` at zoom 1.3 so the time bar stays visible, see the ledger) |
| 16 | Scene S3 Blink | DONE (tsc clean; motion audit passes; stills at the cue frames and the blink A and B frames checked; the jump callout aims at the midpoint of the A and B asteroid positions, see the ledger) |
| 17 | Scene S4 Inspect | DONE (tsc clean; motion audit passes; stills at the cue frames checked; wide whole-window shots at the untick, snap and re-tick so the rail tick box and the card are in frame, see the ledger) |
| 20 | Scene S7 Flag | DONE (tsc clean; motion audit passes; stills at the cue frames checked; click at f3474 with flag at f3478; last shot stays on flagList so the caption sits on clear ground; Requests for patch 23 in the ledger: flag rects and the S8 cursor hide waypoint) |
| 18 | Scene S5 Check | DONE (tsc clean; motion audit passes; stills at the cue frames checked; 148 of 150 and 107 of 150 both on screen in a card shot; predicted-position crosses drawn by the scene overlay; reference blend 0 to 0.6 to 0 on the slider; Request for patch 19 in the ledger: S6 must open from fullWindow scale 1.19) |
| 19 | Scene S6 Planet X | DONE (tsc clean; motion audit passes on all 10 scenes; stills at the cue frames checked; Earth-orbit diagram ends at f2818 so it never sits over the lab text; six-month shift drawn as a 127 px scale bracket by the scene overlay because the orbit evidence has no Earth position for 2025-04 to 2026-04; near verdict on screen about 210 frames; honest beat framed on orreryCard 1.25; Requests for patch 23 in the ledger: S6 to S7 tab cut, per-button focus rects, orrery evidence range) |
| 23 | Continuity and motion pass | IN PROGRESS, stages 1 and 2 of 4 done (see "Patch 23 stages" below and the PATCH 23 block in the ledger) |
| 24 | Audio sync and mix | TODO after 04 (done) and 23 |
| 25 | Final QA, renders, submission files | TODO after 05, 06, 24 |

Remaining: 20 of 173 effort units. Longest remaining chain: 23 -> 24 -> 25.

Ready now: nothing new. Patch 23 is in progress and runs in four stages, one per session; continue it at stage 3. Patches 24 and 25 wait for it.

### Patch 23 stages

Patch 23 is split because one session cannot do all of it. After each stage, add the result to the PATCH 23 block in docs/LEDGER.md, update this section, and produce a patch file (`git diff` of tracked files only; `public/` holds fetched assets and generated manifests and stays out).

| Stage | Spec steps | State |
|---|---|---|
| 1 | Step 1 (apply the Requests that touch focus rects, theme, FilmApp, Grain, Vignette, CUES, the S8 cursor), step 3 audit, step 4 on the added lines | DONE: tsc clean, ledger check clean, motion audit 10 of 10 scenes pass, stills compared before and after |
| 2 | Step 2: render the last frame of each scene and the first of the next at the nine boundaries and fix any jump in app state, camera pose or cursor | DONE: camera and cursor continuous at all nine; S5 to S6, S6 to S7 and S7 to S8 fixed; check-stills passes on all 18 boundary frames; audit still 0 failures |
| 3 | Steps 4 and 5 in full: grep the whole repo for comments, timers, transitions, Date.now, backdrop-filter, Math.random; verify the honesty list (S6 near verdict, S5 148/150 and 107/150, S7 browser-only wording, S8 simulated label, prototype text); decide the deferred Requests | TODO |
| 4 | Step 6: preview render at 0.25 scale to out/preview.mp4, contact sheets per scene, then `node tools/ledger.mjs done 23` | TODO |

Stage 1 applied: Grain and Vignette fade to zero over 4470-4499 (new `CUES.s9.fade`, last frame is exactly the paper colour); flagForm, flagList, pxLab and pxOutput focus rects corrected; the right panel now has its background and left rule; S8 no longer has a cursor waypoint (it caused a one-off cursor blip at f3773-3787).

Stage 2 applied (entry and exit lines of S6, S7, S8 only; camera keyframes untouched): S6 now holds the S5 exit state (Context pane, crosshair, fading cursor) until f2720 and switches to Planet X once the diagram has dimmed the app; S6 ends with a cursor click on the Inspect tab at f3416 and S7 reveals the Inspect pane over 20 frames from f3420 (the S7 cursor fade-in at f3438 is gone, the cursor goes from the tab to Flag it); S8 opens from the S7 exit state instead of the app defaults, so the flag panel no longer blanks at f3780. Residual: the selection crosshair on Pallas appears on f3420 together with the pane change.

Left for later stages: stage 3 is the repo-wide hygiene greps, the honesty check on real frames (S6 near verdict, S5 148/150 and 107/150, S7 browser-only wording, S8 simulated label, prototype text) and the decision on the deferred Requests (reference-layers selector, orbit polyline and angles in the evidence, a viewer `knownReveal` field, optional scene notes; listed in the ledger block with the reasons). Stage 4 is the 0.25-scale preview render, the contact sheets and `node tools/ledger.mjs done 23`.

Environment for the next stage (nothing persists between sessions; `node scripts/check-stills.mjs --frames <list> --scale 0.5 --browser <chrome>` runs the pass checks): `npm install` and then `git checkout package-lock.json` (`npm ci` fails on this lock file); clone https://github.com/Unavailable4u/spherex-blink.git anywhere and run `node scripts/fetch-assets.mjs --from <that clone>` and `npm run sfx`; stills: `node tools/shots.mjs SpherexFilm <frames> <outdir> 0.5 <chrome>` with Chromium at /opt/pw-browsers/chromium-1243/chrome-linux64/chrome.

## 2. What exists

- src/config: theme, timeline (SCENES, CUT_FRAMES, CUES), copy, camera, focus (27 focus rects), filmState (frozen), sfx.
- src/data: evidence.json (REAL capture, spherex-blink commit f525fd5), types, select (typed selectors).
- src/fx, src/lib: motion toolkit. src/gfx: HookField, Mark, ParallaxDiagram, LimitsCard (finished). src/audio/FilmAudio.tsx (finished).
- src/ui: SkyViewer (+ src/ui/viewer/*) is FINISHED (patch 09; exports `tileToFigure` and `tileToApp` for aiming callouts). Header, TimeBar and Rail are FINISHED (patches 07, 08). PanelTabs, PanelInspect and PanelFlags are FINISHED (patch 10; PanelInspect exports `INSPECT_SPLIT`). PanelContext and SkyMapCard are FINISHED (patch 11). PanelPlanetX and PanelOrrery are FINISHED (patch 12). FilmApp.tsx is already wired.
- src/scenes: all ten scenes are FINISHED (S0Hook, S1Title, S2Data, S3Blink, S4Inspect, S5Check, S6PlanetX, S7Flag, S8Limits, S9Outro; patches 13 to 22); index.ts wires all of them.
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
5. Patch 06 was audited on S0, S1, S8, S9 and on synthetic camera tracks; S2 to S7 pass too, so the full audit is clean for the first time. Re-run `npm run motion` after every change in patch 23.

## 6. Next steps for whoever continues

1. `npm install`, `npm run assets -- --from ../spherex-blink`, `npm run sfx`.
2. Run the continuity and motion pass (23, on the critical path): `node tools/ledger.mjs start 23`, build the prompt with `node tools/make-prompt.mjs 23`, work through the Requests for shared files in the ledger entries (S6 ends on tabs.tab "planetx" and S7 starts on "inspect" with no tab click; per-button focus rects; the S5 and S8 requests), run the patch's CHECK, `node tools/ledger.mjs done 23 "note"`, add a ledger block.
3. Then 24, 25.
