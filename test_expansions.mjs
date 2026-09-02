// Regression sweep: every expansion cluster + common phrasings must land on the
// right project, and garbage must not move anything. Threshold FLOOR = 0.30.
import { pipeline, env } from "@xenova/transformers";
import { readFileSync } from "fs";

env.allowLocalModels = false;
const html = readFileSync("index.html", "utf8");

function clean(s) {
  return s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function cardChunks() {
  const out = [];
  const cardRe = /<article class="card"[^>]*>([\s\S]*?)<\/article>/g;
  let m;
  while ((m = cardRe.exec(html))) {
    const blk = m[1];
    const title = clean((blk.match(/<h3>([^<]*)<\/h3>/) || [])[1] || "");
    const tagline = clean((blk.match(/class="tagline">([^<]*)</) || [])[1] || "");
    const body = clean((blk.match(/class="metric[^"]*">([\s\S]*?)<\/p>/) || [])[1] || "");
    const chips = [...blk.matchAll(/<span class="stack-chip">([^<]*)<\/span>/g)].map(c => c[1]).join(", ");
    const chunks = [title + ". " + tagline + ". Stack: " + chips];
    for (let i = 0; i < body.length; i += 220) chunks.push(title + ". " + body.slice(i, i + 220));
    out.push({ name: title.split(" ")[0], chunks });
  }
  return out;
}
function miniChunks() {
  const out = [];
  const mcRe = /<div class="mini-card">([\s\S]*?)(?=<div class="mini-card">|<\/div>\s*<\/div>\s*<\/section>)/g;
  let m;
  while ((m = mcRe.exec(html))) {
    const blk = m[1];
    const title = clean((blk.match(/<h4>([^<]*)<\/h4>/) || [])[1] || "");
    const body = clean((blk.match(/<p[^>]*>([\s\S]*?)<\/p>/) || [])[1] || "");
    out.push({ name: title.split(" ")[0], chunks: [title + ". " + body] });
  }
  return out;
}
// pull EXPANSIONS straight out of index.html so the test always matches the site
function siteExpansions() {
  const src = html.match(/const EXPANSIONS = \[([\s\S]*?)\n\];/)[1];
  return eval("[" + src + "]");
}
function expand(q) {
  let extra = "";
  for (const [re, exp] of siteExpansions()) if (re.test(q)) extra += " " + exp;
  return q + extra;
}

const FLOOR = 0.30;
const cards = cardChunks();
const minis = miniChunks();
const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", { quantized: true });

const allChunks = [];
const idx = [];
for (const c of [...cards, ...minis]) {
  const start = allChunks.length;
  c.chunks.forEach(t => allChunks.push(t));
  idx.push({ start, end: allChunks.length, name: c.name, mini: c === minis[0] || c === minis[1] || c === minis[2] || c === minis[3] });
}
const out = await extractor(allChunks, { pooling: "mean", normalize: true });
const dim = out.dims[out.dims.length - 1];
const vec = i => Array.from(out.data.slice(i * dim, (i + 1) * dim));
const cos = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };

// [query, expected project, mustMove]
const CASES = [
  ["RAG", "RAG", true],
  ["rag", "RAG", true],
  ["documents question answering", "RAG", true],
  ["local llm offline", "AI-Document-RAG-System", true],
  ["chatbot", "LangChain", true],
  ["chat", "LangChain", true],
  ["persona streaming", "LangChain", true],
  ["agents", "Real-Time", true],
  ["agentic tool calling", "Real-Time", true],
  ["payment outage pager duty", "ExplainOps", true],
  ["incident triage", "ExplainOps", true],
  ["on-call alerts", "ExplainOps", true],
  ["server down crash", "ExplainOps", true],
  ["monitoring logs metrics", "ExplainOps", true],
  ["phone calls in spanish", "Real-Time", true],
  ["voice assistant telephony", "Real-Time", true],
  ["whisper transcription hindi", "Real-Time", true],
  ["meeting notes pdf", "AI", true],
  ["attendee action items", "AI", true],
  ["predict disease risk", "Stroke", true],
  ["stroke patient model", "Stroke", true],
  ["xgboost machine learning", "Stroke", true],
  ["sales lead booking", "Northstar", true],
  ["lead qualification agent", "Northstar", true],
  ["self-evaluating rubric judge", "Self-Evaluating", true],
  ["lesson grading llm judge", "Self-Evaluating", true],
  ["docker containerized deployment", "NO_MOVE", true],
  ["ci cd github actions pipeline", "ExplainOps", true],
  ["pytest automated tests", "ExplainOps", true],
  ["weather forecast", null, false],
  ["banana bread recipe", null, false],
  ["stock market today", null, false],
];

let pass = 0, fail = 0;
for (const [q, expected, mustMove] of CASES) {
  const qout = await extractor(expand(q), { pooling: "mean", normalize: true });
  const qv = Array.from(qout.data.slice(0, dim));
  const scored = idx.map(c => {
    let best = -1;
    for (let i = c.start; i < c.end; i++) best = Math.max(best, cos(qv, vec(i)));
    return { name: c.name, s: best, moved: best >= FLOOR };
  });
  scored.sort((a, b) => b.s - a.s);
  const top = scored[0];
  const anyMoved = scored.some(x => x.moved);
  const ok = expected === "NO_MOVE"
    ? !anyMoved
    : (mustMove ? (top.name === expected && anyMoved) : !anyMoved);
  if (ok) pass++; else fail++;
  const detail = mustMove ? `top=${top.name} ${top.s.toFixed(3)}` : `top=${top.name} ${top.s.toFixed(3)} (< FLOOR, correct)`;
  console.log(`${ok ? "PASS" : "FAIL"}  "${q}" -> ${detail}`);
}
console.log(`\n${pass}/${CASES.length} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
