# 09 - Audio

Voice-over is optional: `make-voice.bat` (or `python scripts/make-voice.py`) reads `voiceBlocks` in `src/config/voice.ts` (id, start frame, text), speaks them locally with Pocket TTS and writes one 150 s file, `public/audio/voice.wav` (48 kHz, 16-bit, mono), which `FilmAudio` plays from frame 0 when `npm run sfx` or `node scripts/make-sfx.mjs --manifest` has listed it. The first word of each block lands on its start frame, a block that would run into the next one is sped up by at most 1.25x, the last 20 frames stay silent, and `out/voice-timing.txt` lists every sentence's start and end frame. Without `voice.wav` the film plays as below. The `--cut30` render keeps the full-length voice track and cuts it with the picture, so render that cut without `voice.wav`. Music-free film with designed sound: an ambient bed plus precise hits, all generated deterministically by `scripts/make-sfx.mjs` (patch 04) as 48 kHz 16-bit WAV files in `public/audio/`. No external audio, no samples, nothing copyrighted.

Layers: (1) a low drone, very quiet, that rises slowly through the film, at gain 0.35 of full, with a 3 s fade-out that ends at frame 4480; (2) a 120 BPM pulse that is only felt in S1 and S9; (3) hits: `tick` (each blink flip in S3, very short, soft; also a soft tick on caption entries), `click` (every cursor click), `whoosh` (scene changes), `chime` (every callout), `thud` (stat numerals locking), `riser` (the 2 beats before S1, S6 and S9 starts), `hatch` (S8 columns). Every hit lands on a beat or on the frame of a UI event.

Cue source of truth: `src/config/sfx.ts` (a list of `{frame, name, gain}`), built from `CUES`, the cursor waypoints in `FILM_CURSOR` and the scene boundaries. Patch 04 built the engine and a first cue list; patch 24 rebuilt the list from the finished scenes. `src/config/sfx.ts` throws on load if two hits (the pulse excluded) are closer than 3 frames or if any sound reaches into the last 20 frames.

Rules the list obeys:
- Click cues are read from `FILM_CURSOR`, so a moved click moves its sound. Callout, caption and counter frames are read from `CUES`; the scenes use the same values (checked in patch 24), so a scene that stops using a `CUES` frame for its callout or caption must be matched here by hand.
- A chime that would land within 3 frames of a blink tick moves later by up to 3 frames (s3.calloutStars and s3.calloutJump, both +3). Nothing else is nudged.
- A caption tick is left out where a whoosh or a blink tick already marks the same frame: s2.caption (600), s3.captionPluto (1230), s4.caption (1680), s5.caption (2220), s6.caption (2700), s7.caption (3420), s8.caption (3780).
- Gains: whoosh 0.45, riser 0.45, click 0.5, thud 0.7, hatch 0.4, blink tick 0.25, caption tick 0.22, chime 0.5 on the verdict callouts (s0.calloutJump, s3.calloutJump, s4.calloutMover, s5.calloutChecked, s6.calloutNear, s7.calloutCross) and 0.32 on the other eight, pulse 0.2.
- Off the beat on purpose: the clicks, the blink ticks that are not on a multiple of 15 frames, and the s6.calloutNear chime (f3200), because each follows an event on screen.
- No sound in the last 20 frames: the drone gain is `droneGainAt(frame)` in `src/config/sfx.ts` (smoothstep from f4390 to zero at f4480) and the last pulse is at f4425.

Final cue list (70 hits; the 36 pulses are listed below the table):

