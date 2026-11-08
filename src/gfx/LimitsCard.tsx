import React from "react";
import { fonts, theme, alpha } from "../config/theme";
import { badges, s8 } from "../config/copy";
import { clamp01, signature } from "../lib/ease";
import { selectFields, selectMeta, selectOverview, selectValidationAll } from "../data/select";

export interface LimitsCardProps {
  progress: number;
}

type Mark = "tick" | "diamond" | "hatch";

interface Row {
  text: string;
  mark: Mark;
  pill?: string;
}

interface Column {
  title: string;
  color: string;
  rows: Row[];
}

const W = 1500;
const H = 560;
const COL_W = 440;
const GAP = 60;
const ROW_START = 0.1;
const ROW_STEP = 0.14;
const ROW_SPAN = 0.12;

function buildColumns(): Column[] {
  const overview = selectOverview();
  const totals = selectValidationAll().totals;
  const detectors = selectFields().map((f) => f.bands.length);
  const minBands = Math.min(...detectors);
  const maxBands = Math.max(...detectors);
  const release = selectMeta().dataRelease.split(",")[0];
  return [
    {
      title: s8.columns.real,
      color: theme.good,
      rows: [
        { text: `${overview.realFields} real fields, ${overview.realFrames} real frames`, mark: "tick" },
        { text: release, mark: "tick" },
        { text: `Known asteroid found on its predicted spot in ${totals.framesDetected} of ${totals.framesChecked} frames`, mark: "tick" },
      ],
    },
    {
      title: s8.columns.simulated,
      color: theme.warn,
      rows: [
        { text: `${overview.simulatedFields} simulated practice field`, mark: "diamond" },
        { text: "Always labelled on screen", mark: "diamond", pill: badges.simulated },
      ],
    },
    {
      title: s8.columns.limited,
      color: theme.bad,
      rows: [
        { text: `Each field keeps ${minBands} to ${maxBands} of the six detectors: a handful of the 102 colours`, mark: "hatch" },
        { text: "A sample of the sky, not the whole survey", mark: "hatch" },
        { text: `Stricter check (gone from that pixel elsewhere too): ${totals.moversConfirmed} of ${totals.framesChecked} frames`, mark: "hatch" },
        { text: "Slow asteroids barely move in their window, so they cannot pass it", mark: "hatch" },
        { text: "Tiles are 8-bit stretched pictures: brightness is approximate", mark: "hatch" },
      ],
    },
  ];
}

const MarkGlyph: React.FC<{ kind: Mark; color: string }> = ({ kind, color }) => {
  if (kind === "tick") {
    return (
      <svg width={26} height={26} viewBox="0 0 26 26" style={{ flex: "none", marginTop: 3 }}>
        <path d="M5 13.5 L11 19 L21 7" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "diamond") {
    return (
      <svg width={26} height={26} viewBox="0 0 26 26" style={{ flex: "none", marginTop: 3 }}>
        <path d="M13 4 L22 13 L13 22 L4 13 Z" fill="none" stroke={color} strokeWidth={2.4} />
      </svg>
    );
  }
  return (
    <div
      style={{
        flex: "none",
        width: 22,
        height: 22,
        marginTop: 5,
        marginLeft: 2,
        border: `2px solid ${color}`,
        background: theme.hatchBad,
      }}
    />
  );
};

export const LimitsCard: React.FC<LimitsCardProps> = ({ progress }) => {
  const p = clamp01(progress);
  const columns = buildColumns();
  const head = signature(clamp01(p / 0.1));
  return (
    <div style={{ position: "relative", width: W, height: H, fontFamily: fonts.serif, color: theme.ink }}>
      {columns.map((col, ci) => (
        <div key={col.title} style={{ position: "absolute", left: ci * (COL_W + GAP), top: 0, width: COL_W }}>
          <div
            style={{
              fontFamily: fonts.mono,
              fontSize: 24,
              letterSpacing: 4,
              color: col.color,
              opacity: head,
              paddingBottom: 14,
            }}
          >
            {col.title}
          </div>
          <div style={{ height: 2, width: COL_W * head, background: alpha(col.color, 0.7), marginBottom: 22 }} />
          {col.rows.map((row, ri) => {
            const t = signature(clamp01((p - (ROW_START + ri * ROW_STEP)) / ROW_SPAN));
            return (
              <div
                key={row.text}
                style={{
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                  marginBottom: 18,
                  opacity: t,
                  transform: `translateY(${12 * (1 - t)}px)`,
                }}
              >
                <MarkGlyph kind={row.mark} color={col.color} />
                <div style={{ fontSize: 25, lineHeight: 1.24, color: theme.ink }}>
                  {row.text}
                  {row.pill ? (
                    <div
                      style={{
                        display: "inline-block",
                        marginTop: 8,
                        marginLeft: 0,
                        fontFamily: fonts.mono,
                        fontSize: 20,
                        padding: "3px 12px",
                        border: `1.5px solid ${theme.warn}`,
                        background: theme.warnWash,
                        color: theme.warn,
                      }}
                    >
                      {row.pill}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: 2 * (COL_W + GAP),
          bottom: 0,
          display: "flex",
          alignItems: "center",
          gap: 14,
          opacity: signature(clamp01((p - 0.86) / 0.1)),
        }}
      >
        <div style={{ width: 120, height: 40, background: theme.sunken, backgroundImage: theme.hatchNoData, border: `1px solid ${theme.rule2}` }} />
        <div style={{ fontFamily: fonts.mono, fontSize: 20, color: theme.ink2 }}>No coverage</div>
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, fontFamily: fonts.mono, fontSize: 20, color: alpha(theme.ink, 0.5) }}>Prototype, not a discovery tool</div>
    </div>
  );
};
