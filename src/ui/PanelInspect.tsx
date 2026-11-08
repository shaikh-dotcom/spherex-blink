import React from "react";
import { focusRect } from "../config/focus";
import { selectFields, selectFrame, selectPallas, selectPick } from "../data/select";

export interface PanelInspectState {
  reveal: number;
  verdict: null | "none" | "fixed" | "moves" | "unclear";
  verdictReveal: number;
}

export const INSPECT_DEFAULT: PanelInspectState = { reveal: 0, verdict: null, verdictReveal: 0 };

export const INSPECT_SPLIT = 556;

const SPLIT = INSPECT_SPLIT;

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

const EMPTY_TEXT = "Click anywhere on the sky to read its position, band and brightness.";

function verdictBody(kind: NonNullable<PanelInspectState["verdict"]>, n: number): React.ReactNode {
  const s = n > 1 ? "s" : "";
  if (kind === "none") return "No clear source at this spot in this frame.";
  if (kind === "fixed") return `Same spot in all ${n} other frame${s}: a fixed star or galaxy, not a mover.`;
  if (kind === "moves") {
    return (
      <>
        {`Gone from this spot in all ${n} other frame${s}: `}
        <b>it moves</b>
        {" (or is a transient). A good candidate."}
      </>
    );
  }
  return (
    <>
      {`Gone from all ${n} other frame${s}, but it has hard edges and no soft halo like a star's. It could be a `}
      <b>cosmic-ray hit</b>
      {" rather than a mover: check it before flagging."}
    </>
  );
}

function metaRows(): [string, React.ReactNode][] {
  const pick = selectPick();
  const frame = selectFrame(pick.frame);
  const info = selectFields().find((f) => f.id === selectPallas().id);
  const passes = info ? info.epochs.length : 1;
  const sign = pick.dec >= 0 ? "+" : "";
  const flux = pick.flux;
  const intensity: React.ReactNode = flux ? (
    <>
      {`${flux.lowerLimit ? "≥ " : ""}${flux.value.toPrecision(3)} ${flux.unit}`}
      {pick.peak8bit === 255 ? <span className="small">{" (saturated in the 8-bit tile)"}</span> : null}
    </>
  ) : (
    "—"
  );
  return [
    ["RA", `${pick.ra.toFixed(5)}° ${pick.raHms}`],
    ["Dec", `${sign}${pick.dec.toFixed(5)}° ${pick.decDms}`],
    [
      "Pixel",
      <>
        {`${pick.pixel[0]}, ${pick.pixel[1]} `}
        <span className="small">{`centroid of a source (SNR ${pick.snr.toFixed(0)})`}</span>
      </>,
    ],
    ["Galactic", `l ${pick.galactic.l.toFixed(2)}° b ${pick.galactic.b.toFixed(2)}°`],
    ["Ecliptic", `λ ${pick.ecliptic.lon.toFixed(2)}° β ${pick.ecliptic.lat.toFixed(2)}°`],
    ["Band", `${pick.band}${pick.wavelengthUm !== null ? ` · ${pick.wavelengthUm.toFixed(3)} µm` : ""}`],
    ["Frame", `${frame.utc.replace("T", " ").slice(0, 16)} UTC${passes > 1 ? ` · pass ${frame.epoch}` : ""}`],
    ["Intensity", intensity],
  ];
}

export const PanelInspect: React.FC<{ state: PanelInspectState }> = ({ state }) => {
  const tabs = focusRect("tabs");
  const top = tabs.y + tabs.h;
  const reveal = clamp01(state.reveal);
  const verdictReveal = clamp01(state.verdictReveal);
  const rows = metaRows();
  const n = selectPick().moverCheck.otherFrames;
  return (
    <div className="sb-pan sb-insp" style={{ left: tabs.x, top, width: tabs.w, height: SPLIT - top }} data-anchor="inspectCard">
      <section className="card">
        <h2 className="lbl">
          <i>1.</i>
          Selected point
        </h2>
        <div className="metabox" data-anchor="inspectMeta">
          <dl className="blank" style={{ opacity: clamp01(1 - reveal * 2) }}>
            <dt className="empty">{EMPTY_TEXT}</dt>
          </dl>
          <dl style={{ opacity: reveal, transform: `translateY(${(1 - reveal) * 6}px)` }}>
            {rows.map(([k, v]) => (
              <React.Fragment key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
        <div className="mover" style={{ opacity: verdictReveal, transform: `translateY(${(1 - verdictReveal) * 6}px)` }} data-anchor="moverCheck">
          {state.verdict ? (
            <>
              <h3 className="lbl sub">Mover check</h3>
              <div className={`verdict ${state.verdict}`}>
                <i />
                <span>{verdictBody(state.verdict, n)}</span>
              </div>
            </>
          ) : null}
        </div>
      </section>
    </div>
  );
};
