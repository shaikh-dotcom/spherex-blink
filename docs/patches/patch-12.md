---
id: 12
title: UI: Planet X pane (PanelPlanetX, PanelOrrery)
group: ui
weight: 10
needs: 00, 01
owns: src/ui/PanelPlanetX.tsx, src/ui/PanelOrrery.tsx, src/dev/sheets/DevPlanetX.tsx
paste: src/config/filmState.ts, src/config/theme.ts, src/config/focus.ts, src/config/timeline.ts, src/data/types.ts, src/data/select.ts, src/lib/ease.ts, src/lib/spring.ts, src/ui/FilmApp.tsx, src/ui/Stub.tsx, src/ui/theme.css, src/ui/PanelPlanetX.tsx, src/ui/PanelOrrery.tsx
ref: web/index.html:193-215, web/css/style.css:1875-1927, web/js/motion.js, web/js/parallax.js, web/js/orrery.js
bible: 02, 04, 05, 10, 11
appendix: A
---
Common rules for every UI patch: the component is a PURE function of its `state` prop and of the global frame where animation is needed (use useCurrentFrame only for ambient motion; reveal values come from state). It draws in the app's 1600x900 logical space and is positioned by FilmApp through the focus rects, so it must fill exactly the box FilmApp gives it (width and height 100 percent, no outside margins). Port the real app's markup, class names, wording and CSS from the reference files; keep the real look (CMU Serif and CMU Typewriter Text, the app palette mapped to theme.ts). Put the CSS for your component in src/ui/theme.css ONLY inside a block you add at the end of the file between the lines `.sb-<name>-begin{}` and `.sb-<name>-end{}` selectors (no comments), so parallel patches never touch the same lines. No transitions, no animation property, no backdrop-filter, no timers, no Math.random. Every number and string that is data comes from src/data/select.ts. You may ADD fields with defaults to your own slice, never rename or remove existing ones. Keep the exports `XState`, `X_DEFAULT`, component names exactly as in the stub. Add `src/dev/sheets/Dev<Name>.tsx` (a DevSheet showing your component at 3 or 4 states) to inspect it alone.

When finished, in docs/LEDGER.md under Handoff entries add a block for your patch listing: files, FINAL slice fields (name, type, meaning, default), the focus names your component occupies, and any Request for shared files (never edit them yourself).

PATCH 12 - Replace src/ui/PanelPlanetX.tsx and src/ui/PanelOrrery.tsx.

PanelPlanetX: the "Planet X lab": the distance slider (30 to 1000 AU) set to state.distanceAu with its readout, the output lines built from selectShift(distanceAu) (snap to the nearest of the 8 table rows): window px and arcsec, six-month px and arcsec, the multiplier; "Measure a mover" block (state.measureReveal): Mark A, Mark B buttons, the measured separation from parallax.measuredPair (measuredPx, measuredArcsec, daysApart) and the fit line state.fitReveal reveals, built in the app's wording for fit.kind: "near" -> "Nearby object: asteroid or comet. It moved far more than any body beyond <dminAu> AU can through parallax (even at <dminAu> AU the shift would be <predictedAtDminArcsec>″)." (motion.js 85-90); also implement the wordings for "still", "distant", "misfit" from motion.js so the component is complete. state.outReveal reveals the output block.

PanelOrrery: the "Solar system" card: top-down orrery from evidence.orrery (bodies: arrays of [x,y] per step from mjd0; step days), drawn at state.day (index = (day / step) rounded, clamped), orbit trails as thin ivory curves, planets as dots with the app's labels, Earth highlighted, the violet dashed direction line "a distant Planet X would lie somewhere along it" from the field's ecliptic direction (use pallas.pick.ecliptic.lon), playing toggles the play glyph only (no motion of its own; the scene drives `day`). sqrt radial scale like the app. reveal fades the card.

CHECK: npx tsc --noEmit; composition DevPlanetX; stills for distanceAu 30, 100, 500, 1000; fit reveal 0 and 1; orrery day 0, 90, 180.
