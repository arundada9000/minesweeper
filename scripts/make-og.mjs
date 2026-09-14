/**
 * Generates site-level and per-article OG images (1200×630 PNG) with a
 * headless Chromium via Playwright. Run with `node scripts/make-og.mjs`.
 *
 * Requires: `pnpm i -D playwright && npx playwright install chromium`
 *
 * Design mirrors make-icons.mjs: dark ink canvas (#1c1c1e), amber mine emblem
 * (reused as inline SVG), white title, "Easy Minesweeper" wordmark. Outputs
 * land in public/og/{slug}.png (consumed by src/app/(site)/blog/[slug]/page.tsx)
 * plus a default public/og.png site card.
 */

import { chromium } from "playwright";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const PUBLIC = join(ROOT, "public");
const OG_DIR = join(PUBLIC, "og");

const SITE_NAME = "Easy Minesweeper";
const SITE_TAGLINE = "Think clearly. Clear everything.";

/* Full titles are taken from the `meta` export of each article under
 * src/content/articles/. Keep slugs in sync with src/content/posts.ts. */
const ARTICLES = [
  { slug: "how-to-play-minesweeper", title: "How to Play Minesweeper: Rules, Controls, and Your First Win" },
  { slug: "minesweeper-strategy-for-beginners", title: "Minesweeper Strategy for Beginners: How to Never Guess Again" },
  { slug: "minesweeper-number-patterns", title: "The 1-2-1 Pattern and the Other Number Patterns That Win Games" },
  { slug: "no-guess-mode", title: "No Guess Mode: What It Is and Why It Changes Minesweeper" },
  { slug: "minesweeper-speed-techniques", title: "Flag, Chord, and Fast Clicking: Speed Techniques That Actually Help" },
  { slug: "minesweeper-3bv-and-good-times", title: "What Is 3BV and What Counts as a Good Minesweeper Time" },
  { slug: "zen-mode", title: "Zen Mode: Why a Timer-Free Minesweeper Is a Better Teacher" },
  { slug: "rush-mode-guide-and-tips", title: "Rush Mode Guide: How to Clear the Board Before the Clock Does" },
  { slug: "daily-minesweeper-challenge", title: "The Daily Minesweeper Challenge: One Board, One Leaderboard, Every Day" },
  { slug: "practice-mode-and-smart-hints", title: "Practice Mode and Smart Hints: How to Learn Minesweeper Without Losing" },
  { slug: "custom-minesweeper-boards", title: "Custom Minesweeper Boards: Build the Exact Field You Want to Train" },
  { slug: "minesweeper-probability-and-guessing", title: "Minesweeper Probability: When Guessing Is Mathematically Right" },
  { slug: "speedrun-minesweeper-records", title: "How to Speedrun Minesweeper: From Casual Player to Sub-Minute Expert" },
  { slug: "play-minesweeper-on-mobile", title: "Play Minesweeper on Your Phone: Touch, Pinch, and Your Personal Best" },
  { slug: "minesweeper-glossary", title: "Minesweeper Glossary: Every Term Explained in One Place" },
  { slug: "brief-history-of-minesweeper", title: "A Brief History of Minesweeper, From a 1973 Terminal to Your Browser" },
];

/* ------------------------- embedded display font ------------------------- */
/* Lexend is the site's display typeface (font-display). Embed it base64 so the
 * screenshots render it regardless of the host's installed fonts. */
function fontFace(relativePath, weight) {
  const p = join(ROOT, "node_modules", "@fontsource", "lexend", "files", relativePath);
  const data = readFileSync(p).toString("base64");
  return `@font-face { font-family: "Lexend"; font-style: normal; font-weight: ${weight}; font-display: block; src: url(data:font/woff2;base64,${data}) format("woff2"); }`;
}

const FONT_CSS = [fontFace("lexend-latin-600-normal.woff2", 600), fontFace("lexend-latin-700-normal.woff2", 700)].join("\n");

/* ------------------ mine emblem as SVG (from make-icons.mjs) -------------- */
/* Reuses the SDF painter's geometry constants: 8 spokes radiating off a dark
 * orb with an amber rim and an upper-left specular highlight. */
const SPIKE_IN = 0.13;
const SPIKE_OUT = 0.64;
const SPIKE_W = 0.055;
const ORB_R = 0.17;

