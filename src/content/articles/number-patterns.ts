export const meta = {
  title: "The 1-2-1 Pattern and the Other Number Patterns That Win Games",
  description:
    "Learn the 1-2-1, 1-2, edge 1, and reduced patterns that resolve most minesweeper cells, with examples you can spot in seconds.",
  date: "2026-09-11",
};

export const body = `
Patterns are how good players scan a board at a glance. They are not memorized trivia; each pattern is a three-second proof that a specific arrangement of numbers forces specific mines underneath. This guide walks through the five that do almost all of the work.

## The edge 1

The simplest pattern and the most common. A [[1]] sitting on the edge of the board or against a wall of revealed ground touches a known number of cells, usually three. If two of those cells are already revealed or flagged, the rest are solved instantly.

When an edge [[1]] has exactly one sealed neighbor, that neighbor is a mine. Flag it and move on. You will flag dozens of these in a single Expert run without thinking.

## The 1-2-1

Find three seen cells in a row reading [[1]], [[2]], [[1]]. Above the row these three numbers have exactly two mines total, and the two [[1]]s cannot share a mine with each other or with the [[2]]. The only arrangement that satisfies all three: one mine above the left [[1]], one above the right [[1]], and clean ground above the [[2]].

Spot the [[1-2-1]] and you have instantly placed two mines and one safe cell. It appears constantly along the walls and ridges of every board.

## The 1-2

Two adjacent cells reading [[1]], [[2]]. One of the [[1]]'s neighbors is claimed by a mine; the [[2]] needs two. If the [[1]] touches a cell that the [[2]] also touches, the cell the [[1]] owns can only be the [[2]]'s second mine.

Read it as: the [[1]] anchors one mine, and the [[2]]'s other mine has to sit on the cell only the [[2]] sees. The [[1-2]] resolves a mine and a safe cell almost as often as the [[1-2-1]] and is the fallback when the classic pattern is missing its third cell.

## The reduced number

Many patterns are the 1-2-1 or edge 1 with cells already solved. Take a [[2]] whose two mines are next to each other: the cell on the far side of those mines is safe. Take a [[3]] with two flags: the third mine is whichever sealed neighbor completes a line with them.

Reduced patterns are the reason competent players ignore half of the board. They subtract everything concrete, mentally replace revealed cells with blank ground, and re-read the remaining numbers as fresh puzzles.

## The wall pair

Along a wall of flags, a pair of numbers that share a row can force a mine corridor. A [[2]] directly above a [[1]] across three sealed cells is the [[1-2]] again; a [[2]] over a [[2]] over three cells can paint a complete column. Judge the pair by the cells they share, never by their value alone.

## How to practice them

Patterns only stick by repetition, and repetition on an Expert board is expensive. In Easy Minesweeper, practice mode shows a faint preview of the number under each sealed cell, so you can verify your read a second after making it. When you hit a wall, the hint system points at the next provable move and tells you why in one sentence, which is exactly the feedback a pattern needs to cement.

For a complete list of the words this guide uses, the [minesweeper glossary](https://easyminesweeper.vercel.app/blog/minesweeper-glossary) is the reference to keep open beside your first Expert boards.

## From patterns to speed

Patterns turn into speed the moment you stop searching and start chording. Read [flagging, chording, and fast clicking](https://easyminesweeper.vercel.app/blog/minesweeper-speed-techniques) next, because a pattern read in three seconds and executed in one is worth twice as much as a pattern read in six.
`;