import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [comp, frameList, outDirArg, scaleArg, browserArg] = process.argv.slice(2);
if (!comp || !frameList) {
  console.error("Usage: node tools/shots.mjs <compositionId> <frame,frame,...> [outDir=out/shots] [scale=0.5] [chromePath]");
  process.exit(1);
}
const outDir = path.resolve(ROOT, outDirArg || "out/shots");
const scale = Number(scaleArg || 0.5);
const browserExecutable = browserArg || process.env.REMOTION_BROWSER || undefined;
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src", "index.ts"), publicDir: path.join(ROOT, "public") });
const composition = await selectComposition({ serveUrl, id: comp, browserExecutable });
for (const frame of frameList.split(",").map(Number)) {
  const output = path.join(outDir, `${comp}-${frame}.png`);
  await renderStill({ composition, serveUrl, frame, output, scale, browserExecutable });
  console.log(path.relative(ROOT, output));
}
