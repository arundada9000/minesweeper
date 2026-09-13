"use client";

import { useEffect, useState } from "react";

/** Scroll progress hairline styled like a cell-clear meter. */
export function ClearMeter() {
  const [p, setP] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
      setReady(true);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!ready}
      role="progressbar"
      aria-label="How much of the page you have read"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(p)}
      className="relative h-[3px] w-full bg-track"
    >
      <div
        className="absolute inset-y-0 left-0 rounded-r-full bg-flag transition-[width] duration-150 ease-out"
        style={{ width: `${p}%` }}
      />
    </div>
  );
}