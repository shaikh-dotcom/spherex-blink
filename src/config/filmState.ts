import { HEADER_DEFAULT, type HeaderState } from "../ui/Header";
import { RAIL_DEFAULT, type RailState } from "../ui/Rail";
import { VIEWER_DEFAULT, type SkyViewerState } from "../ui/SkyViewer";
import { TIME_DEFAULT, type TimeBarState } from "../ui/TimeBar";
import { TABS_DEFAULT, type PanelTabsState } from "../ui/PanelTabs";
import { INSPECT_DEFAULT, type PanelInspectState } from "../ui/PanelInspect";
import { FLAGS_DEFAULT, type PanelFlagsState } from "../ui/PanelFlags";
import { CONTEXT_DEFAULT, type PanelContextState } from "../ui/PanelContext";
import { SKYMAP_DEFAULT, type SkyMapCardState } from "../ui/SkyMapCard";
import { PLANETX_DEFAULT, type PanelPlanetXState } from "../ui/PanelPlanetX";
import { ORRERY_DEFAULT, type PanelOrreryState } from "../ui/PanelOrrery";

export interface FilmState {
  header: HeaderState;
  rail: RailState;
  viewer: SkyViewerState;
  time: TimeBarState;
  tabs: PanelTabsState;
  inspect: PanelInspectState;
  flags: PanelFlagsState;
  context: PanelContextState;
  skymap: SkyMapCardState;
  planetx: PanelPlanetXState;
  orrery: PanelOrreryState;
  appOpacity: number;
}

export type FilmStatePatch = { [K in keyof FilmState]?: FilmState[K] extends object ? Partial<FilmState[K]> : FilmState[K] };

export const DEFAULT_FILM_STATE: FilmState = {
  header: HEADER_DEFAULT,
  rail: RAIL_DEFAULT,
  viewer: VIEWER_DEFAULT,
  time: TIME_DEFAULT,
  tabs: TABS_DEFAULT,
  inspect: INSPECT_DEFAULT,
  flags: FLAGS_DEFAULT,
  context: CONTEXT_DEFAULT,
  skymap: SKYMAP_DEFAULT,
  planetx: PLANETX_DEFAULT,
  orrery: ORRERY_DEFAULT,
  appOpacity: 1,
};

export function mergeFilmState(base: FilmState, patch: FilmStatePatch): FilmState {
  const out: Record<string, unknown> = { ...base };
  for (const key of Object.keys(patch) as (keyof FilmState)[]) {
    const value = patch[key];
    if (value === undefined) continue;
    const prev = base[key];
    out[key] = typeof prev === "object" && prev !== null ? { ...prev, ...(value as object) } : value;
  }
  return out as unknown as FilmState;
}
