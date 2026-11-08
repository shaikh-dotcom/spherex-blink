import React from "react";
import { useCurrentFrame } from "remotion";
import type { FilmStatePatch } from "../config/filmState";
import { holdShot, type CameraKeyframe, type CursorWaypoint } from "../config/camera";
import { s2, badges } from "../config/copy";
import { focusRect, rectPoint } from "../config/focus";
import { CUES, SCENES, STAGE } from "../config/timeline";
import { alpha, fonts, glass, hair, theme } from "../config/theme";
import { selectOverview, selectPair, selectPallas, selectPallasFrames } from "../data/select";
import { Badge, badgePulse, badgeReveal } from "../fx/Badge";
import { Callout } from "../fx/Callout";
import { Caption } from "../fx/Caption";
import { StatNumeral } from "../fx/StatNumeral";
import { clamp01, signature } from "../lib/ease";

const START = SCENES.S2.start;
const END = SCENES.S2.end;

const IMAGE_AT = 690;
const PLATES_AT = CUES.s2.bands;
const FIGURE_AT = CUES.s2.captionPatch;
const BAND_STEP = 45;
const SWEEP_END = 1040;
const RETURN_END = 1070;
const CAPTION_END = 765;
const PATCH_CAPTION_END = 1065;
const BADGE_AT = 720;
const BADGE_END = 774;
const COUNTER_LEN = 45;
const COUNTER_OUT = 762;
const TAG_END = 945;

export const S2_CAMERA: CameraKeyframe[] = [
  ...holdShot(START, IMAGE_AT, "header", { arrive: 36, push: 0.03 }),
  ...holdShot(IMAGE_AT, PLATES_AT, "skyImage", { arrive: 36, push: 0.03 }),
  ...holdShot(PLATES_AT, FIGURE_AT, "bandPlates", { arrive: 36, push: 0.04, scaleBias: 0.27 }),
  ...holdShot(FIGURE_AT, END + 1, "centre", { arrive: 36, push: 0.03, scaleBias: 1.22 }),
];

const plate = (id: string): { x: number; y: number } => {
  const x = id === "D1" || id === "D4" ? 57 : 134;
  const y = id === "D1" || id === "D2" ? 127 : 179;
  return { x: x + 8, y: y + 8 };
};

const bar = focusRect("timeBar");
const image = focusRect("skyImage");
const badge = { x: 1270, y: 36 };

export const S2_CURSOR: CursorWaypoint[] = [
  { frame: 648, x: badge.x - 20, y: badge.y + 8, hover: "badge" },
  { frame: 738, ...rectPoint(image, 0.68, 0.36) },
  { frame: 822, ...plate("D1"), hover: "bandD1" },
  { frame: 846, ...plate("D2"), hover: "bandD2" },
  { frame: 891, ...plate("D4"), hover: "bandD4" },
  { frame: 936, ...plate("D5"), hover: "bandD5" },
  { frame: 984, x: bar.x + bar.w * 0.18, y: bar.y - 24 },
  { frame: 1056, ...rectPoint(image, 0.58, 0.52) },
];

const bandsOf = (): string[] => selectPallas().bands;

const framesByDate = () => [...selectPallasFrames()].sort((a, b) => a.mjd - b.mjd || a.id.localeCompare(b.id));

const sweepAt = (frame: number): number => {
  if (frame < FIGURE_AT) return 0;
  if (frame <= SWEEP_END) return signature(clamp01((frame - FIGURE_AT) / (SWEEP_END - FIGURE_AT)));
  return 1 - signature(clamp01((frame - SWEEP_END) / (RETURN_END - SWEEP_END)));
};

const bandFrameAt = (position: number, band: string): string => {
  const all = framesByDate();
  const nearest = Math.round(position * (all.length - 1));
  const same = all.filter((f) => f.band === band);
  const before = all.slice(0, nearest + 1).filter((f) => f.band === band);
  return (before.length ? before[before.length - 1] : same[0]).id;
};

