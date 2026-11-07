import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PATCH_DIR = path.join(ROOT, "docs", "patches");
export const STATUS_FILE = path.join(PATCH_DIR, "status.json");
export const LEDGER_FILE = path.join(ROOT, "docs", "LEDGER.md");

const list = (v) =>
  (v || "")
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x && x.toLowerCase() !== "none" && x.toLowerCase() !== "nothing");

export function parsePatch(file) {
  const text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing front matter`);
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  const id = String(meta.id).padStart(2, "0");
  return {
    id,
    title: meta.title,
    group: meta.group,
    weight: Number(meta.weight || 1),
    frames: Number(meta.frames || 0),
    human: meta.human === "yes",
    needs: list(meta.needs).map((x) => x.padStart(2, "0")),
    owns: list(meta.owns),
    paste: list(meta.paste),
    ref: list(meta.ref),
    bible: list(meta.bible),
    appendix: list(meta.appendix),
    check: meta.check || "",
    body: m[2].replace(/^\n+/, "").replace(/\s+$/, ""),
    file,
  };
}

export function loadPatches() {
  const files = fs
    .readdirSync(PATCH_DIR)
    .filter((f) => /^patch-\d+\.md$/.test(f))
    .sort();
  const patches = files.map((f) => parsePatch(path.join(PATCH_DIR, f)));
  const byId = Object.fromEntries(patches.map((p) => [p.id, p]));
  for (const p of patches) {
    for (const n of p.needs) if (!byId[n]) throw new Error(`patch ${p.id} needs unknown patch ${n}`);
  }
  const wave = {};
  const visit = (id, trail = []) => {
    if (wave[id] !== undefined) return wave[id];
    if (trail.includes(id)) throw new Error(`dependency cycle: ${[...trail, id].join(" -> ")}`);
    const p = byId[id];
    wave[id] = p.needs.length === 0 ? 0 : 1 + Math.max(...p.needs.map((n) => visit(n, [...trail, id])));
    return wave[id];
  };
  for (const p of patches) p.wave = visit(p.id);
  return { patches, byId };
}

export function loadStatus() {
  if (!fs.existsSync(STATUS_FILE)) return {};
  return JSON.parse(fs.readFileSync(STATUS_FILE, "utf8"));
}

export function saveStatus(status) {
  const sorted = Object.fromEntries(Object.entries(status).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(STATUS_FILE, JSON.stringify(sorted, null, 2) + "\n", "utf8");
}

export function stateOf(status, id) {
  return (status[id] && status[id].state) || "todo";
}

export function ownsOverlap(a, b) {
  const norm = (s) => s.replace(/\/\*+$/, "/").replace(/\\/g, "/");
  const x = norm(a);
  const y = norm(b);
  if (x === y) return true;
  if (x.endsWith("/") && y.startsWith(x)) return true;
  if (y.endsWith("/") && x.startsWith(y)) return true;
  return false;
}
