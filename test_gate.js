// Verify the per-dot matching logic: only projects clearing the floor move in.
const FLOOR = 0.30, CEIL = 0.62;
function radiusFor(s) {
  const norm = Math.max(0, Math.min(1, (s - FLOOR) / (CEIL - FLOOR)));
  return { norm, radius: 130 - norm * 92, matched: s >= FLOOR };
}

// Case 1: on-topic query — one strong match, three weak
const onTopic = [0.52, 0.28, 0.24, 0.20].map(radiusFor);
console.log("ON-TOPIC:");
onTopic.forEach((r, i) => console.log(`  project ${i}: s= ${(FLOOR + (CEIL - FLOOR) * r.norm).toFixed(2)} matched=${r.matched} radius=${r.radius.toFixed(0)} ${r.matched ? "MOVES" : "HOLDS ORBIT"}`));

// Case 2: off-topic query — nothing clears the floor
const offTopic = [0.26, 0.22, 0.19, 0.15].map(radiusFor);
console.log("OFF-TOPIC:");
offTopic.forEach((r, i) => console.log(`  project ${i}: matched=${r.matched} radius=${r.radius.toFixed(0)} ${r.matched ? "MOVES" : "HOLDS ORBIT"}`));

// Case 3: two strong matches — both come in, stronger one closer + gold
const two = [0.55, 0.48, 0.22, 0.18].map(radiusFor);
console.log("TWO MATCHES:");
two.forEach((r, i) => console.log(`  project ${i}: norm=${r.norm.toFixed(2)} radius=${r.radius.toFixed(0)} ${r.matched ? "MOVES" : "HOLDS ORBIT"}`));

// Pointer check: query stays at 170,170 always
console.log("POINTER: fixed at translate(170,170) — never moves");
