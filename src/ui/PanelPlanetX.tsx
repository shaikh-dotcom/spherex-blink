import React from "react";
import { alpha, theme } from "../config/theme";
import { focusRect } from "../config/focus";
import { selectFrame, selectPallas, selectParallax, selectShift } from "../data/select";
import type { ParallaxEvidence, ShiftRow } from "../data/types";
import { clamp01 } from "../lib/ease";

export type FitKind = "still" | "near" | "distant" | "misfit";

export interface PanelPlanetXState {
  distanceAu: number;
  outReveal: number;
  measureReveal: number;
  fitReveal: number;
  reveal: number;
  sixReveal: number;
  marks: number;
  markPulse: number;
  fitKind: FitKind | null;
}

export const PLANETX_DEFAULT: PanelPlanetXState = {
  distanceAu: 500,
  outReveal: 0,
  measureReveal: 0,
  fitReveal: 0,
  reveal: 1,
  sixReveal: 1,
  marks: 2,
  markPulse: 0,
  fitKind: null,
};

type Fit = NonNullable<ParallaxEvidence["measuredPair"]["fit"]>;

const MISSING = "Re-capture with: npm run evidence -- --repo <path to spherex-blink>";
const SQRT2 = Math.SQRT2;

function fmt(x: number, digits: number): string {
  const k = 10 ** digits;
  return (Math.round(x * k + 1e-7) / k).toFixed(digits);
}

function duration(days: number): string {
  const h = days * 24;
  if (h < 48) return `${fmt(h, h < 10 ? 1 : 0)} h`;
  if (days < 60) return `${fmt(days, days < 10 ? 1 : 0)} d`;
  return `${fmt(days / 30.44, 1)} months`;
}

function nearestRow(distanceAu: number): ShiftRow {
  const table = selectParallax().table;
  let best = table[0];
  for (const row of table) {
    if (Math.abs(row.distanceAu - distanceAu) < Math.abs(best.distanceAu - distanceAu)) best = row;
  }
  return selectShift(best.distanceAu);
}

function utcLabel(utc: string): string {
  return `${utc.slice(0, 16).replace("T", " ")} UTC`;
}

const lift = (v: number): React.CSSProperties => ({ opacity: v, transform: `translateY(${((1 - v) * 6).toFixed(2)}px)` });

function fitWords(kind: FitKind, fit: Fit, moved: number, total: number, span: string): React.ReactNode {
  if (kind === "still") {
    const limit = fit.limitAu > 5000 ? "5000+" : fmt(fit.limitAu, 0);
    return (
      <>
        <b>No significant motion.</b>
        {` Shift ${fmt(moved, 1)}″ is within the error (±${fmt(total, 1)}″). It is a fixed source such as a star, or a body too far for this baseline: over ${span} only bodies closer than about `}
        <b>{`${limit} AU`}</b>
        {" could show up."}
      </>
    );
  }
  if (kind === "near") {
    if (fit.predictedAtDminArcsec === null) throw new Error(`evidence: parallax.measuredPair.fit.predictedAtDminArcsec is missing. ${MISSING}`);
    return (
      <>
        <b>Nearby object: asteroid or comet.</b>
        {` It moved far more than any body beyond ${fit.dminAu} AU can through parallax (even at ${fit.dminAu} AU the shift would be ${fmt(fit.predictedAtDminArcsec, 0)}″).`}
      </>
    );
  }
  if (kind === "distant") {
    const [lo, hi] = fit.rangeAu;
    const range = fit.openHigh ? `more than ${fmt(lo, 0)} AU` : `${fmt(lo, 0)}–${fmt(hi, 0)} AU`;
    return (
      <>
        <b>Consistent with a distant body.</b>
        {" Best fit "}
        <b>{`${fmt(fit.distanceAu, 0)} AU`}</b>
        {` (68% range ${range}). This is a `}
        <b>candidate</b>
        {", not a detection: it needs confirming in another pass."}
      </>
    );
  }
  return (
    <>
      <b>Moves, but not as parallax predicts.</b>
      {" More likely noise, an artifact, a mis-click or a nearby slow object."}
    </>
  );
}

const VERDICT_CLASS: Record<FitKind, string> = { still: "still", near: "near", distant: "far", misfit: "mis" };

