import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { CAMERA_LIMITS, type CameraKeyframe } from "../config/camera";
import { focusRect } from "../config/focus";
import { FPS, LOGICAL, STAGE, sceneAt } from "../config/timeline";
import { clamp01, mapRange, signature } from "../lib/ease";
import { rand } from "../lib/prng";
import { spr } from "../lib/spring";
import { veil } from "../config/theme";
const ORIGIN = { x: STAGE.w / 2, y: STAGE.h / 2 } as const;
interface Pose {
    cx: number;
    cy: number;
    logScale: number;
    rx: number;
    ry: number;
    rz: number;
    fw: number;
    fh: number;
}
export interface CameraState {
    scale: number;
    tx: number;
    ty: number;
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    driftX: number;
    driftY: number;
    shakeX: number;
    shakeY: number;
    focusW: number;
    focusH: number;
}
export interface CameraOptions {
    wideTilt?: boolean;
}
const clampTo = (v: number, lim: number): number => (v < -lim ? -lim : v > lim ? lim : v);
function poseOf(k: CameraKeyframe): Pose {
    const r = focusRect(k.target);
    const availW = STAGE.w - 2 * k.padding;
    const availH = STAGE.h - 2 * k.padding;
    if (!(availW > 0) || !(availH > 0))
        throw new Error(`Camera: padding ${k.padding} leaves no room on the stage (keyframe at frame ${k.frame})`);
    if (!(k.scaleBias > 0))
        throw new Error(`Camera: scaleBias must be > 0 (keyframe at frame ${k.frame})`);
    const fit = Math.min(availW / r.w, availH / r.h) * k.scaleBias;
    const s = Math.min(CAMERA_LIMITS.scaleMax, Math.max(CAMERA_LIMITS.scaleMin, fit));
    return { cx: r.x + r.w / 2, cy: r.y + r.h / 2, logScale: Math.log(s), rx: k.rotateX, ry: k.rotateY, rz: k.rotateZ, fw: r.w * s, fh: r.h * s };
}
function progress(frame: number, k: CameraKeyframe, fps: number): number {
    const local = frame - k.frame;
    if (local <= 0)
        return 0;
    const mode = k.ease ?? "spring";
    if (mode === "spring")
        return local > CAMERA_LIMITS.springSettled ? 1 : spr(frame, fps, k.frame, "camera");
    const len = k.frames ?? CAMERA_LIMITS.defaultMoveFrames;
    return mapRange(frame, k.frame, k.frame + Math.max(1, len), 0, 1, mode === "signature" ? signature : (t) => t);
}
function validate(keyframes: readonly CameraKeyframe[]): void {
    if (keyframes.length === 0)
        throw new Error("Camera: at least one keyframe is required");
    for (let i = 1; i < keyframes.length; i++) {
        if (!(keyframes[i].frame >= keyframes[i - 1].frame)) {
            throw new Error(`Camera: keyframes must be in frame order (keyframe ${i} at frame ${keyframes[i].frame} comes after frame ${keyframes[i - 1].frame})`);
        }
    }
}
function shakeAt(frame: number, keyframes: readonly CameraKeyframe[]): {
    x: number;
    y: number;
    rot: number;
} {
    let x = 0;
    let y = 0;
    let rot = 0;
    for (const k of keyframes) {
        if (!k.shake)
            continue;
        const local = frame - k.frame;
        if (local < 0 || local >= CAMERA_LIMITS.shakeFrames)
            continue;
        const t = local / CAMERA_LIMITS.shakeFrames;
        const decay = (1 - t) * (1 - t);
        const phaseX = rand(k.frame * 7 + 3) * Math.PI * 2;
        const phaseY = rand(k.frame * 13 + 5) * Math.PI * 2;
        const w = (Math.PI * 2) / 2.7;
        x += k.shake * decay * Math.sin(w * local + phaseX);
        y += k.shake * decay * Math.sin(w * local * 1.13 + phaseY);
        rot += k.shake * decay * 0.04 * Math.sin(w * local * 0.9 + phaseX);
    }
    return { x, y, rot };
}
function driftAt(frame: number): {
    x: number;
    y: number;
} {
    const a = CAMERA_LIMITS.driftPx;
    return {
        x: a * Math.sin((Math.PI * 2 * frame) / 190 + 0.7),
        y: a * Math.sin((Math.PI * 2 * frame) / 257 + 2.1),
    };
}
function breathAt(frame: number): number {
    return 1 + CAMERA_LIMITS.floatZoom * Math.sin((Math.PI * 2 * frame) / 310 + 1.3);
}
export function getCameraState(frame: number, keyframes: readonly CameraKeyframe[], fps: number = FPS, opts: CameraOptions = {}): CameraState {
    validate(keyframes);
    const poses = keyframes.map(poseOf);
    const acc = { ...poses[0] };
    for (let i = 1; i < poses.length; i++) {
        const p = progress(frame, keyframes[i], fps);
        if (p === 0)
            continue;
        const a = poses[i - 1];
        const b = poses[i];
        acc.cx += (b.cx - a.cx) * p;
        acc.cy += (b.cy - a.cy) * p;
        acc.logScale += (b.logScale - a.logScale) * p;
        acc.rx += (b.rx - a.rx) * p;
        acc.ry += (b.ry - a.ry) * p;
        acc.rz += (b.rz - a.rz) * p;
        acc.fw += (b.fw - a.fw) * p;
        acc.fh += (b.fh - a.fh) * p;
    }
    const wide = opts.wideTilt ?? (() => {
        const id = sceneAt(frame).id;
        return id === "S1" || id === "S9";
    })();
    const limX = wide ? CAMERA_LIMITS.tiltXWide : CAMERA_LIMITS.tiltX;
    const limY = wide ? CAMERA_LIMITS.tiltYWide : CAMERA_LIMITS.tiltY;
    const scale = Math.exp(acc.logScale) * breathAt(frame);
    const sh = shakeAt(frame, keyframes);
    const dr = driftAt(frame);
    const tx = ORIGIN.x - scale * acc.cx + (scale - 1) * ORIGIN.x + dr.x + sh.x;
    const ty = ORIGIN.y - scale * acc.cy + (scale - 1) * ORIGIN.y + dr.y + sh.y;
    return {
        scale,
        tx,
        ty,
        rotateX: clampTo(acc.rx, limX),
        rotateY: clampTo(acc.ry, limY),
        rotateZ: clampTo(acc.rz, CAMERA_LIMITS.tiltZ) + sh.rot,
        driftX: dr.x,
        driftY: dr.y,
        shakeX: sh.x,
        shakeY: sh.y,
        focusW: acc.fw,
        focusH: acc.fh,
    };
}
export function cameraTransform(s: CameraState): string {
    return (`perspective(${CAMERA_LIMITS.perspective}px) rotateX(${s.rotateX.toFixed(4)}deg) rotateY(${s.rotateY.toFixed(4)}deg) ` +
        `rotateZ(${s.rotateZ.toFixed(4)}deg) translate3d(${s.tx.toFixed(3)}px, ${s.ty.toFixed(3)}px, 0) scale(${s.scale.toFixed(5)})`);
}
export function worldToStage(state: CameraState, p: {
    x: number;
    y: number;
}): {
    x: number;
    y: number;
} {
    return {
        x: ORIGIN.x + state.tx + state.scale * (p.x - ORIGIN.x),
        y: ORIGIN.y + state.ty + state.scale * (p.y - ORIGIN.y),
    };
}
export interface CameraProps {
    keyframes: readonly CameraKeyframe[];
    dof?: boolean;
    wideTilt?: boolean;
    children?: React.ReactNode;
}
export const Camera: React.FC<CameraProps> = ({ keyframes, dof = true, wideTilt, children }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const state = getCameraState(frame, keyframes, fps, { wideTilt });
    const rx = Math.max(220, (state.focusW / 2) * 1.5);
    const ry = Math.max(140, (state.focusH / 2) * 1.5);
    const hole = `radial-gradient(ellipse ${rx.toFixed(1)}px ${ry.toFixed(1)}px at 50% 50%, transparent 62%, #000 100%)`;
    return (<div style={{ position: "absolute", left: 0, top: 0, width: STAGE.w, height: STAGE.h, overflow: "hidden" }}>
      <div style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: LOGICAL.w,
            height: LOGICAL.h,
            transformOrigin: `${ORIGIN.x}px ${ORIGIN.y}px`,
            transform: cameraTransform(state),
        }}>
        {children}
      </div>
      {dof ? (<div style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: STAGE.w,
                height: STAGE.h,
                pointerEvents: "none",
                background: veil(CAMERA_LIMITS.dofDim),
                maskImage: hole,
                WebkitMaskImage: hole,
            }}/>) : null}
    </div>);
};
export function cameraProgress(frame: number, startFrame: number, fps: number = FPS): number {
    return clamp01(spr(frame, fps, startFrame, "camera"));
}
