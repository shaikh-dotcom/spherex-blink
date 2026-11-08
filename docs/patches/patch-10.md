---
id: 10
title: UI: Inspect pane (PanelTabs, PanelInspect, PanelFlags)
group: ui
weight: 10
needs: 00, 01
owns: src/ui/PanelTabs.tsx, src/ui/PanelInspect.tsx, src/ui/PanelFlags.tsx, src/dev/sheets/DevInspect.tsx
paste: src/config/filmState.ts, src/config/theme.ts, src/config/focus.ts, src/config/timeline.ts, src/data/types.ts, src/data/select.ts, src/lib/ease.ts, src/lib/spring.ts, src/ui/FilmApp.tsx, src/ui/Stub.tsx, src/ui/theme.css, src/ui/PanelTabs.tsx, src/ui/PanelInspect.tsx, src/ui/PanelFlags.tsx
ref: web/index.html:138-168, web/css/style.css:1008-1233, web/css/style.css:1636-1706, web/css/style.css:1707-1814, web/js/controls.js:236-300, web/js/controls.js:325-380, web/js/flagging.js
bible: 02, 04, 05, 10, 11
appendix: A
---
Common rules for every UI patch: the component is a PURE function of its `state` prop and of the global frame where animation is needed (use useCurrentFrame only for ambient motion; reveal values come from state). It draws in the app's 1600x900 logical space and is positioned by FilmApp through the focus rects, so it must fill exactly the box FilmApp gives it (width and height 100 percent, no outside margins). Port the real app's markup, class names, wording and CSS from the reference files; keep the real look (CMU Serif and CMU Typewriter Text, the app palette mapped to theme.ts). Put the CSS for your component in src/ui/theme.css ONLY inside a block you add at the end of the file between the lines `.sb-<name>-begin{}` and `.sb-<name>-end{}` selectors (no comments), so parallel patches never touch the same lines. No transitions, no animation property, no backdrop-filter, no timers, no Math.random. Every number and string that is data comes from src/data/select.ts. You may ADD fields with defaults to your own slice, never rename or remove existing ones. Keep the exports `XState`, `X_DEFAULT`, component names exactly as in the stub. Add `src/dev/sheets/Dev<Name>.tsx` (a DevSheet showing your component at 3 or 4 states) to inspect it alone.

When finished, in docs/LEDGER.md under Handoff entries add a block for your patch listing: files, FINAL slice fields (name, type, meaning, default), the focus names your component occupies, and any Request for shared files (never edit them yourself).

PATCH 10 - Replace src/ui/PanelTabs.tsx, src/ui/PanelInspect.tsx, src/ui/PanelFlags.tsx.

PanelTabs: the three tabs (Inspect, Context, Planet X; the real app has three tabs, flags live inside Inspect) with the active underline for state.tab; the underline position is a pure function of the tab (the film switches by changing state; for the slide look the scene can set the tab and the component draws the underline at the final place, no motion needed). reveal fades the strip.

PanelInspect: the "Selected point" card: RA/Dec in hms/dms, galactic and ecliptic, band, UTC, wavelength, brightness with the lower-limit marker, from evidence.pallas.pick (selectPick). Empty state wording from the app when nothing is selected. The Mover check block: state.verdict null shows nothing; "none" "fixed" "moves" "unclear" show the app's verdict text and colour (controls.js 249-259; "moves" = "Gone from the other N frames" style wording built from pick.moverCheck.otherFrames). state.reveal fades the selected card; verdictReveal the verdict block.

PanelFlags: the flag form (category select with selectFlagCategories, note field, "Flag it" button), the match note ("This matches a known object: (2) Pallas. Good catch. It is catalogued, so it is not a new discovery." - the real wording in controls.js 364-369), the flag list with state.flagged rows (the first row built from the pick), the CSV and JSON export buttons and a CSV preview strip with the header from selectFlagColumns, the flag-mode pill reading "saved in this browser only" and the status line "Saved in this browser (no shared store is configured)." (controls.js 328-332). formReveal, matchReveal, exportReveal fade each block in. Nothing may claim flags are shared.

The panel body is shown by FilmApp when tab is "inspect": PanelInspect and PanelFlags are stacked in one pane; read FilmApp.tsx to see how they are laid out and stay inside the boxes it gives you.

CHECK: npx tsc --noEmit; composition DevInspect; stills for: nothing selected, selected with verdict "moves", form shown, match note shown, export shown; every digit traceable to evidence.
