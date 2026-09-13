import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <div aria-hidden className="size-20 rounded-full bg-[#14141a] shadow-[inset_0_0_0_2px_rgba(255,149,0,0.5)]">
        <div className="mx-auto mt-4 size-10 rounded-full bg-[#ff9500]" />
      </div>
      <div>
        <h1 className="font-display text-3xl font-extrabold text-ink">404. No mines here.</h1>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          You cleared every cell but this one: the page does not exist. Start a fresh board instead.
        </p>
      </div>
      <Link href="/" className="press rounded-2xl bg-accent px-5 py-2.5 text-sm font-semibold text-on-accent">
        New game
      </Link>
    </main>
  );
}