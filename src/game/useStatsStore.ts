/**
 * Stats store: bundles statistics, achievements, daily history, and recent
 * games behind a small Zustand surface. Recording is content-addressed so a
 * finished run is never double-counted (e.g. under React StrictMode).
 */

import { create } from "zustand";
import { GameEngine } from "@/engine";
import { getMode } from "@/engine/modes";
import type { ModeId } from "@/engine/types";
import {
  recordRun,
  loadAll,
  saveAll,
  localDateStamp,
  ACHIEVEMENTS,
  type PersistedAll,
  type RunOutcome,
  type DifficultyBucket,
  type AchievementId,
} from "./stats";

export interface FinishedNotice {
  recordBeaten: boolean;
  unlocked: AchievementId[];
  unlockName: string | null;
}

interface StatsState extends PersistedAll {
  /** Bumped every time the snapshot changes so sheets can re-render. */
  statsVersion: number;
  /** What the last recorded run produced for the result overlay. */
  lastNotice: FinishedNotice;
  /** Content address of the last recorded run (dedupe under StrictMode). */
  lastFingerprint: string;
  outcomeFor: (engine: GameEngine, mode: ModeId, bucket: DifficultyBucket) => RunOutcome;
  recordFinished: (outcome: RunOutcome) => FinishedNotice;
}

function fingerprint(outcome: RunOutcome): string {
  return `${outcome.mode}|${outcome.bucket}|${outcome.won}|${outcome.timeMs}|${outcome.moves}|${outcome.date}`;
}

function makeNotice(recordBeaten: boolean, unlocked: AchievementId[]): FinishedNotice {
  const first = unlocked.length > 0 ? ACHIEVEMENTS.find((a) => a.id === unlocked[0]) : null;
  return {
    recordBeaten,
    unlocked,
    unlockName: first ? first.name : null,
  };
}

const initial = loadAll();

export const useStats = create<StatsState>()((set, get) => ({
  stats: initial.stats,
  achievements: initial.achievements,
  daily: initial.daily,
  recent: initial.recent,
  statsVersion: 0,
  lastNotice: { recordBeaten: false, unlocked: [], unlockName: null },
  lastFingerprint: "",

  outcomeFor: (engine, mode, bucket) => {
    const won = engine.phase === "won";
    const wrongFlags = engine.cells.filter((c) => c.state === "flagged" && !c.isMine).length;
    const modeDef = getMode(mode);
    const limit = engine.timeLimitMs;
    let score: number | null = null;
    if (modeDef.score === "rush") {
      score = won
        ? 1000 + Math.round((limit !== null ? Math.max(0, limit - engine.elapsedMs) : 0) / 1000) * 10
        : Math.round(engine.elapsedMs / 1000);
    }
    return {
      mode,
      bucket,
      won,
      timeMs: engine.elapsedMs,
      moves: engine.moves,
      mineCount: engine.config.mineCount,
      cellsRevealed: engine.revealedSafeCount,
      flagsPlaced: engine.flagsPlaced,
      wrongFlags,
      score,
      date: localDateStamp(),
    };
  },

  recordFinished: (outcome) => {
    const fp = fingerprint(outcome);
    if (get().lastFingerprint === fp) return get().lastNotice;

    const next = recordRun(
      { stats: get().stats, achievements: get().achievements, daily: get().daily, recent: get().recent },
      outcome
    );
    const notice = makeNotice(next.recordBeaten, next.unlocked);
    saveAll(next);
    set({
      ...next,
      statsVersion: get().statsVersion + 1,
      lastNotice: notice,
      lastFingerprint: fp,
    });
    return notice;
  },
}));

/** Derived help for sheets: a mode's total across all its buckets. */
export function aggregateStat(stats: PersistedAll["stats"], mode: ModeId) {
  const entries = Object.values(stats).filter((s) => s.mode === mode);
  return entries.reduce(
    (acc, s) => {
      acc.gamesPlayed += s.gamesPlayed;
      acc.gamesWon += s.gamesWon;
      acc.gamesLost += s.gamesLost;
      acc.cellsRevealed += s.cellsRevealed;
      acc.minesFound += s.minesFound;
      acc.flagsPlaced += s.flagsPlaced;
      acc.perfectGames += s.perfectGames;
      acc.totalMoves += s.totalMoves;
      acc.totalWinTimeMs += s.totalWinTimeMs;
      if (s.bestTimeMs !== null && (acc.bestTimeMs === null || s.bestTimeMs < acc.bestTimeMs)) {
        acc.bestTimeMs = s.bestTimeMs;
      }
      if (s.bestScore !== null && (acc.bestScore === null || s.bestScore > acc.bestScore)) {
        acc.bestScore = s.bestScore;
      }
      acc.bestWinStreak = Math.max(acc.bestWinStreak, s.bestWinStreak);
      acc.currentWinStreak += s.currentWinStreak;
      return acc;
    },
    {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      cellsRevealed: 0,
      minesFound: 0,
      flagsPlaced: 0,
      perfectGames: 0,
      totalMoves: 0,
      totalWinTimeMs: 0,
      bestTimeMs: null as number | null,
      bestScore: null as number | null,
      bestWinStreak: 0,
      currentWinStreak: 0,
    }
  );
}