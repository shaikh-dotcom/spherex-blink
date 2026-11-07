import raw from "./evidence.json";
import type {
  Evidence,
  EvidenceMeta,
  FieldInfo,
  FrameInfo,
  Overview,
  OrreryEvidence,
  PairInfo,
  PallasField,
  ParallaxEvidence,
  PickInfo,
  ShiftRow,
  SixMonthField,
  TargetPosition,
  ValidationAll,
  ValidationFrame,
} from "./types";

const evidence = raw as unknown as Evidence;

function need<T>(value: T | null | undefined, path: string): T {
  if (value === null || value === undefined) {
    throw new Error(`evidence: ${path} is missing. Re-capture with: npm run evidence -- --repo <path to spherex-blink>`);
  }
  return value;
}

export function selectMeta(): EvidenceMeta {
  return need(evidence.meta, "meta");
}

export function selectOverview(): Overview {
  return need(evidence.overview, "overview");
}

export function selectFields(): FieldInfo[] {
  return need(evidence.fields, "fields");
}

export function selectPallas(): PallasField {
  return need(evidence.pallas, "pallas");
}

export function selectPallasFrames(band?: string): FrameInfo[] {
  const all = need(evidence.pallas.frames, "pallas.frames");
  return band ? all.filter((x) => x.band === band) : all;
}

export function selectFrame(id: string): FrameInfo {
  const hit = [...selectPallas().frames, ...selectSixMonth().frames].find((x) => x.id === id);
  return need(hit, `pallas.frames[${id}]`);
}

export function selectPair(): { info: PairInfo; a: FrameInfo; b: FrameInfo } {
  const info = need(evidence.pallas.pair, "pallas.pair");
  const frames = selectPallasFrames(info.band);
  const a = need(frames.find((x) => x.id === info.a), `pallas.frames[${info.a}]`);
  const b = need(frames.find((x) => x.id === info.b), `pallas.frames[${info.b}]`);
  return { info, a, b };
}

export function selectPick(): PickInfo {
  return need(evidence.pallas.pick, "pallas.pick");
}

export function selectTargetPosition(frameId: string): TargetPosition {
  return need(evidence.pallas.target_positions[frameId], `pallas.target_positions[${frameId}]`);
}

export function selectValidationFrame(frameId: string): ValidationFrame {
  return need(evidence.pallas.validation.frames[frameId], `pallas.validation.frames[${frameId}]`);
}

export function selectPallasValidation() {
  return need(evidence.pallas.validation, "pallas.validation");
}

export function selectValidationAll(): ValidationAll {
  return need(evidence.validationAll, "validationAll");
}

export function selectSixMonth(): SixMonthField {
  return need(evidence.pallas6mo, "pallas6mo");
}

export function selectParallax(): ParallaxEvidence {
  return need(evidence.parallax, "parallax");
}

export function selectShift(distanceAu: number): ShiftRow {
  const row = selectParallax().table.find((x) => x.distanceAu === distanceAu);
  return need(row, `parallax.table[${distanceAu} AU]`);
}

export function selectOrrery(): OrreryEvidence {
  return need(evidence.orrery, "orrery");
}

export function selectAcknowledgement(): string {
  return need(evidence.acknowledgement, "acknowledgement");
}

export function selectFlagColumns(): string[] {
  return need(evidence.flags.csvColumns, "flags.csvColumns");
}

export function selectFlagCategories(): string[] {
  return need(evidence.flags.categories, "flags.categories");
}

let cachedId: string | null = null;

export function selectEvidenceShortId(): string {
  if (cachedId) return cachedId;
  const text = JSON.stringify(evidence);
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  cachedId = h.toString(16).padStart(8, "0");
  return cachedId;
}

export function formatUtc(utc: string): string {
  return utc.replace("T", " ").replace("Z", " UTC");
}

export function formatWavelength(frame: FrameInfo): string {
  if (frame.wavelengthUm === null) return "—";
  return `${frame.wavelengthEstimated ? "≈" : ""}${frame.wavelengthUm.toFixed(2)} µm`;
}
