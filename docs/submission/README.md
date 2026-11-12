# SPHEREx Blink Comparator: demo film

NASA Space Apps 2026, challenge "Planet X and SPHEREx".

Real infrared images of one patch of sky. Find what moves.

## What the video shows

A 150.00 second film of the SPHEREx Blink Comparator web app working on real SPHEREx Quick Release 2 data. It follows the app's own workflow: flip between infrared observations of one patch of sky taken on different days, spot the dot that moves, check it against the pixels and the known sky, see why a distant body would show parallax from Earth's orbit, flag a candidate and export it. It ends on what is real, what is simulated and what is limited. The app is a prototype and the film claims no discovery.

Live app: https://unavailable4u.github.io/spherex-blink/
Repository: https://github.com/Unavailable4u/spherex-blink

## Files

| File | What | Frames | Length |
|---|---|---|---|
| out/spherex-blink-film-1080p.mp4 | Full film, 1920x1080, H.264, AAC audio | 4500 | 150.00 s |
| out/spherex-blink-film-4k.mp4 | Same film at 3840x2160 | 4500 | 150.00 s |
| out/spherex-blink-film-30s.mp4 | Short cut of eight segments of the film | 900 | 30.00 s |
| docs/submission/captions.srt | English subtitles for the full film | | |
| docs/submission/captions-30s.srt | English subtitles for the 30 second cut | | |

The out/ folder is build output and is not committed. Rebuild with `npm run assets -- --from ../spherex-blink`, `npm run sfx`, then `node scripts/render.mjs`, `node scripts/render.mjs --4k` and `node scripts/render.mjs --cut30`.

The film has no spoken narration. Both subtitle files mirror the text shown on screen (captions, callouts, title and end card). The long data acknowledgement on the end card is not subtitled; its full text is in credits.md.

## Scenes (seconds = frame / 30)

| Scene | Seconds | Frames | Shows |
|---|---|---|---|
| S0 Hook | 0.00 to 10.00 | 0 to 299 | A field of stars that stand still, and one dot that jumps. |
| S1 Title | 10.00 to 20.00 | 300 to 599 | Title card: SPHEREx Blink Comparator. Real infrared images of one patch of sky. Find what moves. |
| S2 Data | 20.00 to 36.00 | 600 to 1079 | SPHEREx scans the whole sky in 102 infrared colours. The app holds 20 real fields and 219 real frames; each field shows a handful of colours seen on different days. |
| S3 Blink | 36.00 to 56.00 | 1080 to 1679 | The blink comparator on real frames of one patch of sky. Stars stay put, one dot jumps. The Best pair button picks two frames days apart in similar colour. |
| S4 Inspect | 56.00 to 74.00 | 1680 to 2219 | Known objects off, hunt blind, click the dot. The app snaps to the centroid and checks that the dot is gone from the other frames, then checks it against the known layer. |
| S5 Check | 74.00 to 90.00 | 2220 to 2699 | The reality check finds the known asteroid in the pixels: Pallas in 13 of 13 frames, 148 of 150 across 16 asteroid fields, and 107 of 150 under the stricter check. |
| S6 PlanetX | 90.00 to 114.00 | 2700 to 3419 | Why a distant planet barely moves while Earth does, parallax from Earth's orbit, and the Planet X lab fitting a distance to a measured mover. The measured mover is the asteroid Pallas and the app's verdict is a nearby object. |
| S7 Flag | 114.00 to 126.00 | 3420 to 3779 | Flag it, cross-matched to known objects, export as CSV or JSON. Flags are saved in this browser only. |
| S8 Limits | 126.00 to 140.00 | 3780 to 4199 | What is real, what is simulated, what is limited. No coverage is a hatch, not black. Nothing here claims a detection. |
| S9 Outro | 140.00 to 150.00 | 4200 to 4499 | Lockup, the live app link, the repository link and the data acknowledgement. |

## The 30 second cut

| From scene | Frames | Seconds in the full film |
|---|---|---|
| S0 Hook | 0 to 119 | 0.00 to 4.00 |
| S3 Blink | 1170 to 1289 | 39.00 to 43.00 |
| S4 Inspect | 1800 to 1919 | 60.00 to 64.00 |
| S5 Check | 2310 to 2429 | 77.00 to 81.00 |
| S6 PlanetX | 2880 to 2999 | 96.00 to 100.00 |
| S6 PlanetX | 3150 to 3269 | 105.00 to 109.00 |
| S7 Flag | 3480 to 3539 | 116.00 to 118.00 |
| S9 Outro | 4260 to 4379 | 142.00 to 146.00 |

## Space Apps demo requirements

Read on 11 November 2026 from the Project Submission Guide on spaceappschallenge.org (the 2025 edition, dated 3 October 2025; the 2026 edition is scheduled for 13 November 2026):

- The demo is required and is either a video up to 30 seconds or a slide deck of up to seven slides.
- Video demos must include English subtitles.
- The demo is hosted on an external site (for example YouTube or Google Drive) and the link must be public with no login.
- Projects that exceed the length limits are not eligible for Global Judging.

For that reason the 30 second cut with captions-30s.srt is the file to use as the project demo, and the 150.00 second film is the full walkthrough to link from the detailed project description. Read the 2026 guide on 13 November and confirm the limits have not changed before submitting.

Submission window for 2026 (spaceappschallenge.org/2026): opens Saturday 14 November at 9:00 a.m. and closes Sunday 15 November at 11:59 p.m., local time of the team's event.

The project form also has a Use of Artificial Intelligence field; answer it on the project page according to the team's actual use.

## Companion documents

- credits.md: data acknowledgement, picture credits, fonts, links
- honesty.md: what is real, simulated and limited, and what the film does not claim