function emblemSvg() {
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const ang = (i / 8) * Math.PI * 2;
    const ax = (Math.cos(ang) * SPIKE_IN).toFixed(3);
    const ay = (Math.sin(ang) * SPIKE_IN).toFixed(3);
    const bx = (Math.cos(ang) * SPIKE_OUT).toFixed(3);
    const by = (Math.sin(ang) * SPIKE_OUT).toFixed(3);
    return `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" />`;
  }).join("");
  const hl = { cx: (-0.055).toFixed(3), cy: (-0.06).toFixed(3), r: 0.045 };
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.7 -0.7 1.4 1.4" width="100%" height="100%">
  <defs>
    <radialGradient id="orb" cx="35%" cy="32%" r="75%">
      <stop offset="0%" stop-color="#273146"/>
      <stop offset="55%" stop-color="#101217"/>
      <stop offset="100%" stop-color="#08090b"/>
    </radialGradient>
  </defs>
  <g stroke="#ff9500" stroke-width="${SPIKE_W.toFixed(3)}" stroke-linecap="round">
    ${spokes}
  </g>
  <circle r="${ORB_R}" fill="url(#orb)" />
  <circle r="${ORB_R}" fill="none" stroke="#f09433" stroke-width="0.014" />
  <circle cx="${hl.cx}" cy="${hl.cy}" r="${hl.r}" fill="#ffffff" opacity="0.32" />
</svg>`;
}

const EMBLEM = emblemSvg();

/* ---------------------------------- layout -------------------------------- */

const FONT_STACK = `"Lexend", "Segoe UI", system-ui, -apple-system, sans-serif`;

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * @param {{ kind: "site" | "article", title?: string }} opts
 */
function template({ kind, title }) {
  const isArticle = kind === "article";
  const headline =
    kind === "site"
      ? `<div class="site-name">${escapeHtml(SITE_NAME)}</div>
         <div class="tagline"><span class="dot"></span>${escapeHtml(SITE_TAGLINE)}<span class="dot"></span></div>`
      : `<div class="stage"><div id="title" class="title">${escapeHtml(title)}</div></div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  ${FONT_CSS}
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1200px; height: 630px; }
  body {
    background: #1c1c1e;
    color: #f5f5f7;
    font-family: ${FONT_STACK};
    overflow: hidden;
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .wordmark {
    position: absolute; top: 44px; left: 0; right: 0;
    text-align: center;
    font-size: 22px; font-weight: 600;
    letter-spacing: 0.34em; text-indent: 0.34em; text-transform: uppercase;
    color: #8a8a8e;
  }
  .wordmark b { color: #ff9500; font-weight: 600; }
  .stage {
    width: 940px; height: 320px;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; margin-top: 34px;
  }
  .title {
    font-weight: 700;
    color: #f5f5f7;
    text-align: center;
    line-height: 1.14;
    letter-spacing: -0.015em;
    width: 100%;
  }
  .site-name {
    font-weight: 700; font-size: 84px; color: #f5f5f7;
    text-align: center; letter-spacing: -0.02em; line-height: 1;
  }
  .tagline {
    margin-top: 26px;
    font-size: 19px; font-weight: 600;
    letter-spacing: 0.22em; text-indent: 0.22em; text-transform: uppercase;
    color: #98989d; text-align: center;
  }
  .tagline .dot {
    display: inline-block; width: 8px; height: 8px; border-radius: 50%;
    background: #ff9500; vertical-align: middle;
    margin: 0 18px; opacity: 0.85;
  }
  .emblem {
    position: absolute; width: 150px; height: 150px;
    right: 54px; bottom: 54px;
    opacity: 0.11;
  }
  .accent {
    position: absolute; left: 0; right: 0; bottom: 0; height: 4px;
    background: linear-gradient(90deg, #ff9500 0%, #ff6b35 100%);
  }
</style>
<script>
  function fitTitle() {
    const el = document.getElementById("title");
    if (!el) return;
    const max = 58, min = 30;
    let size = max;
    while (size > min) {
      el.style.fontSize = size + "px";
      if (el.scrollHeight <= el.clientHeight && el.scrollWidth <= el.clientWidth) break;
      size--;
    }
    el.style.fontSize = size + "px";
    el.style.opacity = "1";
  }
  window.fitTitle = fitTitle;
  window.addEventListener("load", fitTitle);
</script>
</head>
<body>
  <div class="wordmark">${isArticle ? `<b>✦</b>&nbsp; ${escapeHtml(SITE_NAME)} · Guide` : `✦&nbsp; ${escapeHtml(SITE_NAME)}`}</div>
  ${headline}
  ${isArticle ? "" : `<div class="emblem">${EMBLEM}</div>`}
  <div class="accent"></div>
</body>
</html>`;
}

/* ----------------------------------- emit --------------------------------- */

async function main() {
  mkdirSync(OG_DIR, { recursive: true });
  console.log("launching chromium…");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

  const jobs = [
    { kind: "site", rel: "og.png" },
    ...ARTICLES.map((a) => ({ kind: "article", title: a.title, rel: join("og", `${a.slug}.png`) })),
  ];

  for (const job of jobs) {
    const html = template({ kind: job.kind, title: job.title });
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    if (job.kind === "article") await page.evaluate(() => window.fitTitle && window.fitTitle());
    const buf = await page.screenshot({ type: "png" });
    const out = join(PUBLIC, job.rel);
    writeFileSync(out, buf);
    console.log(`✓ wrote public/${job.rel} (${buf.length} bytes)`);
  }

  await browser.close();
  console.log(`done — ${jobs.length} images`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});