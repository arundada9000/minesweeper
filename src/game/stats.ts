/**
 * Statistics, achievements, personal records, daily history, and recent games.
 *
 * Pure and headless: everything here is a pure function of its inputs, so the
 * whole module is unit-testable without React or a browser. Persistence uses
 * per-key schema validation so one corrupted record never wipes the rest.
 */

import type { ModeId } from "@/engine/types";
import { getMode } from "@/engine/modes";
import type { PresetId } from "@/engine/presets";

export type DifficultyBucket = PresetId | "custom";

export function statsKey(mode: ModeId, bucket: DifficultyBucket): string {
  return `${mode}:${bucket}`;
}

export interface ModeStats {
  mode: ModeId;
  bucket: DifficultyBucket;
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  /** Best winning time, competitive modes only. */
  bestTimeMs: number | null;
  /** Sum of winning times, for the average win time. */
  totalWinTimeMs: number;
  /** Best Rush score, Rush only. */
  bestScore: number | null;
  totalScore: number;
  totalMoves: number;
  cellsRevealed: number;
  minesFound: number;
  flagsPlaced: number;
  perfectGames: number;
  currentWinStreak: number;
  bestWinStreak: number;
}

export function emptyModeStats(mode: ModeId, bucket: DifficultyBucket): ModeStats {
  return {
    mode,
    bucket,
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    bestTimeMs: null,
    totalWinTimeMs: 0,
    bestScore: null,
    totalScore: 0,
    totalMoves: 0,
    cellsRevealed: 0,
    minesFound: 0,
    flagsPlaced: 0,
    perfectGames: 0,
    currentWinStreak: 0,
    bestWinStreak: 0,
  };
}

export type StatsData = Record<string, ModeStats>;

/* ------------------------------ achievements ------------------------------ */

export type AchievementId =
  | "first-clear"
  | "pure-logic"
  | "no-flagger"
  | "speed-demon"
  | "perfect-run"
  | "daily-habit"
  | "zen-mind"
  | "rush-hour";

export interface AchievementDef {
  id: AchievementId;
  name: string;
  description: string;
}

export const ACHIEVEMENTS: readonly AchievementDef[] = [
  { id: "first-clear", name: "First Clear", description: "Complete your first board." },
  { id: "pure-logic", name: "Pure Logic", description: "Complete 10 No Guess boards." },
  { id: "no-flagger", name: "No Flagger", description: "Win a board without placing a flag." },
  { id: "speed-demon", name: "Speed Demon", description: "Clear an Expert board in under two minutes." },
  { id: "perfect-run", name: "Perfect Run", description: "Win without a single wrong flag." },
  { id: "daily-habit", name: "Daily Habit", description: "Clear 3 Daily Puzzles in a row." },
  { id: "zen-mind", name: "Zen Mind", description: "Clear 5 Zen boards." },
  { id: "rush-hour", name: "Rush Hour", description: "Win a Rush board with a score of 1500 or more." },
];

export type AchievementsData = Record<AchievementId, number | null>; // unlockedAt timestamp or null

export function emptyAchievements(): AchievementsData {
  const out = {} as AchievementsData;
  for (const a of ACHIEVEMENTS) out[a.id] = null;
  return out;
}

/* ------------------------------ daily history ----------------------------- */

export interface DailyEntry {
  date: string; // local YYYY-MM-DD
  won: boolean;
  timeMs: number;
}

export type DailyData = DailyEntry[];

/**
 * Consecutive winning days ending today (or yesterday, so a streak survives
 * opening the app before midnight rollover).
 */
export function dailyStreak(entries: DailyData, today = localDateStamp()): number {
  const days = new Set<number>();
  for (const e of entries) {
    if (e.won) days.add(parseStamp(e.date));
  }
  if (days.size === 0) return 0;

  const todayMs = parseStamp(today);
  let cursor = days.has(todayMs) ? todayMs : todayMs - 86_400_000;
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= 86_400_000;
  }
  return streak;
}

/* -------------------------------- recent games ---------------------------- */

export interface RecentGame {
  date: string;
  mode: ModeId;
  bucket: DifficultyBucket;
  won: boolean;
  timeMs: number;
  moves: number;
  score: number | null;
}

/* --------------------------------- outcome -------------------------------- */

export interface RunOutcome {
  mode: ModeId;
  bucket: DifficultyBucket;
  won: boolean;
  timeMs: number;
  moves: number;
  mineCount: number;
  cellsRevealed: number;
  flagsPlaced: number;
  /** Cells flagged at the end that were not mines. */
  wrongFlags: number;
  /** Solver hints requested during the run. Competitive runs with any hint
   *  keep counting toward totals and achievements, but never set a record. */
  hintsUsed: number;
  /** Rush score for this run, if the mode scores by score. */
  score: number | null;
  /** Result timestamp. */
  date: string;
}

