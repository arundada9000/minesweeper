import Link from "next/link";
import type { Post } from "@/content/posts";
import { formatDate } from "@/lib/posts";
import { CELL_NUM_COLORS } from "@/components/site/map";
import { GridIcon, ArrowRightIcon } from "@/components/ui/icons";

export function ArticleCard({
  post,
  index,
}: {
  post: Post;
  index: number;
}) {
  const num = (index % 8) + 1;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col gap-4 rounded-2xl border border-line/60 bg-surface-2/70 p-5 transition-[border-color,transform] duration-200 ease-touch hover:-translate-y-0.5 hover:border-line-strong/60 focus-visible:outline-none"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className={`grid size-9 shrink-0 place-items-center rounded-lg border border-line/60 bg-cell-revealed font-mono text-xs font-bold ${CELL_NUM_COLORS[num]}`}
        >
          {num}
        </span>
        <span className="flex items-center gap-1.5 text-2xs font-medium uppercase tracking-[0.14em] text-ink-muted">
          <GridIcon size={12} />
          Field note
        </span>
      </div>
      <div className="flex-1 space-y-2">
        <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-ink transition-colors duration-150 group-hover:text-accent">
          {post.title}
        </h3>
        <p className="text-sm leading-relaxed text-ink-soft">{post.description}</p>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-line/40 pt-4">
        <span className="tabular text-2xs text-ink-muted">
          {formatDate(post.date)} · {post.minutes} min read
        </span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
          Read
          <ArrowRightIcon size={13} className="transition-transform duration-200 ease-touch group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}