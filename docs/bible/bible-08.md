# 08 - Camera and focus

Focus names are in `src/config/focus.ts` (`FOCUS_NAMES`); rectangles are in the 1600x900 logical app space and derived from the real layout (header 70, rail 252, centre 956, panel 392; the sky figure is 608 px square with a 58 px left ruler and 30 px top ruler).

fullWindow, header, rail, bandPlates, blinkControls, layers, keys, centre, figure, skyImage, caption, timeBar, panel, tabs, inspectMeta, moverCheck, flagForm, flagList, contextField, realityCheck, referenceBlend, skyMapCard, pxLab, pxDistance, pxOutput, pxMeasure, orreryCard.

Rules: use `kf(frame, name, { padding, scaleBias, rotateX, rotateY, ease, frames })`; `holdShot(frame, end, name, ...)` for holds. Scale is limited to 1.0 to 2.6. See `docs/guide/motion-rules.md`. If a UI patch changes where a card sits inside the app, it reports the new rectangle under "Requests" (focus.ts is not editable by it); until then keep every card inside its current focus rectangle.

Use `src/dev/sheets/DevFocusMap.tsx` (composition `DevFocusMap`) to see the rectangles over the app.
