import fs from "node:fs";
import { loadPatches, loadStatus, saveStatus, stateOf, ownsOverlap, LEDGER_FILE } from "./lib.mjs";

const [cmd = "sync", id, ...rest] = process.argv.slice(2);
const pad = (x) => (x === undefined ? undefined : String(x).padStart(2, "0"));
const { patches, byId } = loadPatches();
const status = loadStatus();
const today = new Date().toISOString().slice(0, 10);

const BEGIN = "<!-- STATUS:BEGIN -->";
const END = "<!-- STATUS:END -->";

function conflicts() {
  const out = [];
  for (let i = 0; i < patches.length; i++) {
    for (let j = i + 1; j < patches.length; j++) {
      for (const a of patches[i].owns) {
        for (const b of patches[j].owns) {
          if (ownsOverlap(a, b)) out.push(`${patches[i].id} and ${patches[j].id} both own ${a} / ${b}`);
        }
      }
    }
  }
  return out;
}

function ready() {
  return patches.filter((p) => stateOf(status, p.id) === "todo" && p.needs.every((n) => stateOf(status, n) === "done"));
}

function criticalPath() {
  const best = {};
  const go = (id) => {
    if (best[id]) return best[id];
    const p = byId[id];
    let tail = { w: 0, chain: [] };
    for (const n of p.needs) {
      const c = go(n);
      if (c.w > tail.w) tail = c;
    }
    best[id] = { w: tail.w + p.weight, chain: [...tail.chain, id] };
    return best[id];
  };
  let top = { w: 0, chain: [] };
  for (const p of patches) {
    const c = go(p.id);
    if (c.w > top.w) top = c;
  }
  return top;
}

function render() {
  const total = patches.reduce((a, p) => a + p.weight, 0);
  const doneW = patches.filter((p) => stateOf(status, p.id) === "done").reduce((a, p) => a + p.weight, 0);
  const prog = patches.filter((p) => stateOf(status, p.id) === "in-progress").reduce((a, p) => a + p.weight, 0);
  const sceneP = patches.filter((p) => p.frames > 0);
  const framesTotal = sceneP.reduce((a, p) => a + p.frames, 0);
  const framesDone = sceneP.filter((p) => stateOf(status, p.id) === "done").reduce((a, p) => a + p.frames, 0);
  const countBy = (s) => patches.filter((p) => stateOf(status, p.id) === s).length;
  const rdy = ready();
  const cp = criticalPath();
  const remainingCp = cp.chain.filter((x) => stateOf(status, x) !== "done");
  const lines = [];
  lines.push(BEGIN);
  lines.push(`Updated by \`node tools/ledger.mjs sync\` on ${today}. Do not edit by hand; run the command after every state change.`);
  lines.push("");
  lines.push("### Progress");
  lines.push("");
  lines.push(`- Work done: **${Math.round((doneW / total) * 100)}%** by effort weight (${doneW} of ${total} units; ${prog} more in progress)`);
  lines.push(`- Patches: ${countBy("done")} done, ${countBy("in-progress")} in progress, ${countBy("blocked")} blocked, ${countBy("todo")} not started (of ${patches.length})`);
  lines.push(`- Film scenes finished: ${framesDone} of ${framesTotal} frames (${Math.round((framesDone / framesTotal) * 100)}%)`);
  lines.push(`- Work left: ${total - doneW} effort units. Longest remaining chain: ${remainingCp.length ? remainingCp.join(" -> ") : "none"}`);
  lines.push("");
  lines.push("### Ready now (all needs done, nobody started)");
  lines.push("");
  if (rdy.length === 0) lines.push("Nothing is ready. Check in-progress and blocked rows below.");
  else {
    lines.push("These can all run at the same time in separate sessions: they need only finished patches and they own different files.");
    lines.push("");
    for (const p of rdy) lines.push(`- **${p.id}** ${p.title} (weight ${p.weight}; owns ${p.owns.join(", ") || "nothing"})`);
  }
  lines.push("");
  lines.push("### Every patch");
  lines.push("");
  lines.push("| ID | Wave | State | Weight | Needs | Title | Owner / note |");
  lines.push("|----|------|-------|--------|-------|-------|--------------|");
  for (const p of patches) {
    const s = status[p.id] || {};
    lines.push(`| ${p.id} | ${p.wave} | ${stateOf(status, p.id)} | ${p.weight} | ${p.needs.join(", ") || "-"} | ${p.title}${p.human ? " (human step)" : ""} | ${[s.owner, s.note].filter(Boolean).join(": ") || "-"} |`);
  }
  lines.push("");
  lines.push("### Waves: what runs in parallel and what runs in order");
  lines.push("");
  const maxWave = Math.max(...patches.map((p) => p.wave));
  for (let w = 0; w <= maxWave; w++) {
    const inWave = patches.filter((p) => p.wave === w);
    lines.push(`**Wave ${w}**${w === 0 ? "" : ` (starts when its needs are done; ${inWave.length > 1 ? "these run in parallel" : "single patch"})`}`);
    lines.push("");
    for (const p of inWave) lines.push(`- ${p.id} ${p.title}${p.needs.length ? ` <- needs ${p.needs.join(", ")}` : ""}`);
    lines.push("");
  }
  lines.push("A wave number is only the earliest wave a patch could run in. A patch may start as soon as ITS OWN needs are done, even if its wave-mates are not.");
  lines.push("");
  lines.push("### File ownership (no two patches write the same file)");
  lines.push("");
  const c = conflicts();
  lines.push(c.length ? `CONFLICTS: ${c.join("; ")}` : "No ownership conflicts: every file or folder below is written by exactly one patch.");
  lines.push("");
  for (const p of patches) if (p.owns.length) lines.push(`- ${p.id}: ${p.owns.join(", ")}`);
  lines.push(END);
  return lines.join("\n");
}

