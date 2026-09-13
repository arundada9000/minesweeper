import Link from "next/link";
import { allPosts } from "@/lib/posts";
import { ArticleCard } from "@/components/content/ArticleCard";
import { AdSlot } from "@/components/site/AdSlot";
import { CellWell, ClearedBoard, ContourField, MapLegend } from "@/components/site/map";
import { PlayIcon, LeafIcon, ZapIcon, EyeIcon, CalendarIcon, GraduationIcon, GridIcon, LightbulbIcon } from "@/components/ui/icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Easy Minesweeper",
  description:
    "A calm, offline-first minesweeper that runs entirely in your browser. Learn the numbers, clear the field, and keep every record on your own device.",
  alternates: { canonical: `https://easyminesweeper.vercel.app/` },
};

const ROWS: string[] = [
  "....1.3....5.",
  ".2..1..1..12.",
  "..1.2....1...",
  "....3..1....2",
  "1..1..2..1.1.",
  ".2.2....3....",
  ".3..1..1..4..",
  "1..1..3.2...1",
  ".2..2..1.1...",
  "..1...2..3.1.",
  "1..1..1......",
  "..1.4..2..2..",
];

const FIELD_ROWS = ROWS.map((row) => row.split("").map((c) => (c === "." ? ("" as const) : Number(c))));

const FEATURES = [
  {
    num: 1,
    icon: LightbulbIcon,
    title: "Learn as you clear",
    body: "Patterns, smart hints, and a practice mode that previews numbers. The game teaches while it plays.",
    href: "/blog/practice-mode-and-smart-hints",
    link: "See how practice works",
  },
  {
    num: 2,
    icon: EyeIcon,
    title: "No Guess boards",
    body: "A generator that only deals provably solvable fields. Every win is earned, every loss is a lesson.",
    href: "/blog/no-guess-mode",
    link: "About No Guess mode",
  },
  {
    num: 3,
    icon: LeafIcon,
    title: "Zen, Rush, and Daily",
    body: "Calm untimed clears, hard 60 second races, and one shared board every day with a fair leaderboard.",
    href: "/blog/zen-mode",
    link: "Pick your pace",
  },
  {
    num: 4,
    icon: GridIcon,
    title: "Any field, any size",
    body: "Custom boards from 5 by 5 to 60 by 60 with your mine count, your rules, and truthful stats.",
    href: "/blog/custom-minesweeper-boards",
    link: "Design your own field",
  },
];

const MODES = [
  { num: 1, name: "Classic", line: "The standard field with records and honest 50/50s", href: "/blog/how-to-play-minesweeper" },
  { num: 2, name: "Zen", line: "Same mines, no timer, complete calm", href: "/blog/zen-mode" },
  { num: 3, name: "Rush", line: "Beat the 60, 150, or 300 second clock", href: "/blog/rush-mode-guide-and-tips" },
  { num: 4, name: "No Guess", line: "Provably solvable, zero coin flips", href: "/blog/no-guess-mode" },
  { num: 5, name: "Daily", line: "One shared board every day, fair rankings", href: "/blog/daily-minesweeper-challenge" },
  { num: 6, name: "Practice", line: "Faint numbers, hints, and undo for learning", href: "/blog/practice-mode-and-smart-hints" },
  { num: 7, name: "Custom", line: "Your size, your mines, your rules", href: "/blog/custom-minesweeper-boards" },
];