export interface RecordRunResult {
  stats: StatsData;
  achievements: AchievementsData;
  daily: DailyData;
  recent: RecentGame[];
  /** True when this run beat a stored personal record. */
  recordBeaten: boolean;
  unlocked: AchievementId[];
}

const RECENT_LIMIT = 20;
const SPEED_DEMON_TARGET_MS = 120_000;
const DAILY_HABIT_STREAK = 3;
const ZEN_MIND_WINS = 5;
const PURE_LOGIC_WINS = 10;
const RUSH_HOUR_SCORE = 1500;
/** Daily boards are recorded once per date; a retry replaces that day. */
const DAILY_HISTORY_LIMIT = 366;

export function recordRun(
  prev: {
    stats: StatsData;
    achievements: AchievementsData;
    daily: DailyData;
    recent: RecentGame[];
  },
  outcome: RunOutcome
): RecordRunResult {
  const stats = { ...prev.stats };
  const key = statsKey(outcome.mode, outcome.bucket);
  const current = stats[key] ?? emptyModeStats(outcome.mode, outcome.bucket);
  const modeDef = getMode(outcome.mode);
  const competitive = modeDef.competitive;

  const s: ModeStats = { ...current, gamesPlayed: current.gamesPlayed + 1 };
  let recordBeaten = false;

  if (outcome.won) {
    s.gamesWon += 1;
    s.currentWinStreak += 1;
    s.bestWinStreak = Math.max(s.bestWinStreak, s.currentWinStreak);
    s.minesFound += outcome.mineCount;
    if (outcome.wrongFlags === 0) s.perfectGames += 1;

    if (competitive) {
      s.totalWinTimeMs += outcome.timeMs;
      if (outcome.score !== null) s.totalScore += outcome.score;
      // Totals stay honest, but a hint usage disqualifies the personal record.
      if (outcome.hintsUsed === 0) {
        const prevBest = s.bestTimeMs;
        if (prevBest === null || outcome.timeMs < prevBest) {
          s.bestTimeMs = outcome.timeMs;
          recordBeaten = prevBest !== null;
        }
        if (outcome.score !== null && (s.bestScore === null || outcome.score > s.bestScore)) {
          const fresh = s.bestScore === null;
          s.bestScore = outcome.score;
          if (!fresh) recordBeaten = true;
        }
      }
    }
  } else {
    s.gamesLost += 1;
    s.currentWinStreak = 0;
  }

  s.totalMoves += outcome.moves;
  s.cellsRevealed += outcome.cellsRevealed;
  s.flagsPlaced += outcome.flagsPlaced;
  stats[key] = s;

  // Achievements (checked regardless of competitiveness).
  const achievements = { ...prev.achievements };
  const unlocked: AchievementId[] = [];
  const consider = (id: AchievementId, condition: boolean, now: number) => {
    if (condition && achievements[id] === null) {
      achievements[id] = now;
      unlocked.push(id);
    }
  };
  const now = Date.now();
  const noGuessWins = winsAcross(stats, "no-guess");
  const zenWins = winsAcross(stats, "zen");

  consider("first-clear", outcome.won, now);
  consider("pure-logic", noGuessWins >= PURE_LOGIC_WINS, now);
  consider("no-flagger", outcome.won && outcome.flagsPlaced === 0, now);
  consider(
    "speed-demon",
    outcome.won && outcome.mode === "classic" && outcome.bucket === "expert" && outcome.timeMs <= SPEED_DEMON_TARGET_MS,
    now
  );
  consider("perfect-run", outcome.won && outcome.wrongFlags === 0, now);
  consider(
    "daily-habit",
    outcome.mode === "daily" && outcome.won && dailyStreak(pushDaily(prev.daily, outcome), outcome.date) >= DAILY_HABIT_STREAK,
    now
  );
  consider("zen-mind", zenWins >= ZEN_MIND_WINS, now);
  consider("rush-hour", outcome.mode === "rush" && outcome.won && outcome.score !== null && outcome.score >= RUSH_HOUR_SCORE, now);

  // Daily history: exactly one record per calendar date.
  const daily =
    outcome.mode === "daily"
      ? pushDaily(prev.daily, outcome)
      : prev.daily;

  const recent: RecentGame[] = [
    {
      date: outcome.date,
      mode: outcome.mode,
      bucket: outcome.bucket,
      won: outcome.won,
      timeMs: outcome.timeMs,
      moves: outcome.moves,
      score: outcome.score,
    },
    ...prev.recent,
  ].slice(0, RECENT_LIMIT);

  return { stats, achievements, daily, recent, recordBeaten, unlocked };
}

