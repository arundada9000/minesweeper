export const meta = {
  title: "How to Play Minesweeper: Rules, Controls, and Your First Win",
  description:
    "A complete beginner's guide to minesweeper: what the numbers mean, how flags and chording work, and how to clear your first board without guessing.",
  date: "2026-09-13",
};

export const body = `
Minesweeper looks like a wall of sealed cells, and in the first ten seconds it feels unfair. It is not. Every number on the board is a true statement about the mines around it, and once you learn to read those statements you can clear a board with pure logic. This guide walks through the rules, the controls, and a first-click plan that gets you to your first win.

## The one rule

The field hides a fixed number of mines. Each sealed cell hides either a mine or clear ground. Clicking a clear cell reveals it. Clicking a mine ends the run.

The trick is that revealed cells tell the truth: the number in a cell says exactly how many of the eight cells touching it hide mines. A cell showing [[3]] means three mines are hidden in the ring that wraps around it, nothing more. A blank revealed cell means zero mines around it, so every neighbor is safe to open.

## Numbers are clues, not curses

Beginners read numbers as danger. Reverse that: numbers are the only intel you have. A [[1]] guarantees one mine among its neighbors, two if the cell is on the edge, somewhere in that exposed ring alone. When a number's mine count is already satisfied, every neighbor left is safe, and you can click them freely.

The fastest way to feel this is the hidden-cell hint used in Easy Minesweeper's practice mode: a [[2]] that looks flat until you realize it fits exactly one pattern. Once you see a [[1]] with only one neighbor left, that neighbor is a mine, and you flag it instead of clicking it.

## Flag, question, reveal

Right-click or long-press a sealed cell to plant a flag, which is your promise that this cell hides a mine. Flags do two things: they stop you from accidentally revealing a known mine, and they let you chord on the numbers around them. If question marks are enabled, the same action cycles flag, question, then back to sealed.

The golden rule of flagging: flag only cells you can prove. A flag is a conclusion, not a guess. Flagging randomly costs a click at best and teaches the board nothing at worst.

## Chord to clear fast

When a revealed number has flags matching its count, you can chord it: double-click on desktop or double-tap on mobile. The game opens every remaining neighbor in one motion. Chord is how expert boards get cleared in minutes instead of hours, and it is safe because you have already proven the mine count.

## How to start a board

On any board with first-click safety, your first click never opens a mine; the field is generated around that spot. Aim your first click anywhere in the middle, then look for revealed blanks spreading outward. From that opening, read outward: each new number extends the map by one ring of truth.

If the opening is sparse, that is a gift. Sparse openings mean most of your safe cells choose themselves, and the board may solve itself through most of the middle before you reach the real decisions near the edges.

## Common first mistakes

- Clicking corner cells first. Corners have only three neighbors, so they produce the least information. Start mid-board.
- Flagging on vibes. You cannot win a minesweeper run on feelings, only on counts.
- Ignoring [[1]]s along edges. An edge [[1]] with one outside neighbor is a guaranteed mine, or a guaranteed safe cell, and either answer moves the map.
- Opening the same risky spot twice. Once a cell is flagged as a known mine, never reveal it.

## Where the guessing ends

Classic minesweeper always ends in one or two 50/50 positions. Easy Minesweeper offers No Guess mode, where the board is generated so that every move is provable from the start. If you want runs that are always solvable, and records that come purely from speed and reading, start there after this guide.

## Get reps

The fastest way from rules to wins is the practice mode: sealed cells show a faint preview of the number underneath, so you learn to read a [[2]] before you commit to clicking it, and the hint system points at the next provable move when you are stuck. Ten boards in practice mode teaches more than a hundred lost runs on Expert.

Now that you know the rules, the next step is the opening strategy that turns those rules into wins: [the beginner's strategy to never guess](https://easyminesweeper.vercel.app/blog/minesweeper-strategy-for-beginners). And when you are ready for a quieter run, [zen mode](https://easyminesweeper.vercel.app/blog/zen-mode) removes the worry of the timer entirely.
`;