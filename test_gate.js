// Sanity-check the new relevance-gate math against realistic MiniLM cosine values.
function gate(sims) {
  const vals = sims;
  const max = Math.max(...vals), min = Math.min(...vals);
  const span = (max - min) || 1e-9;
  const pull = Math.max(0, Math.min(1, (max - 0.30) / 0.35));
  const norms = vals.map(s => ((s - min) / span) * pull);
  const radius = n => 130 - n * 92;
  return { max, pull, norms, radii: norms.map(radius) };
}

// Case 1: on-topic query ("payment outage pager duty" -> ExplainOps strong, others mid)
const onTopic = [0.52, 0.44, 0.41, 0.38, 0.35, 0.32, 0.30, 0.28, 0.26, 0.24];
const r1 = gate(onTopic);
console.log("ON-TOPIC   pull =", r1.pull.toFixed(2), " winner radius =", r1.radii[0].toFixed(0), " last radius =", r1.radii[9].toFixed(0));

// Case 2: off-topic query (all cosines weak)
const offTopic = [0.24, 0.22, 0.21, 0.20, 0.19, 0.18, 0.17, 0.16, 0.15, 0.14];
const r2 = gate(offTopic);
console.log("OFF-TOPIC  pull =", r2.pull.toFixed(2), " winner radius =", r2.radii[0].toFixed(0), " (orbit=130 => nothing moves)");

// Case 3: strong query, two close contenders
const strong = [0.58, 0.55, 0.36, 0.33, 0.31, 0.30, 0.29, 0.27, 0.26, 0.25];
const r3 = gate(strong);
console.log("STRONG     pull =", r3.pull.toFixed(2), " winner radius =", r3.radii[0].toFixed(0), " runner-up radius =", r3.radii[1].toFixed(0), " last radius =", r3.radii[9].toFixed(0));

// Case 4: everything nearly identical (span ~ 0) -> pull decides, not noise
const uniform = [0.33, 0.33, 0.33, 0.32, 0.33, 0.33, 0.33, 0.33, 0.33, 0.33];
const r4 = gate(uniform);
console.log("UNIFORM    pull =", r4.pull.toFixed(2), " spread of norms =", (Math.max(...r4.norms) - Math.min(...r4.norms)).toFixed(2));
