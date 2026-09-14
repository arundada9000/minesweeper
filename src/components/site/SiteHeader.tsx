"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { MineIcon, PlayIcon } from "@/components/ui/icons";

const NAV_LINKS = [
  { href: "/blog", label: "Guides" },
  { href: "/about", label: "About" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`glass sticky top-0 z-header animate-header-in border-b transition-[border-color,box-shadow] duration-300 ease-touch ${
        scrolled ? "border-line/70 shadow-ios" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="group inline-flex items-center gap-2.5 no-select">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-ink text-canvas transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-105">
            <MineIcon size={17} />
          </span>
          <span className="flex flex-col justify-center leading-none">
            <span className="font-display text-[15px] font-bold tracking-tight text-ink">Easy Minesweeper</span>
            <span className="mt-1 text-2xs font-medium uppercase tracking-[0.18em] text-ink-muted">
              think clearly. clear everything.
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={href}
                href={href}
                className={`relative inline-flex min-h-11 items-center rounded-full px-3 py-1.5 text-sm transition-colors ${
                  active ? "text-ink" : "text-ink-soft hover:text-ink"
                } after:absolute after:inset-x-3 after:-bottom-0.5 after:h-[2px] after:origin-left after:rounded-full after:bg-accent after:transition-transform after:duration-300 ease-touch ${
                  active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
          <Link
            href="/play"
            className="press group/play hidden h-11 items-center gap-1.5 rounded-full bg-accent pl-4 pr-2.5 text-sm font-semibold text-on-accent shadow-ios transition-shadow hover:opacity-95 sm:inline-flex"
          >
            Play
            <span className="grid size-5 place-items-center rounded-full bg-white/15 transition-transform duration-200 group-hover/play:translate-x-0.5">
              <PlayIcon size={11} />
            </span>
          </Link>
          <Link
            href="/play"
            aria-label="Play the game"
            className="press grid size-11 place-items-center rounded-full bg-accent text-on-accent shadow-ios sm:hidden"
          >
            <PlayIcon size={15} />
          </Link>
        </nav>
      </div>
    </header>
  );
}