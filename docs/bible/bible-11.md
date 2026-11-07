# 11 - Source map (the real app, in the spherex-blink repo)

Paths are inside the spherex-blink repo (give `--repo <clone>` to `npm run prompt`). Line ranges are for the current main (commit in appendix A). The real source is the truth for layout, wording and behaviour: port it; do not reinvent it.

| Film component | Real source |
|---|---|
| Design tokens (colours, fonts) | web/css/style.css 1-157 |
| Header, brand logo, field select, Tour, About | web/index.html 17-40; web/css/style.css 158-228, 1391-1420 |
| Rail: band plates, Blink, Layers, Keys | web/index.html 41-80; web/css/style.css 229-505, 513-619, 1421-1544; web/js/controls.js 1-120 |
| Sky viewer: figure, rulers, HUD, caption | web/index.html 81-124; web/css/style.css 620-888, 1376-1390, 1545-1615; web/js/axes.js; web/js/renderer.js; web/js/known.js |
| Time bar | web/index.html 125-137; web/css/style.css 952-1007, 1616-1635 |
| Panel tabs, Inspect card, mover check | web/index.html 138-152; web/css/style.css 1008-1233, 1636-1706; web/js/controls.js 236-300 |
| Flags: form, match note, list, export | web/index.html 153-168; web/css/style.css 1707-1814; web/js/flagging.js; web/js/controls.js 325-380 |
| Context: field card, Reality check, other eyes | web/index.html 169-184; web/css/style.css 1815-1874; web/js/controls.js 85-100; web/js/reference.js |
| Sky map card | web/js/skymap.js; web/css/style.css 1815-1874 |
| Planet X lab, Measure a mover | web/index.html 193-204; web/css/style.css 1875-1927; web/js/motion.js; web/js/parallax.js |
| Solar system card (orrery) | web/index.html 205-215; web/js/orrery.js |
| About list (limits wording for S8) | web/index.html 238-256 |
| Logo SVG | web/index.html 18-26 |

Real wording the film may reuse (built from evidence values in code): mover-check verdicts (web/js/controls.js 249-259), Planet X fit lines (web/js/motion.js 85-90), flag match note (web/js/controls.js 365), About list (web/index.html 244-250), flag status wording (web/js/controls.js 328-332, 364-369), known-object label (web/js/known.js 24).
