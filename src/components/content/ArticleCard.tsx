import Link from "next/link";
import type { Post } from "@/content/posts";
import { formatDate } from "@/lib/posts";
import { CELL_NUM_COLORS } from "@/components/site/map";
import { GridIcon } from "@/components/ui/icons";

export function ArticleCard({
  post,
  index,
  featured = false,
}: {
  post: Post;
  index: number;
  featured?: boolean;
}) {
  const num = (index % 8) + 1;
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col gap-4 rounded-2xl border border-line/60 bg-surface-2/70 p-5 transition-[border-color,transform] duration-200 ease-touch hover:-translate-y-0.5 hover:border-line-strong/60"
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
        <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-ink transition-colors group-hover:text-accent">
          {post.title}
        </h3>
        <p className="text-sm leading-relaxed text-ink-soft">{post.description}</p>
      </div>
      <div className="flex items-center gap-2 text-2xs text-ink-muted">
        <span>{formatDate(post.date)}</span>
        <span aria-hidden className="text-line-strong">
          /
        </span>
        <span>{post.minutes} min read</span>
      </div>
    </Link>
  );
}