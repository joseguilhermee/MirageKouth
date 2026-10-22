"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAutoGrowTextarea } from "@/lib/useAutoGrowTextarea";
import { ENTER_TRANSITION, EXIT_TRANSITION } from "@/lib/motion";
import {
  MIN_MAIN_CHARS,
  setStepValue,
  shownSteps,
  type Question,
  type QuestionDetail,
  type ShownStep,
} from "@/lib/questions";

const PILL = "px-4 py-2 rounded-full border text-sm transition";
const PILL_ON = "border-accent bg-accent/15 text-foreground";
const PILL_OFF = "border-border text-foreground/70 hover:border-muted";

export function QuestionCard({
  index,
  total,
  question,
  value,
  onChange,
  detail,
  onDetailChange,
  onNext,
  onBack,
}: {
  index: number;
  total: number;
  question: Question;
  value: string;
  onChange: (value: string) => void;
  detail: QuestionDetail;
  onDetailChange: (detail: QuestionDetail) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const textareaRef = useAutoGrowTextarea(value);
  const [triedToAdvance, setTriedToAdvance] = useState(false);
  // Só o passo aberto por um clique de botão ganha foco: o que aparece
  // enquanto a pessoa ainda digita a principal não pode roubar o cursor.
  const [focusAfterClick, setFocusAfterClick] = useState(false);

  // Resposta em branco não é "sem dado": pelo §AUSÊNCIA do protocolo, itens
  // vazios derrubam a confiança do perfil inteiro. Por isso tudo o que aparece
  // é obrigatório; "nunca aconteceu" já conta como resposta.
  const mainOk = value.trim().length >= MIN_MAIN_CHARS;
  const { shown, complete } = shownSteps(question, value, detail);
  const firstOpen = shown.find((s) => !s.answered)?.key;
  // Derivado, não sincronizado por efeito: o aviso some sozinho assim que a
  // resposta fica longa o bastante, e volta se ela for apagada de novo.
  const blocked = triedToAdvance && !mainOk;
  const stepBlocked = triedToAdvance && mainOk && !complete;

  function setStep(key: string, next: string, byClick: boolean) {
    setFocusAfterClick(byClick);
    onDetailChange(setStepValue(detail, key, next));
  }

  function handleNext() {
    if (!complete) {
      setTriedToAdvance(true);
      if (!mainOk) textareaRef.current?.focus();
      return;
    }
    onNext();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleNext();
    }
  }

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, transition: EXIT_TRANSITION }}
      transition={ENTER_TRANSITION}
      className="flex flex-col justify-center h-full"
    >
      <div className="flex items-baseline gap-3 mb-5">
        <span className="font-display text-3xl text-accent/70">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="font-mono text-xs tracking-[0.2em] text-muted">
          / {String(total).padStart(2, "0")}
        </span>
      </div>

      <h1 className="font-display text-2xl sm:text-3xl leading-snug tracking-tight text-glow mb-6 max-w-2xl">
        {question.text}
      </h1>

      <textarea
        ref={textareaRef}
        rows={3}
        autoFocus
        aria-label={question.text}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        aria-invalid={blocked}
        aria-describedby={blocked ? `blocked-${index}` : undefined}
        placeholder={question.placeholder}
        className={`w-full max-w-xl bg-transparent border-b-2 outline-none text-lg sm:text-xl py-3 placeholder:text-muted/40 transition-colors font-display resize-none leading-snug ${
          blocked ? "border-accent-2" : "border-border focus:border-accent"
        }`}
      />

      <p
        id={`blocked-${index}`}
        role="status"
        aria-live="polite"
        className={`text-sm mt-3 max-w-xl transition-opacity ${
          blocked ? "opacity-100 text-accent-2" : "opacity-0"
        }`}
      >
        {blocked
          ? "Essa pergunta precisa de uma resposta antes de seguir. Se não se aplica a você, escreva isso mesmo — “nunca aconteceu” já conta."
          : " "}
      </p>

      {shown.length > 0 && (
        <div className="mt-4 max-w-xl flex flex-col gap-6 border-l-2 border-accent/30 pl-4">
          {shown.map((s) => (
            <StepField
              key={s.key}
              shown={s}
              invalid={stepBlocked && s.key === firstOpen}
              autoFocus={focusAfterClick && s.key === firstOpen}
              onChange={(next, byClick) => setStep(s.key, next, byClick)}
              onKeyDown={onKeyDown}
            />
          ))}
          <p
            role="status"
            aria-live="polite"
            className={`text-sm -mt-3 transition-opacity ${
              stepBlocked ? "opacity-100 text-accent-2" : "opacity-0"
            }`}
          >
            {stepBlocked ? "Responda essa parte também antes de seguir." : " "}
          </p>
        </div>
      )}

      <div className="flex items-center gap-4 mt-9">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirst}
          className="px-5 py-3 rounded-full border border-border text-sm text-foreground/80 disabled:opacity-30 disabled:cursor-not-allowed hover:border-muted transition"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-disabled={!complete}
          className={`px-7 py-3 rounded-full text-sm font-semibold tracking-wide transition ${
            complete
              ? "bg-gradient-to-r from-accent to-accent-2 text-background hover:brightness-110 shadow-lg shadow-accent/20"
              : "border border-border text-muted hover:border-muted"
          }`}
        >
          {isLast ? "Concluir" : "Próxima"}
        </button>
        <span className="text-xs text-muted hidden sm:inline">
          Enter pula linha · Ctrl+Enter avança
        </span>
      </div>
    </motion.div>
  );
}

/** Um passo: botões de escolha única ou uma pergunta curta em texto. */
function StepField({
  shown,
  invalid,
  autoFocus,
  onChange,
  onKeyDown,
}: {
  shown: ShownStep;
  invalid: boolean;
  autoFocus: boolean;
  onChange: (value: string, byClick: boolean) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  const { step, value } = shown;
  const ref = useAutoGrowTextarea(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ENTER_TRANSITION}
      role={step.kind === "button" ? "radiogroup" : undefined}
      aria-label={step.kind === "button" ? step.prompt : undefined}
    >
      {step.kind === "button" ? (
        <>
          <p
            className={`text-lg sm:text-xl font-display leading-snug mb-3 transition-colors ${
              invalid ? "text-accent-2" : "text-foreground"
            }`}
          >
            {step.prompt}
          </p>
          <div className="flex flex-wrap gap-2">
            {step.options.map((option) => {
              const isOn = value === option.label;
              return (
                <button
                  key={option.label}
                  type="button"
                  role="radio"
                  aria-checked={isOn}
                  onClick={() => onChange(option.label, true)}
                  className={`${PILL} ${isOn ? PILL_ON : PILL_OFF}`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <label className="flex flex-col gap-1">
          <span className="font-display text-lg sm:text-xl leading-snug text-foreground">
            {step.prompt}
          </span>
          <textarea
            ref={ref}
            rows={2}
            autoFocus={autoFocus}
            aria-invalid={invalid}
            value={value}
            onChange={(e) => onChange(e.target.value, false)}
            onKeyDown={onKeyDown}
            className={`w-full bg-transparent border-b-2 outline-none text-lg sm:text-xl py-3 transition-colors font-display resize-none leading-snug ${
              invalid ? "border-accent-2" : "border-border focus:border-accent"
            }`}
          />
        </label>
      )}
    </motion.div>
  );
}
