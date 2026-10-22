/**
 * O horizonte: a faixa de terra roxa presa no pé da tela, com um marco por
 * pergunta e o sol parado na pergunta atual. Junto com o céu (SkyShell), diz
 * quanto da tarde já passou. Quando todas foram respondidas, o sol se põe.
 */
export function ProgressBar({ current, total }: { current: number; total: number }) {
  const done = Math.min(current, total);
  const finished = current >= total;
  const sunAt = total > 1 ? Math.min(current, total - 1) / (total - 1) : 0;
  const left = total - done;

  return (
    <>
      <div aria-hidden className="h-10 sm:h-14" />
      <div className="sticky bottom-0 z-30 mt-auto bg-terra text-terra-ink">
        <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-10 lg:px-16">
          <div
            role="progressbar"
            aria-valuenow={done}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label="Progresso do questionário"
            className="relative h-3"
          >
            {Array.from({ length: total }).map((_, i) => (
              <span
                key={i}
                className={`absolute top-0 w-[2px] -translate-x-1/2 rounded-b-full bg-terra-ink transition-[height,opacity] duration-700 ${
                  i < done ? "h-3 opacity-90" : "h-1.5 opacity-35"
                }`}
                style={{ left: `${total > 1 ? (i / (total - 1)) * 100 : 0}%` }}
              />
            ))}
            <span
              aria-hidden
              className="sun-marker absolute top-0 h-5 w-5 -translate-x-1/2 rounded-full bg-sun ring-2 ring-terra transition-[left,transform,opacity] duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                left: `${sunAt * 100}%`,
                // Sentado na linha do horizonte; ao terminar, desce atrás dela.
                transform: finished ? "translate(-50%, 40%)" : "translate(-50%, -50%)",
                opacity: finished ? 0 : 1,
              }}
            />
          </div>
          <div className="flex h-10 items-center justify-between text-sm sm:h-12">
            <span className="font-display text-base font-semibold tabular-nums sm:text-lg">
              {finished ? total : String(current + 1).padStart(2, "0")}
              <span className="opacity-60"> / {total}</span>
            </span>
            <span className="opacity-85">
              {left === 0
                ? "Todas respondidas"
                : left === 1
                  ? "Falta 1 pergunta"
                  : `Faltam ${left} perguntas`}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
