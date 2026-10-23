"use client";

import { useEffect, useRef } from "react";
import { BTN_GHOST, DISPLAY } from "@/lib/ui";
import { ArrowRight } from "./Glyphs";

export type Purpose = "para_mim" | "presente" | "ocasiao" | "quem_quero_ser";

export function PurposeStep({ onSelect, onBack }: {
  onSelect: (value: Purpose) => void; onBack: () => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); heading.current?.focus({ preventScroll: true }); }, []);
  const options: { title: string; subtitle?: string; value?: Purpose }[] = [
    { title: "Para mim", subtitle: "a minha personalidade", value: "para_mim" },
    { title: "Para quem eu quero ser", value: "quem_quero_ser" },
    { title: "Para uma ocasião especial", value: "ocasiao" },
    { title: "Para presente", value: "presente" },
  ];
  return <div className="flex flex-col">
    <h1 ref={heading} tabIndex={-1} style={{ outline: "none" }} className={`${DISPLAY} mb-8 text-[38px] sm:text-6xl`}>Para quem é esse perfume?</h1>
    <nav aria-label="Finalidade do perfume" className="grid gap-3">
      {options.map(o => <button key={o.title} type="button" aria-label={o.title}
        disabled={!o.value} onClick={() => o.value && onSelect(o.value)}
        className="kouth-purpose text-ink hover:text-brand">
        <span><strong className="block font-display text-[25px] font-normal">{o.title}</strong>{o.subtitle && <span className="mt-1 block text-sm text-ink-3">{o.subtitle}</span>}</span>
        <span aria-hidden="true" className="kouth-purpose-arrow"><ArrowRight /></span>
      </button>)}
    </nav>
    <div className="mt-9 flex gap-3"><button type="button" onClick={onBack} className={BTN_GHOST}>Voltar</button></div>
  </div>;
}
