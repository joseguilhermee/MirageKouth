"use client";

import { useEffect, useState } from "react";
import { SpecialInterview } from "./SpecialInterview";
import { becomingQuestions } from "@/lib/becomingQuestions";
import type { QuestionDetail } from "@/lib/questions";

const STORAGE_KEY = "mirage-quem-progress-v1";
type BecomingState = {
  step: number;
  answers: Record<number, string>;
  details: Record<number, QuestionDetail>;
};

export function BecomingFlow({ name, onBack, onCompleted }: { name: string; onBack: () => void; onCompleted: () => void }) {
  const [state, setState] = useState<BecomingState>({ step: 0, answers: {}, details: {} });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as BecomingState;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState({ ...saved, step: Math.max(0, saved.step ?? 0) });
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

  return <SpecialInterview name={name} label="Para quem eu quero ser" questions={questions}
    step={state.step} answers={state.answers} details={state.details} becoming={{ questions }}
    onAnswer={(index, value) => setState(prev => ({ ...prev, answers: { ...prev.answers, [index]: value } }))}
    onDetail={(index, detail) => setState(prev => ({ ...prev, details: { ...prev.details, [index]: detail } }))}
    onStep={step => setState(prev => ({ ...prev, step }))}
    onBack={() => setState(prev => ({ ...prev, step: Math.max(0, prev.step - 1) }))}
    onChoosePurpose={onBack}
    onCompleted={() => { try { localStorage.removeItem(STORAGE_KEY); } catch {} onCompleted(); }} />;
}
