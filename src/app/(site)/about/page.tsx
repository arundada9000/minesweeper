import Link from "next/link";
import { SITE_URL, SITE_TAGLINE } from "@/lib/site";
import { Reveal } from "@/components/site/Reveal";
import { MineIcon, PlayIcon } from "@/components/ui/icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    `Easy Minesweeper is a calm, offline-first minesweeper that runs entirely in the browser. ${SITE_TAGLINE}`,
  alternates: { canonical: `${SITE_URL}/about/` },
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-12 sm:px-6">
      <Reveal onMount>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line/60 bg-surface-2/70 px-3 py-1 text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">
          <span className="grid size-3.5 place-items-center rounded-[3px] border border-line bg-cell-revealed text-[9px] font-bold text-num-4">4</span>
          About
        </div>

        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">Think clearly. Clear everything.</h1>
      </Reveal>

      <Reveal y={16} className="mt-8">
        <div className="space-y-6 text-[15px] leading-7 text-ink-soft">
        <p className="text-lg leading-relaxed text-ink-soft">
          Easy Minesweeper is a minesweeper with a quiet philosophy: the puzzle should teach you,
          not punish you. It runs entirely in your browser, works fully offline once loaded, and
          installs like an app with a single prompt, with no account and no server in the way.
        </p>

        <p>
          The rules are the classic ones. The field hides mines under sealed cells, the numbers
          count the mines beside them, and reading those numbers is the whole game. Around that
          single idea we built the parts classic minesweeper never shipped: a No Guess generator
          that only deals provably solvable boards, a practice mode with intelligent hints, a zen
          mode without a timer, a daily board that everyone on the internet shares, and records
          that live on your device.
        </p>

        <p>
          This project is a small, independent one. It is made by{" "}
          <strong className="font-semibold text-ink">Arun Neupane</strong> and the game's guides
          are written to be genuinely useful, not to pad a page. Every article on this site points
          at a real feature you can open in the game and try in under a minute.
        </p>

        <h2 className="pt-4 font-display text-xl font-bold tracking-tight text-ink">
          What you can expect
        </h2>

        <ul className="list-disc space-y-2 pl-5 marker:text-ink-muted">
          <li>
            A clean play area with no ads, no popups, and no account wall, including fully offline PWA support.
          </li>
          <li>Records, streaks, and settings stored privately on your own device.</li>
          <li>Accessible play: keyboard, touch, and screen-reader friendly controls, plus an onboarding tour.</li>
          <li>A small ad slot on this site's landing and guide pages that funds the project without touching the game.</li>
        </ul>
      </div>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/play"
          className="press inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-on-accent shadow-ios hover:opacity-90"
        >
          <PlayIcon size={16} />
          Play the game
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-hover"
        >
          <MineIcon size={16} />
          Read the guides
        </Link>
      </div>
      </Reveal>
    </div>
  );
}