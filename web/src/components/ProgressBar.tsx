export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.min(100, Math.max(0, Math.round((current / total) * 100)));

  return (
    <div className="w-full">
      <div
        role="progressbar"
        aria-valuenow={Math.min(current, total)}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Progresso do questionário"
        className="relative h-px w-full bg-border"
      >
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-2 to-accent transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-[left] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ left: `${pct}%` }}
        >
          <span className="absolute inset-0 -m-2 rounded-full bg-accent/40 blur-md" />
          <svg
            viewBox="0 0 24 24"
            className="relative h-3 w-3 fill-accent drop-shadow-[0_0_6px_var(--accent)]"
          >
            <path d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z" />
          </svg>
        </div>
      </div>
      <div className="mt-3 flex justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
        <span>Travessia</span>
        <span>
          {Math.min(current, total)} / {total}
        </span>
      </div>
    </div>
  );
}
