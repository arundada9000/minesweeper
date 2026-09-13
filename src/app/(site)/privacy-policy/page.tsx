import { SITE_URL, SITE_TAGLINE } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    `How Easy Minesweeper handles data: almost none. Everything stays on your device. ${SITE_TAGLINE}`,
  alternates: { canonical: `${SITE_URL}/privacy-policy/` },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-24 pt-12 sm:px-6">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-line/60 bg-surface-2/70 px-3 py-1 text-2xs font-bold uppercase tracking-[0.16em] text-ink-muted">
        <span className="grid size-3.5 place-items-center rounded-[3px] border border-line bg-cell-revealed text-[9px] font-bold text-num-6">6</span>
        Privacy
      </div>

      <h1 className="font-display text-4xl font-bold tracking-tight text-ink">Privacy Policy</h1>
      <p className="mt-3 text-ink-muted">Last updated: September 2026</p>

      <div className="mt-10 space-y-6 text-[15px] leading-7 text-ink-soft">
        <p>
          The short version: Easy Minesweeper collects almost nothing, and everything
          it does store lives on your own device. This policy explains that in full.
        </p>

        <h2 className="pt-4 font-display text-xl font-bold tracking-tight text-ink">
          1. What we store on your device
        </h2>
        <p>
          The game stores its state locally in your browser: theme and accent preferences,
          sound and vibration settings, your personal bests, your daily streak, and your
          achievements. This data never leaves your device and is used only to make the game
          feel continuous when you come back. Clearing your browser data for this site removes it.
        </p>

        <h2 className="pt-4 font-display text-xl font-bold tracking-tight text-ink">
          2. What we store off your device
        </h2>
        <p>
          Nothing. There is no account, no sign-in, no server receiving your gameplay, and no
          telemetry. The daily board is derived from the date and a public seed, so no personal
          data is needed to play it.
        </p>

        <h2 className="pt-4 font-display text-xl font-bold tracking-tight text-ink">
          3. Networking
        </h2>
        <p>
          The site is served over HTTPS from a static export. Once the game's essential files are
          loaded, the whole puzzle works offline with no network access at all. The guides and the
          game share one site; reading a guide never triggers tracking we control.
        </p>

        <h2 className="pt-4 font-display text-xl font-bold tracking-tight text-ink">
          4. Advertising
        </h2>
        <p>
          The landing page and the guide pages reserve a future slot for partner advertising. If a
          partner network is ever added, this policy will be updated to name it, and the game page
          will remain free of advertisements.
        </p>

        <h2 className="pt-4 font-display text-xl font-bold tracking-tight text-ink">
          5. Links to other sites
        </h2>
        <p>
          Guides sometimes link to external sources for historical reading. This policy applies only
          to this site; we are not responsible for the privacy practices of sites we link to.
        </p>

        <h2 className="pt-4 font-display text-xl font-bold tracking-tight text-ink">
          6. Changes
        </h2>
        <p>
          If this policy ever changes, the date at the top updates and the change will be visible
          in the site's public history. We will not start collecting personal data without a clear,
          visible notice.
        </p>

        <h2 className="pt-4 font-display text-xl font-bold tracking-tight text-ink">
          7. Contact
        </h2>
        <p>
          Easy Minesweeper is made by Arun Neupane. For privacy questions or anything else, open a
          conversation through the project's public repository page.
        </p>
      </div>
    </div>
  );
}