function winsAcross(stats: StatsData, mode: ModeId): number {
  let total = 0;
  for (const entry of Object.values(stats)) {
    if (entry.mode === mode) total += entry.gamesWon;
  }
  return total;
}

function pushDaily(prev: DailyData, outcome: RunOutcome): DailyData {
  const entry: DailyEntry = { date: outcome.date, won: outcome.won, timeMs: outcome.timeMs };
  const filtered = prev.filter((e) => e.date !== outcome.date);
  return [...filtered, entry].sort((a, b) => (a.date < b.date ? -1 : 1)).slice(-DAILY_HISTORY_LIMIT);
}

/* ------------------------------ persistence ------------------------------- */

function parseStamp(stamp: string): number {
  return new Date(`${stamp}T00:00:00`).getTime();
}

export function localDateStamp(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* --------------------------- corrupt-safe storage -------------------------- */

type Validator<T> = (value: unknown) => value is T;

export function isModeStats(value: unknown): value is ModeStats {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.gamesPlayed === "number" &&
    typeof v.gamesWon === "number" &&
    typeof v.gamesLost === "number" &&
    (v.bestTimeMs === null || typeof v.bestTimeMs === "number") &&
    typeof v.totalWinTimeMs === "number" &&
    (v.bestScore === null || typeof v.bestScore === "number") &&
    typeof v.totalScore === "number" &&
    typeof v.totalMoves === "number" &&
    typeof v.cellsRevealed === "number" &&
    typeof v.minesFound === "number" &&
    typeof v.flagsPlaced === "number" &&
    typeof v.perfectGames === "number" &&
    typeof v.currentWinStreak === "number" &&
    typeof v.bestWinStreak === "number"
  );
}

function isStatsData(value: unknown): value is StatsData {
  if (typeof value !== "object" || value === null) return false;
  return Object.values(value).every(isModeStats);
}

const ACHIEVEMENT_IDS = new Set<string>(ACHIEVEMENTS.map((a) => a.id));

function isAchievementsData(value: unknown): value is AchievementsData {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return Object.entries(v).every(
    ([id, at]) => ACHIEVEMENT_IDS.has(id) && (at === null || typeof at === "number")
  );
}

function isDailyData(value: unknown): value is DailyData {
  if (!Array.isArray(value)) return false;
  return value.every((e) => {
    if (typeof e !== "object" || e === null) return false;
    const v = e as Record<string, unknown>;
    return typeof v.date === "string" && typeof v.won === "boolean" && typeof v.timeMs === "number";
  });
}

function isRecentData(value: unknown): value is RecentGame[] {
  if (!Array.isArray(value)) return false;
  return value.every((e) => {
    if (typeof e !== "object" || e === null) return false;
    const v = e as Record<string, unknown>;
    return (
      typeof v.date === "string" &&
      typeof v.mode === "string" &&
      typeof v.won === "boolean" &&
      typeof v.timeMs === "number" &&
      typeof v.moves === "number"
    );
  });
}

/** Minimal localStorage-compatible surface so tests can inject a fake. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function defaultStorage(): KeyValueStorage | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  return window.localStorage;
}

/** Read a stored value. Corrupt or missing data yields the fallback. */
export function loadPersistent<T>(key: string, validator: Validator<T>, fallback: T, storage?: KeyValueStorage | null): T {
  const store = storage === undefined ? defaultStorage() : storage;
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return validator(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

export function savePersistent<T>(key: string, value: T, storage?: KeyValueStorage | null): void {
  const store = storage === undefined ? defaultStorage() : storage;
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or locked; the run is still playable */
  }
}

export interface PersistedAll {
  stats: StatsData;
  achievements: AchievementsData;
  daily: DailyData;
  recent: RecentGame[];
}

export const STATS_STORAGE_KEY = "swm.stats.v1";

/** Load the full stats bundle, discarding only the corrupted slice. */
export function loadAll(storage?: KeyValueStorage | null): PersistedAll {
  const empty: PersistedAll = { stats: {}, achievements: emptyAchievements(), daily: [], recent: [] };
  const raw = loadPersistent<Partial<PersistedAll> | null>(STATS_STORAGE_KEY, (v): v is Partial<PersistedAll> => {
    return typeof v === "object" && v !== null;
  }, null, storage);
  if (!raw) return empty;
  return {
    stats: isStatsData(raw.stats) ? raw.stats : {},
    achievements: isAchievementsData(raw.achievements) ? raw.achievements : emptyAchievements(),
    daily: isDailyData(raw.daily) ? raw.daily : [],
    recent: isRecentData(raw.recent) ? raw.recent : [],
  };
}

export function saveAll(next: PersistedAll, storage?: KeyValueStorage | null): void {
  savePersistent(STATS_STORAGE_KEY, next, storage);
}