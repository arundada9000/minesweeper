import Link from "next/link";
import { AUTHOR_NAME } from "@/lib/site";
import { MineIcon } from "@/components/ui/icons";
import { posts } from "@/content/posts";

const GAME_LINKS = [
  { href: "/play", label: "Play the game" },
  { href: "/blog", label: "All guides" },
  { href: "/about", label: "About" },
  { href: "/privacy-policy", label: "Privacy" },
];

export function SiteFooter() {
  const top = posts.slice(0, 5);
  return (
    <footer className="border-t border-line/50 bg-canvas-deep">
      <div className="safe-bottom mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5 no-select">
              <span className="grid size-8 place-items-center rounded-lg bg-ink text-canvas">
                <MineIcon size={17} />
              </span>
              <span className="font-display text-base font-bold tracking-tight text-ink">Easy Minesweeper</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              A calm, offline-first minesweeper that runs entirely in your browser. Think clearly. Clear everything.
            </p>
          </div>

          <nav aria-label="Popular guides">
            <h2 className="text-2xs font-bold uppercase tracking-[0.14em] text-ink-muted">Popular guides</h2>
            <ul className="mt-3 space-y-2">
              {top.map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="text-sm text-ink-soft transition-colors hover:text-ink">
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Site">
            <h2 className="text-2xs font-bold uppercase tracking-[0.14em] text-ink-muted">Site</h2>
            <ul className="mt-3 space-y-2">
              {GAME_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-soft transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line/50 pt-6 text-2xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Easy Minesweeper. Made by {AUTHOR_NAME}.</p>
          <p className="tabular font-mono">FLAG{top.length} / SAFE&gt;</p>
        </div>
      </div>
    </footer>
  );
}