| Frame | Seconds | Scene | Cue | Gain | Source |
|---|---|---|---|---|---|
| 60 | 2.00 | S0 | tick | 0.22 | caption s0.caption |
| 210 | 7.00 | S0 | chime | 0.5 | callout s0.calloutJump |
| 240 | 8.00 | S0 | riser | 0.45 | rise into S1 |
| 300 | 10.00 | S1 | whoosh | 0.45 | scene cut to S1 |
| 600 | 20.00 | S2 | whoosh | 0.45 | scene cut to S2 |
| 735 | 24.50 | S2 | thud | 0.7 | stat numerals lock (s2.counter + 45) |
| 780 | 26.00 | S2 | chime | 0.32 | callout s2.bands |
| 960 | 32.00 | S2 | tick | 0.22 | caption s2.captionPatch |
| 1080 | 36.00 | S3 | whoosh | 0.45 | scene cut to S3 |
| 1136 | 37.87 | S3 | click | 0.5 | cursor click |
| 1140 | 38.00 | S3 | tick | 0.25 | blink flip |
| 1150 | 38.33 | S3 | tick | 0.25 | blink flip |
| 1160 | 38.67 | S3 | tick | 0.25 | blink flip |
| 1170 | 39.00 | S3 | tick | 0.25 | blink flip |
| 1173 | 39.10 | S3 | chime | 0.32 | callout s3.calloutStars (+3) |
| 1180 | 39.33 | S3 | tick | 0.25 | blink flip |
| 1190 | 39.67 | S3 | tick | 0.25 | blink flip |
| 1200 | 40.00 | S3 | tick | 0.25 | blink flip |
| 1203 | 40.10 | S3 | chime | 0.5 | callout s3.calloutJump (+3) |
| 1210 | 40.33 | S3 | tick | 0.25 | blink flip |
| 1220 | 40.67 | S3 | tick | 0.25 | blink flip |
| 1230 | 41.00 | S3 | tick | 0.25 | blink flip |
| 1240 | 41.33 | S3 | tick | 0.25 | blink flip |
| 1250 | 41.67 | S3 | tick | 0.25 | blink flip |
| 1260 | 42.00 | S3 | tick | 0.25 | blink flip |
| 1270 | 42.33 | S3 | tick | 0.25 | blink flip |
| 1280 | 42.67 | S3 | tick | 0.25 | blink flip |
| 1290 | 43.00 | S3 | chime | 0.32 | callout s3.calloutAmber |
| 1406 | 46.87 | S3 | click | 0.5 | cursor click |
| 1410 | 47.00 | S3 | tick | 0.22 | caption s3.captionPair |
| 1590 | 53.00 | S3 | chime | 0.32 | callout s3.calloutWarn |
| 1680 | 56.00 | S4 | whoosh | 0.45 | scene cut to S4 |
| 1706 | 56.87 | S4 | click | 0.5 | cursor click |
| 1710 | 57.00 | S4 | chime | 0.32 | callout s4.calloutBlind |
| 1766 | 58.87 | S4 | click | 0.5 | cursor click |
| 1800 | 60.00 | S4 | chime | 0.32 | callout s4.calloutSnap |
| 1890 | 63.00 | S4 | chime | 0.5 | callout s4.calloutMover |
| 2096 | 69.87 | S4 | click | 0.5 | cursor click |
| 2100 | 70.00 | S4 | tick | 0.22 | caption s4.captionKnown |
| 2216 | 73.87 | S4 | click | 0.5 | cursor click |
| 2220 | 74.00 | S5 | whoosh | 0.45 | scene cut to S5 |
| 2310 | 77.00 | S5 | chime | 0.5 | callout s5.calloutChecked |
| 2460 | 82.00 | S5 | tick | 0.22 | caption s5.captionFields |
| 2580 | 86.00 | S5 | tick | 0.22 | caption s5.captionStrict |
| 2636 | 87.87 | S5 | click | 0.5 | cursor click |
| 2640 | 88.00 | S5 | riser | 0.45 | rise into S6 |
| 2700 | 90.00 | S6 | whoosh | 0.45 | scene cut to S6 |
| 2816 | 93.87 | S6 | click | 0.5 | cursor click |
| 2880 | 96.00 | S6 | chime | 0.32 | callout s6.calloutShift |
| 3000 | 100.00 | S6 | chime | 0.32 | callout s6.calloutSix |
| 3060 | 102.00 | S6 | tick | 0.22 | caption s6.captionMeasure |
| 3068 | 102.27 | S6 | click | 0.5 | cursor click |
| 3086 | 102.87 | S6 | click | 0.5 | cursor click |
| 3114 | 103.80 | S6 | click | 0.5 | cursor click |
| 3132 | 104.40 | S6 | click | 0.5 | cursor click |
| 3200 | 106.67 | S6 | chime | 0.5 | callout s6.calloutNear |
| 3300 | 110.00 | S6 | tick | 0.22 | caption s6.captionHonest |
| 3386 | 112.87 | S6 | click | 0.5 | cursor click |
| 3416 | 113.87 | S6 | click | 0.5 | cursor click |
| 3420 | 114.00 | S7 | whoosh | 0.45 | scene cut to S7 |
| 3474 | 115.80 | S7 | click | 0.5 | cursor click |
| 3480 | 116.00 | S7 | chime | 0.5 | callout s7.calloutCross |
| 3540 | 118.00 | S7 | tick | 0.22 | caption s7.captionExport |
| 3660 | 122.00 | S7 | tick | 0.22 | caption s7.captionState |
| 3780 | 126.00 | S8 | whoosh | 0.45 | scene cut to S8 |
| 3810 | 127.00 | S8 | hatch | 0.4 | s8.columns |
| 3900 | 130.00 | S8 | tick | 0.22 | caption s8.captionHatch |
| 4080 | 136.00 | S8 | tick | 0.22 | caption s8.captionClaim |
| 4140 | 138.00 | S8 | riser | 0.45 | rise into S9 |
| 4200 | 140.00 | S9 | whoosh | 0.45 | scene cut to S9 |

Pulse: gain 0.2, every 15 frames, f300 to f585 in S1 (20) and f4200 to f4425 in S9 (16). The pulses at f300 and f4200 sit on the same frame as the whoosh on purpose (the downbeat).

Mix target: dialogue-free, so integrated loudness about -20 LUFS, true peak under -1 dB. Fades: 1 s in at frame 0 of the drone (in the WAV), 3 s out ending at frame 4480.

Measured in patch 24 on an offline sum of the drone and every cue at these gains (it matches the rendered audio of f1136-1195 at lag 0, correlation 1.000): integrated -28.1 LUFS, loudness range 12.4 LU, true peak -6.0 dBFS. The true peak is inside the target; the loudness is about 8 LU below it because the film is sparse and the drone sits at 0.35. Every hit is at least 10 dB above the drone's RMS in a 0.4 s window around it (lowest margins: caption tick 10.3 dB at f3540, note chime 14.3 dB at f3000, click 17.2 dB at f3114, blink tick 17.7 dB at f1220). Not listened to by ear.
