import { Easing } from "remotion";
export const SIGNATURE_BEZIER = [0.65, 0, 0.35, 1] as const;
export const signature: (t: number) => number = Easing.bezier(0.65, 0, 0.35, 1);
export const easeInOut = signature;
export const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number, easing: (t: number) => number = (t) => t): number {
    if (inMin === inMax)
        return value < inMin ? outMin : outMax;
    const t = clamp01((value - inMin) / (inMax - inMin));
    return outMin + (outMax - outMin) * easing(t);
}
export function easeOutBack(t: number, s = 1.70158): number {
    const x = clamp01(t) - 1;
    return 1 + (s + 1) * x * x * x + s * x * x;
}
export function overshoot(t: number, amount = 0.05): number {
    const x = clamp01(t);
    const split = 0.7;
    if (x <= split)
        return (1 + amount) * signature(x / split);
    return 1 + amount * (1 - signature((x - split) / (1 - split)));
}
export function stepPulse(frame: number, start: number, len: number): number {
    if (frame < start || len <= 0)
        return 0;
    const t = (frame - start) / len;
    if (t >= 1)
        return 0;
    return 1 - signature(t);
}
