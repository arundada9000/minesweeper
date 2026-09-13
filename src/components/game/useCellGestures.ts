/**
 * Unified cell gestures on a single button element using Pointer Events.
 *
 *  Main button (or touch):
 *    - short tap      -> reveal (hidden/questioned) or unflag (flagged)
 *    - long-press     -> flag (hidden) or cycle (flagged/questioned)
 *    - double-tap     -> chord, only on an already-revealed number cell
 *  Right button:       -> cycle flag state (context menu suppressed)
 *  Middle button:      -> chord
 *
 * A finger that drifts beyond the tap slop cancels the action (scroll wins).
 */

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export interface CellGestureKind {
  /** Hidden and safe to reveal. */
  canReveal: boolean;
  /** Currently flagged: a short tap takes the flag off. */
  canUnflag: boolean;
  /** Revealed number cell that can chord. */
  canChord: boolean;
}

export interface CellGestureEvents {
  reveal: () => void;
  flag: () => void;
  unflag: () => void;
  chord: () => void;
}

const TAP_SLOP = 14;
const CHORD_WINDOW_MS = 260;

export function useCellGestures(kind: CellGestureKind, events: CellGestureEvents, longPressMs: number) {
  const [pressed, setPressed] = useState(false);
  const kindRef = useRef(kind);
  const eventsRef = useRef(events);
  const longPressRef = useRef(longPressMs);

  kindRef.current = kind;
  eventsRef.current = events;
  longPressRef.current = longPressMs;

  const stateRef = useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    moved: false,
    longTimer: 0 as number,
    longTriggered: false,
    lastTapAt: 0,
  });

  useEffect(() => () => clearTimeout(stateRef.current.longTimer), []);

  const clearLongTimer = () => {
    if (stateRef.current.longTimer) {
      clearTimeout(stateRef.current.longTimer);
      stateRef.current.longTimer = 0;
    }
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    // Right button: cycle flag.
    if (e.button === 2) {
      e.preventDefault();
      eventsRef.current.flag();
      return;
    }
    // Middle button: chord.
    if (e.button === 1) {
      e.preventDefault();
      if (kindRef.current.canChord) eventsRef.current.chord();
      return;
    }
    if (e.button !== 0) return;

    const now = Date.now();
    stateRef.current.pointerId = e.pointerId;
    stateRef.current.startX = e.clientX;
    stateRef.current.startY = e.clientY;
    stateRef.current.moved = false;
    stateRef.current.longTriggered = false;
    clearLongTimer();

    // Double-tap chord on a revealed number cell.
    if (kindRef.current.canChord) {
      if (now - stateRef.current.lastTapAt < CHORD_WINDOW_MS) {
        stateRef.current.lastTapAt = 0;
        setPressed(false);
        eventsRef.current.chord();
        return;
      }
      stateRef.current.lastTapAt = now;
      setPressed(true);
      return;
    }

    setPressed(true);
    // Long-press: flag (hidden) or cycle (flagged/questioned).
    const timer = window.setTimeout(() => {
      stateRef.current.longTimer = 0;
      stateRef.current.longTriggered = true;
      if (kindRef.current.canReveal) eventsRef.current.flag();
      else if (kindRef.current.canUnflag) eventsRef.current.flag();
      setPressed(false);
    }, longPressRef.current);
    stateRef.current.longTimer = timer;
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.pointerId !== stateRef.current.pointerId) return;
    const dx = e.clientX - stateRef.current.startX;
    const dy = e.clientY - stateRef.current.startY;
    if (dx * dx + dy * dy > TAP_SLOP * TAP_SLOP) {
      // Cancel the gesture; this is becoming a scroll/drag.
      stateRef.current.moved = true;
      clearLongTimer();
      setPressed(false);
    }
  };

  const cancel = () => {
    clearLongTimer();
    stateRef.current.pointerId = -1;
    stateRef.current.moved = false;
    stateRef.current.longTriggered = false;
    setPressed(false);
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.pointerId !== stateRef.current.pointerId) return;
    clearLongTimer();
    const { moved, longTriggered } = stateRef.current;
    stateRef.current.pointerId = -1;
    stateRef.current.moved = false;
    stateRef.current.longTriggered = false;
    setPressed(false);

    if (moved || longTriggered) return;
    if (kindRef.current.canChord) return; // chord timing handled on pointer down

    // Short tap: reveal hidden/questioned, otherwise take a flag off.
    if (kindRef.current.canReveal) eventsRef.current.reveal();
    else if (kindRef.current.canUnflag) eventsRef.current.unflag();
  };

  const onPointerCancel = () => cancel();
  const onPointerLeave = (e: ReactPointerEvent<HTMLButtonElement>) => {
    // Only bail out for the active pointer.
    if (e.pointerId === stateRef.current.pointerId) cancel();
  };

  return {
    pressed,
    bind: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onPointerLeave,
      onContextMenu: (e: ReactPointerEvent<HTMLButtonElement>) => e.preventDefault(),
      onDoubleClick: (e: ReactPointerEvent<HTMLButtonElement>) => e.preventDefault(),
    },
  };
}