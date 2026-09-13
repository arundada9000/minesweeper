/**
 * Game screen: wires the store, clock, gestures, keyboard, overlays, and
 * settings into one playable scene. Client-only (stores touch window APIs).
 */

"use client";

import { useCallback, useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from "react";
import { AnimatePresence, MotionConfig } from "motion/react";
import { useGame, loadSavedRun, clearSavedRun } from "@/game/useGameStore";
import { useStats, type FinishedNotice } from "@/game/useStatsStore";
import { useSettings, applySettingsToDocument, applyMotionMedia } from "@/game/useSettingsStore";
import { playSound, haptic, primeAudio } from "@/game/sound";
import { getMode, MODE_LIST } from "@/engine/modes";
import { getPreset } from "@/engine/presets";
import type { PresetId, CustomBoardSpec } from "@/engine/presets";
import type { ModeId } from "@/engine/types";
import {
  PauseIcon,
  PlayIcon,
  SettingsIcon,
  KeyboardIcon,
  TrophyIcon,
  HelpIcon,
  GridIcon,
  CalendarIcon,
  ZapIcon,
  LeafIcon,
  CommandIcon,
  RestartIcon,
  SpeakerIcon,
  SpeakerOffIcon,
  VibrateIcon,
} from "../ui/icons";
import { CommandPalette, type Command } from "../ui/CommandPalette";
import { ContextMenuLayer, useContextMenu, type MenuItem } from "../ui/ContextMenu";
import { ToastViewport, toast } from "../ui/Toasts";
import { Tooltip } from "../ui/primitives";
import { Hud } from "./Hud";
import { BoardGrid } from "./BoardGrid";
import { ContinueOverlay, PauseOverlay, ResultOverlay } from "./Overlays";
import { ModeSelect } from "./ModeSelect";
import { SettingsSheet } from "./SettingsSheet";
import { StatsSheet } from "./StatsSheet";
import { HelpSheet } from "./HelpSheet";

const TICK_INTERVAL_MS = 250;
const MAX_DT_MS = 1000;
const EMPTY_NOTICE: FinishedNotice = { recordBeaten: false, unlocked: [], unlockName: null };

export function GameScreen() {
  const [showMode, setShowMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [continuePrompt, setContinuePrompt] = useState(() => loadSavedRun());
  const [cursor, setCursor] = useState<number | null>(null);
  const [notice, setNotice] = useState<FinishedNotice>(EMPTY_NOTICE);

  const phase = useGame((s) => s.engine.phase);
  useGame((s) => s.clockVersion);

  const engine = useGame.getState().engine;
  const mode = useGame.getState().mode;
  const preset = useGame.getState().preset;
  const cols = useGame.getState().cols;
  const rows = useGame.getState().rows;

  /* ------------------------------ document tokens ------------------------------ */

  useEffect(() => {
    applySettingsToDocument(useSettings.getState());
    applyMotionMedia(useSettings.getState());
    return useSettings.subscribe((state) => {
      applySettingsToDocument(state);
      applyMotionMedia(state);
    });
  }, []);

  /* ------------------------------- clock + autopause ---------------------------- */

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const loop = (now: number) => {
      const dt = Math.min(now - last, MAX_DT_MS);
      last = now;
      acc += dt;
      if (acc >= TICK_INTERVAL_MS) {
        useGame.getState().tick(acc);
        acc = 0;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pauseIfAuto = useCallback(() => {
    const settings = useSettings.getState();
    if (!settings.autoPause) return;
    const store = useGame.getState();
    if (store.engine.phase === "playing") {
      playSound("pause");
      haptic("tap");
      store.engine.pause(true);
      useGame.setState({ clockVersion: useGame.getState().clockVersion + 1 });
    }
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) pauseIfAuto();
    };
    const onBlur = () => pauseIfAuto();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
    };
  }, [pauseIfAuto]);

  /* ---------------------------------- actions ---------------------------------- */

  const togglePause = useCallback(() => {
    const store = useGame.getState();
    playSound("pause");
    if (store.engine.isPaused) {
      store.resume();
      playSound("resume");
    } else {
      store.pause();
    }
    haptic("tap");
  }, []);

  const startGame = useCallback((nextMode: ModeId, presetId: PresetId, custom: CustomBoardSpec) => {
    setContinuePrompt(null);
    setShowMode(false);
    setShowResult(false);
    setCursor(null);
    useGame.getState().newGame(nextMode, presetId, custom);
  }, []);

  const abandon = useCallback(() => {
    clearSavedRun();
    setShowResult(false);
    useGame.getState().newGame();
  }, []);

  /* --------------------------------- commands --------------------------------- */

  const startMode = useCallback(
    (nextMode: ModeId) => {
      primeAudio();
      setContinuePrompt(null);
      setShowResult(false);
      setCursor(null);
      useGame.getState().newGame(nextMode);
      toast(getMode(nextMode).name);
    },
    []
  );

  const openBoardMenu = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      const store = useGame.getState();
      const items: MenuItem[] = [
        {
          id: "new",
          label: "New game",
          icon: <PlayIcon size={15} />,
          onSelect: () => {
            primeAudio();
            setShowMode(true);
          },
        },
        {
          id: "restart",
          label: "Restart board",
          icon: <RestartIcon size={15} />,
          onSelect: () => {
            playSound("newgame");
            useGame.getState().restart();
          },
        },
      ];
      if (store.engine.phase === "paused") {
        items.splice(2, 0, {
          id: "resume",
          label: "Resume game",
          icon: <PlayIcon size={15} />,
          onSelect: togglePause,
        });
      } else {
        items.splice(2, 0, {
          id: "pause",
          label: "Pause game",
          icon: <PauseIcon size={15} />,
          onSelect: togglePause,
        });
      }
      items.push(
        {
          id: "command",
          label: "Commands",
          icon: <CommandIcon size={15} />,
          onSelect: () => setShowCommand(true),
        },
        {
          id: "help",
          label: "How to play",
          icon: <HelpIcon size={15} />,
          onSelect: () => setShowHelp(true),
        },
        {
          id: "settings",
          label: "Settings",
          icon: <SettingsIcon size={15} />,
          onSelect: () => setShowSettings(true),
        }
      );
      useContextMenu.getState().open(e.clientX, e.clientY, items);
    },
    [togglePause]
  );

  const commands = useMemo<Command[]>(() => {
    const settings = useSettings.getState();
    const paused = phase === "paused";
    const modeIcon: Record<ModeId, ReactNode> = {
      classic: <GridIcon size={15} />,
      "no-guess": <CommandIcon size={15} />,
      daily: <CalendarIcon size={15} />,
      rush: <ZapIcon size={15} />,
      zen: <LeafIcon size={15} />,
    };
    return [
      {
        id: "modeselect",
        group: "Game",
        label: "New game",
        keywords: "start board pick mode",
        icon: <PlayIcon size={15} />,
        onRun: () => {
          primeAudio();
          setShowMode(true);
        },
      },
      {
        id: "restart",
        group: "Game",
        label: "Restart board",
        keywords: "reset clear",
        icon: <RestartIcon size={15} />,
        onRun: () => {
          playSound("newgame");
          useGame.getState().restart();
          toast("Board restarted");
        },
      },
      paused
        ? {
            id: "resume",
            group: "Game",
            label: "Resume game",
            keywords: "continue unpause",
            icon: <PlayIcon size={15} />,
            onRun: togglePause,
          }
        : {
            id: "pause",
            group: "Game",
            label: "Pause game",
            keywords: "stop hold",
            icon: <PauseIcon size={15} />,
            onRun: togglePause,
          },
      ...MODE_LIST.map((m) => ({
        id: `start-${m.id}`,
        group: "Start a mode",
        label: m.name,
        keywords: m.description,
        icon: modeIcon[m.id],
        onRun: () => startMode(m.id),
      })),
      { id: "stats", group: "Library", label: "Records and stats", keywords: "achievements history scores", icon: <TrophyIcon size={15} />, onRun: () => setShowStats(true) },
      { id: "settings", group: "Library", label: "Settings", keywords: "preferences options", icon: <SettingsIcon size={15} />, onRun: () => setShowSettings(true) },
      { id: "help", group: "Library", label: "How to play", keywords: "help shortcuts gestures controls", icon: <HelpIcon size={15} />, onRun: () => setShowHelp(true) },
      settings.sound
        ? { id: "sound-off", group: "Preferences", label: "Turn sound off", keywords: "audio mute", icon: <SpeakerIcon size={15} />, onRun: () => { useSettings.getState().toggleSound(); toast("Sound off"); } }
        : { id: "sound-on", group: "Preferences", label: "Turn sound on", keywords: "audio mute", icon: <SpeakerOffIcon size={15} />, onRun: () => { useSettings.getState().toggleSound(); toast("Sound on"); } },
      settings.haptics
        ? { id: "haptics-off", group: "Preferences", label: "Turn haptics off", keywords: "vibration feedback", icon: <VibrateIcon size={15} />, onRun: () => { useSettings.getState().toggleHaptics(); toast("Haptics off"); } }
        : { id: "haptics-on", group: "Preferences", label: "Turn haptics on", keywords: "vibration feedback", icon: <VibrateIcon size={15} />, onRun: () => { useSettings.getState().toggleHaptics(); toast("Haptics on"); } },
    ];
  }, [phase, startMode, togglePause]);

  /* ---------------------------------- keyboard --------------------------------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const raw = e.key.toLowerCase();
      const active = document.activeElement;
      const typing = active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement;

      if ((e.ctrlKey || e.metaKey) && raw === "k") {
        e.preventDefault();
        setShowCommand((v) => !v);
        return;
      }
      if (typing) return;
      if (raw === "?" && !showMode && !showSettings && !showStats && !showHelp) {
        e.preventDefault();
        setShowHelp(true);
        return;
      }
      if (showMode || showSettings || showStats || showHelp || showCommand) return;

      const store = useGame.getState();
      const phaseNow = store.engine.phase;
      const isPlayingOrReady = phaseNow === "ready" || phaseNow === "playing";

      const move = (dx: number, dy: number) => {
        e.preventDefault();
        if (!isPlayingOrReady) return;
        setCursor((prev) => {
          const c = prev ?? Math.floor(rows / 2) * cols + Math.floor(cols / 2);
          const nr = Math.min(rows - 1, Math.max(0, Math.floor(c / cols) + dy));
          const nc = Math.min(cols - 1, Math.max(0, (c % cols) + dx));
          return nr * cols + nc;
        });
      };

      switch (raw) {
        case "arrowup":
          return move(0, -1);
        case "arrowdown":
          return move(0, 1);
        case "arrowleft":
          return move(-1, 0);
        case "arrowright":
          return move(1, 0);
        case " ":
        case "enter":
          e.preventDefault();
          if (cursor !== null) {
            playSound("reveal");
            store.reveal(cursor);
          }
          return;
        case "f":
        case "q":
          if (cursor !== null) {
            playSound("flag");
            store.cycleFlag(cursor);
          }
          return;
        case "u":
        case "z":
          if (store.engine.canUndo) store.undo();
          return;
        case "r":
          playSound("newgame");
          store.restart();
          return;
        case "p":
        case "escape":
          e.preventDefault();
          if (phaseNow === "paused") store.resume();
          else if (isPlayingOrReady) togglePause();
          return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cursor, cols, rows, showMode, showSettings, showStats, showHelp, showCommand, togglePause]);

  /* ------------------------------- settle results ------------------------------ */

  useEffect(() => {
    if (phase === "won" || phase === "lost") {
      const store = useGame.getState();
      const outcome = useStats.getState().outcomeFor(store.engine, store.mode, store.preset);
      const notice = useStats.getState().recordFinished(outcome);
      setNotice(notice);
    }
    if (phase === "won") {
      playSound("win");
      haptic("win");
      setShowResult(true);
    } else if (phase === "lost") {
      playSound("lose");
      haptic("lose");
      setShowResult(true);
    }
  }, [phase]);

  /* ---------------------------------- render ---------------------------------- */

  const hasBoard = engine.cells.length > 0;
  const won = phase === "won";
  const lost = phase === "lost";
  const paused = phase === "paused";
  const finished = won || lost;
  const modeDef = getMode(mode);
  const modeLabel = modeDef.name;
  const presetEntry = getPreset(mode, preset);
  const presetLabel = preset === "custom" ? `${cols} x ${rows}` : presetEntry?.name ?? preset;

  const resultStats: "standard" | "rush" | "zen" =
    modeDef.score === "rush" ? "rush" : modeDef.timer === "none" ? "zen" : "standard";
  const timeLimit = engine.timeLimitMs;
  const rushScore = won
    ? 1000 + Math.round((timeLimit !== null && timeLimit !== undefined ? Math.max(0, timeLimit - engine.elapsedMs) : 0) / 1000) * 10
    : Math.round(engine.elapsedMs / 1000);
  const timeUp = lost && engine.reason === "Time's up.";
  const showUndoHint = modeDef.undoAllowed;

  return (
    <MotionConfig reducedMotion="user">
      <div className="no-select flex h-dvh flex-col bg-canvas">
      <header className="safe-top flex items-center justify-between px-5 pt-2.5">
        <div className="flex items-baseline gap-2">
          <h1 className="text-lg font-bold tracking-tight text-ink font-display">SweeperMine</h1>
          <span className="hidden text-2xs uppercase tracking-widest text-ink-muted sm:block">{modeLabel} / {presetLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <Tooltip label="Records and stats">
            <button
              type="button"
              aria-label="Records and stats"
              onClick={() => {
                primeAudio();
                setShowStats(true);
              }}
              className="press no-select flex size-10 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2 hover:text-ink"
            >
              <TrophyIcon size={18} />
            </button>
          </Tooltip>
          <Tooltip label="How to play">
            <button
              type="button"
              aria-label="How to play"
              onClick={() => {
                primeAudio();
                setShowHelp(true);
              }}
              className="press no-select flex size-10 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2 hover:text-ink"
            >
              <HelpIcon size={18} />
            </button>
          </Tooltip>
          <Tooltip label="Pause or resume">
            <button
              type="button"
              aria-label="Pause"
              onClick={togglePause}
              className="press no-select flex size-10 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2 hover:text-ink"
            >
              <PauseIcon size={18} />
            </button>
          </Tooltip>
          <Tooltip label="Settings">
            <button
              type="button"
              aria-label="Settings"
              onClick={() => {
                primeAudio();
                setShowSettings(true);
              }}
              className="press no-select flex size-10 items-center justify-center rounded-full text-ink-soft hover:bg-surface-2 hover:text-ink"
            >
              <SettingsIcon size={19} />
            </button>
          </Tooltip>
        </div>
      </header>

      <main className="mt-2 flex min-h-0 flex-1 flex-col">
        <Hud onModeClick={() => setShowMode(true)} onUndo={() => useGame.getState().undo()} onRestart={() => useGame.getState().restart()} />

        <div className="relative mb-3 mt-3 min-h-0 flex-1 px-2">
          <div className="game-canvas absolute inset-0" onContextMenu={openBoardMenu}>
            <BoardGrid cursor={cursor} />
          </div>

          <AnimatePresence>
            {continuePrompt && !finished && !hasBoard && (
              <ContinueOverlay
                key="continue"
                savedAt={continuePrompt.savedAt}
                label={`${getMode(continuePrompt.mode).name} / ${continuePrompt.preset === "custom" ? "Custom" : getPreset(continuePrompt.mode, continuePrompt.preset)?.name ?? "Game"}`}
                onContinue={() => {
                  playSound("confirm");
                  haptic("tap");
                  setContinuePrompt(null);
                  useGame.getState().continueSaved();
                }}
                onNewGame={() => {
                  playSound("newgame");
                  setContinuePrompt(null);
                  useGame.getState().newGame();
                }}
              />
            )}
            {paused && !finished && (
              <PauseOverlay
                key="pause"
                reason={engine.reason}
                onResume={() => {
                  playSound("resume");
                  haptic("tap");
                  useGame.getState().resume();
                }}
                onRestart={() => {
                  playSound("newgame");
                  useGame.getState().restart();
                }}
                onQuit={abandon}
              />
            )}
            {finished && showResult && (
              <ResultOverlay
                key={won ? "won" : "lost"}
                won={won}
                timeMs={engine.elapsedMs}
                mines={engine.config.mineCount}
                moves={engine.moves}
                stats={resultStats}
                cleared={engine.revealedSafeCount}
                score={rushScore}
                timeUp={timeUp}
                record={notice.recordBeaten}
                unlock={notice.unlockName}
                onPlayAgain={() => {
                  playSound("newgame");
                  useGame.getState().restart();
                  setShowResult(false);
                }}
                onNewBoard={() => {
                  playSound("newgame");
                  useGame.getState().newGame();
                  setShowResult(false);
                }}
                onClose={() => setShowResult(false)}
              />
            )}
          </AnimatePresence>
        </div>

        <div className="safe-bottom flex items-center justify-center gap-2 px-5 pb-2 text-2xs text-ink-muted">
          <KeyboardIcon size={13} />
          {mode !== "zen" ? (
            <span className="hidden sm:inline">
              Arrows move / Space reveals / F flags {showUndoHint ? "/ Z undoes" : ""} / R restarts / P pauses
            </span>
          ) : (
            <span className="hidden sm:inline">
              Arrows move / Space reveals / F flags / R restarts / Z undoes
            </span>
          )}
          <span className="sm:hidden">Tap to reveal / Hold to flag / Double-tap to clear around a number</span>
          <span className="hidden lg:inline">/ Ctrl+K commands</span>
        </div>
      </main>

      <ModeSelect
        open={showMode}
        onClose={() => {
          playSound("cancel");
          setShowMode(false);
        }}
        onStart={startGame}
      />
      <SettingsSheet open={showSettings} onClose={() => setShowSettings(false)} />
      <StatsSheet open={showStats} onClose={() => setShowStats(false)} />
      <HelpSheet open={showHelp} onClose={() => setShowHelp(false)} />
      <CommandPalette open={showCommand} onClose={() => setShowCommand(false)} commands={commands} />
      <ContextMenuLayer />
      <ToastViewport />
      </div>
    </MotionConfig>
  );
}