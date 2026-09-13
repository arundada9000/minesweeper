"use client";

import { useEffect, useState } from "react";
import { DownloadIcon } from "@/components/ui/icons";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function computeInstallable() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches;
}

/**
 * PWA install pill. Shows its own "Install" affordance only when the browser
 * offers a beforeinstallprompt and the app is not already installed.
 */
export function InstallButton({
  variant = "solid",
  className = "",
}: {
  variant?: "solid" | "ghost";
  className?: string;
}) {
  const [evt, setEvt] = useState<InstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(computeInstallable);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as InstallPromptEvent);
    };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !evt) return null;

  const base =
    "press group inline-flex items-center justify-center gap-2 text-sm font-semibold transition-opacity hover:opacity-90";
  const skin =
    variant === "solid"
      ? "rounded-xl bg-accent px-5 py-3.5 text-on-accent shadow-ios"
      : "rounded-full border border-line bg-surface-2 px-4 py-2 text-ink hover:bg-surface-hover";

  return (
    <button
      type="button"
      aria-label="Install Easy Minesweeper"
      onClick={() => {
        evt.prompt();
        evt.userChoice.finally(() => setEvt(null));
      }}
      className={`${base} ${skin} ${className}`}
    >
      <DownloadIcon size={15} className="transition-transform duration-200 group-active:translate-y-0.5" />
      Install
    </button>
  );
}