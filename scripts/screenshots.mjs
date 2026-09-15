/**
 * Captures desktop + mobile screenshots of the main routes for the README.
 * Serves the static export in `out/` locally, then drives Chromium through
 * every page and writes PNGs to `screenshots/`.
 *
 * Usage: pnpm build && node scripts/screenshots.mjs
 */

import { chromium } from "playwright";
import { createServer } from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT = join(ROOT, "out");
const SHOTS = join(ROOT, "screenshots");
const PORT = 4173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".txt": "text/plain",
  ".xml": "application/xml",
};

const server = createServer(async (req, res) => {
  let urlPath = decodeURIComponent(new URL(req.url, `http://localhost:${PORT}`).pathname);
  if (urlPath.endsWith("/")) urlPath += "index.html";
  let file = join(OUT, urlPath);

  const tryRead = async (f) => {
    try {
      return await readFile(f);
    } catch {
      return null;
    }
  };

  const data = (await tryRead(file)) ?? (await tryRead(join(OUT, "404.html")));
  if (!data) {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  res.writeHead(200, { "Content-Type": MIME[extname(file)] ?? "application/octet-stream", "Cache-Control": "no-store" });
  res.end(data);
});

const PAGES = [
  { route: "home", path: "/" },
  { route: "play", path: "/play/" },
  { route: "blog", path: "/blog/" },
  { route: "article", path: "/blog/how-to-play-minesweeper/" },
  { route: "about", path: "/about/" },
  { route: "privacy", path: "/privacy-policy/" },
  { route: "404", path: "/no-such-page/" },
];

await new Promise((r) => server.listen(PORT, r));
await mkdir(SHOTS, { recursive: true });

const browser = await chromium.launch();

for (const { route, path } of PAGES) {
  for (const [label, viewport, dsf, fullPage] of [
    ["desktop", { width: 1280, height: 800 }, 1, true],
    ["mobile", { width: 390, height: 844 }, 2, true],
  ]) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: dsf,
      colorScheme: "light",
      reducedMotion: "reduce",
    });

    // Seed a finished onboarding and quiet settings so the game screen is idle.
    // Neutralize the service worker so it cannot serve stale caches mid-capture.
    await context.addInitScript(() => {
      const key = "swm.settings.v1";
      try {
        const existing = JSON.parse(localStorage.getItem(key) || "{}");
        existing.state = {
          ...(existing.state || {}),
          onboarded: true,
          sound: false,
          haptics: false,
          motion: "reduced",
        };
        existing.version = 1;
        localStorage.setItem(key, JSON.stringify(existing));
      } catch {
        /* storage unavailable */
      }
      if (navigator.serviceWorker) {
        navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
      }
    });

    const page = await context.newPage();
    await page.goto(`http://localhost:${PORT}${path}`, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);

    if (route === "play") {
      const board = page.locator(".game-canvas");
      if (await board.count()) {
        await board.click({ position: { x: 120, y: 90 } }).catch(() => {});
        await page.waitForTimeout(500);
      }
    } else {
      await page.waitForTimeout(600);
    }

    await page.screenshot({ path: join(SHOTS, `${route}-${label}.png`), fullPage });
    console.log(`wrote screenshots/${route}-${label}.png`);
    await context.close();
  }
}

await browser.close();
server.close();
console.log("done");