/**
 * Ad slot. Reserves a clearly labeled, patterned space for sponsor content.
 * Kept separate from the game so the play experience never carries an ad.
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
      className={`flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-line-strong/60 bg-surface-2/50 ${box} ${className}`}
    >
      <span className="text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">Advertisement</span>
      <span className="text-2xs text-ink-muted/70">Reserved for a future sponsor</span>
    </div>
  );
}