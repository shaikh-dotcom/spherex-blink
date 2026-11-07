import React from "react";
import { STAGE } from "../config/timeline";
import { shade } from "../config/theme";
export interface VignetteProps {
    strength?: number;
}
export const Vignette: React.FC<VignetteProps> = ({ strength = 0.12 }) => (<div style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: STAGE.w,
        height: STAGE.h,
        pointerEvents: "none",
        background: `radial-gradient(ellipse farthest-corner at 50% 50%, ${shade(0)} 52%, ${shade(strength)} 100%)`,
    }}/>);
