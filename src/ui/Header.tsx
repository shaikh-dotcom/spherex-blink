import React from "react";
import { alpha, theme } from "../config/theme";
import { badges, brand } from "../config/copy";
import { focusRect } from "../config/focus";
import { selectFields } from "../data/select";
import { Mark } from "../gfx/Mark";
import { clamp01 } from "../lib/ease";

export interface HeaderState {
  fieldId: string;
  badge: "real" | "simulated";
  tourPulse: number;
}

export const HEADER_DEFAULT: HeaderState = { fieldId: "pallas", badge: "real", tourPulse: 0 };

const TAGLINE = "Hunting for moving worlds in the infrared sky";

export const Header: React.FC<{ state: HeaderState }> = ({ state }) => {
  const r = focusRect("header");
  const field = selectFields().find((f) => f.id === state.fieldId);
  const title = field ? field.title : state.fieldId;
  const sim = state.badge === "simulated";
  const p = clamp01(state.tourPulse);
  const tourStyle: React.CSSProperties =
    p > 0
      ? {
          borderColor: alpha(theme.accent, 0.35 + 0.65 * p),
          color: theme.ink,
          boxShadow: `0 0 0 ${(2 * p).toFixed(2)}px ${alpha(theme.accent, 0.55 * p)}, 0 0 ${(28 * p).toFixed(2)}px ${alpha(theme.accent, 0.5 * p)}`,
        }
      : {};
  return (
    <div className="sb-hd" style={{ left: r.x, top: r.y, width: r.w, height: r.h }}>
      <div className="brand">
        <span className="logo">
          <Mark size={38} />
        </span>
        <div>
          <div className="overline">{brand.eyebrow}</div>
          <h1>
            {brand.nameLead} <em>{brand.nameAccent}</em>
          </h1>
        </div>
      </div>
      <div className="hdr-right">
        <span className="tag">{TAGLINE}</span>
        <div className="field">
          <span>Field</span>
          <div className={sim ? "sel sim" : "sel"} data-anchor="fieldSelect">
            <span>{title}</span>
            <svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
              <path d="M1 1l4 4 4-4" fill="none" stroke={theme.ink2} strokeWidth="1.4" />
            </svg>
          </div>
        </div>
        <span className={sim ? "badge sim" : "badge ok"} data-anchor="badge">
          {sim ? badges.simulated : badges.real}
        </span>
        <div className="gbtn" style={tourStyle} data-anchor="tourBtn">
          Tour
        </div>
        <div className="gbtn" data-anchor="aboutBtn">
          About
        </div>
        <div className="gbtn round" data-anchor="helpBtn">
          ?
        </div>
      </div>
    </div>
  );
};
