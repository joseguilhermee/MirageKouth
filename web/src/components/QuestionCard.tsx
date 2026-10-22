"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAutoGrowTextarea } from "@/lib/useAutoGrowTextarea";
import { ENTER_TRANSITION, EXIT_TRANSITION } from "@/lib/motion";
import {
  BTN_GHOST,
  BTN_PRIMARY,
  BTN_PRIMARY_WAITING,
  DISPLAY,
  FIELD,
  PILL,
  PILL_OFF,
  PILL_ON,
} from "@/lib/ui";
import { Kbd } from "./Glyphs";
import {
  MIN_MAIN_CHARS,
  setStepValue,
  shownSteps,
  type Question,
  type QuestionDetail,
  type ShownStep,
} from "@/lib/questions";

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
  onSeal,
  departing = false,
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
  /**
   * Chamado ao avançar com tudo respondido. Se devolver true, a página cuida da
   * animação de selar e chama onNext no fim dela; o texto some do campo para
   * não aparecer duas vezes.
   */
  onSeal?: (field: HTMLTextAreaElement) => boolean;
  departing?: boolean;
}) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const textareaRef = useAutoGrowTextarea(value);
  const [triedToAdvance, setTriedToAdvance] = useState(false);
  // Só o passo aberto por um clique de botão ganha foco: o que aparece
  // enquanto a pessoa ainda digita a principal não pode roubar o cursor.
  const [focusAfterClick, setFocusAfterClick] = useState(false);
  const [sealing, setSealing] = useState(false);

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
    if (sealing) return;
    const field = textareaRef.current;
    if (field && onSeal?.(field)) {
      setSealing(true);
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
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: departing ? 0 : 1, y: departing ? -12 : 0 }}
      exit={{ opacity: 0, y: -12, transition: EXIT_TRANSITION }}
      transition={departing ? { duration: 0.55, ease: [0.4, 0, 0.2, 1] } : ENTER_TRANSITION}
      className={`flex flex-col ${sealing ? "[&_textarea]:text-transparent [&_textarea]:caret-transparent" : ""}`}
    >
      <h1 className={`${DISPLAY} mb-6 max-w-[34ch] text-[28px] leading-[1.18] sm:text-[34px] lg:text-[40px] lg:leading-[1.14]`}>
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
        readOnly={sealing}
        className={`${FIELD} ${blocked ? "border-warn" : "border-line-strong focus:border-terra"} ${
          sealing ? "text-transparent caret-transparent placeholder:text-transparent" : ""
        }`}
      />

      <p
        id={`blocked-${index}`}
        role="status"
        aria-live="polite"
        className={`mt-3 min-h-5 text-[15px] leading-snug text-warn transition-opacity ${
          blocked ? "opacity-100" : "opacity-0"
        }`}
      >
        {blocked
          ? "Essa pergunta precisa de uma resposta antes de seguir. Se não se aplica a você, escreva isso mesmo — “nunca aconteceu” já conta."
          : " "}
      </p>

      {shown.length > 0 && (
        <div className="mt-5 flex flex-col gap-8">
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
            className={`-mt-5 min-h-5 text-[15px] text-warn transition-opacity ${
              stepBlocked ? "opacity-100" : "opacity-0"
            }`}
          >
            {stepBlocked ? "Responda essa parte também antes de seguir." : " "}
          </p>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
        <button type="button" onClick={onBack} disabled={isFirst || sealing} className={BTN_GHOST}>
          Voltar
        </button>
        <button
          type="button"
          onClick={handleNext}
          aria-disabled={!complete}
          className={complete ? BTN_PRIMARY : BTN_PRIMARY_WAITING}
        >
          {isLast ? "Concluir" : "Próxima"}
        </button>
        <span className="hidden text-[13px] text-ink-3 sm:inline">
          <Kbd>Enter</Kbd> pula linha · <Kbd>Ctrl</Kbd> + <Kbd>Enter</Kbd> avança
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
  const promptClass = `font-display text-xl sm:text-[22px] font-medium leading-snug transition-colors ${
    invalid ? "text-warn" : "text-ink"
  }`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ENTER_TRANSITION}
      role={step.kind === "button" ? "radiogroup" : undefined}
      aria-label={step.kind === "button" ? step.prompt : undefined}
    >
      {step.kind === "button" ? (
        <>
          <p className={`${promptClass} mb-3`}>{step.prompt}</p>
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
          <span className={promptClass}>{step.prompt}</span>
          <textarea
            ref={ref}
            rows={2}
            autoFocus={autoFocus}
            aria-invalid={invalid}
            value={value}
            onChange={(e) => onChange(e.target.value, false)}
            onKeyDown={onKeyDown}
            className={`${FIELD} ${invalid ? "border-warn" : "border-line-strong focus:border-terra"}`}
          />
        </label>
      )}
    </motion.div>
  );
}
