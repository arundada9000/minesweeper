import { SITE_URL, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { Reveal } from "@/components/site/Reveal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    `How Easy Minesweeper handles data: almost none. Everything stays on your device. ${SITE_TAGLINE}`,
  alternates: { canonical: `${SITE_URL}/privacy-policy/` },
  openGraph: {
    type: "website",
    title: "Privacy Policy - Easy Minesweeper",
    description: `How Easy Minesweeper handles data: almost none. Everything stays on your device. ${SITE_TAGLINE}`,
    siteName: SITE_NAME,
    images: [`${SITE_URL}/og.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy - Easy Minesweeper",
    description: `How Easy Minesweeper handles data: almost none. Everything stays on your device. ${SITE_TAGLINE}`,
    images: [`${SITE_URL}/og.png`],
  },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Privacy Policy" },
            ],
          }),
        }}
      />
      <Reveal onMount>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line/60 bg-surface-2/70 px-3 py-1 text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">
          <span className="grid size-3.5 place-items-center rounded-[3px] border border-line bg-cell-revealed text-[9px] font-bold text-num-6">6</span>
          Privacy
        </div>

        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">Privacy Policy</h1>
        <p className="mt-3 text-ink-muted">Last updated: September 2026</p>
      </Reveal>

      <Reveal y={16} className="mt-10">
        <div className="space-y-4 text-[15px] leading-7 text-ink-soft">
          <section className="rounded-2xl border border-line/60 bg-surface-2/70 p-6 shadow-ios">
            <p>
              The short version: Easy Minesweeper collects almost nothing, and everything
              it does store lives on your own device. This policy explains that in full.
            </p>
          </section>

          <section className="rounded-2xl border border-line/60 bg-surface-2/70 p-6 shadow-ios">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              1. What we store on your device
            </h2>
            <p className="mt-3">
              The game stores its state locally in your browser: theme and accent preferences,
              sound and vibration settings, your personal bests, your daily streak, and your
              achievements. This data never leaves your device and is used only to make the game
              feel continuous when you come back. Clearing your browser data for this site removes it.
            </p>
          </section>

          <section className="rounded-2xl border border-line/60 bg-surface-2/70 p-6 shadow-ios">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              2. What we store off your device
            </h2>
            <p className="mt-3">
              Nothing. There is no account, no sign-in, no server receiving your gameplay, and no
              telemetry. The daily board is derived from the date and a public seed, so no personal
              data is needed to play it.
            </p>
          </section>

          <section className="rounded-2xl border border-line/60 bg-surface-2/70 p-6 shadow-ios">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              3. Networking
            </h2>
            <p className="mt-3">
              The site is served over HTTPS from a static export. Once the game's essential files are
              loaded, the whole puzzle works offline with no network access at all. The guides and the
              game share one site; reading a guide never triggers tracking we control.
            </p>
          </section>

          <section className="rounded-2xl border border-line/60 bg-surface-2/70 p-6 shadow-ios">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              4. Advertising
            </h2>
            <p className="mt-3">
              The landing page and the guide pages reserve a future slot for partner advertising. If a
              partner network is ever added, this policy will be updated to name it, and the game page
              will remain free of advertisements.
            </p>
          </section>

          <section className="rounded-2xl border border-line/60 bg-surface-2/70 p-6 shadow-ios">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              5. Links to other sites
            </h2>
            <p className="mt-3">
              Guides sometimes link to external sources for historical reading. This policy applies only
              to this site; we are not responsible for the privacy practices of sites we link to.
            </p>
          </section>

          <section className="rounded-2xl border border-line/60 bg-surface-2/70 p-6 shadow-ios">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              6. Changes
            </h2>
            <p className="mt-3">
              If this policy ever changes, the date at the top updates and the change will be visible
              in the site's public history. We will not start collecting personal data without a clear,
              visible notice.
            </p>
          </section>

          <section className="rounded-2xl border border-line/60 bg-surface-2/70 p-6 shadow-ios">
            <h2 className="font-display text-xl font-bold tracking-tight text-ink">
              7. Contact
            </h2>
            <p className="mt-3">
              Easy Minesweeper is made by Arun Neupane. For privacy questions or anything else, open a
              conversation through the project's public repository page.
            </p>
          </section>
        </div>
      </Reveal>
    </div>
  );
}