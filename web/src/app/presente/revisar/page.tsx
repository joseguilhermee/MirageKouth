"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { BTN_PRIMARY, DISPLAY, FIELD } from "@/lib/ui";

/** O rascunho chega ao doador após a análise, fora do arquivo de respostas. */
export default function GiftReviewPage() {
  const [perfume, setPerfume] = useState("");
  const [draft, setDraft] = useState("");
  const canPrint = Boolean(perfume.trim() && draft.trim());
  return <div className="min-h-dvh bg-[var(--review-paper)] print:bg-white print:text-black text-ink">
    <div className="print:hidden"><Header /></div>
    <main className="mx-auto max-w-[800px] px-5 py-12 sm:px-10 print:max-w-none print:p-0">
      <div className="print:hidden">
        <h1 className={`${DISPLAY} mb-5 text-[38px] sm:text-5xl`}>Revisar o texto do presente</h1>
        <p className="mb-8 max-w-[60ch] text-lg text-ink-2">Depois da análise, informe o perfume escolhido e cole o rascunho escrito na sua voz. Você pode editar o texto antes de imprimir.</p>
        <label className="block font-display text-xl" htmlFor="gift-perfume">Perfume escolhido</label>
        <input id="gift-perfume" value={perfume} onChange={e => setPerfume(e.target.value)}
          className="kouth-input mb-8 mt-3 w-full text-xl" />
        <label className="block font-display text-xl" htmlFor="gift-draft">Texto para quem vai receber</label>
        <textarea id="gift-draft" value={draft} onChange={e => setDraft(e.target.value)} rows={14}
          className={`${FIELD} mt-3 min-h-64 border-line-strong focus:border-terra`} />
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <button type="button" disabled={!canPrint} onClick={() => window.print()} className={BTN_PRIMARY}>Imprimir texto</button>
        </div>
      </div>
      {canPrint && <article className="mt-12 whitespace-pre-wrap font-display text-xl leading-relaxed print:mt-0"><h2 className="mb-8 text-3xl font-semibold">{perfume.trim()}</h2>{draft}</article>}
    </main>
  </div>;
}
