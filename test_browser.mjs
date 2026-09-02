import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--no-sandbox"]
});
const page = await browser.newPage();
const logs = [];
page.on("console", m => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", e => logs.push(`[PAGEERROR] ${e.message}`));

await page.goto("http://127.0.0.1:8765/", { waitUntil: "networkidle2", timeout: 90000 });
await page.waitForFunction(() => window.__semanticReady === true, { timeout: 90000 });

console.log("debug before typing:", JSON.stringify(await page.evaluate(() => window.__semanticDebug())));

await page.type("#searchInput", "chatbot", { delay: 50 });
await new Promise(r => setTimeout(r, 2500));

console.log("debug after typing:", JSON.stringify(await page.evaluate(() => window.__semanticDebug())));
console.log("labels:", JSON.stringify(await page.evaluate(() => [...document.querySelectorAll("[data-label]")].map(e => e.textContent.slice(0, 30)))));
console.log("dot0 transform:", await page.evaluate(() => window.__vdotRegistry[0].el.getAttribute("transform")));
console.log("--- console trace ---");
console.log(logs.filter(l => l.includes("[semantic]") || l.includes("PAGEERROR") || l.includes("[error]")).slice(0, 30).join("\n"));
await browser.close();
