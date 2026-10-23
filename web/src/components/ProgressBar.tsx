/** Progresso discreto e legível, sem apressar a conversa. */
export function ProgressBar({ current, total }: { current: number; total: number }) {
  const done = Math.min(current, total);
  return <footer className="kouth-progress" style={done >= total ? { position: "static" } : undefined}>
    <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-10 lg:px-16">
      <div className="mb-3 flex items-center justify-between gap-4 text-xs text-ink-2 sm:text-sm">
        <span className="tabular-nums">{done >= total ? "Conversa concluída" : <>Pergunta <strong className="font-medium text-ink">{String(current + 1).padStart(2, "0")}</strong> de {total}</>}</span>
        <span>{done >= total ? "Pronta para o próximo passo." : "No seu tempo."}</span>
      </div>
      <div role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total} aria-label="Progresso do questionário" className="h-0.5 overflow-hidden bg-line">
        <div className="h-full bg-action transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${done / total * 100}%` }} />
      </div>
    </div>
  </footer>;
}
