import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BackToTop } from "@/components/site/BackToTop";

/**
 * Site chrome around content pages (landing, blog, about, privacy).
 * The game at /play bypasses this shell so it keeps its own app frame.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas pb-[env(safe-area-inset-bottom)]">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <BackToTop />
    </div>
  );
}