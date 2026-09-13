# SweeperMine - Implementation Plan

Source of truth for build order and decisions. Synced as work proceeds.

## Stack (confirmed with Arun)

- Next.js 16 (App Router)
- React 19, TypeScript (strict)
- Tailwind CSS v4 as the engine, but **every configurable value (theme colors, accents, font families + sizes, spacing scale, radii, shadows, easing, durations) is a CSS custom property**, runtime-mutable on `:root` / `[data-theme]`.
- Motion (Framer Motion) for purposeful animation.
- No backend. Everything local: localStorage / IndexedDB. Fully offline PWA.

Why this over the reference's handrolled 6000-line CSS: Tailwind v4 is CSS-first, generates utilities from `@theme` variables, and utilities resolve through the same custom properties that themes override at runtime. Same token philosophy as `loksewa quiz hosted`, but less repetition and faster iteration.

Design reference: `D:\Programming\html-css\loksewa quiz hosted` (iOS HIG tokens, `[data-theme]` blocks, frosted glass, safe areas, spring touch physics, `--ease` / `--dur` motion tokens).

## Architecture

```
src/
  app/            Next.js App Router (routes, shell, PWA manifest wiring)
  engine/         Pure TS game engine. Zero React/UI. Headless-testable.
    topology/     GridTopology abstraction (Square now, Hex/Cylinder later)
    rng/          Deterministic seeded RNG (mulberry32 + seed hashing)
    board/        Board, Cell, CellState, generation, first-click safety
    logic/        reveal, cascade, chord, flag cycle, win/loss detection
    modes/        ModeDefinition (declarative rules per mode)
    solver/       No-Guess validation + hint system (logic-based)
    metrics/      3BV, difficulty classification
    replay/       action recording for replay (tier 3)
    timer/        deterministic timer that survives pause/visibility
  game/           UI glue: state container (Zustand), stats, achievements, persistence, sound, haptics, settings
  components/
    ui/           Custom primitives: Button, Sheet, Modal, Toast, ContextMenu, Tooltip, Segmented, Toggle, Slider, CommandPalette, custom cursor + scrollbar
    game/         Board, Cell, HUD, Result, Pause, ModeSelect, DifficultySelect
    settings/     Settings panels (appearance, fonts/spacing, sound, haptics, controls)
    landing/      (later) landing page
  styles/         design tokens (themes, accents, fonts, spacing, motion), global css
```

## Tenets (mandatory)

- Gameplay layer never imports React; UI never contains mine-generation or win logic.
- No hardcoded values in components; all values come from tokens/config.
- No fake features. Every button does something real.
- No emojis, no em dashes. Proper SVG icons.
- Determinism: seed -> same board. Daily seed = hash(date + mode + difficulty + version).
- Respect feedback priority: state > visual > haptic > audio > secondary animation.
- prefers-reduced-motion respected; nothing carries essential info via motion/color alone.

## Build order

### Stage 0 - Scaffold
- [x] Move rules files into `rules/`
- [x] plan.md + tracker.md created
- [ ] git init + .gitignore
- [ ] create-next-app scaffold (TS, Tailwind v4, app router)
- [ ] Verify `pnpm dev` / `pnpm build`

### Stage 1 - Design tokens & theme system
- Token layers: color (bg/surface/text/primary/green/red/amber/gold/brand), typography (display/body scales), spacing scale, radii, shadows, glass, motion (ease/dur), haptics preset names
- 8+ built-in themes (paper, slate, midnight, sepia, mist, contrast, ocean, grape) via `[data-theme]`
- Accent system: reusable accent palette applied over any theme
- Fonts: system SF stack default + configurable families (self-hosted woff2, offline-first)
- Runtime appliers: appearance store writes CSS vars, font scale, spacing density
- System theme preference (auto light/dark)

### Stage 2 - Engine (headless)
- RNG (mulberry32), seed utils, daily seed, puzzle id encoding
- SquareGrid topology (neighbors via topology, not hardcoded)
- Board generation: first-click-safe, no terrible openings, validate limits
- Cell model + state machine guards (no invalid combos)
- Reveal + cascade (BFS, performant), chord, flag cycle (incl. question config)
- Win/loss, restart, timer
- MoveHistory for undo (mode policy)
- Tests for all of the above (vitest)

### Stage 3 - Classic + UI shell
- Board component (grid, cell rendering, reveal/flag input: left/right/double/middle, long-press, pan/zoom)
- HUD (mines left, timer, restart, mode, pause)
- Difficulty presets (Beginner/Intermediate/Expert/Custom)
- Result flow (win/loss presentation, personal best)
- Continue game persistence

### Stage 4 - Sound + haptics
- Web Audio synthesized sounds (no asset files, offline, tiny)
- Haptic abstraction (navigator.vibrate + future WebHaptics), event mapping
- Master/gameplay/UI volumes, global toggle

### Stage 5 - Modes
- Zen, Rush, Daily, No Guess (solver-backed generation + hints)

### Stage 6 - Settings + persistence
- Settings app: appearance (theme/accent/font scale/spacing), sound, haptics, controls (keybindings), board behavior (question marks, confirm restart, tap/long-press behavior)
- Stats, achievements, records, daily history persisted locally, corrupt-state recovery

### Stage 7 - Custom primitives & polish
- Context menu, command palette (Cmd/Ctrl+K), custom cursor + scrollbar, toasts, sheets/modals
- Keyboard navigation + focus rings, help modal
- Animations/microinteractions audit; haptic/sound tuning

### Stage 8 - PWA, meta, docs
- manifest, service worker (offline-first cache), install prompt
- SEO/AEO/OG/GEO, sitemap, robots, 404 + error pages
- console easter egg, footer watermark (Arun Neupane)
- README, LICENSE (proprietary per Arun's decision), CHANGELOG, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, .gitignore

## Open decisions (ask Arun)

- None blocking currently. Will ask if confusion arises.