export const meta = {
  title: "Minesweeper Glossary: Every Term Explained in One Place",
  description:
    "A friendly dictionary of every minesweeper word you will meet: 3BV, chord, flag, guess, no-guess, pattern, 50/50, and more, each explained in one line.",
  date: "2026-09-03",
};

export const body = `
Minesweeper has a small, precise vocabulary, and most of it looks like code until someone explains each word in a sentence. This glossary is that someone. Bookmark it and flip back whenever a guide uses a term you have not met.

## Board terms

- Field. The grid of cells where the game happens, sized by columns and rows.
- Cell. One square of the field. Sealed, revealed, flagged, or questioned.
- Reveal. The action that opens a sealed cell and shows its number or a blank.
- Number. A revealed value counting the mines in the eight cells touching it.
- Mine. The hidden hazard that ends a run when revealed.
- Edge. The border of the field, where cells have fewer neighbors.
- Opening. The fan of blank cells a first click produces.
- Front line. The ring of revealed numbers separating solved ground from sealed unknown.

## Actions

- Flag. A marker promising a cell hides a mine. Right-click or long-press to place.
- Question. A tentative marker sent for review when question marks are on.
- Chord. Double-clicking a satisfied number to open every remaining neighbor, all at once.
- Undo. Reversing the previous action in friendly modes, at no cost to the field.
- Hint. A next-move suggestion proven by the same solver that builds No Guess boards.

## Concepts

- Solvable. When the board guarantees at least one provably safe move.
- Proof. A logical argument that a cell is safe or mined, from the numbers alone.
- 50/50. The classic dead end where two cells both fit the same numbers, one hides a mine, and no proof exists.
- Guess. Revealing without proof, forced by a 50/50 or chosen by impatience.
- No Guess. A generator that refuses to ship any position with an unprovable move.
- 3BV. The minimum number of actions a perfect player would need to clear a board. The fair way to compare times.
- Actions per second. Your clear time divided by the board's 3BV. The speed skill number.
- Forced move. A cell that only one outcome can satisfy, guaranteed by proof.

## Patterns

- Edge [[1]]. A [[1]] on the border with one sealed neighbor: that neighbor is a mine.
- [[1-2-1]]. Three in a row reading one, two, one: mines sit above the two ones, ground above the middle two.
- [[1-2]]. A [[1]] sharing a cell with a [[2]]: one mine the [[1]] owns, the [[2]] takes its other mine from the cell only it sees.
- Reduced pattern. A familiar pattern with already-solved cells mentally subtracted.

## Modes

- Classic. Standard minesweeper with a timer, records, and honest 50/50s.
- Zen. The same field with the timer removed, for calm complete reads.
- Rush. A hard countdown: Beginner at 60 seconds, Intermediate at 150, Expert at 300.
- Daily. A fixed No Guess board everyone shares on a given date, with a daily leaderboard.
- Practice. Faint number previews under sealed cells, hints on, undo on, competitive records switched off.
- Custom. Hand-sized field from 5 by 5 up to 60 by 60, your mine count, your rules.

## Buried treasure terms

- First-click safety. The field is generated around your first click so it can never open a mine.
- No Flagger trick. Clearing Expert while placing few or no flags, saving clicks.
- Personal best. Your fastest clean time on a mode and board size.
- Streak. Consecutive daily boards cleared without a miss.

Now you can read any guide without a dictionary. Start with the [strategy guide](https://easyminesweeper.vercel.app/blog/minesweeper-strategy-for-beginners) and come back here when a word sneaks past you.
`;