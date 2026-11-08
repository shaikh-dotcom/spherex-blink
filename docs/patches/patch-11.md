---
id: 11
title: UI: Context pane (PanelContext, SkyMapCard)
group: ui
weight: 8
needs: 00, 01
owns: src/ui/PanelContext.tsx, src/ui/SkyMapCard.tsx, src/dev/sheets/DevContext.tsx
paste: src/config/filmState.ts, src/config/theme.ts, src/config/focus.ts, src/config/timeline.ts, src/data/types.ts, src/data/select.ts, src/lib/ease.ts, src/lib/spring.ts, src/ui/FilmApp.tsx, src/ui/Stub.tsx, src/ui/theme.css, src/ui/PanelContext.tsx, src/ui/SkyMapCard.tsx
ref: web/index.html:169-192, web/css/style.css:1815-1874, web/js/controls.js:85-100, web/js/skymap.js, web/js/reference.js
bible: 02, 04, 05, 10, 11
appendix: A
---
Common rules for every UI patch: the component is a PURE function of its `state` prop and of the global frame where animation is needed (use useCurrentFrame only for ambient motion; reveal values come from state). It draws in the app's 1600x900 logical space and is positioned by FilmApp through the focus rects, so it must fill exactly the box FilmApp gives it (width and height 100 percent, no outside margins). Port the real app's markup, class names, wording and CSS from the reference files; keep the real look (CMU Serif and CMU Typewriter Text, the app palette mapped to theme.ts). Put the CSS for your component in src/ui/theme.css ONLY inside a block you add at the end of the file between the lines `.sb-<name>-begin{}` and `.sb-<name>-end{}` selectors (no comments), so parallel patches never touch the same lines. No transitions, no animation property, no backdrop-filter, no timers, no Math.random. Every number and string that is data comes from src/data/select.ts. You may ADD fields with defaults to your own slice, never rename or remove existing ones. Keep the exports `XState`, `X_DEFAULT`, component names exactly as in the stub. Add `src/dev/sheets/Dev<Name>.tsx` (a DevSheet showing your component at 3 or 4 states) to inspect it alone.

When finished, in docs/LEDGER.md under Handoff entries add a block for your patch listing: files, FINAL slice fields (name, type, meaning, default), the focus names your component occupies, and any Request for shared files (never edit them yourself).

PATCH 11 - Replace src/ui/PanelContext.tsx and src/ui/SkyMapCard.tsx.

PanelContext: "This field" card (title, target, bands, frames, size in degrees, from selectFields / selectPallas), "Reality check" card (state.validationReveal): "Pallas found in 13 of 13 frames", rms offset 0.57 px (3.5 arcsec) from pallas.validation.summary, the across-fields line "148 of 150 frames in 16 asteroid fields" and the stricter line "107 of 150" with the app's honest explanatory sentence (controls.js 94 and the context pane markup; do not hide the weaker number), and "Compare with other eyes": the reference blend slider showing state.referenceBlend as its value, with the reference credit line (from public/sky/credits.json via selectors or a literal import of that JSON if no selector exists; request a selector in your ledger entry if you add one). reveal fades the pane.

SkyMapCard: the all-sky map card (port skymap.js): a Milky Way backdrop (public/sky/milkyway.jpg), the 20 real fields as dots from selectFields (ra, dec), the Pallas field ringed, a legend; showKnown toggles the known-object markers. Equirectangular or the app's own projection; port it exactly.

CHECK: npx tsc --noEmit; composition DevContext; stills with validationReveal 0, 0.5, 1; referenceBlend 0 and 0.6; skymap showKnown true and false.
