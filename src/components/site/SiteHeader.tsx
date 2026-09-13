import Link from "next/link";
import { MineIcon } from "@/components/ui/icons";
import { ClearMeter } from "./ClearMeter";

const NAV_LINKS = [
  { href: "/blog", label: "Guides" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="glass sticky top-0 z-sticky border-b border-line/50">
      <div className="safe-top mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5 no-select">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink text-canvas transition-transform duration-200 group-hover:scale-105">
            <MineIcon size={17} />
          </span>
          <span className="font-display text-[15px] font-bold tracking-tight text-ink sm:text-base">
            Easy Minesweeper
          </span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="press hidden rounded-full px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink sm:inline-flex"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/play"
            className="press inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent shadow-ios transition-opacity hover:opacity-90"
          >
            Play
          </Link>
        </nav>
      </div>
      <ClearMeter />
    </header>
  );
}