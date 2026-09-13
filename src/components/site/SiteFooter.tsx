import Link from "next/link";
import { AUTHOR_NAME, AUTHOR_URL, SITE_TAGLINE } from "@/lib/site";
import {
  MineIcon,
  GraduationIcon,
  GridIcon,
  GitHubIcon,
  LinkedInIcon,
  XIcon,
  InstagramIcon,
  YouTubeIcon,
  WhatsAppIcon,
  ArrowUpRightIcon,
} from "@/components/ui/icons";
import { posts } from "@/content/posts";

const SITE_LINKS = [
  { href: "/play", label: "Play the game" },
  { href: "/blog", label: "All guides" },
  { href: "/about", label: "About" },
  { href: "/privacy-policy", label: "Privacy" },
];

const SOCIALS = [
  { href: "https://arunneupane.vercel.app/", label: "Personal site", Icon: ArrowUpRightIcon },
  { href: "https://github.com/arundada9000", label: "GitHub", Icon: GitHubIcon },
  { href: "https://www.linkedin.com/in/arundada9000", label: "LinkedIn", Icon: LinkedInIcon },
  { href: "https://x.com/arundada9000", label: "X", Icon: XIcon },
  { href: "https://www.youtube.com/@arundada9000", label: "YouTube", Icon: YouTubeIcon },
  { href: "https://www.instagram.com/arundada9000/", label: "Instagram", Icon: InstagramIcon },
  { href: "https://wa.me/9779811420975", label: "WhatsApp", Icon: WhatsAppIcon },
];

export function SiteFooter() {
  const top = posts.slice(0, 5);
  return (
    <footer className="relative border-t border-line/60 bg-canvas-deep">
      <div className="mx-auto max-w-6xl px-5 pt-14 sm:px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.2fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" className="group inline-flex items-center gap-2.5 no-select">
              <span className="grid size-8 place-items-center rounded-lg bg-ink text-canvas transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105">
                <MineIcon size={17} />
              </span>
              <span className="flex flex-col justify-center leading-none">
                <span className="font-display text-[15px] font-bold tracking-tight text-ink">Easy Minesweeper</span>
                <span className="mt-1 text-2xs font-medium uppercase tracking-[0.18em] text-ink-muted">{SITE_TAGLINE}</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              A calm, offline-first minesweeper that runs entirely in your browser. Your records,
              streaks, and achievements stay on your own device.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="group/soc grid size-9 place-items-center rounded-full border border-line/70 bg-surface-2 text-ink-soft transition-all duration-200 ease-touch hover:-translate-y-0.5 hover:border-transparent hover:bg-accent hover:text-on-accent hover:shadow-ios focus-visible:outline-none"
                >
                  <Icon
                    size={16}
                    className="transition-transform duration-200 ease-touch group-hover/soc:-rotate-6 group-hover/soc:scale-110"
                  />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Popular guides">
            <h2 className="inline-flex items-center gap-2 text-2xs font-bold uppercase tracking-[0.14em] text-ink-muted">
              <GraduationIcon size={14} />
              Popular guides
            </h2>
            <ul className="mt-4 space-y-2.5">
              {top.map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="group inline-flex items-baseline gap-2 text-sm text-ink-soft transition-colors hover:text-ink">
                    <span className="h-px w-3 self-center bg-line-strong/60 transition-[width] duration-200 group-hover:w-5 group-hover:bg-accent" />
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Site">
            <h2 className="inline-flex items-center gap-2 text-2xs font-bold uppercase tracking-[0.14em] text-ink-muted">
              <GridIcon size={14} />
              Site
            </h2>
            <ul className="mt-4 space-y-2.5">
              {SITE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group inline-flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-ink">
                    <span className="h-px w-3 self-center bg-line-strong/60 transition-[width] duration-200 group-hover:w-5 group-hover:bg-accent" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line/60 pt-6 text-2xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Easy Minesweeper. Built by{" "}
            <a
              href={AUTHOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ink-soft transition-colors hover:text-ink"
            >
              {AUTHOR_NAME}
            </a>
            .
          </p>
          <p>Every record is stored on your device, nowhere else.</p>
        </div>
      </div>
    </footer>
  );
}