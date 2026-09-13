import Link from "next/link";
import { allPosts } from "@/lib/posts";
import { ArticleCard } from "@/components/content/ArticleCard";
import { AdSlot } from "@/components/site/AdSlot";
import { Reveal } from "@/components/site/Reveal";
import { FieldChart } from "@/components/site/FieldChart";
import { InstallButton } from "@/components/site/InstallButton";
import { CountUp } from "@/components/site/CountUp";
import { CellWell, ContourField, MapLegend } from "@/components/site/map";
import { PlayIcon, ArrowRightIcon, LightbulbIcon, EyeIcon, LeafIcon, GridIcon, GraduationIcon, CalendarIcon, ZapIcon } from "@/components/ui/icons";
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
    title: "The board teaches you",
    body: "Practice mode previews hidden numbers, and the hint button only ever suggests provable moves. A wall of numbers stops being scary the moment you have read three of its neighbors.",
    href: "/blog/practice-mode-and-smart-hints",
    link: "See how practice works",
  },
  {
    num: 2,
    icon: EyeIcon,
    title: "No Guess boards",
    body: "A generator that only deals provably solvable fields. Every win is earned, every loss is one lesson closer to a clean read.",
    href: "/blog/no-guess-mode",
    link: "About No Guess mode",
  },
  {
    num: 3,
    icon: LeafIcon,
    title: "Zen, Rush, and Daily",
    body: "Unhurried clears, 60 second races, and one shared board every day with a fair timeline to compare against.",
    href: "/blog/zen-mode",
    link: "Pick your pace",
  },
  {
    num: 4,
    icon: GridIcon,
    title: "Any field, any size",
    body: "Custom boards from 5 by 5 to 60 by 60 with your mine count, your rules, and records that stay honest.",
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
          <Reveal onMount>
            <p className="inline-flex items-center gap-2 rounded-full border border-line/60 bg-surface-2/70 px-3 py-1 text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-flag" />
              Easy Minesweeper / the field map
            </p>
          </Reveal>

          <Reveal onMount delay={0.08}>
            <h1 className="mt-6 font-display text-[2.6rem] font-bold leading-[1.04] tracking-tight text-ink sm:text-6xl">
              Think clearly.
              <br />
              Clear everything.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Classic, No Guess, Zen, Rush, and Daily all run in your browser, fully offline once
              loaded. Read the numbers, flag only what you can prove, and your records stay on
              your own device.
            </p>
          </Reveal>

          <Reveal onMount delay={0.16}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/play"
                className="press group/cta inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3.5 text-sm font-semibold text-on-accent shadow-ios hover:opacity-90"
              >
                <PlayIcon size={16} className="transition-transform duration-200 group-hover/cta:scale-110" />
                Play the game
              </Link>
              <Link
                href="/blog/how-to-play-minesweeper"
                className="group/rules inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface-hover"
              >
                Learn the rules first
                <ArrowRightIcon size={15} className="transition-transform duration-200 ease-touch group-hover/rules:translate-x-0.5" />
              </Link>
              <InstallButton variant="solid" className="sm:self-stretch" />
            </div>

            <div className="mt-10">
              <MapLegend />
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <div className="flex items-baseline gap-2">
                <CountUp value={16} className="font-display text-2xl font-bold text-ink" />
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Field notes</span>
              </div>
              <div className="flex items-baseline gap-2">
                <CountUp value={7} className="font-display text-2xl font-bold text-ink" />
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Modes</span>
              </div>
              <div className="flex items-baseline gap-2">
                <CountUp value={8} className="font-display text-2xl font-bold text-ink" />
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Achievements</span>
              </div>
            </div>
          </Reveal>

          <Reveal onMount delay={0.24}>
            <div className="relative" aria-hidden>
              <div className="relative rounded-2xl border border-line/70 bg-surface/70 p-4 shadow-ios-lg backdrop-blur-sm">
                <div className="mb-3 flex items-center justify-between text-2xs font-mono text-ink-muted">
                  <span>FIELD 16x12</span>
                  <span>40 MINES / CLEARED</span>
                  <span>3BV 78</span>
                </div>
                <FieldChart rows={FIELD_ROWS} />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line/50 bg-canvas-deep">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6">
          <Reveal>
            <div className="flex items-center gap-4">
              <CellWell value={1} />
              <div>
                <p className="text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">Revealed tile 1</p>
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">How it plays</h2>
              </div>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <Reveal key={feature.num} delay={i * 0.07} className="h-full">
                  <article className="group/feat flex h-full flex-col gap-4 rounded-2xl border border-line/60 bg-surface-2/70 p-6 transition-[border-color] duration-200 hover:border-line-strong/60">
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
                      <ArrowRightIcon
                        size={14}
                        className="transition-transform duration-200 ease-touch group-hover/feat:translate-x-0.5"
                      />
                    </Link>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-line/50">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6">
          <Reveal>
            <div className="flex items-center gap-4">
              <CellWell value={2} />
              <div>
                <p className="text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">Seven tiles, one field</p>
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">Modes of play</h2>
              </div>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {MODES.map((mode, i) => (
              <Reveal key={mode.name} delay={i * 0.05} className="h-full">
                <Link
                  href={mode.href}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-line/60 bg-surface-2/70 p-5 transition-[border-color,transform] duration-200 ease-touch hover:-translate-y-0.5 hover:border-line-strong/60"
                >
                  <CellWell value={mode.num} />
                  <div>
                    <h3 className="font-display text-base font-bold tracking-tight text-ink transition-colors group-hover:text-accent">
                      {mode.name}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{mode.line}</p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line/50 bg-canvas-deep">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-6">
          <Reveal>
            <div className="flex items-center gap-4">
              <CellWell value={3} />
              <div>
                <p className="text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">Sixteen field notes</p>
                <h2 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">The guides</h2>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              Written against the real game, every guide ends on a board you can open in under a minute.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 3).map((post, i) => (
              <Reveal key={post.slug} delay={i * 0.07} className="h-full">
                <ArticleCard post={post} index={i} />
              </Reveal>
            ))}
          </div>

          <Reveal y={14} className="mt-8">
            <Link
              href="/blog"
              className="group/guides inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-surface-hover"
            >
              Browse all 16 guides
              <ArrowRightIcon
                size={15}
                className="transition-transform duration-200 ease-touch group-hover/guides:translate-x-0.5"
              />
            </Link>
          </Reveal>
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
            <Reveal>
              <div className="flex items-center gap-4">
                <CellWell value={4} />
                <p className="text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">Install it in one tap</p>
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Built for real devices, not just browsers
              </h2>
              <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft">
                Load once, then keep playing in a train, a tunnel, or a plane. It installs like an
                app with a single prompt, and nothing ever uploads your stats.
              </p>
            </Reveal>
            <div className="grid gap-4">
              {[
                { icon: GraduationIcon, num: 5, text: "An onboarding tour explains tap, hold, and double-tap before your first board ever ticks." },
                { icon: CalendarIcon, num: 6, text: "The daily board seeds itself offline, so the streak survives the commute underground." },
                { icon: ZapIcon, num: 7, text: "Keyboard shortcuts, full-screen play, and easy gesture controls on every screen size." },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.num} delay={i * 0.08} className="h-full">
                    <div className="flex items-center gap-4 rounded-2xl border border-line/60 bg-surface-2/70 p-5">
                      <CellWell value={item.num} />
                      <p className="text-sm leading-relaxed text-ink-soft">{item.text}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          <Reveal y={14} className="mt-12">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/play"
                className="press group/cta inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-7 py-4 text-sm font-semibold text-on-accent shadow-ios hover:opacity-90"
              >
                <PlayIcon size={16} className="transition-transform duration-200 group-hover/cta:scale-110" />
                Play the game
              </Link>
              <InstallButton variant="ghost" className="sm:self-stretch" />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}