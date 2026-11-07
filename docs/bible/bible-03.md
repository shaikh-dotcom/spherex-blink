# 03 - Timeline

120 BPM: 1 beat = 15 frames, 1 bar = 60 frames, 75 bars, 4500 frames. Source of truth: `src/config/timeline.ts` (`SCENES`, `CUT_FRAMES`, `CUES`).

| Scene | Name | Frames | Seconds | One-line job |
|---|---|---|---|---|
| S0 | Hook | 0-299 | 10 | The sky stands still; one dot jumps |
| S1 | Title | 300-599 | 10 | Name, eyebrow, tagline |
| S2 | Data | 600-1079 | 16 | Real SPHEREx data: fields, frames, bands |
| S3 | Blink | 1080-1679 | 20 | Blink A and B; overlay; best pair |
| S4 | Inspect | 1680-2219 | 18 | Hunt blind, click, mover check, then known objects |
| S5 | Check | 2220-2699 | 16 | Reality check against the known asteroid |
| S6 | PlanetX | 2700-3419 | 24 | Parallax, six months, measure a mover |
| S7 | Flag | 3420-3779 | 12 | Flag, cross-match, export |
| S8 | Limits | 3780-4199 | 14 | Real, simulated, limited |
| S9 | Outro | 4200-4499 | 10 | One link, acknowledgement |

Cut frames (every scene cut and big reveal lands on one): 60, 150, 300, 420, 600, 1080, 1680, 2220, 2700, 3420, 3780, 4200.

`CUES` holds the nominal start frame of every caption, callout and badge. Keys mirror `copy` (`CUES.s3.calloutJump` is the frame for `copy.s3.calloutJump`). A scene may nudge a cue by up to 6 frames to land exactly on a beat; it must not change a cue by more than that. Scenes must not edit timeline.ts.
