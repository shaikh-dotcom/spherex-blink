# spherex-blink-film

Deterministic Remotion motion video for the spherex-blink project (NASA Space Apps 2026, Planet X and SPHEREx): 1920x1080, 30 fps, 4500 frames (150 s). The film drives a re-creation of the real app from one state object and a virtual camera, with every number taken from real data captured from the app's own code.

Live app: https://unavailable4u.github.io/spherex-blink/
Repo: https://github.com/Unavailable4u/spherex-blink

## Quick start

```
npm install
npx tsc --noEmit
npm run studio
```

Work is split into patches in docs/patches/. Start with docs/guide/00-read-first.md and docs/LEDGER.md.

## Layout

- src/config: theme, timeline, copy, camera, focus rects, FilmState
- src/data: evidence.json and typed selectors
- src/fx, src/lib: motion toolkit
- src/ui: the app components, one slice of state each
- src/gfx: explainer graphics
- src/scenes: S0 to S9
- scripts, tools: evidence, assets, render, ledger, prompt builder
- docs: bible, guides, patches, ledger
