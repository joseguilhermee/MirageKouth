// Teclas e setas desenhadas, no mesmo traço dos ícones da barra do topo,
// em vez de caracteres ↵ e → que mudam de forma em cada fonte.

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="rounded-md border border-line-strong bg-[var(--kbd)] px-1.5 py-0.5 font-sans text-[12px] font-medium text-ink-2">
      {children}
    </kbd>
  );
}

export function ArrowRight({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className} aria-hidden>
      <path d="M5 12h14m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
