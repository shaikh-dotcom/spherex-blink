# Honesty statement

SPHEREx Blink Comparator is a prototype working on a sample of the sky. It does not claim a discovery.

## What is real

- Real SPHEREx data from Quick Release 2: 20 real fields and 219 real frames, shown as the app shows them.
- The reality check finds a known asteroid in the pixels. Pallas is found on its predicted spot in 13 of 13 frames (rms offset 0.57 px). Across 16 asteroid fields it is found in 148 of 150 frames.
- Every number on screen is read from evidence captured from the app's own code (src/data/evidence.json, app commit f525fd5).

## What is simulated

- 1 practice field with 16 frames is simulated and is always labelled "Simulated · practice field" on screen.
- The Planet X lab's tracks at a chosen distance are simulated and carry the app's label "Planet X @ d AU (simulated)".
- The opening star field and the parallax diagram are illustrations and are labelled as such.

## What is limited

- Each field holds only 2 to 6 of the six detectors, a handful of the 102 colours. The data is a sample of the sky, not the whole survey.
- The stricter check (the dot is gone from that pixel in the other frames too) passes in 107 of 150 frames, not all of them.
- Ceres: the known asteroid is found on its predicted spot in 7 of 8 frames, but the stricter check passes in 0 of 8 even though Ceres moves far. This is not yet explained. The film's limits scene reports the overall 107 of 150, which includes it, and gives Ceres no row of its own.
- Slow asteroids barely move in their window, so they cannot pass the stricter check.
- Tiles are 8-bit stretched pictures, so brightness is approximate.
- No coverage is shown as a hatch, never as black.
- Flags are saved in this browser only.

## The Planet X result

The measured pair in the film is the asteroid Pallas. The app's verdict on it is "Nearby object: asteroid or comet", and the film shows that verdict. It shows no distant-body fit. A distant verdict in the app reads as a candidate for follow-up, never as a detection.

## What the film does not claim

- It does not claim a discovery, a detected planet, or that the tool finds unknown objects.
- It says nothing about SPHEREx beyond the app's own text.
- It does not present any invented statistic, date or coordinate.
