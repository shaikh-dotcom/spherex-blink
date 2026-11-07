import fs from "node:fs";
import path from "node:path";
import { ROOT, loadPatches, loadStatus, stateOf } from "./lib.mjs";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const num = args.find((a) => /^\d+$/.test(a));
if (num === undefined) {
  console.error("Usage: node tools/make-prompt.mjs <patch number> [--repo <path to your spherex-blink clone>] [--film-repo <path to your minilocker-film clone, only for patches that port its tooling>] [--no-files]");
  process.exit(1);
}
const { patches, byId } = loadPatches();
const status = loadStatus();
const id = String(num).padStart(2, "0");
const patch = byId[id];
if (!patch) {
  console.error(`No patch ${id}. Valid: ${patches.map((p) => p.id).join(", ")}`);
  process.exit(1);
}
if (patch.human) {
  console.error(`Patch ${id} is a human step: follow docs/patches/patch-${id}.md yourself. No prompt is needed.`);
  process.exit(1);
}
const repo = flag("--repo") || process.env.SPHEREX_BLINK_REPO || "";
const filmRepo = flag("--film-repo") || process.env.MINILOCKER_FILM_REPO || "";
const withFiles = !args.includes("--no-files");

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8").replace(/\s+$/, "");
const fence = (txt) => (txt.includes("```") ? "````" : "```");
const lang = (p) => ({ ".ts": "ts", ".tsx": "tsx", ".json": "json", ".md": "md", ".css": "css", ".mjs": "js", ".js": "js", ".html": "html" }[path.extname(p.split(":")[0])] || "");

const out = [];
const notes = [];
const unmet = patch.needs.filter((n) => stateOf(status, n) !== "done");
if (unmet.length) notes.push(`Needs not done yet in the ledger: ${unmet.join(", ")}. Finish them first or the files below will be stubs.`);

out.push(read("docs/guide/context-header.md"));
out.push("\n\n=== PROJECT STATE (from docs/LEDGER.md) ===\n");
const ledger = read("docs/LEDGER.md");
const b = ledger.indexOf("<!-- STATUS:BEGIN -->");
const e = ledger.indexOf("<!-- STATUS:END -->");
out.push(ledger.slice(b, e).replace("<!-- STATUS:BEGIN -->", "").trim());
const entries = ledger.slice(ledger.indexOf("## Handoff entries"));
out.push("\n\n=== HANDOFF ENTRIES SO FAR (docs/LEDGER.md) ===\n");
out.push(entries.replace("## Handoff entries", "").trim() || "(none yet)");

if (withFiles && patch.paste.length) {
  out.push("\n\n=== EXISTING FILES FROM MY spherex-blink-film REPO (current content) ===");
  for (const rel of patch.paste) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) {
      notes.push(`MISSING existing file: ${rel}`);
      continue;
    }
    const body = read(rel);
    const f = fence(body);
    out.push(`\n--- FILE: ${rel} ---\n${f}${lang(rel)}\n${body}\n${f}`);
  }
}

if (withFiles && patch.ref.length) {
  out.push("\n\n=== REFERENCE FILES (read-only; files from the real spherex-blink app are the truth for look, wording and behaviour: port them, do not invent the UI) ===");
  for (const spec of patch.ref) {
    const m = spec.match(/^(.*?)(?::(\d+)-(\d+))?$/);
    const isFilm = m[1].startsWith("@film/");
    const rel = isFilm ? m[1].slice(6) : m[1];
    const base = isFilm ? filmRepo : repo;
    if (!base) {
      notes.push(`Reference not included (no ${isFilm ? "--film-repo" : "--repo"} path): ${spec}`);
      continue;
    }
    const full = path.join(base, rel);
    if (!fs.existsSync(full)) {
      notes.push(`MISSING reference file: ${rel}`);
      continue;
    }
    let lines = fs.readFileSync(full, "utf8").replace(/\r\n/g, "\n").split("\n");
    let label = rel;
    if (m[2]) {
      lines = lines.slice(Number(m[2]) - 1, Number(m[3]));
      label = `${rel} (lines ${m[2]}-${m[3]})`;
    }
    const body = lines.join("\n").replace(/\s+$/, "");
    const f = fence(body);
    out.push(`\n--- REFERENCE: ${label} ---\n${f}${lang(rel)}\n${body}\n${f}`);
  }
}

const parts = [
  ...patch.bible.map((n) => `docs/bible/bible-${String(n).padStart(2, "0")}.md`),
  ...patch.appendix.map((a) => `docs/bible/appendix-${a}.md`),
];
if (parts.length) {
  out.push("\n\n=== FILM BIBLE SECTIONS ===");
  for (const p of parts) out.push("\n" + read(p));
}

out.push(`\n\n=== THE PATCH PROMPT (patch ${id}: ${patch.title}) ===\n`);
out.push(`FILES THIS PATCH OWNS (write only these): ${patch.owns.join(", ") || "none"}`);
out.push(`THIS PATCH NEEDS: ${patch.needs.join(", ") || "nothing"}\n`);
out.push(patch.body);
out.push(
  `\nWHEN YOU ARE DONE, END YOUR ANSWER WITH TWO THINGS.\n1. A block headed "### PATCH ${id} - ${patch.title}" to append to docs/LEDGER.md: files created or changed, the public API (exports with signatures), anything that differs from the spec and why, and how to verify.\n2. The line to run: node tools/ledger.mjs done ${id} "<one line summary>"`,
);

const outDir = path.join(ROOT, "prompts-out");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, `patch-${id}.md`);
const text = out.join("\n") + "\n";
fs.writeFileSync(outFile, text, "utf8");

console.log(`\nPATCH ${id} - ${patch.title}`);
console.log(`Needs: ${patch.needs.join(", ") || "nothing"}   Owns: ${patch.owns.join(", ") || "nothing"}`);
console.log(`Wrote ${path.relative(process.cwd(), outFile)} (${text.length.toLocaleString()} characters, about ${Math.round(text.length / 4).toLocaleString()} tokens)`);
console.log("Open it, select all, paste into a NEW session.");
if (notes.length) {
  console.log("\nHeads-up:");
  for (const n of notes) console.log("  - " + n);
}
console.log(`\nWhen the session answers: save each file at the path it gives, run its CHECK commands, paste the ledger block into docs/LEDGER.md, then run the "done" line it gives.\n`);
