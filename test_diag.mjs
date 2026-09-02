import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--no-sandbox"]
});
const page = await browser.newPage();
const logs = [];
page.on("console", m => logs.push(`[${m.type()}] ${m.text().slice(0, 200)}`));
page.on("pageerror", e => logs.push(`[PAGEERROR] ${e.message.slice(0, 300)}`));

await page.goto("http://127.0.0.1:8765/", { waitUntil: "domcontentloaded", timeout: 90000 });
await new Promise(r => setTimeout(r, 1500));

const diag = await page.evaluate(() => ({
  cardReg: (window.__cardRegistry || []).length,
  vdotReg: (window.__vdotRegistry || []).length,
  dotLayerChildren: document.getElementById("dotLayer") ? document.getElementById("dotLayer").children.length : -1,
  cardCount: document.querySelectorAll("#projectGrid .card").length,
  miniCount: document.querySelectorAll("#more-projects .mini-card").length,
  hasDebug: typeof window.__semanticDebug
}));
console.log("DIAG:", JSON.stringify(diag, null, 1));
console.log("--- captured logs ---");
console.log(logs.join("\n") || "none");
await browser.close();
