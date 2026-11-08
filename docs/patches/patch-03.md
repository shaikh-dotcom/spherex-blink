---
id: 03
title: Graphics: ParallaxDiagram (S6) and LimitsCard (S8)
group: gfx
weight: 6
needs: 00
owns: src/gfx/ParallaxDiagram.tsx, src/gfx/LimitsCard.tsx, src/dev/sheets/DevGfxExplain.tsx
paste: src/gfx/ParallaxDiagram.tsx, src/gfx/LimitsCard.tsx, src/config/theme.ts, src/config/timeline.ts, src/config/copy.ts, src/data/select.ts, src/data/types.ts, src/lib/ease.ts, src/lib/spring.ts
ref: web/index.html:238-256, web/js/parallax.js, web/css/style.css:1096-1233
bible: 01, 02, 05, 10
appendix: A
---
PATCH 03 - Explainer graphics. Replace src/gfx/ParallaxDiagram.tsx and src/gfx/LimitsCard.tsx completely and add src/dev/sheets/DevGfxExplain.tsx (two DevSheets in one file is not allowed: export one `devSheet` that shows ParallaxDiagram for 120 frames then LimitsCard for 180).

ParallaxDiagram (props FROZEN: { progress: number; distanceAu: number }, size 900x520 px, draws in its own coordinate box): a clean top-down plate. The Sun at the centre; Earth's orbit as a thin ivory circle; Earth as a small dot that moves along the orbit as `progress` goes 0 to 1 (about a quarter of an orbit, then the label "six months later" moves it to the opposite side: use progress 0 to 0.5 for the first quarter and 0.5 to 1 for the half orbit); a distant body far outside the orbit (violet, theme.planetX) that does NOT move; two thin dashed sight lines from Earth's two positions to the body, and a short arc at the far end showing the tiny angle between them. As `distanceAu` rises from 30 to 1000 the angle shrinks (scale the drawn far distance with sqrt(distance), like the app's orrery). Labels in small caps mono: "Earth, day 0", "Earth, six months later", "Planet X (simulated)", "tiny shift"; bottom-left "Illustration". No numbers typed in: if you want to print an angle, derive it from selectShift(distanceAu): the rows exist for 30, 50, 100, 200, 300, 500, 750, 1000 AU, so snap to the nearest row.

LimitsCard (props FROZEN: { progress: number }, size 1500x560): three columns on hairline rules, headings in small caps: REAL, SIMULATED, LIMITED (copy.s8.columns). Rows appear one by one as progress goes 0 to 1 (each row rises 12 px with the signature ease). Content (every number from evidence, wording from the app's About list, web/index.html 244-250 given as reference): REAL: "20 real fields, 219 real frames" from selectOverview, "SPHEREx Quick Release 2" from selectMeta().dataRelease, "Known asteroid found on its predicted spot in 148 of 150 frames" from selectValidationAll().totals. SIMULATED: "One practice field with planted movers" (selectOverview().simulatedFields) always with the Badge look of badges.simulated. LIMITED: "Each field keeps 2 to 6 of the six detectors D1-D6: a handful of the 102 colours", "A sample of the sky, not the whole survey", "The stricter check (also gone from that pixel elsewhere) passes in 107 of 150 frames" from selectValidationAll().totals.moversConfirmed, "Slow asteroids barely move in their window, so they cannot pass it" (the app's own explanation; do not add a Ceres row, the app does not explain Ceres), "Tiles are 8-bit stretched pictures: brightness is approximate". Use theme.good for the REAL ticks, theme.planetX is NOT used here, theme.bad with theme.hatchBad for the LIMITED column marks, theme.warn for SIMULATED. Include a small hatch swatch captioned "No coverage" drawn with theme.hatchNoData on theme.sunken.

CHECK: npx tsc --noEmit; composition DevGfxExplain; stills at f0, f60, f119 (diagram at three progress values) and f130, f160, f299 (limits card growing); verify every digit on screen is produced by a selector and that no row overflows its column.
