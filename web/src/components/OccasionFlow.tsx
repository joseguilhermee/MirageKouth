"use client";

import { useEffect, useState } from "react";
import { SpecialInterview } from "./SpecialInterview";
import { OCCASION_QUESTIONS } from "@/lib/occasionQuestions";
import type { QuestionDetail } from "@/lib/questions";

const STORAGE_KEY = "mirage-ocasiao-progress-v1";
const MOMENT_DETAIL: QuestionDetail = { steps: { "0": "qualquer hora" } };
type OccasionState = {
  step: number;
  answers: Record<number, string>;
  details: Record<number, QuestionDetail>;
};

export function OccasionFlow({ name, onBack, onCompleted }: { name: string; onBack: () => void; onCompleted: () => void }) {
  const [state, setState] = useState<OccasionState>({ step: 0, answers: {}, details: {} });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(JSON.parse(raw) as OccasionState);
      }
    } catch { /* segue sem progresso salvo */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* segue sem persistência */ }
  }, [ready, state]);

  if (!ready) return null;
  return <SpecialInterview name={name} label="Ocasião especial" questions={OCCASION_QUESTIONS}
    step={state.step} answers={state.answers} details={state.details}
    detailAt={index => index === 2 ? MOMENT_DETAIL : state.details[index] ?? {}}
    occasion={{ questions: OCCASION_QUESTIONS }}
    onAnswer={(index, value) => setState(prev => ({ ...prev, answers: { ...prev.answers, [index]: value } }))}
    onDetail={(index, detail) => setState(prev => ({ ...prev, details: { ...prev.details, [index]: detail } }))}
    onStep={step => setState(prev => ({ ...prev, step }))}
    onBack={() => state.step === 0 ? onBack() : setState(prev => ({ ...prev, step: prev.step - 1 }))}
    onChoosePurpose={onBack}
    onCompleted={() => { try { localStorage.removeItem(STORAGE_KEY); } catch {} onCompleted(); }} />;
}
