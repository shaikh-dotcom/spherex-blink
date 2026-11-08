# Read first (human workflow)

1. `npm install`, then `npx tsc --noEmit` (must be clean) and `npm run studio`.
2. Patch 01 (human): clone https://github.com/Unavailable4u/spherex-blink next to this repo, then `npm run assets -- --from ../spherex-blink`. Open the live app, field Pallas patch, band D1, press Best pair, and confirm it matches docs/bible/appendix-A.md; if not, `npm run evidence -- --repo ../spherex-blink --pair idA,idB` and run assets again. Then `node tools/ledger.mjs done 01 "assets fetched"`.
3. See what can run now: `node tools/ledger.mjs next`.
4. For each ready patch, in its own session: `node tools/ledger.mjs start NN`, `node tools/make-prompt.mjs NN --repo ../spherex-blink --film-repo ../minilocker-film`, give prompts-out/patch-NN.md to a model, apply the files it returns.
5. Run the patch's CHECK line, then `node tools/ledger.mjs done NN "note"`. The model's ledger block goes under Handoff entries in docs/LEDGER.md.
6. Wave order and dependencies are in docs/LEDGER.md. Run all ready patches in parallel; never start a patch before its needs are done.
7. After scenes: patch 23 (continuity), 24 (audio), 25 (final renders and submission files).

Rules for every file: no code comments, no author or tool attribution, no timers or CSS transitions, every number from src/data/select.ts.
