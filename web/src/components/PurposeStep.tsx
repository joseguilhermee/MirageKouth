"use client";

import { BTN_GHOST, BTN_PRIMARY, DISPLAY } from "@/lib/ui";

export type Purpose = "para_mim" | "presente" | "ocasiao" | "quem_quero_ser";

export function PurposeStep({ value, onChange, onNext, onBack }: {
  value: Purpose | null; onChange: (value: Purpose) => void; onNext: () => void; onBack: () => void;
}) {
  const options: { title: string; subtitle?: string; value?: Purpose }[] = [
    { title: "Para mim", subtitle: "a minha personalidade", value: "para_mim" },
    { title: "Para quem eu quero ser", value: "quem_quero_ser" },
    { title: "Para uma ocasião especial", value: "ocasiao" },
    { title: "Para presente", value: "presente" },
  ];
  return <div className="flex flex-col">
    <h1 className={`${DISPLAY} mb-8 text-[38px] sm:text-6xl`}>Para quem é esse perfume?</h1>
    <div role="radiogroup" aria-label="Finalidade do perfume" className="grid gap-3">
      {options.map(o => <button key={o.title} type="button" role="radio" aria-checked={o.value ? value === o.value : false}
        disabled={!o.value} onClick={() => o.value && onChange(o.value)}
        className="kouth-purpose text-ink hover:text-brand">
        <span><strong className="block font-display text-[25px] font-normal">{o.title}</strong>{o.subtitle && <span className="mt-1 block text-sm text-ink-3">{o.subtitle}</span>}</span>
        <span aria-hidden="true" className="kouth-purpose-indicator" />
      </button>)}
    </div>
    <div className="mt-9 flex gap-3"><button type="button" onClick={onBack} className={BTN_GHOST}>Voltar</button><button type="button" disabled={!value} onClick={onNext} className={BTN_PRIMARY}>Continuar</button></div>
  </div>;
}
