# Tracker

Live record of tasks, decisions, and progress. Updated at each stage.

## Status

| Stage | Task | Status |
|------|------|--------|
| 0 | Move rules/design/game-logic into `rules/` | Done |
| 0 | Create `rules/plan.md` + `rules/tracker.md` | Done |
| 0 | git init + .gitignore | Done |
| 0 | Scaffold Next.js 16 + React 19 + TS + Tailwind v4 | Done |
| 1 | Design token + theme system | Done |
| 2 | Headless game engine + tests | Done |
| 3 | Classic mode + UI shell | Done |
| 4 | Sound + haptics | Done (folded into shell) |
| 5 | Zen / Rush / Daily / No Guess | Pending |
| 6 | Settings + persistence (stats, achievements, records) | Pending |
| 7 | Custom primitives + polish | Pending |
| 8 | PWA, meta, docs | Pending |

## Decisions

- **2026-09-13** Stack confirmed: Next.js 16 + React 19 + TS strict + Tailwind v4 with CSS-variable-driven tokens. User approved option 1 and asked Tailwind decision to be made after reviewing the reference folder. Decision: use Tailwind v4 as engine, all configurable values are runtime custom properties.
- **2026-09-13** Design reference: `D:\Programming\html-css\loksewa quiz hosted`. Token strategy mirrors its `[data-theme]` approval, iOS HIG material, frosted glass, safe areas, spring motion tokens.
- **2026-09-13** Project name: SweeperMine. Tagline: "Think clearly. Clear everything."
- **2026-09-13** No backend. Fully local. PWA offline-first. V1 modes: Classic (Beginner/Intermediate/Expert/Custom), Zen, Rush, Daily, No Guess.
- **2026-09-13** Engine architecture finalized: `src/engine/` (pure TS, zero React) with modular `rng` (mulberry32 + hashed seeds), `topology` (Square/Cylinder + adjacency), `actions` (flood/chord/flag mutate cells only), `GameEngine` state machine (phase, tick, undo via 256-entry snapshots, serialize/hydrate), `solver` (constraint + enumeration fallback for No Guess), `metrics` (3BV). Vitest config moved to `vitest.config.mts` to silence ESM-in-CJS warning. 51 engine tests pass. First-reveal board generation uses `generatedFor` + generous-opening neighborhood; chord() returns null when not applicable (no phantom undo snapshots).
- **2026-09-13** Stage 3 UI shell done: `src/game/` Zustand glue (`useSettingsStore` persist `swm.settings.v1` + document data-* application; `useGameStore` wraps GameEngine with clock/board version counters, continue persistence `swm.run.v1` via serialize/hydrate, `unflag` engine method for tap-to-unflag, cols/rows tracking), `src/game/sound.ts` (Web Audio generative, zero assets) + haptics. `src/components/ui/` primitives (Button, IconButton, SegmentedControl, Switch, Sheet) + hand-drawn SVG icon set. `src/components/game/`: GameScreen (rAF clock, keyboard nav + shortcuts, visibility auto-pause, result detection), Hud (mines/status/timer + undo/restart), BoardGrid (ResizeObserver cell sizing, MIN_CELL floor so boards scroll instead of shrinking to untappable targets, mines-grid utility), Cell (per-cell state signature subscription, pointer gestures: tap reveal, tap-flagged unflag, long-press flag, double-tap chord, right/middle click), Overlays (Continue/Pause/Result), ModeSelect (modes disabled except Classic with "Soon" tag), SettingsSheet (theme/accent/font/scale/density/motion/feedback). Inline `inlineTokens.ts` restores saved tokens before first paint. 52 tests, typecheck + static export build green.
- **2026-09-13** SegmentDisplay skipped, swapped for compact tabular HUD per plan; "face" replaced by color-tinted restart icon (no emoji rule); question mark enabled in Classic cycle (game-logic questionAllowed).

## Notes

- Commit at every meaningful milestone, clear messages, never batch unrelated changes.
- Engine must be headless-testable; UI never contains game logic.