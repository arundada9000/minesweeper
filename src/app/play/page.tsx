import { GameScreen } from "@/components/game/GameScreen";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play Minesweeper",
  description: SITE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/play/` },
  openGraph: {
    type: "website",
    title: "Play Minesweeper - Easy Minesweeper",
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: "Easy Minesweeper mine emblem on dark ink" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Play Minesweeper - Easy Minesweeper",
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og.png`],
  },
};

export default function PlayPage() {
  return <GameScreen />;
}