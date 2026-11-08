import React from "react";
import { focusRect } from "../config/focus";
import { selectFields, selectPallas, selectPallasValidation, selectValidationAll } from "../data/select";
import { clamp01 } from "../lib/ease";

export interface PanelContextState {
  reveal: number;
  validationReveal: number;
  referenceBlend: number;
  acrossReveal: number;
  strictReveal: number;
  refReveal: number;
  refLayer: string;
}

export const CONTEXT_DEFAULT: PanelContextState = {
  reveal: 0,
  validationReveal: 0,
  referenceBlend: 0,
  acrossReveal: 1,
  strictReveal: 1,
  refReveal: 1,
  refLayer: "dss2",
};

interface RefLayer {
  id: string;
  label: string;
  credit: string;
}

const REF_LAYERS: readonly RefLayer[] = [
  { id: "dss2", label: "DSS2 optical", credit: "Digitized Sky Survey, STScI/NASA, via CDS hips2fits" },
  { id: "2mass", label: "2MASS near-infrared", credit: "2MASS, UMass / IPAC-Caltech / NASA / NSF, via CDS hips2fits" },
  { id: "wise", label: "WISE mid-infrared", credit: "WISE, NASA / JPL-Caltech, via CDS hips2fits" },
];

const STRICT_NOTE =
  "Not every frame can show it gone from that pixel: the check needs the asteroid to have moved clear of its other positions, which short windows and crowded fields may not allow. The detections above are the stronger evidence.";

const MJD_UNIX_EPOCH = 40587;

function isoDate(mjd: number): string {
  return new Date((mjd - MJD_UNIX_EPOCH) * 864e5).toISOString().slice(0, 10);
}

function duration(days: number): string {
  const h = days * 24;
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h < 48) return `${h.toFixed(h < 10 ? 1 : 0)} h`;
  if (days < 60) return `${days.toFixed(days < 10 ? 1 : 0)} d`;
  return `${(days / 30.44).toFixed(1)} months`;
}

function fieldRows(): [string, React.ReactNode][] {
  const pallas = selectPallas();
  const info = selectFields().find((f) => f.id === pallas.id);
  const mjds = pallas.frames.map((f) => f.mjd);
  const first = Math.min(...mjds);
  const last = Math.max(...mjds);
  const passes = info ? info.epochs.length : 1;
  return [
    ["Target", pallas.target],
    ["Frames", `${pallas.frames.length} in ${pallas.bands.length} bands`],
    ["Dates", `${isoDate(first)} \u2192 ${isoDate(last)} (${duration(last - first)})`],
    [
      "Passes",
      <>
        {passes}
        {passes < 2 ? <span className="small">{" (one survey pass: add a second ~6 months later for parallax)"}</span> : null}
      </>,
    ],
    ["Size", `${pallas.sizeDeg.toFixed(2)}\u00b0 square, ${pallas.tile.width}\u00d7${pallas.tile.height} px`],
  ];
}

const lift = (v: number): React.CSSProperties => ({ opacity: v, transform: `translateY(${((1 - v) * 6).toFixed(2)}px)` });

const Collapse: React.FC<{ amount: number; children: React.ReactNode }> = ({ amount, children }) => {
  const a = clamp01(amount);
  return (
    <div className="collapse" style={{ gridTemplateRows: `${a.toFixed(4)}fr`, opacity: a }}>
      <div className="collapse-in">{children}</div>
    </div>
  );
};

export const PanelContext: React.FC<{ state: PanelContextState }> = ({ state }) => {
  const field = focusRect("contextField");
  const reality = focusRect("realityCheck");
  const blendRect = focusRect("referenceBlend");
  const pallas = selectPallas();
  const summary = selectPallasValidation().summary;
  const all = selectValidationAll().totals;
  const info = selectFields().find((f) => f.id === pallas.id);
  const sim = info ? info.kind === "simulated" : false;
  const reveal = clamp01(state.reveal);
  const val = clamp01(state.validationReveal);
  const across = clamp01(state.acrossReveal);
  const strict = clamp01(state.strictReveal);
  const refReveal = clamp01(state.refReveal);
  const blend = clamp01(state.referenceBlend);
  const layer = REF_LAYERS.find((l) => l.id === state.refLayer) ?? REF_LAYERS[0];
  const top = field.y;
  const bottom = blendRect.y + blendRect.h;
  const rows = fieldRows();
  return (
    <div className="sb-pan sb-ctx" style={{ left: field.x, top, width: field.w, height: bottom - top }} data-anchor="contextCard">
      <section className="card fieldcard" style={{ height: field.h, ...lift(reveal) }} data-anchor="contextField">
        <h2 className="lbl">This field</h2>
        <div className="ftitle">
          {info ? info.title : pallas.id}
          <span className={sim ? "badge" : "badge ok"}>{sim ? "simulated" : "real SPHEREx data"}</span>
        </div>
        <dl className="mini">
          {rows.map(([k, v]) => (
            <React.Fragment key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </React.Fragment>
          ))}
        </dl>
      </section>
      <section className="card valcard" style={{ height: reality.h, ...lift(reveal * val) }} data-anchor="realityCheck">
        <h2 className="lbl">Reality check</h2>
        <Collapse amount={1 - strict}>
          <p className="valintro">
            {"The ephemeris position of "}
            <b>{summary.target}</b>
            {" was searched for a real source in every frame, so the orange overlay is checked against the pixels, not just drawn."}
          </p>
        </Collapse>
        <div className="valnum">
          <div>
            <b>{`${summary.frames_detected}/${summary.frames_checked}`}</b>
            <span>frames with a source on the predicted spot</span>
          </div>
          <div>
            <b>{`${summary.rms_offset_px.toFixed(2)} px`}</b>
            <span>{`rms offset, ${summary.rms_offset_arcsec.toFixed(1)}\u2033`}</span>
          </div>
          <div>
            <b>{`${summary.movers_confirmed}/${summary.frames_checked}`}</b>
            <span>frames where it is gone from that pixel in the other frames</span>
          </div>
        </div>
        <Collapse amount={across}>
          <div className="valnum valfields">
            <div>
              <b>{`${all.framesDetected}/${all.framesChecked}`}</b>
              <span>{`frames found across ${all.fields} asteroid fields`}</span>
            </div>
            <div style={{ opacity: strict }}>
              <b>{`${all.moversConfirmed}/${all.framesChecked}`}</b>
              <span>also gone from that pixel in the other frames</span>
            </div>
          </div>
        </Collapse>
        <Collapse amount={strict}>
          <p className="small valnote">{STRICT_NOTE}</p>
        </Collapse>
      </section>
      <section className="card refcard" style={{ height: blendRect.h, ...lift(reveal * refReveal) }} data-anchor="referenceBlend">
        <h2 className="lbl">Compare with other eyes</h2>
        <div className="refsel">
          <span>{layer.label}</span>
          <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
            <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </div>
        <div className="slider">
          <span className="small">Blend</span>
          <div className="track">
            <div className="fill" style={{ width: `${(blend * 100).toFixed(2)}%` }} />
            <div className="thumb" style={{ left: `${(blend * 100).toFixed(2)}%` }} />
          </div>
          <span className="small val">{`${Math.round(blend * 100)}%`}</span>
        </div>
        <div className="small credit" style={{ opacity: clamp01(blend * 5) }}>{`Credit: ${layer.credit}`}</div>
      </section>
    </div>
  );
};
