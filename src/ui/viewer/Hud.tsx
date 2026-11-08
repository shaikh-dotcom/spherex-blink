import React from "react";
import { VIEW_BOX, type ViewTransform } from "./geometry";
import { offsetArcsec, type Wcs } from "./wcs";
import type { RulerLayout } from "./Rulers";

const STEPS = [1, 2, 5, 10, 20, 30, 60, 120, 300, 600, 1200, 1800, 3600, 7200];

function scaleBar(wcs: Wcs, view: ViewTransform): { px: number; label: string } {
  const cx = wcs.width / 2;
  const cy = wcs.height / 2;
  const p0 = wcs.toSky(cx, cy);
  const p1 = wcs.toSky(cx + 1, cy);
  const o = offsetArcsec(p0.ra, p0.dec, p1.ra, p1.dec);
  const asPerTile = Math.hypot(o.e, o.n);
  const pxPerTile = (VIEW_BOX.inner / wcs.width) * view.s;
  let best = STEPS[0];
  const maxPx = Math.max(64, Math.min(130, VIEW_BOX.inner * 0.26));
  for (const v of STEPS) if ((v / asPerTile) * pxPerTile <= maxPx) best = v;
  const label = best >= 3600 ? `${best / 3600}\u00b0` : best >= 60 ? `${best / 60}\u2032` : `${best}\u2033`;
  return { px: (best / asPerTile) * pxPerTile, label };
}

const Compass: React.FC<{ eastSide: "left" | "right" }> = ({ eastSide }) => {
  const east = eastSide === "right" ? 1 : -1;
  const st = { stroke: "currentColor", strokeWidth: 1.2, fill: "none" };
  return (
    <svg className="compass" viewBox="0 0 34 34">
      <g style={{ color: "var(--ink)" }}>
        <path d="M17 31V6" {...st} />
        <path d="M13.5 10 17 5l3.5 5" {...st} />
        <path d={`M17 17H${17 + east * 14}`} {...st} />
        <path d={`M${17 + east * 10} ${17 - 3.4}l${east * 5} 3.4 l${-east * 5} 3.4`} {...st} />
      </g>
      <text x={17} y={3.5} textAnchor="middle" dy="-.15em">
        N
      </text>
      <text x={17 + east * 14 + east * 3} y={17} dy=".34em" textAnchor={east > 0 ? "start" : "end"}>
        E
      </text>
    </svg>
  );
};

const ToolIcon: React.FC<{ d: string }> = ({ d }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d={d} />
  </svg>
);

export const HudTop: React.FC<{ simulated: boolean; coach: boolean; overlayAB: boolean; solar: boolean }> = ({ simulated, coach, overlayAB, solar }) => (
  <div className="hud hud-top">
    <div className="hud-l">
      {simulated && !solar ? (
        <div className="glass simbanner">
          <b>Simulated data.</b> Not from SPHEREx: a practice field.
        </div>
      ) : null}
      {coach && !solar ? (
        <div className="glass coach">
          <kbd>Space</kbd> blink &middot; <kbd>O</kbd> overlay &middot; <kbd>&larr;</kbd>
          <kbd>&rarr;</kbd> step &middot; click to inspect
        </div>
      ) : null}
    </div>
    <div className="hud-r">
      <div className="seg glass">
        <button className={solar ? "" : "on"}>Sky</button>
        <button className={solar ? "on" : ""}>Solar system</button>
      </div>
      {overlayAB && !solar ? (
        <div className="glass abkey">
          <i className="a" />A amber <i className="b" />B cyan
        </div>
      ) : null}
    </div>
  </div>
);

export const HudBottom: React.FC<{ wcs: Wcs; view: ViewTransform; layout: RulerLayout; solar: boolean }> = ({ wcs, view, layout, solar }) => {
  const sb = scaleBar(wcs, view);
  return (
    <div className="hud hud-bottom">
      {solar ? null : (
        <div className="glass plate">
          <Compass eastSide={layout.eastSide} />
          <div className="scale">
            <i style={{ width: sb.px }} />
            <span>{sb.label}</span>
          </div>
        </div>
      )}
      <div className="viewtools">
        <div className="glass tool">
          <ToolIcon d="M6.7 9.3a2.7 2.7 0 0 0 3.8 0l2.3-2.3a2.7 2.7 0 0 0-3.8-3.8l-.8.8M9.3 6.7a2.7 2.7 0 0 0-3.8 0L3.2 9a2.7 2.7 0 0 0 3.8 3.8l.8-.8" />
          <span>Copy link</span>
        </div>
        <div className="glass tool">
          <ToolIcon d="M8 2.2v7.4M4.8 6.7 8 9.9l3.2-3.2M2.8 12.8h10.4" />
          <span>Save image</span>
        </div>
        {solar ? null : (
          <div className="glass tool">
            <ToolIcon d="M2.5 5.8V2.5h3.3M10.2 2.5h3.3v3.3M13.5 10.2v3.3h-3.3M5.8 13.5H2.5v-3.3" />
            <span>Reset view</span>
          </div>
        )}
      </div>
    </div>
  );
};
