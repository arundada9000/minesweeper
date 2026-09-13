import { describe, expect, it } from "vitest";
import {
  recordRun,
  dailyStreak,
  statsKey,
  emptyAchievements,
  loadPersistent,
  savePersistent,
  loadAll,
  localDateStamp,
  type RunOutcome,
  type ModeStats,
  type KeyValueStorage,
  type DailyData,
  type DifficultyBucket,
  type PersistedAll,
} from "./stats";

function outcome(partial: Partial<RunOutcome> = {}): RunOutcome {
  return {
    mode: "classic",
    bucket: "beginner",
    won: true,
    timeMs: 55_000,
    moves: 20,
    mineCount: 10,
    cellsRevealed: 60,
    flagsPlaced: 4,
    wrongFlags: 0,
    score: null,
    date: "2026-09-13",
    ...partial,
  };
}

function empty(): PersistedAll {
  return { stats: {}, achievements: emptyAchievements(), daily: [], recent: [] };
}

function fakeStorage(seed: Record<string, string> = {}): KeyValueStorage {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

describe("recordRun aggregates", () => {
  it("counts plays, wins, losses, cells, mines, and flags", () => {
    const r1 = recordRun(empty(), outcome());
    const r2 = recordRun(r1, outcome({ won: false, flagsPlaced: 2 }));
    const key = statsKey("classic", "beginner");
    const s = r2.stats[key]!;
    expect(s.gamesPlayed).toBe(2);
    expect(s.gamesWon).toBe(1);
    expect(s.gamesLost).toBe(1);
    expect(s.cellsRevealed).toBe(120);
    expect(s.minesFound).toBe(10);
    expect(s.flagsPlaced).toBe(6);
  });

  it("tracks win rate and average win time", () => {
    const r1 = recordRun(empty(), outcome({ timeMs: 60_000 }));
    const r2 = recordRun(r1, outcome({ timeMs: 40_000 }));
    const s = r2.stats[statsKey("classic", "beginner")]!;
    expect(s.gamesWon / s.gamesPlayed).toBeCloseTo(1);
    expect(s.totalWinTimeMs / s.gamesWon).toBe(50_000);
  });

  it("keeps the best (lowest) winning time", () => {
    const r1 = recordRun(empty(), outcome({ timeMs: 80_000 }));
    const r2 = recordRun(r1, outcome({ timeMs: 45_000 }));
    expect(r2.stats[statsKey("classic", "beginner")]!.bestTimeMs).toBe(45_000);
  });

  it("does not record time records for non-competitive modes", () => {
    const r1 = recordRun(empty(), outcome({ mode: "zen", timeMs: 12_000 }));
    expect(r1.stats[statsKey("zen", "beginner")]!.bestTimeMs).toBeNull();
    expect(r1.stats[statsKey("zen", "beginner")]!.gamesWon).toBe(1);
  });

  it("flags recordBeaten only when a stored record is beaten", () => {
    const r1 = recordRun(empty(), outcome({ timeMs: 80_000 }));
    expect(r1.recordBeaten).toBe(false);
    const r2 = recordRun(r1, outcome({ timeMs: 50_000 }));
    expect(r2.recordBeaten).toBe(true);
    const r3 = recordRun(r2, outcome({ timeMs: 90_000 }));
    expect(r3.recordBeaten).toBe(false);
  });

  it("updates winning streaks and best streak", () => {
    const r1 = recordRun(empty(), outcome());
    const r2 = recordRun(r1, outcome());
    const r3 = recordRun(r2, outcome({ won: false }));
    const r4 = recordRun(r3, outcome());
    const s = r4.stats[statsKey("classic", "beginner")]!;
    expect(s.currentWinStreak).toBe(1);
    expect(s.bestWinStreak).toBe(2);
  });

  it("counts perfect games only when no wrong flags were set", () => {
    const r1 = recordRun(empty(), outcome({ wrongFlags: 1 }));
    const r2 = recordRun(r1, outcome({ wrongFlags: 0 }));
    const s = r2.stats[statsKey("classic", "beginner")]!;
    expect(s.perfectGames).toBe(1);
  });

  it("records rush score records", () => {
    const r1 = recordRun(empty(), outcome({ mode: "rush", bucket: "expert", score: 1200 }));
    const r2 = recordRun(r1, outcome({ mode: "rush", bucket: "expert", score: 1550 }));
    const s = r2.stats[statsKey("rush", "expert")]!;
    expect(s.bestScore).toBe(1550);
    expect(r1.recordBeaten).toBe(false);
    expect(r2.recordBeaten).toBe(true);
  });
});

describe("achievements", () => {
  const base = empty();

  it("unlocks First Clear on the first win", () => {
    const r = recordRun(base, outcome());
    expect(r.unlocked).toContain("first-clear");
  });

  it("does not unlock First Clear on a loss", () => {
    const r = recordRun(base, outcome({ won: false }));
    expect(r.unlocked).not.toContain("first-clear");
  });

  it("unlocks No Flagger on a win with zero flags", () => {
    const r = recordRun(base, outcome({ flagsPlaced: 0 }));
    expect(r.unlocked).toContain("no-flagger");
  });

  it("unlocks Perfect Run on a win without wrong flags", () => {
    const r = recordRun(base, outcome({ won: true, wrongFlags: 0 }));
    expect(r.unlocked).toContain("perfect-run");
  });

  it("unlocks Speed Demon on a fast Expert clear", () => {
    const r = recordRun(base, outcome({ mode: "classic", bucket: "expert", timeMs: 110_000 }));
    expect(r.unlocked).toContain("speed-demon");
  });

  it("withholds Speed Demon from slow or non-expert runs", () => {
    const slow = recordRun(base, outcome({ mode: "classic", bucket: "expert", timeMs: 200_000 }));
    const beginner = recordRun(base, outcome({ mode: "classic", bucket: "beginner", timeMs: 60_000 }));
    expect(slow.unlocked).not.toContain("speed-demon");
    expect(beginner.unlocked).not.toContain("speed-demon");
  });

  it("unlocks Zen Mind after five zen wins and Pure Logic after ten", () => {
    let accum = base;
    for (let i = 0; i < 4; i++) accum = recordRun(accum, outcome({ mode: "zen" }));
    expect(accum.achievements["zen-mind"]).toBeNull();
    accum = recordRun(accum, outcome({ mode: "zen" }));
    expect(accum.achievements["zen-mind"]).not.toBeNull();

    let logic = base;
    for (let i = 0; i < 10; i++) logic = recordRun(logic, outcome({ mode: "no-guess" }));
    expect(logic.achievements["pure-logic"]).not.toBeNull();
  });

  it("unlocks Rush Hour at 1500+", () => {
    const r = recordRun(base, outcome({ mode: "rush", bucket: "beginner", score: 1500 }));
    expect(r.achievements["rush-hour"]).not.toBeNull();
    const low = recordRun(base, outcome({ mode: "rush", bucket: "beginner", score: 1200 }));
    expect(low.achievements["rush-hour"]).toBeNull();
  });

  it("only unlocks once", () => {
    const r1 = recordRun(base, outcome());
    const r2 = recordRun(r1, outcome());
    expect(r2.unlocked.filter((a) => a === "first-clear")).toHaveLength(0);
  });

  it("unlocks Daily Habit on a three-day consecutive streak", () => {
    const d1 = recordRun(base, outcome({ mode: "daily", date: "2026-09-11" }));
    const d2 = recordRun(d1, outcome({ mode: "daily", date: "2026-09-12" }));
    const d3 = recordRun(d2, outcome({ mode: "daily", date: "2026-09-13" }));
    expect(d3.achievements["daily-habit"]).not.toBeNull();
  });
});

describe("daily history and streaks", () => {
  it("computes consecutive win streaks ending today", () => {
    const entries: DailyData = [
      { date: "2026-09-11", won: true, timeMs: 60 },
      { date: "2026-09-12", won: true, timeMs: 55 },
      { date: "2026-09-13", won: true, timeMs: 50 },
    ];
    expect(dailyStreak(entries, "2026-09-13")).toBe(3);
    expect(dailyStreak(entries, "2026-09-12")).toBe(2);
  });

  it("a loss breaks a streak", () => {
    const entries: DailyData = [
      { date: "2026-09-11", won: true, timeMs: 60 },
      { date: "2026-09-12", won: false, timeMs: 60 },
      { date: "2026-09-13", won: true, timeMs: 50 },
    ];
    expect(dailyStreak(entries, "2026-09-13")).toBe(1);
  });

  it("a gap resets the streak to zero", () => {
    const gappy: DailyData = [{ date: "2026-09-10", won: true, timeMs: 60 }];
    expect(dailyStreak(gappy, "2026-09-13")).toBe(0);
  });

  it("replaces a date's entry when replayed that day", () => {
    const r1 = recordRun(empty(), outcome({ mode: "daily", won: false, date: "2026-09-13" }));
    expect(r1.daily).toHaveLength(1);
    const r2 = recordRun(r1, outcome({ mode: "daily", won: true, date: "2026-09-13" }));
    expect(r2.daily).toHaveLength(1);
    expect(r2.daily[0].won).toBe(true);
  });

  it("produces the current local date stamp", () => {
    const stamp = localDateStamp(new Date(2026, 8, 13));
    expect(stamp).toBe("2026-09-13");
  });
});

describe("recent games", () => {
  it("keeps the newest runs, capped", () => {
    let state = empty();
    for (let i = 0; i < 25; i++) {
      state = recordRun(state, outcome({ timeMs: i }));
    }
    expect(state.recent).toHaveLength(20);
    expect(state.recent[0].timeMs).toBe(24);
  });
});

describe("corrupt-safe persistence", () => {
  it("round-trips a valid bundle", () => {
    const storage = fakeStorage();
    savePersistent("swm.stats.v1", empty(), storage);
    const loaded = loadAll(storage);
    expect(loaded.achievements["first-clear"]).toBeNull();
  });

  it("falls back when JSON is garbage but keeps other slices", () => {
    const storage = fakeStorage({
      "swm.stats.v1": `{"stats": "garbage", "achievements": ${JSON.stringify(emptyAchievements())}, "daily": [], "recent": []}`,
    });
    const loaded = loadAll(storage);
    expect(loaded.stats).toEqual({});
    expect(loaded.achievements["first-clear"]).toBeNull();
  });

  it("loadPersistent returns fallback on bad JSON and missing keys", () => {
    const storage = fakeStorage({ bad: "{nope" });
    expect(loadPersistent("bad", (v): v is string => typeof v === "string", "fb", storage)).toBe("fb");
    expect(loadPersistent("missing", (v): v is string => typeof v === "string", "fb", storage)).toBe("fb");
  });

  it("preserves unrelated keys when one slice is corrupt", () => {
    const good: ModeStats = {
      mode: "classic",
      bucket: "beginner",
      gamesPlayed: 3,
      gamesWon: 2,
      gamesLost: 1,
      bestTimeMs: 40_000,
      totalWinTimeMs: 90_000,
      bestScore: null,
      totalScore: 0,
      totalMoves: 50,
      cellsRevealed: 150,
      minesFound: 20,
      flagsPlaced: 10,
      perfectGames: 1,
      currentWinStreak: 1,
      bestWinStreak: 2,
    };
    const bundle = { stats: { [statsKey("classic", "beginner")]: good }, achievements: "corrupt", daily: [], recent: [] };
    const storage = fakeStorage({ "swm.stats.v1": JSON.stringify(bundle) });
    const loaded = loadAll(storage);
    expect(loaded.stats[statsKey("classic", "beginner")]?.gamesPlayed).toBe(3);
    expect(loaded.achievements["first-clear"]).toBeNull();
  });

  it("discards stats entries that fail validation", () => {
    const storage = fakeStorage({
      "swm.stats.v1": JSON.stringify({ stats: { "classic:beginner": { gamesPlayed: "nope" } }, daily: [], recent: [] }),
    });
    expect(loadAll(storage).stats).toEqual({});
  });
});

describe("bucket typing", () => {
  it("statsKey composes mode and bucket", () => {
    expect(statsKey("rush", "expert")).toBe("rush:expert");
    const asBucket: DifficultyBucket = "custom";
    expect(statsKey("classic", asBucket)).toBe("classic:custom");
  });
});