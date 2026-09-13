import type { ArticleMeta } from "./types";
import { meta as howToPlayMeta, body as howToPlayBody } from "./articles/how-to-play";
import { meta as beginnerMeta, body as beginnerBody } from "./articles/beginner-strategy";
import { meta as patternsMeta, body as patternsBody } from "./articles/number-patterns";
import { meta as noGuessMeta, body as noGuessBody } from "./articles/no-guess-mode";
import { meta as speedMeta, body as speedBody } from "./articles/speed-techniques";
import { meta as bvMeta, body as bvBody } from "./articles/3bv-and-good-times";
import { meta as zenMeta, body as zenBody } from "./articles/zen-mode";
import { meta as rushMeta, body as rushBody } from "./articles/rush-mode-guide";
import { meta as dailyMeta, body as dailyBody } from "./articles/daily-challenge";
import { meta as practiceMeta, body as practiceBody } from "./articles/practice-mode";
import { meta as customMeta, body as customBody } from "./articles/custom-boards";
import { meta as probabilityMeta, body as probabilityBody } from "./articles/probability-and-guessing";
import { meta as speedrunMeta, body as speedrunBody } from "./articles/speedrunning";
import { meta as mobileMeta, body as mobileBody } from "./articles/mobile";
import { meta as glossaryMeta, body as glossaryBody } from "./articles/glossary";
import { meta as historyMeta, body as historyBody } from "./articles/history";

export interface Post extends ArticleMeta {
  slug: string;
  minutes: number;
  body: string;
}

function minutes(body: string): number {
  return Math.max(1, Math.round(body.trim().split(/\s+/).length / 210));
}

function post(slug: string, meta: ArticleMeta, body: string): Post {
  return { slug, ...meta, body, minutes: minutes(body) };
}

const ORDER = [
  "how-to-play-minesweeper",
  "minesweeper-strategy-for-beginners",
  "minesweeper-number-patterns",
  "no-guess-mode",
  "minesweeper-speed-techniques",
  "minesweeper-3bv-and-good-times",
  "zen-mode",
  "rush-mode-guide-and-tips",
  "daily-minesweeper-challenge",
  "practice-mode-and-smart-hints",
  "custom-minesweeper-boards",
  "minesweeper-probability-and-guessing",
  "speedrun-minesweeper-records",
  "play-minesweeper-on-mobile",
  "minesweeper-glossary",
  "brief-history-of-minesweeper",
];

const entry: Record<string, Post> = {
  "how-to-play-minesweeper": post("how-to-play-minesweeper", howToPlayMeta, howToPlayBody),
  "minesweeper-strategy-for-beginners": post("minesweeper-strategy-for-beginners", beginnerMeta, beginnerBody),
  "minesweeper-number-patterns": post("minesweeper-number-patterns", patternsMeta, patternsBody),
  "no-guess-mode": post("no-guess-mode", noGuessMeta, noGuessBody),
  "minesweeper-speed-techniques": post("minesweeper-speed-techniques", speedMeta, speedBody),
  "minesweeper-3bv-and-good-times": post("minesweeper-3bv-and-good-times", bvMeta, bvBody),
  "zen-mode": post("zen-mode", zenMeta, zenBody),
  "rush-mode-guide-and-tips": post("rush-mode-guide-and-tips", rushMeta, rushBody),
  "daily-minesweeper-challenge": post("daily-minesweeper-challenge", dailyMeta, dailyBody),
  "practice-mode-and-smart-hints": post("practice-mode-and-smart-hints", practiceMeta, practiceBody),
  "custom-minesweeper-boards": post("custom-minesweeper-boards", customMeta, customBody),
  "minesweeper-probability-and-guessing": post("minesweeper-probability-and-guessing", probabilityMeta, probabilityBody),
  "speedrun-minesweeper-records": post("speedrun-minesweeper-records", speedrunMeta, speedrunBody),
  "play-minesweeper-on-mobile": post("play-minesweeper-on-mobile", mobileMeta, mobileBody),
  "minesweeper-glossary": post("minesweeper-glossary", glossaryMeta, glossaryBody),
  "brief-history-of-minesweeper": post("brief-history-of-minesweeper", historyMeta, historyBody),
};

export const posts: Post[] = ORDER.map((slug) => entry[slug]);