function sync() {
  const text = fs.readFileSync(LEDGER_FILE, "utf8");
  const block = render();
  const i = text.indexOf(BEGIN);
  const j = text.indexOf(END);
  if (i < 0 || j < 0) throw new Error("docs/LEDGER.md is missing the STATUS markers");
  fs.writeFileSync(LEDGER_FILE, text.slice(0, i) + block + text.slice(j + END.length), "utf8");
}

function need(id) {
  if (!id || !byId[pad(id)]) {
    console.error(`Unknown patch "${id}". Valid: ${patches.map((p) => p.id).join(", ")}`);
    process.exit(1);
  }
  return pad(id);
}

if (cmd === "status" || cmd === "sync") {
  sync();
  const rdy = ready();
  console.log(`Ledger synced. Ready now: ${rdy.length ? rdy.map((p) => p.id).join(", ") : "none"}`);
} else if (cmd === "next") {
  for (const p of ready()) console.log(`${p.id}  ${p.title}`);
} else if (cmd === "start") {
  const n = need(id);
  const p = byId[n];
  const open = p.needs.filter((x) => stateOf(status, x) !== "done");
  if (open.length) {
    console.error(`Patch ${n} needs ${open.join(", ")} to be done first.`);
    process.exit(1);
  }
  status[n] = { state: "in-progress", owner: rest[0] || "", note: "", at: today };
  saveStatus(status);
  sync();
  console.log(`Patch ${n} marked in-progress.`);
} else if (cmd === "done") {
  const n = need(id);
  status[n] = { ...(status[n] || {}), state: "done", note: rest.join(" "), at: today };
  saveStatus(status);
  sync();
  console.log(`Patch ${n} marked done. Newly ready: ${ready().map((p) => p.id).join(", ") || "none"}`);
} else if (cmd === "block") {
  const n = need(id);
  status[n] = { ...(status[n] || {}), state: "blocked", note: rest.join(" "), at: today };
  saveStatus(status);
  sync();
  console.log(`Patch ${n} marked blocked.`);
} else if (cmd === "reset") {
  const n = need(id);
  delete status[n];
  saveStatus(status);
  sync();
  console.log(`Patch ${n} reset to todo.`);
} else if (cmd === "check") {
  const c = conflicts();
  if (c.length) {
    console.error(c.join("\n"));
    process.exit(1);
  }
  console.log(`No ownership conflicts across ${patches.length} patches.`);
} else {
  console.error("Usage: node tools/ledger.mjs [sync | next | start NN [lane] | done NN [note] | block NN [reason] | reset NN | check]");
  process.exit(1);
}
