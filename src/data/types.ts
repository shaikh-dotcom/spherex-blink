export interface EvidenceMeta {
  sample: boolean;
  capturedAt: string;
  sourceRepo: string;
  sourceCommit: string | null;
  sourceDirty: boolean | null;
  dataRelease: string;
  note: string;
}

export interface Overview {
  realFields: number;
  simulatedFields: number;
  realFrames: number;
  simulatedFrames: number;
  asteroidFields: number;
  passes: string[];
}

export interface FieldInfo {
  id: string;
  title: string;
  kind: "real" | "simulated";
  target: string | null;
  frames: number;
  bands: string[];
  epochs: number[];
  ra: number;
  dec: number;
  sizeDeg: number;
}

export interface FrameInfo {
  id: string;
  band: string;
  epoch: number;
  utc: string;
  mjd: number;
  coverage: number;
  wavelengthUm: number | null;
  wavelengthEstimated: boolean | null;
  bkg: number;
  unit: string;
  file: string;
}

export interface TargetPosition {
  ra: number;
  dec: number;
  col: number;
  row: number;
}

export interface ValidationFrame {
  band: string;
  pred: [number, number];
  centroid: [number, number];
  offsetPx: number;
  peak: number;
  median: number;
  snr: number;
  detected: boolean;
  absentElsewhere: boolean | null;
}

export interface ValidationSummary {
  target: string;
  frames_checked: number;
  frames_detected: number;
  median_offset_px: number;
  rms_offset_px: number;
  max_offset_px: number;
  pixscale_arcsec: number;
  rms_offset_arcsec: number;
  movers_confirmed: number;
}

export interface PairInfo {
  source: "rule" | "override";
  band: string;
  a: string;
  b: string;
  daysApart: number;
  wavelengthRelativeDifference: number | null;
  sharedFootprintUpperBound: number;
  note: string;
}

export interface PickInfo {
  frame: string;
  band: string;
  utc: string;
  wavelengthUm: number | null;
  pixel: [number, number];
  centroid: [number, number];
  predicted: [number, number];
  ra: number;
  dec: number;
  raHms: string;
  decDms: string;
  galactic: { l: number; b: number };
  ecliptic: { lon: number; lat: number };
  snr: number;
  peak8bit: number;
  flux: { value: number; unit: string; lowerLimit: boolean } | null;
  moverCheck: { otherFrames: number; goneFromAll: boolean; basis: string };
}

export interface PallasField {
  id: string;
  target: string;
  centre: { ra: number; dec: number };
  sizeDeg: number;
  tile: { width: number; height: number };
  pixscaleArcsec: number;
  bands: string[];
  frames: FrameInfo[];
  target_positions: Record<string, TargetPosition>;
  validation: { summary: ValidationSummary; frames: Record<string, ValidationFrame> };
  pair: PairInfo;
  pick: PickInfo;
}

export interface PassInfo {
  epoch: number;
  from: string;
  to: string;
  frames: number;
  bands: string[];
}

export interface SixMonthField {
  id: string;
  passes: PassInfo[];
  frames: FrameInfo[];
  tile: { width: number; height: number };
  sizeDeg: number;
}

export interface ValidationField {
  id: string;
  target: string;
  framesChecked: number;
  framesDetected: number;
  moversConfirmed: number;
  rmsOffsetPx: number;
}

export interface ValidationAll {
  totals: { fields: number; framesChecked: number; framesDetected: number; moversConfirmed: number };
  fields: ValidationField[];
}

export interface ShiftRow {
  distanceAu: number;
  windowArcsec: number;
  windowPx: number;
  sixMonthArcsec: number;
  sixMonthPx: number;
  sixMonthOverWindow: number;
}

export interface ParallaxEvidence {
  pixscaleArcsec: number;
  window: { from: string; to: string; mjdFrom: number; mjdTo: number; days: number };
  sixMonthDays: number;
  sigmaArcsec: number;
  detectLimitAu: number;
  table: ShiftRow[];
  headline: ShiftRow;
  targetRateArcsecPerHour: number;
  measuredPair: {
    a: string;
    b: string;
    daysApart: number;
    measuredArcsec: number;
    measuredPx: number;
    sigmaArcsec: number;
    fit: {
      kind: "still" | "near" | "distant" | "misfit";
      distanceAu: number;
      rangeAu: [number, number];
      openHigh: boolean;
      limitAu: number;
      predictedAtDminArcsec: number | null;
      dminAu: number;
    } | null;
  };
}

export interface OrreryEvidence {
  mjd0: number;
  days: number;
  step: number;
  bodies: Record<string, number[][]>;
}

export interface Evidence {
  meta: EvidenceMeta;
  overview: Overview;
  fields: FieldInfo[];
  pallas: PallasField;
  pallas6mo: SixMonthField;
  validationAll: ValidationAll;
  parallax: ParallaxEvidence;
  orrery: OrreryEvidence;
  flags: { csvColumns: string[] | null; categories: string[] };
  acknowledgement: string | null;
}
