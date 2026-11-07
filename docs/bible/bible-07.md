# 07 - Copy

All copy lives in `src/config/copy.ts` (already written): `urls`, `brand`, `badges`, `s0`..`s9`. Captions are at most two lines, at most 7 words per line, sentence case, full stops. Callouts at most 5 words. No exclamation marks.

Words the film uses for the product: "SPHEREx Blink Comparator" (full name, S1 and S9), "the app" or "the tool" (elsewhere). For results: "moves", "gone from the other frames", "found in the pixels", "nearby object: asteroid or comet", "candidate" (only for a distant fit, only as a possibility), "known object".

If a patch needs new copy, it ADDS keys to `copy.ts` only when copy.ts is in its `owns`; otherwise it puts the proposed strings in its ledger "Requests". Scene patches 13 to 22 own their scene file only; the copy they need is already in copy.ts. Strings with digits are built from evidence at render time.
