// náhled: snímky v zadaných časech smyčky. node scripts/peek.mjs 4x5 0 1 2 ...
import { createServer } from "vite";
import { chromium } from "playwright";
const [fmt, ...times] = process.argv.slice(2);
const vp = fmt === "9x16" ? { width: 720, height: 1280 } : fmt === "page" ? { width: 1280, height: 860 } : fmt === "mobile" ? { width: 390, height: 844 } : { width: 720, height: 900 };
const server = await createServer({ server: { port: 5299 }, logLevel: "error" }); await server.listen();
const base = server.resolvedUrls.local[0];
const b = await chromium.launch();
const p = await b.newPage({ viewport: vp, deviceScaleFactor: 1 });
p.on("pageerror", (e) => console.error("pageerror", e.message));
if (fmt === "page" || fmt === "mobile") { await p.goto(base); await p.waitForTimeout(1500); await p.screenshot({ path: `/tmp/peek-${fmt}.png` }); }
else {
  await p.goto(`${base}?demo=1&record=1&format=${fmt}`); await p.waitForFunction(() => window.__demo?.ready);
  let cur = 0;
  for (const t of times.map(Number)) {
    while (cur < t - 1e-6) { await p.evaluate(() => window.__demo.step(1 / 30)); cur += 1 / 30; if (Math.round(cur * 30) % 3 === 0) await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => r()))); }
    await p.evaluate(() => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0))));
    await p.screenshot({ path: `/tmp/peek-${fmt}-${t}.png` });
  }
}
await b.close(); await server.close();
