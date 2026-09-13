# Contributing to SweeperMine

SweeperMine is proprietary software licensed exclusively to its owner, and the
game is a personal project. Outside collaboration is not currently open.

If you are the Licensee (or have been invited) and want to work on the code:

## Ground rules

- `rules/` is the source of truth. Read `rules/rules.md`, `rules/design.md`,
  `rules/game-logic.md`, and `rules/plan.md` before changing behavior, and
  append a dated bullet to `rules/tracker.md` when a rule item lands.
- Follow the existing conventions: typed engine layer free of UI concerns,
  zustand stores, Tailwind tokens, no new runtime dependencies unless the plan
  requires them.
- No comments unless they explain a non-obvious decision (rare). Copy must
  match the calm, teaching tone and avoid em dashes.

## Workflow

1. Verify the current branch is clean: `pnpm typecheck`, `pnpm test`.
2. Make focused changes; each item from `rules/plan.md` lands as its own commit.
3. Before committing, run:
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm build`
   - the impeccable detector:
     `node C:/Users/arunn/.claude/skills/impeccable/scripts/detect.mjs --json <changed files>`
4. Commit with a conventional prefix (`feat`, `fix`, `docs`, `chore`) and keep
   the working tree clean afterwards.

## Releasing

- Regenerate icons if branding changed: `node scripts/make-icons.mjs`.
- Bump `package.json` version and add a `CHANGELOG.md` entry.
- `pnpm build` produces the static export in `out/` for deployment.