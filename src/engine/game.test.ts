import { describe, expect, it } from "vitest";
import { GameEngine } from "./game";
import { neighborCells, deserializeBoard } from "./board";
import { boardIsLogical } from "./solver";
import type { Board, BoardConfig } from "./types";

function makeConfig(overrides: Partial<BoardConfig> = {}): BoardConfig {
  return {
    width: 9,
    height: 9,
    mineCount: 10,
    seed: "game",
    topology: "square",
    firstClickSafe: true,
    generousOpening: true,
    questionMarks: true,
    ...overrides,
  };
}

const CENTER = 40;

describe("GameEngine lifecycle", () => {
  it("starts ready without a board", () => {
    const engine = new GameEngine(makeConfig());
    expect(engine.phase).toBe("ready");
    expect(engine.cells).toHaveLength(0);
  });

  it("generates the board on the first reveal and transitions to playing", () => {
    const engine = new GameEngine(makeConfig());
    const result = engine.reveal(CENTER);
    expect(result?.firstReveal).toBe(true);
    expect(engine.phase).toBe("playing");
    expect(engine.cells).toHaveLength(81);
    expect(engine.cells[CENTER].state).toBe("revealed");
  });

  it("never lets the first click land on a mine", () => {
    const engine = new GameEngine(makeConfig());
    engine.reveal(CENTER);
    expect(engine.cells[CENTER].isMine).toBe(false);
  });

  it("ignores reveals once finished", () => {
    const engine = new GameEngine(makeConfig());
    engine.reveal(CENTER);
    const mine = engine.cells.find((c) => c.isMine && c.state === "hidden");
    expect(mine).toBeDefined();
    engine.reveal(mine!.index);
    expect(engine.phase).toBe("lost");
    expect(engine.reveal(CENTER)).toBeNull();
  });

  it("flags cycle and deplete the mine counter", () => {
    const engine = new GameEngine(makeConfig());
    engine.reveal(CENTER);
    const neighbors = engine.cells.filter((c) => c.index !== CENTER && c.state === "hidden");
    const target = neighbors[0].index;
    engine.cycleFlag(target);
    expect(engine.minesLeft).toBe(9);
    engine.cycleFlag(target);
    expect(engine.minesLeft).toBe(10);
  });

  it("unflags a flagged cell back to hidden", () => {
    const engine = new GameEngine(makeConfig());
    engine.reveal(CENTER);
    const target = engine.cells.find((c) => c.index !== CENTER && c.state === "hidden")!.index;
    engine.cycleFlag(target);
    expect(engine.isFlagged(target)).toBe(true);
    const restored = new GameEngine(makeConfig());
    restored.hydrate(engine.serialize());
    expect(restored.isFlagged(target)).toBe(true);
    engine.unflag(target);
    expect(engine.isFlagged(target)).toBe(false);
    expect(engine.cells[target].state).toBe("hidden");
    expect(engine.moves).toBe(3); // reveal + flag + unflag
    expect(engine.undo()).toBe(true);
    expect(engine.isFlagged(target)).toBe(true);
  });

  it("loses when revealing a mine and decorates wrong flags", () => {
    const engine = new GameEngine(makeConfig());
    engine.reveal(CENTER);
    const safe = engine.cells.find((c) => !c.isMine && c.state === "hidden");
    engine.cycleFlag(safe!.index); // mark a safe cell as flagged
    const mine = engine.cells.find((c) => c.isMine && c.state === "hidden")!;
    const result = engine.reveal(mine.index);
    expect(result?.explodedMine).toBe(mine.index);
    expect(engine.phase).toBe("lost");
    expect(engine.cells[safe!.index].wrongFlag).toBe(true);
    // All mines now revealed or flagged.
    for (const cell of engine.cells) {
      if (cell.isMine) {
        expect(cell.state === "revealed" || cell.state === "flagged" || cell.state === "exploded").toBe(true);
      }
    }
  });

  it("wins when every safe cell is revealed and flags all mines", () => {
    const engine = new GameEngine(makeConfig());
    engine.reveal(CENTER);
    while (engine.phase === "playing") {
      const cell = engine.cells.find((c) => !c.isMine && c.state === "hidden");
      if (!cell) break;
      engine.reveal(cell.index);
    }
    expect(engine.phase).toBe("won");
    expect(engine.revealedSafeCount).toBe(81 - 10);
    for (const cell of engine.cells) {
      if (cell.isMine) expect(cell.state).toBe("flagged");
    }
  });

  it("supports undo for flags and reveals", () => {
    const engine = new GameEngine(makeConfig());
    engine.reveal(CENTER);
    const target = engine.cells.find((c) => c.index !== CENTER && c.state === "hidden")!.index;
    engine.cycleFlag(target);
    expect(engine.isFlagged(target)).toBe(true);
    expect(engine.undo()).toBe(true);
    expect(engine.isFlagged(target)).toBe(false);
    expect(engine.undo()).toBe(true);
    expect(engine.phase).toBe("ready");
    expect(engine.undo()).toBe(false);
  });

  it("chords when the number is satisfied and does not reveal otherwise", () => {
    const engine = new GameEngine(makeConfig());
    engine.reveal(0); // corner is never a mine by exclusion
    const target = engine.cells.find(
      (c) =>
        c.state === "revealed" &&
        c.adjacentMineCount > 0 &&
        neighborCells(9, 9, "square", c.index).some((n) => !engine.cells[n].isMine && engine.cells[n].state === "hidden")
    );
    expect(target).toBeDefined();
    // Unsatisfied chord: nothing happens (returns null).
    expect(engine.chord(target!.index)).toBeNull();
    // Flag exactly the mine-neighbors, then chord reveals the rest.
    for (const n of neighborCells(9, 9, "square", target!.index)) {
      if (engine.cells[n].isMine) engine.cycleFlag(n);
    }
    const done = engine.chord(target!.index);
    expect(done?.revealed.length).toBeGreaterThan(0);
    expect(engine.phase).toBe("playing");
  });

  it("advances the clock only while playing", () => {
    const engine = new GameEngine(makeConfig());
    engine.tick(500);
    expect(engine.elapsedMs).toBe(0);
    engine.reveal(CENTER);
    engine.tick(250);
    expect(engine.elapsedMs).toBe(250);
    engine.pause();
    engine.tick(1000);
    expect(engine.elapsedMs).toBe(250);
    engine.resume();
    engine.tick(750);
    expect(engine.elapsedMs).toBe(1000);
  });

  it("serializes and restores through hydrate", () => {
    const engine = new GameEngine(makeConfig());
    engine.reveal(CENTER);
    engine.tick(1234);
    engine.cycleFlag(engine.cells.find((c) => c.index !== CENTER && c.state === "hidden")!.index);

    const restored = new GameEngine(makeConfig());
    restored.hydrate(engine.serialize());

    expect(restored.phase).toBe(engine.phase);
    expect(restored.elapsedMs).toBe(1234);
    expect(restored.cells.map((c) => c.state)).toEqual(engine.cells.map((c) => c.state));
    expect(restored.revealedSafeCount).toBe(engine.revealedSafeCount);
    // Continue playing on the restored board.
    const cell = restored.cells.find((c) => !c.isMine && c.state === "hidden");
    expect(cell).toBeDefined();
  });

  it("restart clears board and clock but keeps the seed", () => {
    const engine = new GameEngine(makeConfig());
    engine.reveal(CENTER);
    engine.tick(999);
    engine.restart();
    expect(engine.phase).toBe("ready");
    expect(engine.cells).toHaveLength(0);
    expect(engine.elapsedMs).toBe(0);
  });

  it("rejects invalid configs at construction", () => {
    expect(() => new GameEngine(makeConfig({ mineCount: 0 }))).toThrow();
  });

  function boardOf(engine: GameEngine): Board {
    const ser = engine.serialize() as { board: unknown };
    return deserializeBoard(ser.board);
  }

  it("deferred No Guess boards are logically solvable from the first click", () => {
    const engine = new GameEngine(makeConfig({ noGuess: true }));
    const result = engine.reveal(CENTER);
    expect(result?.firstReveal).toBe(true);
    expect(engine.phase).toBe("playing");
    const board = boardOf(engine);
    expect(boardIsLogical(board, makeConfig({ noGuess: true }), CENTER)).toBe(true);
  });

  it("Daily boards are deterministic per seed regardless of the first click", () => {
    const daily = makeConfig({ noGuess: true, openAt: "center", seed: "daily-2026-09-13" });
    const a = new GameEngine(daily);
    a.reveal(0);
    const b = new GameEngine(daily);
    b.reveal(8);
    const mineMapA = boardOf(a).cells.map((c) => c.isMine);
    const mineMapB = boardOf(b).cells.map((c) => c.isMine);
    expect(mineMapA).toEqual(mineMapB);

    const anotherDay = new GameEngine(makeConfig({ noGuess: true, openAt: "center", seed: "daily-2026-09-14" }));
    anotherDay.reveal(0);
    const mineMapC = boardOf(anotherDay).cells.map((c) => c.isMine);
    expect(mineMapC).not.toEqual(mineMapA);
  });

  it("Rush loses when the countdown expires and caps the clock", () => {
    const engine = new GameEngine(makeConfig({ timeLimitMs: 1000 }));
    engine.reveal(CENTER);
    engine.tick(700);
    expect(engine.phase).toBe("playing");
    expect(engine.timeLimitMs).toBe(1000);
    engine.tick(700);
    expect(engine.phase).toBe("lost");
    expect(engine.elapsedMs).toBe(1000);
    expect(engine.reason).toBe("Time's up.");
  });

  it("exposes the countdown budget", () => {
    const untimed = new GameEngine(makeConfig());
    expect(untimed.timeLimitMs).toBeNull();
  });
});