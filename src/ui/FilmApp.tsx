import React from "react";
import { useCurrentFrame } from "remotion";
import { LOGICAL } from "../config/timeline";
import { focusRect } from "../config/focus";
import { fonts, theme } from "../config/theme";
import { useFilmState } from "../lib/useFilmState";
import { Header } from "./Header";
import { Rail } from "./Rail";
import { SkyViewer } from "./SkyViewer";
import { TimeBar } from "./TimeBar";
import { PanelTabs } from "./PanelTabs";
import { PanelInspect } from "./PanelInspect";
import { PanelFlags } from "./PanelFlags";
import { PanelContext } from "./PanelContext";
import { SkyMapCard } from "./SkyMapCard";
import { PanelPlanetX } from "./PanelPlanetX";
import { PanelOrrery } from "./PanelOrrery";

export const FilmApp: React.FC = () => {
  const frame = useCurrentFrame();
  const s = useFilmState(frame);
  const panel = focusRect("panel");
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: LOGICAL.w,
        height: LOGICAL.h,
        background: theme.paper,
        backgroundImage: theme.appBackground,
        border: `1px solid ${theme.rule2}`,
        fontFamily: fonts.serif,
        color: theme.ink,
        opacity: s.appOpacity,
        overflow: "hidden",
      }}
    >
      <Header state={s.header} />
      <Rail state={s.rail} />
      <SkyViewer state={s.viewer} />
      <TimeBar state={s.time} />
      <div style={{ position: "absolute", left: panel.x, top: panel.y, width: panel.w, height: panel.h }} />
      <PanelTabs state={s.tabs} />
      {s.tabs.tab === "inspect" && (
        <>
          <PanelInspect state={s.inspect} />
          <PanelFlags state={s.flags} />
        </>
      )}
      {s.tabs.tab === "context" && (
        <>
          <PanelContext state={s.context} />
          <SkyMapCard state={s.skymap} />
        </>
      )}
      {s.tabs.tab === "planetx" && (
        <>
          <PanelPlanetX state={s.planetx} />
          <PanelOrrery state={s.orrery} />
        </>
      )}
    </div>
  );
};
