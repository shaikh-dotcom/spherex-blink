export { VIEWER_DEFAULT } from "./viewer/state";
export type { SkyViewerState } from "./viewer/state";
export { tileToFigure, tileToApp } from "./viewer/geometry";
import React, { useLayoutEffect, useMemo, useRef } from "react";
import { Img, staticFile } from "remotion";
import { FOCUS, GRID } from "../config/focus";
import { fonts, theme } from "../config/theme";
import { selectPallas } from "../data/select";
import type { FrameInfo } from "../data/types";
import type { SkyViewerState } from "./viewer/state";
import { bandFrames, fieldKind, resolveFrame } from "./viewer/data";
import { FIGURE, VIEW_BOX, viewTransform } from "./viewer/geometry";
import { HudBottom, HudTop } from "./viewer/Hud";
import { Overlay } from "./viewer/Overlay";
import { useRailFlags } from "./viewer/rail";
import { LeftRuler, TopRuler, rulerLayout, type RulerLayout } from "./viewer/Rulers";
import { buildPair, useTiles } from "./viewer/tiles";
import { fieldWcs } from "./viewer/wcs";

const EMPTY_LAYOUT: RulerLayout = { top: { major: [], minor: [], d: 0 }, left: { major: [], minor: [], d: 0 }, eastSide: "left" };

const SkyLayer: React.FC<{ source: HTMLCanvasElement | null; visible: boolean }> = ({ source, visible }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !source) return;
    cv.width = source.width;
    cv.height = source.height;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.drawImage(source, 0, 0);
  }, [source]);
  return <canvas ref={ref} className="sky" style={{ display: visible ? "block" : "none" }} />;
};

const cap = (s: string): string => s[0].toUpperCase() + s.slice(1);

const Caption: React.FC<{ state: SkyViewerState; frame: FrameInfo | null; layout: RulerLayout }> = ({ state, frame, layout }) => {
  const kind = fieldKind(state.fieldId);
  if (kind === "other" || !frame) {
    return (
      <>
        <b>Figure 1.</b> Simulated practice field. Not SPHEREx data.
      </>
    );
  }
  const p = selectPallas();
  const list = bandFrames(kind, frame.band);
  const wl = list.map((x) => x.wavelengthUm).filter((x): x is number => x !== null);
  const band = wl.length ? `${frame.band}, ${Math.min(...wl).toFixed(2)}\u2013${Math.max(...wl).toFixed(2)}\u2009\u00b5m` : frame.band;
  const idx = Math.max(0, list.findIndex((x) => x.id === frame.id));
  const dec = p.centre.dec;
  return (
    <>
      <b>Figure 1.</b> {cap(state.fieldId)} field centred on (<i>{"\u03b1"}</i>,{"\u2009"}
      <i>{"\u03b4"}</i>){"\u2009=\u2009"}({p.centre.ra.toFixed(3)}
      {"\u00b0,\u2009"}
      {dec >= 0 ? "+" : "\u2212"}
      {Math.abs(dec).toFixed(3)}
      {"\u00b0)"}, {p.sizeDeg.toFixed(2)}
      {"\u00b0 on a side. SPHEREx band "}
      <i>{band}</i>, frame {idx + 1} of {list.length}, {frame.utc.replace("T", " ").slice(0, 16)}
      {"\u2009UTC. Arcsinh stretch; north up, east "}
      {layout.eastSide}.
      {state.overlayAB ? " Overlay: frame A in amber, frame B in cyan, so a source that moved appears as an amber and a cyan dot." : ""}
    </>
  );
};

export const SkyViewer: React.FC<{ state: SkyViewerState; showKnown?: boolean; showMask?: boolean }> = ({ state, showKnown, showMask }) => {
  const rail = useRailFlags();
  const known = showKnown ?? rail.showKnown;
  const mask = showMask ?? rail.showMask;
  const kind = fieldKind(state.fieldId);
  const real = kind !== "other";
  const frameA = real ? resolveFrame(state, "A") : null;
  const frameB = real ? resolveFrame(state, "B") : null;
  const tiles = useTiles(frameA && frameB ? [staticFile(frameA.file), staticFile(frameB.file)] : []);
  const tileA = tiles[0] ?? null;
  const tileB = tiles[1] ?? null;
  const pair = useMemo(() => (tileA && tileB ? buildPair(tileA, tileB, mask) : null), [tileA, tileB, mask]);
  const solar = state.view === "solar";
  const wcs = fieldWcs(state.fieldId);
  const view = viewTransform(state);
  const layout = real ? rulerLayout(wcs, view) : EMPTY_LAYOUT;
  const shown = state.blinkPhase < 0.5 ? frameA : frameB;
  const showA = !state.overlayAB && state.blinkPhase < 0.5;
  const showB = !state.overlayAB && state.blinkPhase >= 0.5;
  const dim = solar ? 0.25 : 1;
  const fig = FOCUS.figure;
  const refFile = real && state.refBlend > 0 ? staticFile(`ref/${state.fieldId}/${state.refLayer}.jpg`) : null;
  return (
    <div className="sbv" style={{ position: "absolute", left: fig.x, top: fig.y, width: FIGURE.w, height: FIGURE.h, opacity: state.reveal }}>
      <div className="corner" style={{ opacity: dim }}>
        <span>{"\u03b4\u2009/\u2009\u03b1"}</span>
      </div>
      <TopRuler layout={layout} dim={dim} />
      <LeftRuler layout={layout} dim={dim} />
      <div className="viewer" style={{ left: VIEW_BOX.left, top: VIEW_BOX.top, width: VIEW_BOX.outer, height: VIEW_BOX.outer }}>
        <div className="stage" style={{ width: VIEW_BOX.inner, height: VIEW_BOX.inner, transform: `translate(${view.tx}px,${view.ty}px) scale(${view.s})` }}>
          <div className="nodata" style={{ backgroundImage: `${theme.hatchNoData}, repeating-linear-gradient(135deg, #090c14 0 7px, #06080e 7px 14px)` }} />
          {real ? (
            <>
              <SkyLayer source={pair ? pair.A : null} visible={showA} />
              <SkyLayer source={pair ? pair.B : null} visible={showB} />
              <SkyLayer source={pair ? pair.O : null} visible={state.overlayAB} />
              {refFile ? <Img src={refFile} className="ref" style={{ opacity: state.refBlend }} /> : null}
              {shown ? <Overlay state={state} frame={shown} kind={kind} wcs={wcs} view={view} showKnown={known} /> : null}
            </>
          ) : (
            <div className="practice">
              <span style={{ color: theme.warn, fontFamily: fonts.serif, fontStyle: "italic" }}>Simulated practice field</span>
            </div>
          )}
        </div>
        {solar ? <div className="orbig" /> : null}
        <HudTop simulated={!real} coach={state.coach} overlayAB={state.overlayAB} solar={solar} />
        <HudBottom wcs={wcs} view={view} layout={layout} solar={solar} />
      </div>
      <div className="figcap" style={{ left: 0, top: GRID.rulerTop + GRID.figure + 6, width: FIGURE.w, height: GRID.captionH - 6 }}>
        <Caption state={state} frame={frameA} layout={layout} />
      </div>
    </div>
  );
};
