// Nahraje demo smyčku snímek po snímku (deterministicky přes ruční GSAP ticker)
// a složí MP4 přes ffmpeg. Použití: npm run record [-- --out <složka>] [--only 4x5|9x16]
import { createServer } from "vite";
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const arg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : def;
};
const OUT = resolve(arg("out", "recordings"));
const ONLY = arg("only", null);
const FPS = 30;

const FORMATS = [
  { id: "4x5", viewport: { width: 720, height: 900 }, out: { w: 1080, h: 1350 } },
  { id: "9x16", viewport: { width: 720, height: 1280 }, out: { w: 1080, h: 1920 } },
].filter((f) => !ONLY || f.id === ONLY);

mkdirSync(OUT, { recursive: true });
const server = await createServer({ server: { port: 5199, strictPort: false }, logLevel: "error" });
await server.listen();
const base = server.resolvedUrls.local[0];
const browser = await chromium.launch();

const settle = (page) =>
  page.evaluate(() => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0))));

const encodeArgs = (input, output, w, h, extra = []) => [
  "-y", ...extra, "-i", input,
  "-vf", `scale=${w}:${h}:flags=lanczos:out_color_matrix=bt709:out_range=tv,format=yuv420p`,
  "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-profile:v", "high", "-level", "4.2",
  "-pix_fmt", "yuv420p",
  "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
  "-r", String(FPS), "-bsf:v", "h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1", "-movflags", "+faststart", "-an",
  output,
];

async function openDemo(fmt) {
  const page = await browser.newPage({ viewport: fmt.viewport, deviceScaleFactor: 2, reducedMotion: "no-preference" });
  page.on("pageerror", (e) => console.error("pageerror:", e.message));
  await page.goto(`${base}?demo=1&record=1&format=${fmt.id}`);
  await page.waitForFunction(() => window.__demo?.ready === true);
  await settle(page);
  return page;
}

for (const fmt of FORMATS) {
  const frames = join(OUT, `frames-${fmt.id}`);
  rmSync(frames, { recursive: true, force: true });
  mkdirSync(frames, { recursive: true });
  let page = await openDemo(fmt);
  const duration = await page.evaluate(() => window.__demo.duration);
  const total = Math.round(duration * FPS);
  console.log(`${fmt.id}: ${duration.toFixed(2)} s, ${total} snímků`);
  for (let i = 0; i < total; i++) {
    const file = join(frames, `f${String(i).padStart(4, "0")}.png`);
    for (let attempt = 0; ; attempt++) {
      try {
        if (attempt > 0) {
          // Chromium bez GPU se občas zasekne - nová stránka a přetočení na snímek i
          page.close().catch(() => {});
          page = await openDemo(fmt);
          for (let k = 0; k < i; k++) {
            await page.evaluate((dt) => window.__demo.step(dt), 1 / FPS);
            if (k % 5 === 0) await settle(page);
          }
        } else if (i > 0) {
          await page.evaluate((dt) => window.__demo.step(dt), 1 / FPS);
        }
        await settle(page);
        await page.screenshot({ path: file, timeout: 45000 });
        break;
      } catch (e) {
        if (attempt >= 3) throw e;
        console.warn(`  snímek ${i}: ${e.message.split("\n")[0]} - zkouším znovu`);
      }
    }
    if (i % 60 === 0) console.log(`  ${i}/${total}`);
  }
  await page.close();
  execFileSync("ffmpeg", encodeArgs(join(frames, "f%04d.png"), join(OUT, `glass-checkout-${fmt.id}.mp4`), fmt.out.w, fmt.out.h, ["-framerate", String(FPS)]), { stdio: "inherit" });

  if (fmt.id === "4x5") {
    for (const pose of ["formular", "cvv", "hotovo"]) {
      const p = await openDemo(fmt);
      await p.evaluate((name) => window.__demo.pose(name), pose);
      await settle(p);
      for (let k = 0; k < 40; k++) {
        await p.evaluate(() => window.__demo.step(1 / 30));
        await settle(p);
      }
      const raw = join(OUT, `raw-${pose}.png`);
      await p.screenshot({ path: raw });
      execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-vf", `scale=${fmt.out.w}:${fmt.out.h}:flags=lanczos`, join(OUT, `glass-checkout-${pose}.png`)]);
      rmSync(raw);
      await p.close();
    }
  }
}

await browser.close();
await server.close();
console.log("Hotovo:", OUT);
