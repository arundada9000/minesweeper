export const meta = {
  title: "What Is 3BV and What Counts as a Good Minesweeper Time",
  description:
    "3BV measures how many bare minimum clicks a board needs to be solved. Learn what it means, typical ranges per board size, and how to compare your times honestly.",
  date: "2026-09-08",
};

export const body = `
Two players clear the same Expert board in 180 seconds and 90 seconds. The first is a careful reader, the second is a speed addict. Neither number tells the full story unless you know how many moves the board actually demanded, and that is what 3BV exists to measure.

## 3BV, in one sentence

3BV (the name comes from the expert-run world that popularized it, and it stands for "Bechtel's Board Benchmark Value") counts the minimum number of clicks required to solve a board, assuming a perfect player: each chord toward unrevealed cells counts once, the opening flood counts once, and solved ground costs nothing.

A board with a 3BV of 180 genuinely requires 180 click-equivalents by the fastest legal route. A board with 3BV 120 can never be cleared in fewer than 120 even by a machine with perfect reads.

## Why it slices times fairly

Raw time punishes a player for the luck of the board shape. A sprawling Expert board with lots of open ground has a low 3BV and clears fast; a fortress board with a high 3BV is slow no matter who plays it.

Divide a clear time by the board's 3BV and you get actions per second: a genuinely useful skill number. The 3BV metric is computed and shown alongside each board in Easy Minesweeper, so you can compare a 90-second board that demanded 300 moves to a 90-second board that demanded 150, and know which was the better run.

## What good times look like

Typical ranges for a comfortable, accurate player: Beginner boards land around 4 to 9 in 3BV and clear in 10 to 40 seconds. Intermediate runs 40 to 80 and clears in 60 to 180 seconds. Expert boards run 150 to 220 and take most players 3 to 8 minutes while juggling deadlines.

Speed players reach an actions-per-second ratio noticeably above one; chasing that number instead of chasing raw hours is how dedicated players double their speed without becoming sloppy.

## Modes that measure this for you

Daily boards are generated as fixed daily puzzles with the same layout for every player, so the 3BV is identical for everyone on a given date, and the daily leaderboard is a fair comparison of reading speed rather than board luck. Rush mode adds a hard stopwatch on top, which forces the same trade a real speedrun makes: read fast, or lose the clock.

Zen mode deliberately removes time as a variable, which makes it the counterweight: there, "good" means a calm, perfect read, not a fast one.

## The honest scoring trick

Records in competitive modes ignore your fastest lucky run and keep your best consistent result. A single 3BV-boosted board is a coin flip in disguise; a record you hold across a week of daily boards is a skill you actually own.

Want to know what your quietest possible score looks like? Read the [speed techniques guide](https://easyminesweeper.vercel.app/blog/minesweeper-speed-techniques) and then open an Expert board and count your actions per second for one run. Numbers from your own field teach faster than any benchmark.
`;