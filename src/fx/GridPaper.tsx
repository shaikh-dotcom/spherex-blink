import React from "react";
import { useCurrentFrame } from "remotion";
import { alpha, theme } from "../config/theme";
import { STAGE } from "../config/timeline";
export interface GridPaperProps {
    perspective?: boolean;
    tilt?: number;
    speed?: number;
    lines?: number;
    opacity?: number;
}
export const GridPaper: React.FC<GridPaperProps> = ({ perspective = false, tilt = 58, speed = 0, lines, opacity = 1 }) => {
    const frame = useCurrentFrame();
    const k = lines ?? (perspective ? 3 : 1);
    const line = `rgba(255,32,82,${0.03 * k})`;
    const size = theme.gridSize;
    const offset = (frame * speed) % size;
    const glows = `radial-gradient(1100px 560px at 14% -10%, ${theme.glowA}, transparent 62%), ` +
        `radial-gradient(900px 500px at 104% 0%, ${theme.glowB}, transparent 60%)`;
    if (!perspective) {
        return (<div style={{
                position: "absolute",
                inset: 0,
                opacity,
                pointerEvents: "none",
                backgroundImage: `${glows}, linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
                backgroundSize: `auto, auto, ${size}px ${size}px, ${size}px ${size}px`,
                backgroundPosition: `0 0, 0 0, 0 ${offset}px, ${offset}px 0`,
            }}/>);
    }
    return (<div style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none", overflow: "hidden" }}>
      
      <div style={{ position: "absolute", inset: 0, backgroundImage: glows }}/>
      <div style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: STAGE.w,
            height: STAGE.h,
            perspective: 1000,
            perspectiveOrigin: "50% 30%",
            maskImage: "linear-gradient(180deg, transparent 0%, #000 38%, #000 100%)",
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 38%, #000 100%)",
        }}>
        <div style={{
            position: "absolute",
            left: -STAGE.w,
            top: STAGE.h * 0.1,
            width: STAGE.w * 3,
            height: STAGE.h * 2,
            transformOrigin: "50% 0%",
            transform: `rotateX(${tilt}deg)`,
            backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
            backgroundSize: `${size}px ${size}px, ${size}px ${size}px`,
            backgroundPosition: `0 ${offset}px, ${offset}px 0`,
        }}/>
      </div>
      
      <div style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: STAGE.h * 0.1,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${alpha(theme.accent, 0.12)}, transparent)`,
        }}/>
    </div>);
};
