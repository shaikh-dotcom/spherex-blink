# APPENDIX A - Evidence values (captured; the film reads them from src/data/evidence.json, never from this file)

This appendix is a human-readable snapshot so you can see what the film will say. If it disagrees with evidence.json, evidence.json wins; re-run `npm run evidence` and regenerate this appendix by hand.

Source: spherex-blink commit `f525fd5be8ccfb3a929337d0add8c1be287bdde6`. Data release: SPHEREx Quick Release 2 (QR2), DOI 10.26131/IRSA652.

## Overview (S2)
- Real fields: 20. Simulated practice fields: 1. Real frames: 219 (plus 16 simulated). Fields with a known asteroid target: 16.
- Survey passes of the six-month field: 2025-04, 2025-10, 2026-04.

## Pallas field (the star of the film)
- Target: (2) Pallas. Centre RA 303.443371, Dec 2.665365. Tile 1024 x 1024 px, 1.749 deg, 6.1488 arcsec per pixel.
- Bands in this field: D1, D2, D4, D5. Frames: 13.

## The blink pair (S3, S4)
- Band D1, chosen by: rule. A = `2025-10-07_2337` (2025-10-07T23:37:57Z, 0.751 um). B = `2025-10-09_0811` (2025-10-09T08:11:32Z, 0.8052 um).
- 1.357 days apart; wavelengths differ by 7.0 %; shared footprint at most 60 %.
- CONFIRM IN THE LIVE APP that Best pair picks these two frames. If not, re-run `npm run evidence -- --repo <clone> --pair idA,idB`.

## The clicked mover (S4)
- Frame `2025-10-07_2337`, pixel (602, 318), centroid (602.38, 318.21), ephemeris prediction (602.46, 318.15).
- RA 20h 13m 09.1s, Dec +02° 59′ 43.8″ (decimal 303.287938, 2.995491). Galactic l 45.3139, b -16.6417. Ecliptic lon 306.3379, lat 22.3338.
- Signal to noise 83.3. Brightness at the stretch ceiling: a lower limit (saturated 8-bit peak); flux shown as 16.8 MJy / sr.
- Mover check in the app compares this spot with the other D1 frames at least an hour away (3 of them): gone from all of them, so the verdict is it moves.

## Reality check (S5)
- Pallas: found in 13 of 13 frames, rms offset 0.57 px (3.5 arcsec), median 0.25 px, max 1.64 px.
- Across 16 asteroid fields: found in 148 of 150 frames; the stricter 'also gone from that pixel in the other frames' check passes in 107 of 150.
- Per field (detected / checked, gone elsewhere):
  - (5) Astraea: 13 / 13, 10
  - (1) Ceres: 7 / 8, 0
  - (511) Davida: 5 / 5, 5
  - (15) Eunomia: 14 / 14, 10
  - (19) Fortuna: 14 / 14, 6
  - (6) Hebe: 4 / 4, 0
  - (10) Hygiea: 4 / 4, 0
  - (7) Iris: 14 / 14, 12
  - (3) Juno: 6 / 6, 0
  - (20) Massalia: 4 / 4, 0
  - (9) Metis: 12 / 12, 12
  - (2) Pallas: 13 / 13, 13
  - (11) Parthenope: 14 / 14, 14
  - (16) Psyche: 14 / 14, 14
  - (4) Vesta: 6 / 7, 7
  - (12) Victoria: 4 / 4, 4
- Honest note for S5: Juno, Hebe, Hygiea and Massalia move only about 2 to 11 px in their windows so they cannot pass the stricter check, and Ceres passes 0 of 8 despite moving far (not yet explained). The film must not hide this; it may simply say the stricter check is honest about it.

## Planet X parallax (S6)
- Window: 2025-10-07T23:37:57Z to 2025-10-14T10:33:12Z (6.46 days). Six months = 182.6 days. Pixel scale 6.1488 arcsec.
| Distance AU | Shift in the window (arcsec / px) | Shift over six months (arcsec / px) | Six months vs window |
|---|---|---|---|
| 30 | 356.41 / 57.96 | 12773.6 / 2077.4 | x35.8 |
| 50 | 214.13 / 34.82 | 7727.9 / 1256.8 | x36.1 |
| 100 | 107.17 / 17.43 | 3888.2 / 632.3 | x36.3 |
| 200 | 53.61 / 8.72 | 1950.2 / 317.2 | x36.4 |
| 300 | 35.75 / 5.81 | 1301.5 / 211.7 | x36.4 |
| 500 | 21.45 / 3.49 | 781.6 / 127.1 | x36.4 |
| 750 | 14.3 / 2.33 | 521.3 / 84.8 | x36.4 |
| 1000 | 10.73 / 1.74 | 391 / 63.6 | x36.5 |

- Headline (500 AU): 3.49 px in the window, 127.1 px over six months (x36.4).
- The known asteroid moves 27.9 arcsec per hour in this field.
- Measuring the picked pair (the asteroid, not a planet): 908.9 arcsec (147.8 px) in 1.36 days, sigma 3.51 arcsec. Fit kind: **near**. At the nearest modelled distance (25 AU) the parallax shift would still be only 94 arcsec.
- The app words this exactly: "Nearby object: asteroid or comet. It moved far more than any body beyond 25 AU can through parallax (even at 25 AU the shift would be 94″)." The film shows THIS result. It never shows a made-up distant candidate.
- Detection limit of the tool in this field: about 1073 AU (sigma 3.53 arcsec).

## Flags (S7)
- CSV columns: region, frame, band, epoch, ra, dec, category, verdict, note, created. Categories: asteroid, comet, planet candidate, other.

## Acknowledgement (S9)
```
This publication makes use of data products from the Spectro-Photometer for the History of the Universe, Epoch of Reionization and Ices Explorer (SPHEREx), which is a joint project of the Jet Propulsion Laboratory and the California Institute of Technology, and is funded by the National Aeronautics and Space Administration. Images retrieved from the NASA/IPAC Infrared Science Archive (IRSA), Quick Release 2 (QR2), DOI 10.26131/IRSA652.
```
