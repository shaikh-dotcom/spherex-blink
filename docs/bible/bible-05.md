# 05 - Evidence rules

`src/data/evidence.json` is captured by `npm run evidence -- --repo <clone of spherex-blink>` from the real tile manifests, `sky.json`, `validation.json`, `orrery.json` and the app's own `parallax.js` and `wcs.js`. It is already captured (real, not a sample) in the starter. Typed in `src/data/types.ts`; read ONLY through `src/data/select.ts`.

Selectors (all throw a clear error naming the missing path): `selectMeta`, `selectOverview`, `selectFields`, `selectPallas`, `selectPallasFrames(band?)`, `selectFrame(id)`, `selectPair()` -> `{info, a, b}`, `selectPick()`, `selectTargetPosition(frameId)`, `selectValidationFrame(frameId)`, `selectPallasValidation()`, `selectValidationAll()`, `selectSixMonth()`, `selectParallax()`, `selectShift(distanceAu)`, `selectOrrery()`, `selectAcknowledgement()`, `selectFlagColumns()`, `selectFlagCategories()`, `selectEvidenceShortId()`, `formatUtc(utc)`, `formatWavelength(frame)`.

A patch that needs a value the selectors do not give may ADD a selector to `src/data/select.ts` only if its front matter owns that file; otherwise it puts a "Request" in its ledger block. No patch owns select.ts or evidence.json in the first waves; the continuity patch (23) may add selectors on request.

Tile images: `staticFile(frame.file)` (for example `tiles/pallas/D1/2025-10-07_2337.png`). They are 8-bit PNGs, already stretched; areas with no data are transparent and must be painted as the hatch (`theme.hatchNoData`), never black. Reference pictures: `ref/<region>/...`; planet pictures: `planets/...`; WCS: `tiles/<region>/wcs.json`. All copied by `npm run assets`.

Things that may be typed into copy.ts: only the words in `src/config/copy.ts`. Anything with a digit in it must come from evidence.

Real-app wording the film may reuse verbatim (it is the app's own text; copy it from the source, with the source line given in bible-11): the mover-check verdicts, the Planet X lab result lines, the flag-match note, the About list. When reused, it is a string built in the component from evidence values, not typed numbers.
