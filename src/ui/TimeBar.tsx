import React from "react";
import { alpha, theme } from "../config/theme";
import { focusRect } from "../config/focus";
import { selectPallasFrames, selectSixMonth } from "../data/select";
import type { FrameInfo } from "../data/types";
import { clamp01 } from "../lib/ease";

export interface TimeBarState {
  position: number;
  epochSeg: null | number;
  reveal: number;
  fieldId: string;
}

export const TIME_DEFAULT: TimeBarState = { position: 0, epochSeg: null, reveal: 1, fieldId: "pallas" };

const PAD = 14;
const EPOCH_COLORS: Record<number, string> = { 1: theme.ink3, 2: theme.teal, 3: theme.violet };
const epochColor = (e: number): string => EPOCH_COLORS[e] ?? theme.teal;

function framesFor(fieldId: string): FrameInfo[] {
  const all = fieldId === "pallas-6mo" ? selectSixMonth().frames : selectPallasFrames();
  return [...all].sort((a, b) => a.mjd - b.mjd || a.id.localeCompare(b.id));
}

const day = (f: FrameInfo): string => `${f.utc.slice(0, 10)} UTC`;

export const TimeBar: React.FC<{ state: TimeBarState }> = ({ state }) => {
  const r = focusRect("timeBar");
  const frames = framesFor(state.fieldId);
  const n = frames.length;
  const inner = r.w - 2 * PAD;
  const xOf = (i: number): number => PAD + (n < 2 ? 0.5 : i / (n - 1)) * inner;
  const pos = clamp01(state.position);
  const playX = PAD + pos * inner;
  const nearest = n < 2 ? 0 : Math.round(pos * (n - 1));
  const reveal = clamp01(state.reveal);

  const epochs = Array.from(new Set(frames.map((f) => f.epoch))).sort((a, b) => a - b);
  const segs = epochs.map((e, k) => {
    const idx = frames.map((f, i) => (f.epoch === e ? i : -1)).filter((i) => i >= 0);
    const first = idx[0];
    const last = idx[idx.length - 1];
    const left = k === 0 ? PAD - 8 : (xOf(first - 1) + xOf(first)) / 2;
    const right = k === epochs.length - 1 ? r.w - PAD + 8 : (xOf(last) + xOf(last + 1)) / 2;
    return { e, first, left, right };
  });
  const lastFrame = frames[n - 1];

  return (
    <div
      className="sb-tl"
      style={{ left: r.x, top: r.y, width: r.w, height: r.h, opacity: reveal, transform: `translateY(${((1 - reveal) * 12).toFixed(2)}px)` }}
    >
      {segs.map((s) => {
        const on = state.epochSeg === s.e;
        const c = epochColor(s.e);
        return (
          <div
            key={s.e}
            className={on ? "seg on" : "seg"}
            data-anchor={`epoch${s.e}`}
            style={{
              left: s.left + 2,
              width: s.right - s.left - 4,
              borderColor: on ? c : theme.rule2,
              background: on ? alpha(c, 0.16) : "transparent",
              color: on ? theme.ink : theme.ink3,
            }}
          >
            Pass {s.e}
          </div>
        );
      })}
      {frames.map((f, i) => {
        const on = i === nearest;
        return (
          <i
            key={`${f.band}-${f.id}-${i}`}
            className={on ? "tick on" : "tick"}
            style={{ left: xOf(i) - 0.5, background: on ? theme.accent : epochColor(f.epoch), opacity: on ? 1 : 0.8 }}
          />
        );
      })}
      {segs.map((s) => (
        <span key={`d${s.e}`} className="date" style={{ left: xOf(s.first) - 2 }}>
          {day(frames[s.first])}
        </span>
      ))}
      <span className="date end" style={{ right: PAD - 8 }}>
        {day(lastFrame)}
      </span>
      <div className="play" data-anchor="playhead" style={{ left: playX - 1 }} />
    </div>
  );
};
