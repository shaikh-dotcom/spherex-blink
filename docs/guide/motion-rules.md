# Motion rules

1. No dead frames. A hold longer than 60 frames gets a camera push of 3 to 5 percent (holdShot in src/config/camera.ts if present, otherwise two keyframes).
2. A camera move takes 24 frames or more. A whip (a fast move across the app) is allowed once per scene at most and takes 26 or more. Leave 10 frames of hold between moves.
3. Pan speed stays under 160 px per frame at stage size.
4. Zoom above 2.0 only on one small card (a mover-check verdict, the parallax output) for at most 60 frames. Anything the viewer must read stays at 2.0 or lower.
5. Every scene covers its whole frame range with keyframes, begins from the previous scene's last pose, and never ends on a cropped corner.
6. Cuts are camera moves or match-cuts. No crossfades, wipes or flashes. The one allowed hard cut is S0 to S1 on frame 300 (a beat).
7. The blink flicker is the only linear, mechanical motion. Everything else eases or springs.
8. Everything lands on a beat (multiples of 15 frames), within one frame.
9. Captions never overlap live UI text; they sit in the lower third (layout.captionBottom).
10. Never use backdrop-filter. Dim or blur the app with a plain overlay layer.
11. Cursor moves are eased arcs, never straight lines, and click 4 frames before the thing they click reacts.
