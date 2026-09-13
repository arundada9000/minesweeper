/**
 * Ad slot. Reserves a clearly labeled, patterned space for partner content.
 * Kept off the game page entirely, so the play experience never carries one.
 */

export function AdSlot({
  variant = "leaderboard",
  className = "",
}: {
  variant?: "leaderboard" | "rectangle";
  className?: string;
}) {
  const box =
    variant === "rectangle" ? "h-[280px] w-full max-w-[360px]" : "h-[100px] w-full sm:h-[116px]";
  return (
    <div
      role="complementary"
      aria-label="Advertisement"
      className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-line-strong/60 bg-surface-2/50 ${box} ${className}`}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-3 select-none bg-[repeating-linear-gradient(45deg,transparent_0_10px,var(--track)_10px_11px)] opacity-30"
      />
      <span className="relative grid size-6 place-items-center rounded-lg border border-line bg-cell-revealed text-[9px] font-bold text-ink-muted">
        A
      </span>
      <span className="relative text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">Advertisement</span>
    </div>
  );
}