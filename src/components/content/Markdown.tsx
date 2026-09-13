/**
 * Markdown-lite renderer for article bodies. Supports the subset of Markdown
 * the guides use: headings, paragraphs, lists, blockquotes, rules, bold,
 * inline code, and links. Zero dependencies, safe by construction (no raw
 * HTML passes through), rendered as server output inside the static export.
 */

import type { ReactNode } from "react";
import Link from "next/link";

function isExternal(href: string) {
  return /^(https?:)?\/\//.test(href);
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\[\[[^\]]+\]\]|\[[^\]]+\]\([^()]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const token = m[0];
    if (token.startsWith("**")) {
      const inner = token.slice(2, -2);
      parts.push(<strong key={`${keyPrefix}-${i++}`}>{renderInline(inner, `${keyPrefix}-${i}`)}</strong>);
    } else if (token.startsWith("[[")) {
      parts.push(
        <code key={`${keyPrefix}-${i++}`} className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[0.9em] text-ink">
          {token.slice(2, -2)}
        </code>
      );
    } else {
      const label = token.slice(1, token.indexOf("]("));
      const href = token.slice(token.indexOf("](") + 2, -1);
      if (href.startsWith("/")) {
        parts.push(
          <Link key={`${keyPrefix}-${i++}`} href={href} className="font-medium text-accent underline decoration-accent-soft underline-offset-2 hover:text-accent-strong">
            {label}
          </Link>
        );
      } else {
        parts.push(
          <a
            key={`${keyPrefix}-${i++}`}
            href={href}
            className="font-medium text-accent underline decoration-accent-soft underline-offset-2 hover:text-accent-strong"
            {...(isExternal(href) ? { rel: "noopener noreferrer", target: "_blank" } : {})}
          >
            {label}
          </a>
        );
      }
    }
    last = m.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

interface Block {
  kind: "h2" | "h3" | "p" | "ul" | "ol" | "quote" | "hr";
  text: string;
  items?: string[];
  ordered?: boolean;
}

function parseBlocks(body: string): Block[] {
  const lines = body.split(/\r?\n/);
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let quote: string[] = [];
  let hr = false;

  const flushPara = () => {
    if (para.length) {
      blocks.push({ kind: "p", text: para.join(" ") });
      para = [];
    }
  };
  const flushList = () => {
    if (list.length && listType) {
      blocks.push({ kind: listType, text: "", items: list, ordered: listType === "ol" });
      list = [];
      listType = null;
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      blocks.push({ kind: "quote", text: quote.join(" ") });
      quote = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^---+$/.test(line.trim())) {
      flushPara();
      flushList();
      flushQuote();
      hr = !hr;
      if (hr) blocks.push({ kind: "hr", text: "" });
      continue;
    }
    if (line.trim() === "") {
      flushPara();
      flushList();
      flushQuote();
      continue;
    }
    if (line.startsWith("### ")) {
      flushPara(); flushList(); flushQuote();
      blocks.push({ kind: "h3", text: line.slice(4).trim() });
      continue;
    }
    if (line.startsWith("## ")) {
      flushPara(); flushList(); flushQuote();
      blocks.push({ kind: "h2", text: line.slice(3).trim() });
      continue;
    }
    if (line.startsWith("> ")) {
      flushPara(); flushList();
      quote.push(line.slice(2).trim());
      continue;
    }
    if (/^[-*] /.test(line)) {
      flushPara(); flushQuote();
      if (listType && listType !== "ul") flushList();
      listType = "ul";
      list.push(line.replace(/^[-*] /, ""));
      continue;
    }
    if (/^\d+\. /.test(line)) {
      flushPara(); flushQuote();
      if (listType && listType !== "ol") flushList();
      listType = "ol";
      list.push(line.replace(/^\d+\. /, ""));
      continue;
    }
    flushList(); flushQuote();
    para.push(line.trim());
  }
  flushPara();
  flushList();
  flushQuote();
  return blocks;
}

export function Markdown({ body }: { body: string }) {
  const blocks = parseBlocks(body);
  return (
    <div className="space-y-6">
      {blocks.map((block, idx) => {
        switch (block.kind) {
          case "h2":
            return (
              <h2 key={idx} className="pt-4 font-display text-2xl font-bold tracking-tight text-ink">
                {renderInline(block.text, `h${idx}`)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={idx} className="pt-2 font-display text-lg font-semibold tracking-tight text-ink">
                {renderInline(block.text, `h${idx}`)}
              </h3>
            );
          case "p":
            return (
              <p key={idx} className="text-[15px] leading-7 text-ink-soft">
                {renderInline(block.text, `p${idx}`)}
              </p>
            );
          case "ul":
          case "ol":
            return block.ordered ? (
              <ol key={idx} className="list-decimal space-y-2 pl-5 text-[15px] leading-7 text-ink-soft marker:text-ink-muted">
                {block.items!.map((item, j) => (
                  <li key={j}>{renderInline(item, `li${idx}-${j}`)}</li>
                ))}
              </ol>
            ) : (
              <ul key={idx} className="list-disc space-y-2 pl-5 text-[15px] leading-7 text-ink-soft marker:text-ink-muted">
                {block.items!.map((item, j) => (
                  <li key={j}>{renderInline(item, `li${idx}-${j}`)}</li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote key={idx} className="border-l-2 border-amber pl-4 text-[15px] italic leading-7 text-ink-soft">
                {renderInline(block.text, `q${idx}`)}
              </blockquote>
            );
          case "hr":
            return <hr key={idx} className="border-line" />;
        }
      })}
    </div>
  );
}