import { allPosts } from "@/lib/posts";
import { ArticleCard } from "@/components/content/ArticleCard";
import { AdSlot } from "@/components/site/AdSlot";
import { ContourField } from "@/components/site/map";

export const metadata = {
  title: "Minesweeper Guides, Strategies, and History",
  description:
    "Field notes from Easy Minesweeper: learn the rules, master the patterns, understand scoring, and go from a first win to a sub-minute expert clear.",
  alternates: { canonical: "https://easyminesweeper.vercel.app/blog/" },
};

export default function BlogIndexPage() {
  const posts = allPosts();
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-24 pt-12 sm:px-6">
      <div className="relative">
        <div className="pointer-events-none absolute -top-8 -left-16 opacity-70">
          <ContourField size={420} />
        </div>

        <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-line/60 bg-surface-2/70 px-3 py-1 text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">
          <span className="grid size-3.5 place-items-center rounded-[3px] border border-line bg-cell-revealed text-[9px] font-bold text-num-2">
            1
          </span>
          Field notes
        </div>

        <h1 className="relative font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Minesweeper guides
        </h1>
        <p className="relative mt-4 max-w-2xl text-lg leading-relaxed text-ink-soft">
          Sixteen field notes on rules, patterns, scoring, modes, and history. Every guide is
          written against the real game and points you at a board to practice on.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <ArticleCard key={post.slug} post={post} index={i} />
        ))}
      </div>

      <div className="mt-16">
        <AdSlot variant="leaderboard" />
      </div>
    </div>
  );
}