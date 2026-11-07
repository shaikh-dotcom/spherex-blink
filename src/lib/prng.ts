export function mulberry32(seed: number): () => number {
    let a = seed | 0;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
export function rand(seed: number): number {
    return mulberry32(seed)();
}
export function randRange(seed: number, min: number, max: number): number {
    return min + (max - min) * rand(seed);
}
export function randInt(seed: number, min: number, max: number): number {
    return Math.floor(randRange(seed, min, max + 1));
}
export function hashStringToSeed(text: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 0x01000193);
    }
    return h >>> 0;
}
export function mixSeed(a: number, b: number): number {
    let h = Math.imul(a | 0, 0x9e3779b1) ^ Math.imul((b | 0) + 0x7f4a7c15, 0x85ebca6b);
    h ^= h >>> 15;
    h = Math.imul(h, 0x2c1b3c6d);
    h ^= h >>> 12;
    h = Math.imul(h, 0x297a2d39);
    h ^= h >>> 15;
    return h >>> 0;
}
