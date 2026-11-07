# 04 - Architecture and the frozen contract

This is what lets many sessions work at the same time. Read it twice.

## 1. One persistent app, driven by one state object

`src/ui/FilmApp.tsx` (already written, not owned by any patch) renders the whole app from `FilmState`. `useFilmState(frame)` returns `DEFAULT_FILM_STATE` merged with `sceneState(frame)`; `sceneState` calls the `SN_STATE` function of the scene that owns the frame (`src/scenes/index.ts`, already written).

`FilmState` is composed of slices. EACH UI FILE OWNS ITS SLICE: it exports the interface `XState`, the default `X_DEFAULT`, and the component `X: React.FC<{ state: XState }>`. The slices at the start (frozen; owners may add fields with defaults but never rename or remove):

| FilmState key | Owner file | Fields |
|---|---|---|
| header | src/ui/Header.tsx | fieldId: string; badge: "real" or "simulated"; tourPulse: number (0..1 glow on the Tour button) |
| rail | src/ui/Rail.tsx | band: string ("D1".."D6"); mode: "static" or "blink" or "overlay"; rateHz: 1,2,3,5; showKnown, showMask, snap, showFlags: boolean; hot: null or "band" or "blink" or "pair" or "layers" or "keys" (which rail section is highlighted) |
| viewer | src/ui/SkyViewer.tsx | fieldId: string; pairA, pairB: frame ids; blinkPhase: 0..1 (below 0.5 shows A, otherwise B; the scene computes it from the frame, 3 Hz = 10 frames per half); zoom: number (1 = whole tile); cx, cy: 0..1 centre of the view in the tile; selection: null or {col,row} in tile pixels; overlayAB: boolean (amber and cyan overlay); view: "sky" or "solar"; refBlend: 0..1; pxDrawAu: null or distance in AU (draw the Planet X track); markA, markB: null or {col,row}; reveal: 0..1 |
| time | src/ui/TimeBar.tsx | position: 0..1 along the time bar; epochSeg: null or 1,2,3; reveal: 0..1 |
| tabs | src/ui/PanelTabs.tsx | tab: "inspect" or "context" or "planetx"; reveal: 0..1 |
| inspect | src/ui/PanelInspect.tsx | reveal: 0..1 (selected-point card); verdict: null or "none" or "fixed" or "moves" or "unclear"; verdictReveal: 0..1 |
| flags | src/ui/PanelFlags.tsx | formReveal, matchReveal, exportReveal: 0..1; category: string; flagged: number (how many flags in the list) |
| context | src/ui/PanelContext.tsx | reveal, validationReveal: 0..1; referenceBlend: 0..1 |
| skymap | src/ui/SkyMapCard.tsx | reveal: 0..1; showKnown: boolean |
| planetx | src/ui/PanelPlanetX.tsx | distanceAu: number (30..1000); outReveal, measureReveal, fitReveal: 0..1 |
| orrery | src/ui/PanelOrrery.tsx | reveal: 0..1; day: number (days from orrery.mjd0); playing: boolean |
| (top level) appOpacity | src/config/filmState.ts | 0..1 opacity of the whole app (0 in S0, ramps in at the end of S1) |

A scene patch sets only the slices it needs, through `SN_STATE`. It sets values as pure functions of the global frame (use `interpolate`, `spr`, `mapRange`). A UI component never decides story: it draws what the state says.

Which slice fields exist is whatever the owner patch finished with. Before you write a scene, read the owners' ledger entries in `docs/LEDGER.md` (they list the final slice fields).

## 2. State handoff between scenes

Scenes are written in parallel by different sessions, so each scene must SET EVERYTHING IT DEPENDS ON in its first frame, and must leave the app in the "exit state" below in its last 30 frames, so the next scene starts cleanly. Defaults apply to anything not set.

| Scene | Entry state (set it yourself in your first frame) | Exit state (reach it by your last frame) |
|---|---|---|
| S0 Hook | appOpacity 0 | appOpacity 0 |
| S1 Title | appOpacity 0, ramps to 1 over f570-f599 | appOpacity 1; header.fieldId "pallas"; viewer.fieldId "pallas"; pair = evidence pair; tabs.tab "inspect"; rail.band = pair band; viewer.zoom 1 |
| S2 Data | as S1 exit | rail.band = pair band; viewer showing pair A at zoom 1; time.position 0; tabs.tab "inspect" |
| S3 Blink | as S2 exit | rail.mode "static"; viewer.overlayAB false; viewer.blinkPhase 0 (A shown); viewer zoom 1; rail.showKnown true |
| S4 Inspect | as S3 exit | viewer.selection = the pick; inspect verdict "moves"; rail.showKnown true; tabs.tab "inspect"; zoom 1 |
| S5 Check | as S4 exit | tabs.tab "context"; context.referenceBlend 0 |
| S6 PlanetX | tabs.tab "context" -> switches to "planetx" itself | tabs.tab "planetx"; viewer.fieldId "pallas"; viewer.pxDrawAu null; markA, markB null; orrery.reveal 1 |
| S7 Flag | tabs.tab "inspect" (it switches itself); viewer.fieldId "pallas"; selection = the pick | tabs.tab "inspect"; flags.flagged 1 |
| S8 Limits | app dims to appOpacity 0.15 under the LimitsCard overlay | appOpacity 0 |
| S9 Outro | appOpacity 0 | final black |

## 3. Scene file contract

Each scene file `src/scenes/SnName.tsx` exports exactly: `SN_CAMERA: CameraKeyframe[]`, `SN_CURSOR: CursorWaypoint[]`, `SN_STATE: (frame: number) => FilmStatePatch`, and the overlay component named in the stub. The stubs are already in the repo and wired in `src/scenes/index.ts`; a scene patch REPLACES its stub file completely and never edits index.ts.

- `SN_CAMERA` covers the scene's whole frame range with `kf(frame, focusName, opts)`; the first keyframe is at the scene's first frame, starts from the previous scene's last pose.
- `SN_CURSOR` waypoints are in logical app coordinates (0..1600 x 0..900); the cursor is global and drawn above the app.
- The overlay component is mounted for the whole film; it must return null outside its frame range (the stub shows how, via `SCENES`). It draws captions, callouts, badges, stat numerals and explainer graphics at stage coordinates (1920x1080).
- Callouts take `target` as a focus name or a point, and `camera={SN_CAMERA}` so they follow the camera.

## 4. Shared files nobody may edit inside a patch

`src/config/timeline.ts`, `src/config/copy.ts`, `src/config/focus.ts`, `src/config/camera.ts`, `src/config/theme.ts`, `src/config/filmState.ts`, `src/fx/*`, `src/lib/*`, `src/ui/FilmApp.tsx`, `src/SpherexFilm.tsx`, `src/Root.tsx`, `src/scenes/index.ts`, `src/data/*`. They are the starter. If a patch needs a change, it writes a "Request" in its ledger entry; the continuity patch (23) applies requests in one pass. (Exception: a patch may ADD a key to `copy.ts` or `focus.ts` only if its front matter lists that file under `owns`.)

## 5. Dev sheets

`src/dev/sheets/*.tsx` are Remotion compositions registered automatically (`src/dev/registry.ts`). Each exports `devSheet: DevSheet`. A patch may add a sheet file named after itself (for example `DevSkyViewer.tsx`) to look at its component in isolation; these are dev only and are never part of the film.
