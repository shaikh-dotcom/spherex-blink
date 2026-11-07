import { spring } from "remotion";
export interface SpringConfig {
    damping: number;
    stiffness: number;
    mass: number;
}
export const springPresets = {
    uiPop: { damping: 18, stiffness: 170, mass: 0.9 },
    panel: { damping: 22, stiffness: 120, mass: 1 },
    camera: { damping: 26, stiffness: 90, mass: 1.1 },
    settle: { damping: 14, stiffness: 220, mass: 1 },
} as const satisfies Record<string, SpringConfig>;
export type SpringPresetName = keyof typeof springPresets;
export function spr(frame: number, fps: number, startFrame: number, preset: SpringPresetName | SpringConfig = "uiPop"): number {
    const local = frame - startFrame;
    if (local <= 0)
        return 0;
    const config = typeof preset === "string" ? springPresets[preset] : preset;
    return spring({ frame: local, fps, config });
}
