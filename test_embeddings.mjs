// Measure REAL cosines: all-MiniLM-L6-v2 over the actual portfolio card texts.
// Usage: node test_embeddings.mjs
import { pipeline, env } from "@xenova/transformers";
import { readFileSync } from "fs";

env.allowLocalModels = false;

const html = readFileSync("index.html", "utf8");

function cardTexts() {
  const docs = [];
  const cardRe = /<article class="card"[^>]*>([\s\S]*?)<\/article>/g;
  let m;
  while ((m = cardRe.exec(html))) {
    const blk = m[1];
    const title = (blk.match(/<h3>([^<]*)<\/h3>/) || [])[1] || "";
    const tagline = (blk.match(/class="tagline">([^<]*)</) || [])[1] || "";
    const body = (blk.match(/class="metric[^"]*">([\s\S]*?)<\/p>/) || [])[1] || "";
    const chips = [...blk.matchAll(/<span class="stack-chip">([^<]*)<\/span>/g)].map(c => c[1]);
    const clean = s => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    docs.push([clean(title), clean(title), clean(tagline), chips.join(", "), clean(body)].join(". "));
  }
  return docs;
}

function miniTexts() {
  const out = [];
  const mcRe = /<div class="mini-card">([\s\S]*?)<\/div>\s*(?=<div class="mini-card">|<\/div>\s*<\/div>\s*<\/section>)/g;
  let m;
  while ((m = mcRe.exec(html))) {
    const blk = m[1];
    const title = (blk.match(/<h4>([^<]*)<\/h4>/) || [])[1] || "";
    const body = (blk.match(/<p[^>]*>([\s\S]*?)<\/p>/) || [])[1] || "";
    const clean = s => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
    out.push([clean(title), clean(body)].join(". "));
  }
  return out;
}

const docTexts = cardTexts();
const miniTexts_ = miniTexts();
console.log("parsed cards:", docTexts.length, "| minis:", miniTexts_.length);

const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", { quantized: true });

const allTexts = [...docTexts, ...miniTexts_];
const out = await extractor(allTexts, { pooling: "mean", normalize: true });
const dim = out.dims[out.dims.length - 1];
const vec = i => Array.from(out.data.slice(i * dim, (i + 1) * dim));

const cos = (a, b) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
};

const queries = ["RAG", "agents", "chatbot", "payment outage pager duty", "meeting notes pdf", "weather forecast"];

for (const q of queries) {
  const qout = await extractor(q, { pooling: "mean", normalize: true });
  const qv = Array.from(qout.data.slice(0, dim));
  const sims = allTexts.map((_, i) => ({ i, s: cos(qv, vec(i)) }));
  const names = allTexts.map((_, i) => (i < docTexts.length ? "H" + i : "M" + (i - docTexts.length)));
  const list = sims.map((x, i) => `${names[i]}:${x.s.toFixed(3)}`).join("  ");
  const top = sims.reduce((a, b) => (b.s > a.s ? b : a));
  console.log(`\nquery "${q}"  (top=${names[top.i]} ${top.s.toFixed(3)})`);
  console.log("  " + list);
}
