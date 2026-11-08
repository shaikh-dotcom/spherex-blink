---
id: 07
title: UI: Header and TimeBar
group: ui
weight: 6
needs: 00, 01
owns: src/ui/Header.tsx, src/ui/TimeBar.tsx, src/dev/sheets/DevHeaderTime.tsx
paste: src/config/filmState.ts, src/config/theme.ts, src/config/focus.ts, src/config/timeline.ts, src/data/types.ts, src/data/select.ts, src/lib/ease.ts, src/lib/spring.ts, src/ui/FilmApp.tsx, src/ui/Stub.tsx, src/ui/theme.css, src/ui/Header.tsx, src/ui/TimeBar.tsx
ref: web/index.html:17-40, web/index.html:125-137, web/css/style.css:158-228, web/css/style.css:952-1007, web/css/style.css:1391-1420, web/css/style.css:1616-1635, web/css/style.css:1-157
bible: 02, 04, 11, 10
appendix: A
---
Common rules for every UI patch: the component is a PURE function of its `state` prop and of the global frame where animation is needed (use useCurrentFrame only for ambient motion; reveal values come from state). It draws in the app's 1600x900 logical space and is positioned by FilmApp through the focus rects, so it must fill exactly the box FilmApp gives it (width and height 100 percent, no outside margins). Port the real app's markup, class names, wording and CSS from the reference files; keep the real look (CMU Serif and CMU Typewriter Text, the app palette mapped to theme.ts). Put the CSS for your component in src/ui/theme.css ONLY inside a block you add at the end of the file between the lines `.sb-<name>-begin{}` and `.sb-<name>-end{}` selectors (no comments), so parallel patches never touch the same lines. No transitions, no animation property, no backdrop-filter, no timers, no Math.random. Every number and string that is data comes from src/data/select.ts. You may ADD fields with defaults to your own slice, never rename or remove existing ones. Keep the exports `XState`, `X_DEFAULT`, component names exactly as in the stub. Add `src/dev/sheets/Dev<Name>.tsx` (a DevSheet showing your component at 3 or 4 states) to inspect it alone.

When finished, in docs/LEDGER.md under Handoff entries add a block for your patch listing: files, FINAL slice fields (name, type, meaning, default), the focus names your component occupies, and any Request for shared files (never edit them yourself).

PATCH 07 - Replace src/ui/Header.tsx and src/ui/TimeBar.tsx.

Header: the real top bar: logo (reuse Mark from src/gfx/Mark.tsx at its default size), brand name with the lead and accent parts (brand.nameLead, brand.nameAccent in copy.ts), field select showing the title of state.fieldId (use selectFields to find it), the badge ("Real data · SPHEREx QR2" in theme good colour for real, "Simulated · practice field" in warn for simulated; texts from badges in copy.ts), the Tour and About buttons. state.tourPulse (0..1) adds an amber glow ring to the Tour button (use Glow or box-shadow computed from the value, no CSS animation).

TimeBar: the real timeline strip under the sky: one tick per frame of the Pallas field in date order (selectPallasFrames or the closest selector; add a selector to src/data/select.ts ONLY by requesting it in your ledger entry; otherwise derive it locally from evidence), epoch segments 1-3 as labelled bands (epochSeg highlights one), a playhead at state.position (0..1), UTC date labels under epoch boundaries, tick colour by band. state.reveal fades and lifts the whole bar in.

CHECK: npx tsc --noEmit; composition DevHeaderTime; stills with fieldId "pallas" real badge, fieldId of the simulated field with the warn badge, tourPulse 0 and 1, position 0 and 0.5 and 1.
