import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { inlineTokenScript } from "@/components/game/inlineTokens";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, AUTHOR_NAME, AUTHOR_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Easy Minesweeper - think clearly, clear everything", template: "%s | Easy Minesweeper" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: AUTHOR_NAME, url: AUTHOR_URL }],
  creator: AUTHOR_NAME,
  publisher: AUTHOR_NAME,
  category: "games",
  keywords: ["minesweeper", "puzzle", "game", "offline", "pwa", "mines", "logic puzzle", "daily puzzle", "no-guess minesweeper"],
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: "Easy Minesweeper - think clearly, clear everything",
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Easy Minesweeper mine emblem on dark ink" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Easy Minesweeper - think clearly, clear everything",
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f2f7" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function Home({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="paper" data-accent="auto" data-font="system" data-density="cozy" data-scale="regular" suppressHydrationWarning={true}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: SITE_NAME,
              url: SITE_URL,
              description: SITE_DESCRIPTION,
              applicationCategory: "GameApplication",
              operatingSystem: "Any",
              browserRequirements: "Requires a modern web browser",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD", availability: "https://schema.org/InStock" },
              creator: { "@type": "Person", name: AUTHOR_NAME, url: AUTHOR_URL },
            }),
          }}
        />
      </head>
      <body>
        {/* Direction: the incumbent minesweeper world is extended outward, not replaced. Root `/` is the Field Map landing (seed key 4ad95c77): a cleared field as map, number glyphs as section markers, contour terrain. The game stays pristine at /play inside its own app frame (no site chrome, no ads). Plot: every page reads as part of the minefield, guides teach the real mechanics, records stay on-device. Finish line: game is untouched; marketing pages feel like the product, not like a template. */}
        <script dangerouslySetInnerHTML={{ __html: inlineTokenScript }} />
        {children}
      </body>
    </html>
  );
}