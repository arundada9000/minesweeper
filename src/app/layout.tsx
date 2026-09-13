import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GameScreen } from "@/components/game/GameScreen";
import { inlineTokenScript } from "@/components/game/inlineTokens";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, AUTHOR_NAME, AUTHOR_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "SweeperMine - think clearly, clear everything", template: "%s | SweeperMine" },
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
    title: "SweeperMine - think clearly, clear everything",
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "SweeperMine mine emblem on dark ink" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SweeperMine - think clearly, clear everything",
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

export default function Home() {
  return (
    <html lang="en" data-theme="paper" data-accent="auto" data-font="system" data-density="cozy" data-scale="regular">
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
        <script dangerouslySetInnerHTML={{ __html: inlineTokenScript }} />
        <GameScreen />
      </body>
    </html>
  );
}