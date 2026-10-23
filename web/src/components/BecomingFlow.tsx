"use client";

import { useEffect, useState } from "react";
import { Header } from "./Header";
import { SkyShell } from "./SkyShell";
import { SpecialInterview } from "./SpecialInterview";
import { becomingQuestions } from "@/lib/becomingQuestions";
import type { QuestionDetail } from "@/lib/questions";
import { BTN_GHOST, BTN_PRIMARY, DISPLAY } from "@/lib/ui";

const STORAGE_KEY = "mirage-quem-progress-v1";
type BecomingState = {
  step: number;
  answers: Record<number, string>;
  details: Record<number, QuestionDetail>;
};

export function BecomingFlow({ name, onBack, onCompleted }: { name: string; onBack: () => void; onCompleted: () => void }) {
  const [state, setState] = useState<BecomingState>({ step: -1, answers: {}, details: {} });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(JSON.parse(raw) as BecomingState);
      }
    } catch { /* segue sem progresso salvo */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* segue sem persistência */ }
  }, [ready, state]);

  if (!ready) return null;
  const horizon = state.details[0]?.steps?.["0"] || "";
  const questions = becomingQuestions(horizon);
  if (state.step < 0) return <SkyShell progress={0}><Header /><main className="mx-auto flex w-full max-w-[760px] flex-1 flex-col justify-center px-5 py-12 sm:px-10">
    <p className="mb-6 text-sm text-ink-2">Para quem eu quero ser · cerca de 25 a 35 minutos</p>
    <h1 className={`${DISPLAY} mb-8 max-w-[22ch] text-[34px] leading-tight sm:text-[48px]`}>Aqui não tem resposta certa.</h1>
    <p className="mb-10 max-w-[52ch] text-lg leading-relaxed text-ink-2">Responda o que for verdade, mesmo que não seja bonito — é isso que faz o perfume ser seu.</p>
    <div className="flex gap-3"><button type="button" onClick={onBack} className={BTN_GHOST}>Voltar</button><button type="button" onClick={() => setState(prev => ({ ...prev, step: 0 }))} className={BTN_PRIMARY}>Começar</button></div>
  </main></SkyShell>;

  return <SpecialInterview name={name} label="Para quem eu quero ser" questions={questions}
    step={state.step} answers={state.answers} details={state.details} becoming={{ questions }}
    onAnswer={(index, value) => setState(prev => ({ ...prev, answers: { ...prev.answers, [index]: value } }))}
    onDetail={(index, detail) => setState(prev => ({ ...prev, details: { ...prev.details, [index]: detail } }))}
    onStep={step => setState(prev => ({ ...prev, step }))}
    onBack={() => setState(prev => ({ ...prev, step: prev.step - 1 }))}
    onCompleted={() => { try { localStorage.removeItem(STORAGE_KEY); } catch {} onCompleted(); }} />;
}