export const S2_STATE = (frame: number): FilmStatePatch => {
  const pair = selectPair();
  const bands = bandsOf();
  const stepping = frame >= PLATES_AT && frame < FIGURE_AT;
  const sweeping = frame >= FIGURE_AT;
  let band = pair.info.band;
  let idA = pair.info.a;
  if (stepping) {
    const k = Math.min(bands.length - 1, Math.floor((frame - PLATES_AT) / BAND_STEP));
    band = bands[k];
    idA = selectPallasFrames(band)[0].id;
  }
  const position = sweepAt(frame);
  if (sweeping) idA = bandFrameAt(position, pair.info.band);
  const seg = frame >= FIGURE_AT && frame <= SWEEP_END ? Math.min(3, 1 + Math.floor((frame - FIGURE_AT) / 27)) : null;
  return {
    appOpacity: 1,
    header: { fieldId: "pallas", badge: "real", tourPulse: 0 },
    rail: { fieldId: "pallas", band, mode: "static", hot: stepping ? "band" : null, showKnown: true },
    viewer: { fieldId: "pallas", pairA: idA, pairB: idA, blinkPhase: 0, zoom: 1, cx: 0.5, cy: 0.5, selection: null, overlayAB: false, view: "sky", reveal: 1 },
    time: { fieldId: "pallas", position, epochSeg: seg, reveal: 1 },
    tabs: { tab: "inspect", reveal: 1 },
  };
};

const StatCard: React.FC<{ x: number; value: number; label: string; frame: number }> = ({ x, value, label, frame }) => {
  const inP = signature(clamp01((frame - CUES.s2.counter) / 18));
  const outP = signature(clamp01((frame - COUNTER_OUT) / 18));
  const show = inP * (1 - outP);
  if (show <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 330,
        width: 374,
        height: 250,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        rowGap: 22,
        borderRadius: 18,
        border: `1px solid ${hair(0.18)}`,
        background: `linear-gradient(180deg, ${alpha(theme.accent, 0.06)}, transparent 60%), ${glass(0.92)}`,
        boxShadow: `0 24px 60px -24px ${alpha("#000000", 0.85)}`,
        opacity: show,
        transform: `translateY(${(1 - inP) * 24 + outP * -16}px)`,
      }}
    >
      <StatNumeral value={value} startFrame={CUES.s2.counter} durationFrames={COUNTER_LEN} group size={132} />
      <div style={{ fontFamily: fonts.mono, fontWeight: 500, fontSize: 30, letterSpacing: "0.08em", color: theme.ink2, whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
};

export const S2Data: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < START || frame > END) return null;
  const overview = selectOverview();
  const reveal = badgeReveal(frame, BADGE_AT, 14);
  const exit = 1 - signature(clamp01((frame - (BADGE_END - 12)) / 12));
  const badgeOn = frame >= BADGE_AT && frame < BADGE_END;
  return (
    <>
      <Caption text={s2.caption} highlight="102 infrared colours" startFrame={CUES.s2.caption} endFrame={CAPTION_END} />
      <StatCard x={96} value={overview.realFields} label={s2.counterLabel} frame={frame} />
      <StatCard x={STAGE.w - 96 - 374} value={overview.realFrames} label={s2.counterFrames} frame={frame} />
      {badgeOn ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 30,
            width: STAGE.w,
            display: "flex",
            justifyContent: "center",
            opacity: exit,
            transform: `translateY(${(1 - reveal) * -14}px)`,
          }}
        >
          <Badge label={badges.real} tone="ok" size={20} reveal={reveal} pulse={badgePulse(frame, 45)} />
        </div>
      ) : null}
      <Callout text={s2.bandsTag} variant="note" mono target="bandPlates" camera={S2_CAMERA} side="right" lead={44} startFrame={PLATES_AT} endFrame={TAG_END} />
      <Caption text={s2.captionPatch} highlight="different days" startFrame={CUES.s2.captionPatch} endFrame={PATCH_CAPTION_END} />
    </>
  );
};

