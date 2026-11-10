import React, { useId } from "react";
import { useCurrentFrame } from "remotion";
import { STAGE } from "../config/timeline";
import { rand } from "../lib/prng";
export interface GrainProps {
    opacity?: number;
    frequency?: number;
}
export function grainSeed(frame: number): number {
    return Math.floor(rand(frame * 31 + 11) * 100000);
}
export const GRAIN_OPACITY = 0.03;
export const Grain: React.FC<GrainProps> = ({ opacity = GRAIN_OPACITY, frequency = 0.85 }) => {
    const frame = useCurrentFrame();
    const id = useId().replace(/:/g, "");
    return (<svg width={STAGE.w} height={STAGE.h} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity, mixBlendMode: "overlay" }}>
      <filter id={`grain-${id}`} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency={frequency} numOctaves={2} seed={grainSeed(frame)} stitchTiles="stitch"/>
        
        <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1"/>
      </filter>
      <rect width={STAGE.w} height={STAGE.h} filter={`url(#grain-${id})`}/>
    </svg>);
};
