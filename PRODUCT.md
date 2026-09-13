# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Casual and learning players. Primary jobs: decompress with a familiar puzzle, or actually get better at minesweeper. Many players remember Windows minesweeper and want a cleaner, calmer, more modern version; beginners find classic minesweeper intimidating and need teaching, not just a board.

## Product Purpose

Easy Minesweeper is a free, fully offline, installable minesweeper PWA that runs entirely in the browser. It exists to be both the most pleasant minesweeper to play and a genuinely teaching one: solver-backed hints, a No Guess mode, and a practice mode that shows what each number means. Success means players win their first board without rage-quitting, keep coming back for the daily puzzle, and find the site through search.

## Positioning

"Think clearly. Clear everything." A calm, buttery UX with real teaching tools (no guessing) inside, where every surface feels like you are inside the minefield itself. The mechanism no copycat can claim: hints and a No Guess generator are driven by the same constraint solver that validates the board.

## Operating Context

Browser-based, mobile and desktop. Works offline after first visit, installable as an app. The separate content site (landing + blog + about + privacy) shares the same host and serves search engines and advertisement placement while the game at /play stays focused and ad-free.

## Capabilities and Constraints

- Game modes: Classic (Beginner/Intermediate/Expert/Custom), Zen, Rush, Daily, No Guess, Practice.
- Stats, records, achievements, daily streak; corrupt-safe local persistence; no backend.
- Full theming: 8 themes, 8 accents, 4 fonts, size scale, density; sound + haptics splits; hold duration.
- Pan and pinch zoom for large boards; keyboard play with shortcuts.
- Custom boards with first-click safety and question marks.
- Constraint solver (engine) also powers hints and No Guess generation.
- Next.js 16 App Router, static export to /out, React 19, TypeScript strict, Tailwind v4, CSS-variable tokens, Vitest.
- Content hub is hand-written, static, and indexable; ad frames live on landing and blog only, game page stays clean.

## Brand Commitments

- Name: Easy Minesweeper (site, landing, title tags, footer). Keep the game's internal product name SweeperMine visible in game UI copy only for now.
- Tagline: "Think clearly. Clear everything."
- No emoji in copy; no em dashes; no generic AI-slop wording; nothing default (cursors, scrollbars, modals, toasts all custom).
- Every page must feel "inside minesweeper" - mined grid motifs, flags, number cells as design language, not generic SaaS layouts.
- iOS HIG inspired glass, safe-area handling, spring motion; custom hand-drawn icon set.
- Design tokens are the single source of truth; never hardcode values.

## Evidence on Hand

- Runnable game at /play with 99 passing tests.
- Hand-drawn SVG icon set, token system, service worker, generated icons/OG image.
- Eight real achievements and full stats are implemented in-game (no invented claims needed on the landing page).

## Product Principles

1. Teach genuinely. Hints and No Guess share the solver; the practice mode shows numbers before you guess. Content must be equally real.
2. Calm buttery UX over flash. iOS-quality motion, haptics, sound, and focus; performance and accessibility never lose.
3. The minefield is the identity. Every surface extends the game world; nothing becomes generic.
4. Playable offline with zero compromise. PWA is first-class, ads never touch the game.
5. Static, indexable, truthful. Article and landing copy stays factual and helpful enough to earn ranking and ad approval on merit.

## Accessibility & Inclusion

- Reduced-motion kill switch, a high-contrast theme, custom focus rings, keyboard shortcuts, and contrast-tested muted ink already shipped in the game; the content surfaces inherit all of it.