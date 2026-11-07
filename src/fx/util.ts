import { clamp01, signature } from "../lib/ease";
export function inOut(frame: number, start: number, end: number, inFrames: number, outFrames: number): {
    inP: number;
    outP: number;
    visible: boolean;
} {
    const visible = frame >= start && frame < end;
    const inP = signature(clamp01((frame - start) / Math.max(1, inFrames)));
    const outP = signature(clamp01((frame - (end - outFrames)) / Math.max(1, outFrames)));
    return { inP, outP, visible };
}
export const SERIF_ADVANCE = 0.5;
export const MONO_ADVANCE = 0.525;
export function estimateWidth(text: string, fontSize: number, advance: number): number {
    return text.length * fontSize * advance;
}
export function checkRange(who: string, startFrame: number, endFrame: number): void {
    if (!(endFrame > startFrame)) {
        throw new Error(`${who}: endFrame (${endFrame}) must be greater than startFrame (${startFrame})`);
    }
}
export function splitHighlight(text: string, highlight?: string): {
    text: string;
    hl: boolean;
}[] {
    if (!highlight)
        return [{ text, hl: false }];
    const i = text.indexOf(highlight);
    if (i < 0)
        return [{ text, hl: false }];
    const out: {
        text: string;
        hl: boolean;
    }[] = [];
    if (i > 0)
        out.push({ text: text.slice(0, i), hl: false });
    out.push({ text: highlight, hl: true });
    if (i + highlight.length < text.length)
        out.push({ text: text.slice(i + highlight.length), hl: false });
    return out;
}
