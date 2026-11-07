---
id: 02
title: Graphics: HookField (S0 star field) and Mark (logo)
group: gfx
weight: 4
needs: 00
owns: src/gfx/HookField.tsx, src/gfx/Mark.tsx, src/dev/sheets/DevGfxHook.tsx
paste: src/gfx/HookField.tsx, src/gfx/Mark.tsx, src/config/theme.ts, src/config/timeline.ts, src/config/copy.ts, src/lib/prng.ts, src/lib/ease.ts, src/lib/spring.ts
ref: web/index.html:17-40
bible: 01, 02, 03, 06, 10
appendix: 
---
PATCH 02 - Graphics for S0 and S1/S9. Replace src/gfx/HookField.tsx and src/gfx/Mark.tsx completely, and add src/dev/sheets/DevGfxHook.tsx (a DevSheet, composition id "DevGfxHook", 300 frames, that renders HookField with start 0 and end 299).

HookField (props are FROZEN: { frame: number; start: number; end: number }, frame is the GLOBAL frame): full-bleed 1920x1080 on theme.hookBg. About 140 stars from the seeded PRNG (src/lib/prng.ts), sizes 1 to 3.2 px, a few brighter with a soft glow; slow deterministic drift (under 0.15 px per frame) and a very slight twinkle. Timeline relative to `start` (S0 is 0-299): stillness until +150; from +150 to +209 the field flickers between epoch one and epoch two every 5 frames (3 Hz): identical stars, except ONE dot (choose one mid-bright star near the upper-right third) which is at position P1 in epoch one (amber ghost) and P2 in epoch two (cyan ghost), P2 about 120 px away on a diagonal; from +210 the dot stays at P2, a ring (circle, 1.6 px stroke, amber) draws on around it over 18 frames and the dot gets a faint dashed trail from P1 to P2. A callout is drawn by the scene, not by you, so export a helper `hookDotPoints(): { p1: {x:number;y:number}; p2: {x:number;y:number} }` in stage coordinates so the scene can aim a Callout at it. Bottom-left small mono label "Illustration" (theme.ink3, 20 px) visible from +240. Slow camera-like scale push of the whole field from 1.00 to 1.04 across the scene. Fully deterministic: no Math.random.

Mark (props FROZEN-ADD: { size: number; color?: string; draw?: number }): keep the exact SVG already in the stub (it is the real app's logo: viewBox 0 0 38 38). Add `draw` (0..1, default 1): at 0 nothing is visible; the outer circle and the two ellipses draw on with stroke-dasharray/dashoffset (use getTotalLength-free math: compute path lengths by formula; circumference 2*pi*17.5; ellipse perimeter with the Ramanujan approximation), then the centre dot scales in, then the small amber dot (theme.accent) pops with overshoot. Never redraw the logo differently; only animate it.

CHECK: npx tsc --noEmit; open composition DevGfxHook in npm run studio; render stills at f0, f149, f155, f175, f215, f299 and confirm: all stars identical between epochs except the one dot; ring drawn at f215; no Math.random; the label "Illustration" visible from f240.
