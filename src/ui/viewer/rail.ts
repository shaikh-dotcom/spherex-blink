import { useCurrentFrame } from "remotion";
import { useFilmState } from "../../lib/useFilmState";

export function useRailFlags(): { showKnown: boolean; showMask: boolean } {
  const frame = useCurrentFrame();
  const s = useFilmState(frame);
  return { showKnown: s.rail.showKnown, showMask: s.rail.showMask };
}
