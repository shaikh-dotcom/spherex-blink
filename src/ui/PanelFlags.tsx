import React from "react";
import { focusRect } from "../config/focus";
import { INSPECT_SPLIT } from "./PanelInspect";
import { selectFlagCategories, selectFlagColumns, selectFrame, selectPallas, selectPick, selectTargetPosition } from "../data/select";

export interface PanelFlagsState {
  formReveal: number;
  category: string;
  flagged: number;
  matchReveal: number;
  exportReveal: number;
  exportPulse: number;
  statePulse: number;
}

export const FLAGS_DEFAULT: PanelFlagsState = {
  formReveal: 0,
  category: "asteroid",
  flagged: 0,
  matchReveal: 0,
  exportReveal: 0,
  exportPulse: 0,
  statePulse: 0,
};

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));

const lift = (r: number): React.CSSProperties => ({ opacity: r, transform: `translateY(${(1 - r) * 6}px)` });

const glowRing = (p: number): React.CSSProperties => ({
  opacity: clamp01(p),
  boxShadow: `0 0 18px rgba(242,162,68,${(0.35 * clamp01(p)).toFixed(3)})`,
});

function awayArcsec(): number {
  const pick = selectPick();
  const t = selectTargetPosition(pick.frame);
  return Math.hypot(pick.centroid[0] - t.col, pick.centroid[1] - t.row) * selectPallas().pixscaleArcsec;
}

function csvRow(category: string): string {
  const pick = selectPick();
  const cells: Record<string, string> = {
    region: selectPallas().id,
    frame: pick.frame,
    band: pick.band,
    epoch: String(selectFrame(pick.frame).epoch),
    ra: pick.ra.toFixed(6),
    dec: pick.dec.toFixed(6),
    category,
    verdict: pick.moverCheck.goneFromAll ? "moves" : "",
    note: "",
  };
  return selectFlagColumns()
    .filter((c) => c !== "created")
    .map((c) => cells[c] ?? "")
    .join(",");
}

const Chevron: React.FC = () => (
  <svg className="chev" width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
    <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const PanelFlags: React.FC<{ state: PanelFlagsState }> = ({ state }) => {
  const panel = focusRect("panel");
  const categories = selectFlagCategories();
  if (!categories.includes(state.category)) {
    throw new Error(`PanelFlags: category "${state.category}" is not one of ${categories.join(", ")}`);
  }
  if (state.flagged > 1) {
    throw new Error("PanelFlags: only one flag row has evidence (the pick); flagged must be 0 or 1");
  }
  const pick = selectPick();
  const formReveal = clamp01(state.formReveal);
  const matchReveal = clamp01(state.matchReveal);
  const exportReveal = clamp01(state.exportReveal);
  const flagged = state.flagged >= 1;
  const sign = pick.dec >= 0 ? "+" : "";
  const verdict = pick.moverCheck.goneFromAll ? " · moves" : "";
  const target = selectPallas().target;
  const columns = selectFlagColumns();
  return (
    <div className="sb-pan sb-flags" style={{ left: panel.x, top: INSPECT_SPLIT, width: panel.w, height: panel.y + panel.h - INSPECT_SPLIT }} data-anchor="flagPanel">
      <section className="card" style={lift(formReveal)} data-anchor="flagForm">
        <h2 className="lbl">
          <i>2.</i>
          Flag a mover
          <span className="small">{`(${state.flagged})`}</span>
        </h2>
        <div className="row">
          <div className="ctl sel" data-anchor="categorySelect">
            <span>{state.category}</span>
            <Chevron />
          </div>
          <div className="ctl inp" data-anchor="noteField">
            <span>note (optional)</span>
          </div>
        </div>
        <div className="ctl primary wide" data-anchor="flagIt">
          Flag it
        </div>
        <div className="flagstate" data-anchor="flagState">
          <div className="ring" style={glowRing(state.statePulse)} />
          <span className="pill local">saved in this browser only</span>
          <span className="small" style={{ opacity: flagged ? 1 : 0 }}>
            Saved in this browser (no shared store is configured).
          </span>
        </div>
        <div className="note good" style={{ ...lift(matchReveal), opacity: flagged ? matchReveal : 0 }} data-anchor="flagMatch">
          This matches a <b>{`known object: ${target} (${awayArcsec().toFixed(0)}″ away)`}</b>. Good catch. It is catalogued, so it is not a new discovery.
        </div>
      </section>
      <section className="card" style={lift(formReveal)} data-anchor="flagList">
        <h2 className="lbl">
          <i>3.</i>
          Flags in this field
        </h2>
        <ul className="flaglist">
          {flagged ? (
            <li>
              <div className="flag-go">
                <span className="dot me" />
                <span>
                  <b>{state.category}</b>{" "}
                  <span className="small">{`${pick.band} · ${pick.frame.replace("_", " ")}${verdict}`}</span>
                  <br />
                  <span className="tt small">{`${pick.ra.toFixed(4)}° ${sign}${pick.dec.toFixed(4)}°`}</span>
                </span>
              </div>
              <div className="flag-x">{"×"}</div>
            </li>
          ) : (
            <li className="empty">No flags in this field yet.</li>
          )}
        </ul>
        <div className="exp" style={lift(exportReveal)}>
          <div className="row">
            <div className={flagged ? "ctl ghost" : "ctl ghost off"} data-anchor="exportCsv">
              Export CSV
              <div className="ring" style={glowRing(state.exportPulse)} />
            </div>
            <div className={flagged ? "ctl ghost" : "ctl ghost off"} data-anchor="exportJson">
              Export JSON
              <div className="ring" style={glowRing(state.exportPulse)} />
            </div>
          </div>
          <div className="csv" data-anchor="csvPreview">
            <div>{columns.join(",")}</div>
            <div>{flagged ? csvRow(state.category) : ""}</div>
          </div>
        </div>
      </section>
    </div>
  );
};
