# 02 - Look

Source of truth: `src/config/theme.ts` (values taken from the real app's CSS variables, "observing plate" design system) and `src/ui/theme.css`.

- Ink background (`paper` #05060a, `sheet` #0a0c13), ivory text (`ink` #ece6d5), hairline rules (`rule` #222329). One amber accent (`accent` #f2a244) and cyan (`teal` #79c7d6; frame B blue `frameB` #5fc8ff).
- Meaning of colour: amber = frame A, the earlier date; cyan/blue = frame B, the later date; violet (`planetX` #d36bff, `info` #c8a6ff) = Planet X and information; vermilion (`bad` #ff5a47) with 135 degree hatching = problem or no coverage; `good` green = a passed check.
- Fonts: CMU Serif for text, CMU Typewriter Text for numbers, labels and code. Small labels in small caps (`.smcp`). Tabular lining numerals.
- Style: hairlines, ivory on ink, a scientific plate rather than a dashboard. No gradients except the faint corner glows already in `theme.appBackground`. No emoji, no icons that are not in the app.
- Stage: 1920x1080 stage, 1600x900 logical app, camera does the zooming.
- Type scale on the stage: hook 72, title 150, caption 56 to 76, callout 24, UI minimum 22, mono labels minimum 20. Safe margin 96 px. Caption baseline 110 px from the bottom.
- Grain and vignette are on, subtle. No lens flares, no light leaks.