export default function LandingPage() {
  const posts = allPosts();
  return (
    <div className="relative">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <ContourField size={960} />
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-5 pt-16 pb-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pt-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line/60 bg-surface-2/70 px-3 py-1 text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-flag" />
              Easy Minesweeper / the field map
            </p>

            <h1 className="mt-6 font-display text-[2.6rem] font-bold leading-[1.04] tracking-tight text-ink sm:text-6xl">
              Think clearly.
              <br />
              <span className="text-ink">Clear everything.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              A calm, offline-first minesweeper that runs entirely in your browser. Read the
              numbers, flag what you can prove, and keep every record, streak, and achievement
              on your own device.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/play"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-on-accent shadow-ios transition-opacity hover:opacity-90"
              >
                <PlayIcon size={16} />
                Play the game
              </Link>
              <Link
                href="/blog/how-to-play-minesweeper"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-hover"
              >
                Learn the rules first
              </Link>
            </div>

            <div className="mt-10">
              <MapLegend />
            </div>
          </div>

          <div className="relative" aria-hidden>
            <div className="relative rounded-2xl border border-line/70 bg-surface/70 p-4 shadow-ios-lg backdrop-blur-sm">
              <div className="mb-3 flex items-center justify-between text-2xs font-mono text-ink-muted">
                <span>FIELD 16x12</span>
                <span>40 MINES / CLEARED</span>
                <span>3BV 78</span>
              </div>
              <ClearedBoard rows={FIELD_ROWS} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line/50 bg-canvas-deep">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6">
          <div className="flex items-center gap-4">
            <CellWell value={1} />
            <div>
              <p className="text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">Revealed tile 1</p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">How it plays</h2>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.num} className="flex flex-col gap-4 rounded-2xl border border-line/60 bg-surface-2/70 p-6">
                  <div className="flex items-center gap-3">
                    <CellWell value={feature.num} />
                    <h3 className="font-display text-lg font-bold tracking-tight text-ink">{feature.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-ink-soft">{feature.body}</p>
                  <Link
                    href={feature.href}
                    className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent-strong"
                  >
                    {feature.link}
                    <span aria-hidden>→</span>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-line/50">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6">
          <div className="flex items-center gap-4">
            <CellWell value={2} />
            <div>
              <p className="text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">Seven tiles, one field</p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Modes of play</h2>
            </div>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MODES.map((mode) => (
              <Link
                key={mode.name}
                href={mode.href}
                className="group flex items-start gap-4 rounded-2xl border border-line/60 bg-surface-2/70 p-5 transition-[border-color,transform] duration-200 ease-touch hover:-translate-y-0.5 hover:border-line-strong/60"
              >
                <CellWell value={mode.num} />
                <div>
                  <h3 className="font-display text-base font-bold tracking-tight text-ink transition-colors group-hover:text-accent">
                    {mode.name}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{mode.line}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line/50 bg-canvas-deep">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6">
          <div className="flex items-center gap-4">
            <CellWell value={3} />
            <div>
              <p className="text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">Sixteen field notes</p>
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">The guides</h2>
            </div>
          </div>

          <div className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            Written against the real game, every guide ends on a board you can open in under a minute.
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 3).map((post, i) => (
              <ArticleCard key={post.slug} post={post} index={i} />
            ))}
          </div>

          <div className="mt-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-hover"
            >
              Browse all 16 guides
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-line/50">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6">
          <AdSlot variant="leaderboard" />
        </div>
      </section>

      <section className="border-t border-line/50 bg-canvas-deep">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="flex items-center gap-4">
                <CellWell value={4} />
                <p className="text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">Install it in one tap</p>
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Built for real devices, not just browsers
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
                Load once, and the whole game keeps playing offline: in a train, a tunnel, or a
                plane. It installs like an app with a single prompt, and nothing ever uploads your
                stats. Your records are yours.
              </p>
            </div>
            <div className="grid gap-4">
              {[
                { icon: GraduationIcon, num: 5, text: "An onboarding tour explains tap, hold, and double-tap before your first board ever ticks." },
                { icon: CalendarIcon, num: 6, text: "The daily board seeds itself offline, so the streak survives the commute underground." },
                { icon: ZapIcon, num: 7, text: "Keyboard shortcuts, full-screen play, and easy gesture controls on every screen size." },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.num} className="flex items-center gap-4 rounded-2xl border border-line/60 bg-surface-2/70 p-5">
                    <CellWell value={item.num} />
                    <p className="text-sm leading-relaxed text-ink-soft">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-12">
            <Link
              href="/play"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-7 py-4 text-sm font-semibold text-on-accent shadow-ios transition-opacity hover:opacity-90"
            >
              <PlayIcon size={16} />
              Play the game
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}