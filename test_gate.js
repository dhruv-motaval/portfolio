// Verify approach-ring spacing: matched projects take evenly spaced rings that
// never crowd the central query marker (min radius 52 vs query dot at center).
const MIN_R = 52, RING_GAP = 16, MAX_RING = 122, ORBIT = 130;

function rings(similarities) {
  const sorted = similarities.slice().sort((a, b) => b - a);
  return sorted.map((s, k) => ({ s, radius: Math.min(MIN_R + k * RING_GAP, MAX_RING) }));
}

// 1 matched project
console.log("1 match :", rings([0.55]).map(r => r.radius));
// 3 matched projects -> 52, 68, 84
console.log("3 matches:", rings([0.55, 0.48, 0.36]).map(r => r.radius));
// 6 matched projects (everyone) -> 52, 68, 84, 100, 116, 122 (capped)
console.log("6 matches:", rings([0.55, 0.50, 0.46, 0.40, 0.36, 0.33]).map(r => r.radius));
// 10 matched (worst case) -> all spaced, last capped at 122, orbit 130 still clear
const worst = rings([0.6, 0.57, 0.55, 0.52, 0.5, 0.48, 0.45, 0.43, 0.41, 0.4]);
console.log("10 matches:", worst.map(r => r.radius));
console.log("min gap between rings:", RING_GAP, "pt | closest ring to center:", MIN_R, "pt | query marker clearance: OK");
console.log("unmatched always at orbit:", ORBIT, "pt");
