"use client";

import { useSyncExternalStore } from "react";
import { chooseTheme, currentTheme, subscribeTheme } from "@/lib/theme";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribeTheme, currentTheme, () => "dark");
  const dark = theme === "dark";
  return (
    <button type="button" role="switch" aria-label="Tema escuro" aria-checked={dark}
      title={dark ? "Ativar tema claro" : "Ativar tema escuro"}
      onClick={() => chooseTheme(dark ? "light" : "dark")}
      className={`inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-full border border-line-strong px-2.5 py-2 text-xs text-ink-2 transition-colors hover:bg-terra-wash hover:text-ink sm:px-3 ${className}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-4 w-4" aria-hidden>
        {dark ? <path d="M20.5 13.3A8.5 8.5 0 0 1 10.7 3.5 8.5 8.5 0 1 0 20.5 13.3Z" strokeLinecap="round" strokeLinejoin="round" /> : <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" strokeLinecap="round" />
        </>}
      </svg>
      <span className="hidden sm:inline">{dark ? "Escuro" : "Claro"}</span>
    </button>
  );
}
