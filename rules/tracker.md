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
| 3 | Classic mode + UI shell | Pending |
| 4 | Sound + haptics | Pending |
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

## Notes

- Commit at every meaningful milestone, clear messages, never batch unrelated changes.
- Engine must be headless-testable; UI never contains game logic.