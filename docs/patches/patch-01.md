---
id: 01
title: Fetch assets: fonts, tiles, reference pictures (human step, no model)
group: foundation
weight: 1
needs: 00
owns: public/*
paste: none
ref: none
bible: none
appendix: none
---
HUMAN STEP. No prompt. Needs a local clone of https://github.com/Unavailable4u/spherex-blink next to this repo (for example ../spherex-blink).

1. `npm run evidence:check` (the starter's evidence is already real; this only confirms it).
2. `npm run assets -- --from ../spherex-blink` copies the CMU fonts, every Pallas tile PNG (13 frames) and the six-month Pallas tiles, the reference pictures, planet pictures, Milky Way image and credits into public/. It prints counts and ends with "Complete."
3. `npm run evidence:final-check` must say 0 failures (warnings about the pair being chosen by rule are expected until you confirm Best pair in the live app).
4. CONFIRM THE PAIR: open https://unavailable4u.github.io/spherex-blink/, field "Pallas patch", band D1, press Best pair. If it picks frames other than the ones in docs/bible/appendix-A.md, run `npm run evidence -- --repo ../spherex-blink --pair idA,idB` with the ids the app shows, then `npm run assets -- --from ../spherex-blink`.
5. `npm run studio` and open composition SpherexFilm: the dashed boxes must show, and the console must NOT say fonts failed to load.
6. `node tools/ledger.mjs done 01 "assets fetched, pair confirmed"`.

Other patches can be coded without the tiles, but every still they render of the real UI needs this step first, which is why the UI patches depend on 01.
