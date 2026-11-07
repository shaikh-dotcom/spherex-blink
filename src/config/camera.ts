import type { FocusName } from "./focus";
export type CameraEase = "spring" | "signature" | "linear";
export interface CameraKeyframe {
    frame: number;
    target: FocusName;
    padding: number;
    scaleBias: number;
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    ease?: CameraEase;
    frames?: number;
    shake?: number;
}
export interface CursorWaypoint {
    frame: number;
    x: number;
    y: number;
    click?: boolean;
    hover?: string;
    hide?: boolean;
}
export const CAMERA_LIMITS = {
    scaleMin: 1.0,
    scaleMax: 2.6,
    tiltX: 6,
    tiltY: 5,
    tiltXWide: 14,
    tiltYWide: 14,
    tiltZ: 3,
    perspective: 1800,
    driftPx: 5,
    floatZoom: 0.004,
    shakeFrames: 8,
    dofBlurPx: 1.2,
    dofDim: 0.12,
    springSettled: 150,
    defaultMoveFrames: 30,
} as const;
export function kf(frame: number, target: FocusName, opts: Partial<Omit<CameraKeyframe, "frame" | "target">> = {}): CameraKeyframe {
    return {
        frame,
        target,
        padding: opts.padding ?? 96,
        scaleBias: opts.scaleBias ?? 1,
        rotateX: opts.rotateX ?? 0,
        rotateY: opts.rotateY ?? 0,
        rotateZ: opts.rotateZ ?? 0,
        ...(opts.ease !== undefined ? { ease: opts.ease } : {}),
        ...(opts.frames !== undefined ? { frames: opts.frames } : {}),
        ...(opts.shake !== undefined ? { shake: opts.shake } : {}),
    };
}
export function holdShot(frame: number, end: number, target: FocusName, opts: {
    padding?: number;
    arrive?: number;
    push?: number;
    scaleBias?: number;
    rotateX?: number;
    rotateY?: number;
} = {}): CameraKeyframe[] {
    const arrive = opts.arrive ?? 36;
    const push = opts.push ?? 0.04;
    const bias = opts.scaleBias ?? 1;
    const common = { padding: opts.padding ?? 96, rotateX: opts.rotateX ?? 0, rotateY: opts.rotateY ?? 0 };
    if (!(end > frame + arrive))
        throw new Error(`holdShot: end f${end} must be later than frame f${frame} + arrive ${arrive}`);
    return [
        kf(frame, target, { ...common, scaleBias: bias, ease: "signature", frames: arrive }),
        kf(frame + arrive, target, { ...common, scaleBias: bias * (1 + push), ease: "linear", frames: end - (frame + arrive) }),
    ];
}
