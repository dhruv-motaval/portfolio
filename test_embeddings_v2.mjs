// v2: chunked card embeddings + max-pooling + query expansion
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

// light domain query expansion (classic IR trick, curated for this portfolio)
const EXPANSIONS = [
  [/outage|downtime|down\b/i, "incident failure alerts"],
  [/pager|on-call|on call/i, "on-call triage incident"],
  [/incident|triage/i, "outage pager on-call alerts ranking"],
  [/rag|retriev|document/i, "retrieval augmented generation documents chunking embeddings"],
  [/agent|agentic|tool/i, "tool calling autonomous agent langgraph"],
  [/chatbot|chat|persona/i, "chatbot conversational streaming persona"],
  [/call|voice|phone|speech/i, "voice call speech whisper transcribe multilingual"],
  [/meeting|minutes|notes/i, "meeting minutes transcription notes"],
  [/model|ml|machine learning|prediction/i, "machine learning model training prediction xgboost"],
  [/deploy|cloud|docker/i, "docker containerized cloud deployment"],
  [/search/i, "semantic search vector retrieval"],
];

function expand(q) {
  let extra = "";
  for (const [re, exp] of EXPANSIONS) if (re.test(q)) extra += " " + exp;
  return q + extra;
}

const cards = cardChunks();
const minis = miniChunks();
console.log("cards:", cards.map(c => c.name).join(", "));
console.log("minis :", minis.map(c => c.name).join(", "));

const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", { quantized: true });

// build chunk corpus
const allChunks = [];
const cardChunkIdx = [];
for (const c of cards) {
  const start = allChunks.length;
  c.chunks.forEach(t => allChunks.push(t));
  cardChunkIdx.push({ start, end: allChunks.length, name: c.name, mini: false });
}
for (const c of minis) {
  const start = allChunks.length;
  c.chunks.forEach(t => allChunks.push(t));
  cardChunkIdx.push({ start, end: allChunks.length, name: c.name, mini: true });
}

const out = await extractor(allChunks, { pooling: "mean", normalize: true });
const dim = out.dims[out.dims.length - 1];
const vec = i => Array.from(out.data.slice(i * dim, (i + 1) * dim));
const cos = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * b[i]; return s; };

function score(q) {
  const qv = Array.from((()=>{return null})() || []);
  return null;
}

async function queryScore(q) {
  const qout = await extractor(expand(q), { pooling: "mean", normalize: true });
  const qv = Array.from(qout.data.slice(0, dim));
  return cardChunkIdx.map(c => {
    let best = -1;
    for (let i = c.start; i < c.end; i++) best = Math.max(best, cos(qv, vec(i)));
    return { name: c.name, mini: c.mini, s: best };
  });
}

const queries = ["RAG", "agents", "chatbot", "payment outage pager duty", "meeting notes pdf", "weather forecast", "phone calls in spanish", "incident triage", "predict disease"];

for (const q of queries) {
  const res = await queryScore(q);
  res.sort((a, b) => b.s - a.s);
  console.log(`\n"${q}"  top: ${res[0].name} ${res[0].s.toFixed(3)}`);
  console.log("  " + res.map(r => `${r.name}:${r.s.toFixed(2)}`).join("  "));
}
