import Link from "next/link";
import type { Post } from "@/content/posts";
import { formatDate } from "@/lib/posts";
import { Markdown } from "./Markdown";
import { ArticleCard } from "./ArticleCard";
import { Reveal } from "@/components/site/Reveal";
import { PlayIcon, ArrowRightIcon } from "@/components/ui/icons";

export function ArticleLayout({ post, related }: { post: Post; related: Post[] }) {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 pb-20 pt-10 sm:px-6">
      <Reveal onMount>
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink-muted">
          <Link href="/blog" className="transition-colors hover:text-ink">
            Guides
          </Link>
          <span className="mx-2" aria-hidden>
            /
          </span>
          <span className="text-ink-soft">{post.title}</span>
        </nav>

        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line/60 bg-surface-2/70 px-3 py-1 text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">
          <span className="grid size-3.5 place-items-center rounded-[3px] border border-line bg-cell-revealed text-[9px] font-bold text-num-1">
            3
          </span>
          Field note
        </div>

        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
          {post.title}
        </h1>

        <p className="mt-4 text-lg leading-relaxed text-ink-soft">{post.description}</p>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line/60 pb-6 text-sm text-ink-muted">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden>/</span>
          <span>{post.minutes} min read</span>
          <span aria-hidden>/</span>
          <span className="text-ink-soft">Easy Minesweeper guides</span>
        </div>
      </Reveal>

      <Reveal y={16} className="mt-8">
        <Markdown body={post.body} />
      </Reveal>

      <Reveal y={16} className="mt-14">
        <div className="overflow-hidden rounded-2xl border border-line/60 bg-ink text-canvas">
          <div className="flex flex-col items-start gap-4 p-7 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-lg font-bold tracking-tight">Take the next move</p>
              <p className="mt-1 text-sm text-canvas/70">This board is real, and it is waiting at /play.</p>
            </div>
            <Link
              href="/play"
              className="press group/cta inline-flex shrink-0 items-center gap-2 rounded-xl bg-canvas px-5 py-3 text-sm font-semibold text-ink"
            >
              <PlayIcon size={16} className="transition-transform duration-200 group-hover/cta:scale-110" />
              Play
            </Link>
          </div>
        </div>
      </Reveal>

      {related.length > 0 && (
        <section className="mt-14">
          <Reveal>
            <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold tracking-tight text-ink">
              Next on the map
              <ArrowRightIcon size={16} className="text-accent" />
            </h2>
          </Reveal>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((post, i) => (
              <Reveal key={post.slug} delay={i * 0.06} className="h-full" y={16}>
                <ArticleCard post={post} index={i} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}