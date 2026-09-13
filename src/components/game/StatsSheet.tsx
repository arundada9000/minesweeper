/**
 * Records and stats sheet: personal statistics broken down by mode and
 * difficulty, achievements, daily record, and recent finished runs.
 * Nothing is fabricated: modes with no finished games show a placeholder.
 */

import { useMemo, useState } from "react";
import { Sheet, SegmentedControl, formatClock } from "../ui/primitives";
import { CheckIcon, CrownIcon, SparkleIcon, HistoryIcon } from "../ui/icons";
import { useStats, aggregateStat } from "@/game/useStatsStore";
import { ACHIEVEMENTS, dailyStreak, type ModeStats } from "@/game/stats";
import { MODE_LIST, getMode } from "@/engine/modes";
import type { ModeId } from "@/engine/types";

type Tab = "overall" | ModeId;

const TABS: readonly { value: Tab; label: string }[] = [
  { value: "overall", label: "Overall" },
  ...MODE_LIST.map((m) => ({ value: m.id as Tab, label: m.name })),
];

export function StatsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  useStats((s) => s.statsVersion);
  const stats = useStats.getState();
  const [tab, setTab] = useState<Tab>("overall");

  const { buckets, totals } = useMemo(() => {
    const entries: ModeStats[] =
      tab === "overall"
        ? Object.values(stats.stats)
        : Object.values(stats.stats).filter((s) => s.mode === tab);
    const agg =
      tab === "overall"
        ? entries.reduce((acc, e) => mergeAgg(acc, e), emptyAgg())
        : aggregateStat(stats.stats, tab);
    return { buckets: entries, totals: agg };
  }, [tab, stats.stats]);

  const played = totals.gamesPlayed;
  const modeDef = tab === "overall" ? null : getMode(tab);
  const showTime = tab === "overall" || (modeDef ? modeDef.competitive : false);
  const dailyStreakNow = tab === "daily" ? dailyStreak(stats.daily) : null;
  const noGames = played === 0;

  return (
    <Sheet open={open} onClose={onClose} title="Records and stats">
      <SegmentedControl<Tab>
        ariaLabel="Statistics view"
        className="mb-4"
        options={TABS}
        value={tab}
        onChange={(v) => setTab(v)}
      />

      {noGames ? (
        <div className="mb-5 rounded-2xl bg-surface-2 px-4 py-8 text-center">
          <SparkleIcon size={22} className="mx-auto mb-2 text-ink-muted" />
          <p className="text-sm text-ink-muted">{tab === "overall" ? "Finish a board and your progress lives here." : `${getMode(tab).name} has no games yet.`}</p>
        </div>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <Stat label="Games" value={String(played)} />
            <Stat label="Won" value={`${totals.gamesWon} / ${played}`} sub={winRate(played, totals.gamesWon)} />
            {tab === "rush" ? (
              <Stat label="Best rush" value={totals.bestScore === null ? "-" : String(totals.bestScore)} />
            ) : showTime ? (
              <Stat label="Best time" value={totals.bestTimeMs === null ? "-" : formatClock(totals.bestTimeMs)} />
            ) : (
              <Stat label="Perfect games" value={String(totals.perfectGames)} />
            )}
            <Stat
              label="Streak"
              value={String(dailyStreakNow !== null ? dailyStreakNow : (totals.bestWinStreak ?? 0))}
              sub={dailyStreakNow !== null ? "days straight" : "longest"}
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-x-2 gap-y-1 rounded-2xl bg-surface-2 px-4 py-3">
            <SubStat label="Cells revealed" value={String(totals.cellsRevealed)} />
            <SubStat label="Mines found" value={String(totals.minesFound)} />
            <SubStat label="Flags placed" value={String(totals.flagsPlaced)} />
            <SubStat label="Perfect games" value={String(totals.perfectGames)} />
          </div>

          {tab !== "overall" && (
            <div className="mb-4">
              <div className="mb-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-muted">
                {getMode(tab).name} breakdown
              </div>
              <div className="flex flex-col gap-1.5">
                {buckets.map((b) => (
                  <div key={`${b.mode}:${b.bucket}`} className="flex items-center justify-between rounded-2xl bg-surface-2 px-4 py-2.5">
                    <span className="text-sm font-medium capitalize text-ink">{bucketLabel(b.bucket)}</span>
                    <span className="text-xs tabular text-ink-muted">
                      {b.gamesWon} of {b.gamesPlayed} won
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mb-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-muted">
          <CrownIcon size={14} />
          Achievements
        </div>
        <div className="flex flex-col gap-1.5">
          {ACHIEVEMENTS.map((a) => {
            const unlockedAt = stats.achievements[a.id];
            return (
              <div key={a.id} className={`flex items-start gap-2.5 rounded-2xl px-3 py-2 ${unlockedAt !== null ? "bg-accent-soft" : "bg-surface-2/70"}`}>
                <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${unlockedAt !== null ? "bg-accent text-on-accent" : "bg-surface-2 text-ink-muted"}`}>
                  {unlockedAt !== null ? <CheckIcon size={12} /> : <SparkleIcon size={12} />}
                </span>
                <span className="min-w-0">
                  <span className={`block text-sm font-medium ${unlockedAt !== null ? "text-ink" : "text-ink-muted"}`}>{a.name}</span>
                  <span className="block text-2xs text-ink-muted">{a.description}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wide text-ink-muted">
          <HistoryIcon size={14} />
          Recent games
        </div>
        {stats.recent.length === 0 ? (
          <p className="rounded-2xl bg-surface-2/70 px-4 py-6 text-center text-sm text-ink-muted">Finished games will show up here.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {stats.recent.slice(0, 8).map((g, i) => (
              <li key={`${g.date}-${i}`} className="flex items-center gap-2 rounded-xl bg-surface-2/70 px-3 py-2 text-sm">
                <span className={`size-2 rounded-full ${g.won ? "bg-green" : "bg-red"}`} />
                <span className="min-w-0 flex-1 truncate text-ink">
                  {getMode(g.mode).name}
                  <span className="text-ink-muted"> / {bucketLabel(g.bucket)}</span>
                </span>
                <span className="tabular text-ink-muted">{formatClock(g.timeMs)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Sheet>
  );
}

function emptyAgg() {
  return {
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
  };
}

type Agg = ReturnType<typeof emptyAgg>;

function mergeAgg(a: Agg, b: ModeStats): Agg {
  return {
    gamesPlayed: a.gamesPlayed + b.gamesPlayed,
    gamesWon: a.gamesWon + b.gamesWon,
    gamesLost: a.gamesLost + b.gamesLost,
    totalMoves: a.totalMoves + b.totalMoves,
    cellsRevealed: a.cellsRevealed + b.cellsRevealed,
    minesFound: a.minesFound + b.minesFound,
    flagsPlaced: a.flagsPlaced + b.flagsPlaced,
    perfectGames: a.perfectGames + b.perfectGames,
    totalWinTimeMs: a.totalWinTimeMs + b.totalWinTimeMs,
    bestTimeMs:
      b.bestTimeMs !== null && (a.bestTimeMs === null || b.bestTimeMs < a.bestTimeMs) ? b.bestTimeMs : a.bestTimeMs,
    bestScore: b.bestScore !== null && (a.bestScore === null || b.bestScore > a.bestScore) ? b.bestScore : a.bestScore,
    bestWinStreak: Math.max(a.bestWinStreak, b.bestWinStreak),
    currentWinStreak: a.currentWinStreak + b.currentWinStreak,
  };
}

function winRate(played: number, won: number): string {
  if (played === 0) return "";
  return `${Math.round((won / played) * 100)}%`;
}

function bucketLabel(b: ModeStats["bucket"]): string {
  return b === "custom" ? "Custom" : b[0]?.toUpperCase() + b.slice(1);
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl bg-surface-2 px-4 py-3">
      <div className="font-mono text-xl font-bold tabular text-ink">{value}</div>
      <div className="text-2xs uppercase tracking-wide text-ink-muted">{label}</div>
      {sub && <div className="text-2xs text-ink-muted">{sub}</div>}
    </div>
  );
}

function SubStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-ink-muted">{label}</span>
      <span className="font-mono text-sm font-bold tabular text-ink">{value}</span>
    </div>
  );
}