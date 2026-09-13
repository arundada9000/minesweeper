import Link from "next/link";
import type { Post } from "@/content/posts";
import { formatDate } from "@/lib/posts";
import { Markdown } from "./Markdown";
import { ArticleCard } from "./ArticleCard";
import { PlayIcon } from "@/components/ui/icons";

export function ArticleLayout({ post, related }: { post: Post; related: Post[] }) {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 pb-20 pt-10 sm:px-6">
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

      <div className="mt-8">
        <Markdown body={post.body} />
      </div>

      <div className="mt-14 overflow-hidden rounded-2xl border border-line/60 bg-ink text-canvas">
        <div className="flex flex-col items-start gap-4 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-lg font-bold tracking-tight">Ready to put it on a board?</p>
            <p className="mt-1 text-sm text-canvas/70">Open the field and clear something real.</p>
          </div>
          <Link
            href="/play"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-canvas px-5 py-3 text-sm font-semibold text-ink transition-opacity hover:opacity-90"
          >
            <PlayIcon size={16} />
            Play the game
          </Link>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-lg font-bold tracking-tight text-ink">Next on the map</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((post, i) => (
              <ArticleCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}