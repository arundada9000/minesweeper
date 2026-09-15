# SweeperMine

Think clearly. Clear everything.

SweeperMine is a premium, offline-first minesweeper that runs entirely in your browser. It is a single-player logic game with teacher-built hinting, five play modes, records, achievements, and no ads. Everything is local: boards, records, and saves live in your browser, and the app keeps working with no network at all after the first visit.

## Features

- **Offline-first PWA** - installable (manifest + service worker), plays with no connection, self-hosted fonts and Web Audio no-frills sound engine.
- **Five modes** - Classic, No-guess (always solvable by logic), Daily (same board for everyone, anchored seed), Rush (timed), Zen (no timer, undo always on), plus Practice (visible mines) for learning.
- **Custom boards** - width, height, mine count, first-click safety, and question-mark toggles, all validated and clamped to the engine's browser-safe range.
- **Solver-backed hints** - the hint system analyzes the board, teaches the deduction it found, and flags or reveals for you; hints skip the time record.
- **Pan + pinch zoom** - large boards stay playable on small screens with ctrl/trackpad zoom on desktop and two-finger pinch on touch.
- **Records, achievements, daily history** - corrupt-safe persistence, streak tracking, and a "no flagger" achievement for sweepers who never flag.
- **Full accessibility** - keyboard play, reduced-motion support, system themes, and touch gestures that never misfire during panning or pinching.

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). Production build is a static export:

```bash
pnpm typecheck   # tsc --noEmit
pnpm test        # vitest run (engine + store suites)
pnpm build       # next build (output: out/)
```

`node scripts/make-icons.mjs` regenerates the app icons, favicon, and social card from a dependency-free rasterizer (PNG/ICO emitted to `public/`). `node scripts/make-og.mjs` then composites the developer watermark onto the 1200x630 share cards (`public/og.png` + every `public/og/<slug>.png`).

`pnpm build && node scripts/screenshots.mjs` regenerates the desktop/mobile screenshots below (serves the `out/` export locally and drives Chromium via Playwright).

## Playing

- **Tap** to reveal, **hold** to flag, **double-tap** a revealed number to clear around it (chord).
- **Right-click** (desktop) flags; **middle-click** chords.
- **Keyboard**: arrows move the cell cursor, Space reveals, F flags, Z u/undo, H hints (where allowed), R restarts, P/Esc pauses, ? opens How to play, Ctrl+K opens commands.
- **Pan/zoom**: the board scrolls natively; ctrl + wheel (or trackpad pinch) zooms on desktop, two fingers pinch on touch. A drag that starts on the board background pans.

## Project layout

```
src/
  engine/    rules-free game logic: board, solver, hints, presets (fully unit-tested)
  game/      client state: game store, settings, stats, sound
  components/ UI: game screen, HUD, overlays, sheets, primitives, cell gestures
  app/       Next.js app router shell, metadata, manifest, sitemap, robots
  lib/       shared site facts (SITE_URL etc.)
rules/       design and game-logic source of truth, tracked in rules/tracker.md
scripts/     icon generator (make-icons.mjs), OG watermark (make-og.mjs), screenshot capture (screenshots.mjs)
public/      service worker, icons, social card, sitemap, robots.txt, llms.txt
screenshots/ desktop + mobile captures for this README
```

## Tech stack

Next.js app router (static export), React 19, Zustand for stores, Web Audio for sound, Tailwind v4 tokens, Motion for animation, Vitest for tests.

## Screenshots

Desktop and mobile captures of the main routes (Chromium, `pnpm build && node scripts/screenshots.mjs`).

### Home

| Desktop | Mobile |
| --- | --- |
| <img src="screenshots/home-desktop.png" width="560" alt="Easy Minesweeper home, desktop"/> | <img src="screenshots/home-mobile.png" width="280" alt="Easy Minesweeper home, mobile"/> |

### Play

| Desktop | Mobile |
| --- | --- |
| <img src="screenshots/play-desktop.png" width="560" alt="Minesweeper board, desktop"/> | <img src="screenshots/play-mobile.png" width="280" alt="Minesweeper board, mobile"/> |

### Guides

| Desktop | Mobile |
| --- | --- |
| <img src="screenshots/blog-desktop.png" width="560" alt="Minesweeper guides index, desktop"/> | <img src="screenshots/blog-mobile.png" width="280" alt="Minesweeper guides index, mobile"/> |

### Guide article

| Desktop | Mobile |
| --- | --- |
| <img src="screenshots/article-desktop.png" width="560" alt="How to play minesweeper article, desktop"/> | <img src="screenshots/article-mobile.png" width="280" alt="How to play minesweeper article, mobile"/> |

### About

| Desktop | Mobile |
| --- | --- |
| <img src="screenshots/about-desktop.png" width="560" alt="About page, desktop"/> | <img src="screenshots/about-mobile.png" width="280" alt="About page, mobile"/> |

### Privacy policy

| Desktop | Mobile |
| --- | --- |
| <img src="screenshots/privacy-desktop.png" width="560" alt="Privacy policy, desktop"/> | <img src="screenshots/privacy-mobile.png" width="280" alt="Privacy policy, mobile"/> |

### 404

| Desktop | Mobile |
| --- | --- |
| <img src="screenshots/404-desktop.png" width="560" alt="Custom 404 page, desktop"/> | <img src="screenshots/404-mobile.png" width="280" alt="Custom 404 page, mobile"/> |

## License

SweeperMine is proprietary software. All rights reserved. See [LICENSE](./LICENSE). "Arun Neupane" is credited in-app in the footer watermark and the console easter egg.

## Author

Arun Neupane