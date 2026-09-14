/**
 * Shared multi-touch state between the board's pinch-zoom surface (BoardGrid)
 * and the per-cell pointer gestures (useCellGestures).
 *
 * A second finger landing mid-pinch must suppress cell reveals and flags
 * (game-logic §45, §47), and the finger that lifts to end a pinch must not be
 * mistaken for a tap. BoardGrid reports every pointer that goes down and up
 * inside the board; useCellGestures consults `pinchTapSuppressed` before
 * acting.
 */

const pointers = { count: 0 };

export const boardPinch = {
  multi: false,
  suppressUntil: 0,
};

export function pointerDownOnBoard(): void {
  pointers.count += 1;
  if (pointers.count >= 2) boardPinch.multi = true;
}

export function pointerLeftBoard(): void {
  const wasMulti = pointers.count >= 2;
  pointers.count = Math.max(0, pointers.count - 1);
  boardPinch.multi = pointers.count >= 2;
  if (wasMulti && pointers.count < 2) {
    // The lift that ends a pinch must not replay as a tap on a cell.
    boardPinch.suppressUntil = performance.now() + 450;
  }
}

export function pinchTapSuppressed(now: number): boolean {
  return boardPinch.multi || now < boardPinch.suppressUntil;
}

/** Forget all pointer bookkeeping when a fresh board starts (restart, new
 *  game, continue). A leaked count never recovers on its own — every new tap
 *  adds one more down/up, keeping it at >= 2 forever — which would otherwise
 *  suppress all left-click/tap reveals on the next run. */
export function resetBoardPinch(): void {
  pointers.count = 0;
  boardPinch.multi = false;
  boardPinch.suppressUntil = 0;
}