"use client";

import { useEffect, useState } from "react";
import { Header } from "./Header";
import { SkyShell } from "./SkyShell";
import { SpecialInterview } from "./SpecialInterview";
import { FAMILY_ROLES, GIFT_TIMES, giftQuestions, type GiftInfo } from "@/lib/giftQuestions";
import type { QuestionDetail } from "@/lib/questions";
import { BTN_GHOST, BTN_PRIMARY, DISPLAY, PILL, PILL_OFF, PILL_ON } from "@/lib/ui";

const KEY = "mirage-presente-progress-v1";
type SetupKey = "relacao" | "nome" | "pronome" | "papel" | "papelOutro" | "tempo" | "assinatura";
type GiftState = {
  setup: number;
  question: number;
  values: Partial<GiftInfo> & { papelOutro?: string };
  answers: Record<number, string>;
  details: Record<number, QuestionDetail>;
};

export function GiftFlow({ donor, onBack, onCompleted }: { donor: string; onBack: () => void; onCompleted: () => void }) {
  const [state, setState] = useState<GiftState>({ setup: 0, question: -1, values: { assinatura: donor }, answers: {}, details: {} });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw) as GiftState;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(saved);
      }
    } catch { /* progresso local indisponível */ }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* segue sem persistência */ }
  }, [ready, state]);

  const { values, answers, details } = state;
  const setupKeys: SetupKey[] = ["relacao", "nome", "pronome", ...(values.relacao === "familia" ? ["papel" as const] : []), ...(values.relacao === "familia" && values.papel === "outro" ? ["papelOutro" as const] : []), "tempo", "assinatura"];
  const info: GiftInfo = {
    relacao: values.relacao || "amigo", nome: values.nome || "", pronome: values.pronome || "neutro",
    ...(values.relacao === "familia" ? { papel: values.papel === "outro" ? values.papelOutro?.trim() : values.papel } : {}),
    tempo: values.tempo || "", assinatura: values.assinatura || "",
  };
  const questions = giftQuestions(info);
  const setupDone = state.question >= 0;

  function setValue(key: SetupKey, value: string) {
    setState(prev => ({ ...prev, values: { ...prev.values, [key]: value } }));
  }
  function nextSetup() {
    const key = setupKeys[state.setup];
    const value = String(values[key] || "").trim();
    if (!value) return;
    if (state.setup === setupKeys.length - 1) setState(prev => ({ ...prev, question: 0 }));
    else setState(prev => ({ ...prev, setup: prev.setup + 1 }));
  }
  function backSetup() {
    if (state.setup === 0) onBack();
    else setState(prev => ({ ...prev, setup: prev.setup - 1 }));
  }
  if (!ready) return null;
  if (!setupDone) {
    const key = setupKeys[state.setup];
    const nome = values.nome?.trim() || "essa pessoa";
    const labels: Record<SetupKey, string> = {
      relacao: "O presente é para…", nome: "Como você chama essa pessoa?",
      pronome: `Como você se refere a ${nome}?`, papel: `Quem ${nome} é pra você?`,
      papelOutro: "Qual?", tempo: "Há quanto tempo vocês se conhecem?", assinatura: "Como você quer assinar?",
    };
    const options: Partial<Record<SetupKey, { label: string; value: string }[]>> = {
      relacao: [{ label: "Amigo(a)", value: "amigo" }, { label: "Família", value: "familia" }, { label: "Amor", value: "amor" }],
      pronome: [{ label: "ele", value: "ele" }, { label: "ela", value: "ela" }, { label: "prefiro não definir", value: "neutro" }],
      papel: FAMILY_ROLES.map(v => ({ label: v, value: v })),
      tempo: GIFT_TIMES.map(v => ({ label: v, value: v })),
    };
    return <SkyShell progress={0}><Header /><main className="mx-auto w-full max-w-[760px] flex-1 px-5 py-12 sm:px-10">
      <p className="mb-5 text-sm text-ink-2">Modo Presente · abertura</p>
      <h1 className={`${DISPLAY} mb-8 text-[34px] sm:text-[42px]`}>{labels[key]}</h1>
      {options[key] ? <div role="radiogroup" aria-label={labels[key]} className="flex flex-wrap gap-3">
        {options[key].map(o => <button key={o.value} type="button" role="radio" aria-checked={values[key] === o.value} onClick={() => setValue(key, o.value)} className={`${PILL} ${values[key] === o.value ? PILL_ON : PILL_OFF}`}>{o.label}</button>)}
      </div> : <input autoFocus aria-label={labels[key]} value={String(values[key] || "")} onChange={e => setValue(key, e.target.value)} onKeyDown={e => { if (e.key === "Enter") nextSetup(); }} className="kouth-input w-full text-xl" />}
      <div className="mt-10 flex gap-3"><button type="button" onClick={backSetup} className={BTN_GHOST}>Voltar</button><button type="button" onClick={nextSetup} disabled={!String(values[key] || "").trim()} className={BTN_PRIMARY}>Continuar</button></div>
    </main></SkyShell>;
  }
  return <SpecialInterview name={donor} label="Modo Presente" questions={questions}
    step={state.question} answers={answers} details={details} gift={{ info, questions }}
    onAnswer={(index, value) => setState(prev => ({ ...prev, answers: { ...prev.answers, [index]: value } }))}
    onDetail={(index, detail) => setState(prev => ({ ...prev, details: { ...prev.details, [index]: detail } }))}
    onStep={question => setState(prev => ({ ...prev, question }))}
    onBack={() => setState(prev => ({ ...prev, question: prev.question === 0 ? -1 : prev.question - 1, setup: prev.question === 0 ? setupKeys.length - 1 : prev.setup }))}
    onCompleted={() => { try { localStorage.removeItem(KEY); } catch {} onCompleted(); }} />;
}
