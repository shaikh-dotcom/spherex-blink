import React from "react";
import { focusRect } from "../config/focus";
import { selectFields, selectPair, selectPallasFrames, selectSixMonth } from "../data/select";
import { Glow } from "../fx/Glow";
import { KeyCap } from "../fx/KeyCap";

export interface RailState {
  band: string;
  mode: "static" | "blink" | "overlay";
  rateHz: 1 | 2 | 3 | 5;
  showKnown: boolean;
  showMask: boolean;
  snap: boolean;
  showFlags: boolean;
  hot: null | "band" | "blink" | "pair" | "layers" | "keys";
  fieldId: string;
}

export const RAIL_DEFAULT: RailState = {
  band: "D1",
  mode: "static",
  rateHz: 3,
  showKnown: true,
  showMask: true,
  snap: true,
  showFlags: true,
  hot: null,
  fieldId: "pallas",
};

const BANDS = ["D1", "D2", "D3", "D4", "D5", "D6"] as const;
const RATES = [1, 2, 3, 5] as const;
const KEY_SIZE = 10;

function bandFrameCount(fieldId: string, band: string): number | null {
  if (fieldId === "pallas") return selectPallasFrames(band).length;
  if (fieldId === "pallas-6mo") return selectSixMonth().frames.filter((f) => f.band === band).length;
  return null;
}

const Hot: React.FC<{ w: number; h: number; inset?: number }> = ({ w, h, inset = 6 }) => (
  <>
    <div className="hot" style={{ left: -inset, top: -inset, width: w + inset * 2, height: h + inset * 2 }} />
    <Glow x={w / 2} y={h / 2} radius={Math.max(w, h) * 0.8} intensity={0.22} />
  </>
);

const Label: React.FC<{ n: number; text: string }> = ({ n, text }) => (
  <h2 className="lbl">
    <i>{n}.</i>
    {text}
  </h2>
);

const Check: React.FC<{ on: boolean; label: string; sub?: string; anchor: string }> = ({ on, label, sub, anchor }) => (
  <div className="chk" data-anchor={anchor}>
    <span className={on ? "box on" : "box"}>
      {on ? (
        <svg width="10" height="10" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 6.2 4.9 9 10 3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ) : null}
    </span>
    <span className="txt">
      {label}
      {sub ? <span className="small">{sub}</span> : null}
    </span>
  </div>
);

const KeyRow: React.FC<{ name: string; keys?: string[]; text?: string }> = ({ name, keys, text }) => (
  <div className="krow">
    <span className="kname">{name}</span>
    {keys ? (
      <span className="kcaps">
        {keys.map((k) => (
          <KeyCap key={k} label={k} size={KEY_SIZE} startFrame={-1000} />
        ))}
      </span>
    ) : (
      <span className="ktt">{text}</span>
    )}
  </div>
);

export const Rail: React.FC<{ state: RailState }> = ({ state }) => {
  const rail = focusRect("rail");
  const place = (name: "bandPlates" | "blinkControls" | "layers" | "keys"): React.CSSProperties => {
    const s = focusRect(name);
    return { left: s.x - rail.x, top: s.y - rail.y, width: s.w, height: s.h };
  };
  const fieldBands = selectFields().find((f) => f.id === state.fieldId)?.bands ?? [];
  const pair = selectPair();
  const modeBlink = state.mode === "blink";
  const hot = state.hot;
  const sizes = {
    band: focusRect("bandPlates"),
    layers: focusRect("layers"),
    keys: focusRect("keys"),
  };

  return (
    <div className="sb-rail" style={{ left: rail.x, top: rail.y, width: rail.w, height: rail.h }}>
      <section className="sec" style={place("bandPlates")} data-anchor="bandPlates">
        {hot === "band" ? <Hot w={sizes.band.w} h={sizes.band.h} /> : null}
        <Label n={1} text="Spectral band" />
        <div className="bands">
          {BANDS.map((b) => {
            const enabled = fieldBands.includes(b);
            const count = enabled ? bandFrameCount(state.fieldId, b) : null;
            const cls = ["plate", state.band === b && enabled ? "on" : "", enabled ? "" : "off"].join(" ").trim();
            return (
              <div key={b} className={cls} data-anchor={`band${b}`}>
                {b}
                <small>{count === null ? "—" : `${count} frame${count === 1 ? "" : "s"}`}</small>
              </div>
            );
          })}
        </div>
      </section>

      <section className="sec" style={place("blinkControls")} data-anchor="blinkControls">
        <Label n={2} text="Blink" />
        <div className="grp blinkgrp">
          {hot === "blink" ? <Hot w={226} h={108} /> : null}
          <div className={modeBlink ? "pbtn on" : "pbtn"} data-anchor="blinkAB">
            Blink A {"⇄"} B
          </div>
          <div className="mrow">
            <div className={state.mode === "static" ? "gbtn on" : "gbtn"} data-anchor="modeStatic">
              Static
            </div>
            <div className={state.mode === "overlay" ? "gbtn cy on" : "gbtn"} data-anchor="modeOverlay">
              Overlay
            </div>
          </div>
          <div className="rate" data-anchor="rate">
            {RATES.map((hz) => (
              <span key={hz} className={state.rateHz === hz ? "on" : ""} data-anchor={`rate${hz}`}>
                {hz} Hz
              </span>
            ))}
          </div>
        </div>
        <div className="grp pairgrp">
          {hot === "pair" ? <Hot w={226} h={48} /> : null}
          <div className="gbtn wide" data-anchor="bestPair">
            Best pair
          </div>
          <div className="pairinfo">
            {pair.info.band} {"·"} {pair.info.daysApart.toFixed(2)} days apart
          </div>
        </div>
      </section>

      <section className="sec" style={place("layers")} data-anchor="layers">
        {hot === "layers" ? <Hot w={sizes.layers.w} h={sizes.layers.h} /> : null}
        <Label n={3} text="Layers" />
        <Check on={state.showKnown} label="Known objects" sub="Untick to hunt blind first." anchor="layerKnown" />
        <Check on={state.showMask} label="Blink the shared footprint only" sub="Hides areas covered in just one frame." anchor="layerMask" />
        <Check on={state.snap} label="Snap clicks to sources" sub="Centroids give sharper positions." anchor="layerSnap" />
        <Check on={state.showFlags} label="Flags" anchor="layerFlags" />
      </section>

      <section className="sec keys" style={place("keys")} data-anchor="keys">
        {hot === "keys" ? <Hot w={sizes.keys.w} h={sizes.keys.h} /> : null}
        <Label n={4} text="Keys" />
        <KeyRow name="blink" keys={["Space"]} />
        <KeyRow name="overlay" keys={["O"]} />
        <KeyRow name="set B / swap" keys={["B", "X"]} />
        <KeyRow name="step through time" keys={["←", "→"]} />
        <KeyRow name="zoom" text={"scroll · pinch · + −"} />
        <KeyRow name="inspect a point" text="click" />
      </section>
    </div>
  );
};