export const PanelPlanetX: React.FC<{ state: PanelPlanetXState }> = ({ state }) => {
  const lab = focusRect("pxLab");
  const measureRect = focusRect("pxMeasure");
  const top = lab.y;
  const height = Math.max(lab.y + lab.h, measureRect.y + measureRect.h) - top;
  const px = selectParallax();
  const table = px.table;
  const dMin = table[0].distanceAu;
  const dMax = table[table.length - 1].distanceAu;
  const distance = Math.min(dMax, Math.max(dMin, state.distanceAu));
  const frac = (distance - dMin) / (dMax - dMin);
  const row = nearestRow(distance);
  const reveal = clamp01(state.reveal);
  const out = clamp01(state.outReveal) * reveal;
  const six = clamp01(state.sixReveal);
  const measure = clamp01(state.measureReveal) * reveal;
  const fitReveal = clamp01(state.fitReveal);
  const pulse = clamp01(state.markPulse);
  const windowDays = px.window.mjdTo - px.window.mjdFrom;
  const windowSpan = duration(windowDays);
  const windowRate = row.windowArcsec / (windowDays * 24);
  const target = selectPallas().target;

  const pair = px.measuredPair;
  if (!pair.fit) throw new Error(`evidence: parallax.measuredPair.fit is missing. ${MISSING}`);
  const frameA = selectFrame(pair.a);
  const frameB = selectFrame(pair.b);
  const [first, second] = frameA.mjd <= frameB.mjd ? [frameA, frameB] : [frameB, frameA];
  const baseline = second.mjd - first.mjd;
  const baselineHours = baseline * 24;
  const baselineSpan = duration(baseline);
  const moved = pair.measuredArcsec;
  const total = pair.sigmaArcsec * SQRT2;
  const kind: FitKind = state.fitKind ?? pair.fit.kind;
  const aSet = state.marks >= 1;
  const bSet = state.marks >= 2;
  const numsOpacity = clamp01(state.marks - 1);
  const hintOpacity = clamp01(2 - state.marks);
  const ringTarget: "A" | "B" = state.marks >= 2 ? "B" : "A";
  const ring = (which: "A" | "B"): React.CSSProperties =>
    which === ringTarget && pulse > 0
      ? {
          borderColor: alpha(theme.accent, 0.4 + 0.6 * pulse),
          boxShadow: `0 0 0 ${(2 * pulse).toFixed(2)}px ${alpha(theme.accent, 0.55 * pulse)}, 0 0 ${(18 * pulse).toFixed(1)}px ${alpha(theme.accent, 0.35 * pulse)}`,
        }
      : {};

  return (
    <div className="sb-pan sb-px" style={{ left: lab.x, top, width: lab.w, height }} data-anchor="pxLab">
      <section className="card">
        <h2 className="lbl" style={lift(reveal)}>
          <i>1.</i>
          Planet X lab
        </h2>
        <div style={lift(reveal)}>
          <div className="small desc">What would a distant planet look like here? Earth's own motion makes it drift slowly.</div>
          <div className="slider" data-anchor="pxDistance">
            <div className="shead">
              <span>Distance</span>
              <b>{`${Math.round(distance / 10) * 10} AU`}</b>
            </div>
            <div className="rng">
              <div className="track">
                <div className="fill" style={{ width: `${(frac * 100).toFixed(2)}%` }} />
              </div>
              <div className="thumb" style={{ left: `${(frac * 100).toFixed(2)}%` }} />
            </div>
          </div>
        </div>
        <div className="pxout" style={lift(out)} data-anchor="pxOutput">
          <p>
            {"A body at "}
            <b>{`${row.distanceAu} AU`}</b>
            {" would shift "}
            <b>{`${fmt(row.windowArcsec, row.windowArcsec < 100 ? 1 : 0)}″ = ${fmt(row.windowPx, 1)} pixels`}</b>
            {` over these ${windowSpan} (${fmt(windowRate, 3)}″/hour).`}
          </p>
          <div className="px-grid">
            <div>
              <span>{"error on a measured shift (1σ per axis)"}</span>
              <b>{`±${fmt(px.sigmaArcsec, 1)}″`}</b>
            </div>
            <div>
              <span>farthest body distinguishable from a star here</span>
              <b>{`~${px.detectLimitAu > 5000 ? ">5000" : fmt(px.detectLimitAu, 0)} AU`}</b>
            </div>
            <div className="hl" style={lift(six)} data-anchor="pxSixMonth">
              <span>same body, a second pass 6 months later</span>
              <b>{`${fmt(row.sixMonthArcsec, 0)}″ = ${fmt(row.sixMonthPx, 0)} px`}</b>
            </div>
          </div>
          <span className="small">
            <span style={{ opacity: six }}>
              {`That is ${fmt(row.sixMonthOverWindow, 0)}× more shift than this field's ${windowSpan} window, which is why the challenge compares images six months apart. `}
            </span>
            {`For comparison, ${target} moves ${fmt(px.targetRateArcsecPerHour, 0)}″/hour.`}
          </span>
        </div>
        <div className="mvblock" style={lift(measure)} data-anchor="pxMeasure">
          <h3 className="lbl sub">Measure a mover</h3>
          <div className="btnrow">
            <div className="btn ghost" style={ring("A")} data-anchor="markA">
              Mark A
            </div>
            <div className="btn ghost" style={ring("B")} data-anchor="markB">
              Mark B
            </div>
            <div className="btn ghost" data-anchor="clearMk">
              Clear
            </div>
          </div>
          <div className="mvout">
            <div className="ab">
              <b>A</b>
              {aSet ? utcLabel(first.utc) : "not set"}
            </div>
            <div className="ab">
              <b>B</b>
              {bSet ? utcLabel(second.utc) : "not set"}
            </div>
            <div className="mvbody">
              <span className="small hint" style={{ opacity: hintOpacity }}>
                Click the mover on one frame and press Mark A. Move the time bar, click it again, press Mark B.
              </span>
              <div style={{ opacity: numsOpacity }}>
                <div className="mv-nums" data-anchor="pxMoved">
                  <div>
                    <span>{`moved · ${fmt(pair.measuredPx, 1)} px`}</span>
                    <b>{`${fmt(moved, moved < 100 ? 1 : 0)}″ ± ${fmt(total, 1)}″`}</b>
                  </div>
                  <div>
                    <span>in</span>
                    <b>{baselineSpan}</b>
                  </div>
                  <div>
                    <span>rate</span>
                    <b>{`${fmt(moved / baselineHours, 2)} ± ${fmt(total / baselineHours, 2)}″/h`}</b>
                  </div>
                </div>
                <div className={`verdict ${VERDICT_CLASS[kind]}`} style={{ opacity: fitReveal * numsOpacity, transform: `translateY(${((1 - fitReveal) * 6).toFixed(2)}px)` }} data-anchor="pxFit">
                  <i />
                  <span>{fitWords(kind, pair.fit, moved, total, baselineSpan)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
