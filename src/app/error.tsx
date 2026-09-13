"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[SweeperMine] app error:", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <div aria-hidden className="size-20 rounded-full bg-[#14141a] shadow-[inset_0_0_0_2px_rgba(255,149,0,0.5)]">
        <div className="mx-auto mt-4 size-10 rounded-full bg-[#ff9500]" />
      </div>
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ink">We hit a mine.</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          Something exploded under the hood. Your records are safe; reload and sweep again.
        </p>
      </div>
      <button type="button" onClick={reset} className="press rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent">
        Try again
      </button>
    </main>
  );
}