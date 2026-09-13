import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GameScreen } from "@/components/game/GameScreen";
import { inlineTokenScript } from "@/components/game/inlineTokens";

export const metadata: Metadata = {
  title: "SweeperMine",
  description: "Think clearly. Clear everything. A calm, local-first minesweeper.",
  applicationName: "SweeperMine",
  authors: [{ name: "Arun Neupane", url: "https://github.com/arundada9000" }],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.ico", sizes: "any" }],
    apple: "/apple-touch-icon.png",
  },
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
      <body>
        <script dangerouslySetInnerHTML={{ __html: inlineTokenScript }} />
        <GameScreen />
      </body>
    </html>
  );
}