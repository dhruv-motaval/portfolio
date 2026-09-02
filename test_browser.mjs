import puppeteer from "puppeteer-core";

const browser = await puppeteer.launch({
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: "new",
  args: ["--no-sandbox"]
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", e => errors.push(e.message.slice(0, 200)));

await page.goto("http://127.0.0.1:8765/", { waitUntil: "networkidle2", timeout: 90000 });
await page.waitForFunction(() => window.__semanticReady === true, { timeout: 90000 });
console.log("model ready");

const names = await page.evaluate(() => window.__vdotRegistry.map(d =>
  d.card.querySelector("h3, h4").textContent.split(" ")[0]));

const run = async q => {
  await page.evaluate(() => { document.getElementById("searchInput").value = ""; });
  await page.type("#searchInput", q, { delay: 15 });
  await new Promise(r => setTimeout(r, 3000));
  return page.evaluate(() => {
    const sims = [...document.querySelectorAll("[data-label]")].map(e => e.textContent);
    const moved = window.__vdotRegistry.map(d => parseFloat(d.el.getAttribute("transform").match(/translate\(([-\d.]+)/)[1]));
    const topCard = [...document.querySelectorAll("#projectGrid .card")].find(c => c.classList.contains("top-match"));
    return { sims, moved, topCard: topCard ? topCard.querySelector("h3").textContent.split(" ")[0] : "none" };
  });
};

for (const q of ["RAG", "chatbot", "payment outage pager duty", "meeting notes pdf", "weather forecast"]) {
  const r = await run(q);
  const tops = r.sims.map(s => parseFloat((s.match(/[\d.]+$/) || ["0"])[0]));
  const bestIdx = tops.indexOf(Math.max(...tops));
  const movedCount = r.moved.filter(x => Math.abs(x) < 124).length;
  console.log(`"${q}" -> top: ${names[bestIdx]} (${Math.max(...tops).toFixed(3)}) | dots moved: ${movedCount}/10 | top-match card: ${r.topCard}`);
}

console.log("page errors:", errors.length ? errors : "none");
await browser.close();
