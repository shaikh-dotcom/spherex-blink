---
id: 08
title: UI: Rail (band plates, Blink controls, Layers, Keys)
group: ui
weight: 6
needs: 00, 01
owns: src/ui/Rail.tsx, src/dev/sheets/DevRail.tsx
paste: src/config/filmState.ts, src/config/theme.ts, src/config/focus.ts, src/config/timeline.ts, src/data/types.ts, src/data/select.ts, src/lib/ease.ts, src/lib/spring.ts, src/ui/FilmApp.tsx, src/ui/Stub.tsx, src/ui/theme.css, src/ui/Rail.tsx
ref: web/index.html:41-80, web/css/style.css:229-505, web/css/style.css:513-619, web/css/style.css:1421-1544, web/js/controls.js:1-120
bible: 02, 04, 11, 10
appendix: A
---
Common rules for every UI patch: the component is a PURE function of its `state` prop and of the global frame where animation is needed (use useCurrentFrame only for ambient motion; reveal values come from state). It draws in the app's 1600x900 logical space and is positioned by FilmApp through the focus rects, so it must fill exactly the box FilmApp gives it (width and height 100 percent, no outside margins). Port the real app's markup, class names, wording and CSS from the reference files; keep the real look (CMU Serif and CMU Typewriter Text, the app palette mapped to theme.ts). Put the CSS for your component in src/ui/theme.css ONLY inside a block you add at the end of the file between the lines `.sb-<name>-begin{}` and `.sb-<name>-end{}` selectors (no comments), so parallel patches never touch the same lines. No transitions, no animation property, no backdrop-filter, no timers, no Math.random. Every number and string that is data comes from src/data/select.ts. You may ADD fields with defaults to your own slice, never rename or remove existing ones. Keep the exports `XState`, `X_DEFAULT`, component names exactly as in the stub. Add `src/dev/sheets/Dev<Name>.tsx` (a DevSheet showing your component at 3 or 4 states) to inspect it alone.

When finished, in docs/LEDGER.md under Handoff entries add a block for your patch listing: files, FINAL slice fields (name, type, meaning, default), the focus names your component occupies, and any Request for shared files (never edit them yourself).

PATCH 08 - Replace src/ui/Rail.tsx. The left rail with four sections: BAND plates (D1 to D6; only the bands in the current field are enabled, from selectPallasBands or equivalent; the active band is state.band, drawn with the amber active look), BLINK controls (the three modes static, blink A-B, overlay with state.mode active; rate chips 1, 2, 3, 5 Hz with state.rateHz active; the "Best pair" button), LAYERS (checkboxes: Known objects = showKnown, Detection mask = showMask, Snap to centroid = snap, Flags = showFlags), KEYS (the keyboard legend as KeyCap items from src/fx/KeyCap.tsx). state.hot highlights the named section with an amber outline and a soft Glow; null means none. Also expose a few anchor ids (data-anchor="blinkAB", "bestPair", "layerKnown", "bandD1".. "bandD6") on the real elements so scene authors can cross-check cursor targets; the focus rects in focus.ts remain the source for positions.

CHECK: npx tsc --noEmit; composition DevRail; stills for mode static, blink, overlay; hot null, "band", "blink", "pair", "layers", "keys"; showKnown on and off.
