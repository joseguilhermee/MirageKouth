"use client";

import { useEffect, useRef, useState } from "react";
import { focusContext } from "@/lib/focusContext";
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
  isMainAnswered,
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
  canBackFirst = false,
  onChoosePurpose,
  firstBackLabel,
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
  onSeal?: (field: HTMLElement) => boolean;
  departing?: boolean;
  canBackFirst?: boolean;
  onChoosePurpose?: () => void;
  firstBackLabel?: string;
}) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const textareaRef = useAutoGrowTextarea(value);
  const cardRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const [triedToAdvance, setTriedToAdvance] = useState(false);
  const [focusRequest, setFocusRequest] = useState<{ key: string; revision: number } | null>(null);
  const [sealing, setSealing] = useState(false);
  const [sealingButton, setSealingButton] = useState(false);

  // Resposta em branco não é "sem dado": pelo §AUSÊNCIA do protocolo, itens
  // vazios derrubam a confiança do perfil inteiro. Por isso tudo o que aparece
  // é obrigatório; "nunca aconteceu" já conta como resposta.
  const mainOk = isMainAnswered(question, value);
  const { shown, complete } = shownSteps(question, value, detail);
  const firstOpen = shown.find((s) => !s.answered)?.key;
  // Derivado, não sincronizado por efeito: o aviso some sozinho assim que a
  // resposta fica longa o bastante, e volta se ela for apagada de novo.
  const blocked = triedToAdvance && !mainOk;
  const stepBlocked = triedToAdvance && mainOk && !complete;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const control = textareaRef.current ?? cardRef.current?.querySelector<HTMLElement>('button[role="radio"]');
    control?.focus({ preventScroll: true });
  }, [textareaRef]);

  useEffect(() => {
    if (focusRequest?.key === "main" && mainRef.current && textareaRef.current) {
      return focusContext(mainRef.current, textareaRef.current);
    }
  }, [focusRequest, textareaRef]);

  function requestFocus(key: string) {
    setFocusRequest(previous => ({ key, revision: (previous?.revision ?? 0) + 1 }));
  }

  function setStep(key: string, next: string, byClick: boolean) {
    const updated = setStepValue(detail, key, next);
    onDetailChange(updated);
    if (byClick) {
      const nextShown = shownSteps(question, value, updated).shown;
      const following = nextShown[nextShown.findIndex(item => item.key === key) + 1];
      if (following) requestFocus(following.key);
    }
  }

  function handleNext() {
    if (!complete) {
      setTriedToAdvance(true);
      if (!mainOk) requestFocus("main");
      else if (firstOpen) requestFocus(firstOpen);
      return;
    }
    if (sealing) return;
    const field = textareaRef.current
      ?? cardRef.current?.querySelector<HTMLElement>("textarea")
      ?? cardRef.current?.querySelector<HTMLElement>('button[role="radio"][aria-checked="true"]');
    if (field && onSeal?.(field)) {
      setSealingButton(field instanceof HTMLButtonElement);
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
      ref={cardRef}
      aria-busy={sealing}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: departing ? 0 : 1, y: departing ? -12 : 0 }}
      exit={{ opacity: 0, y: -12, transition: EXIT_TRANSITION }}
      transition={departing ? { duration: 0.55, ease: [0.4, 0, 0.2, 1] } : ENTER_TRANSITION}
      className={`flex flex-col ${focusRequest ? "pb-[45svh]" : ""} ${sealing ? "[&_textarea]:text-transparent [&_textarea]:caret-transparent" : ""}`}
    >
      {question.noMain ? null : <div ref={mainRef}><h1 className={`${DISPLAY} mb-6 max-w-[34ch] text-[28px] leading-[1.18] sm:text-[34px] lg:text-[40px] lg:leading-[1.14]`}>
        {question.text}
      </h1>
      <textarea
        ref={textareaRef}
        rows={3}
        aria-label={question.text}
        aria-required="true"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        aria-invalid={blocked}
        aria-describedby={blocked ? `blocked-${index}` : undefined}
        placeholder={question.placeholder || "Escreva sua resposta aqui…"}
        readOnly={sealing}
        className={`${FIELD} ${blocked ? "border-warn" : "border-line-strong focus:border-terra"} ${
          sealing ? "text-transparent caret-transparent placeholder:text-transparent" : ""
        }`}
      /></div>}

      {!question.noMain && <p
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
      </p>}

      {shown.length > 0 && (
        <div className="mt-5 flex flex-col gap-8">
          {shown.map((s) => (
            <StepField
              key={s.key}
              shown={s}
              invalid={stepBlocked && s.key === firstOpen}
              focusRevision={focusRequest?.key === s.key ? focusRequest.revision : 0}
              hideSelected={sealingButton}
              readOnly={sealing}
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
        {!isFirst && <button type="button" onClick={onBack} disabled={sealing} className={BTN_GHOST}>
          Voltar
        </button>}
        <button
          type="button"
          onClick={handleNext}
          disabled={sealing}
          aria-disabled={sealing}
          className={complete ? BTN_PRIMARY : BTN_PRIMARY_WAITING}
        >
          {isLast ? "Concluir" : "Próxima"}
        </button>
        <span className="hidden text-[13px] text-ink-3 sm:inline">
          <Kbd>Enter</Kbd> pula linha · <Kbd>Ctrl</Kbd> + <Kbd>Enter</Kbd> avança
        </span>
      </div>
      {isFirst && <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-ink-3">
        {onChoosePurpose && <button type="button" onClick={onChoosePurpose} disabled={sealing} className="min-h-11 w-fit underline-offset-4 hover:text-ink hover:underline">Escolher outra opção</button>}
        {canBackFirst && firstBackLabel && <button type="button" onClick={onBack} disabled={sealing} className="min-h-11 w-fit underline-offset-4 hover:text-ink hover:underline">{firstBackLabel}</button>}
      </div>}
    </motion.div>
  );
}

/** Um passo: botões de escolha única ou uma pergunta curta em texto. */
function StepField({
  shown,
  invalid,
  focusRevision,
  hideSelected,
  readOnly,
  onChange,
  onKeyDown,
}: {
  shown: ShownStep;
  invalid: boolean;
  focusRevision: number;
  hideSelected: boolean;
  readOnly: boolean;
  onChange: (value: string, byClick: boolean) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}) {
  const { step, value } = shown;
  const ref = useAutoGrowTextarea(value);
  const blockRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!focusRevision || !blockRef.current) return;
    const control = ref.current ?? blockRef.current.querySelector<HTMLElement>('button[role="radio"]:not(:disabled)');
    if (control) return focusContext(blockRef.current, control);
  }, [focusRevision, ref]);
  const promptClass = `font-display text-xl sm:text-[22px] font-medium leading-snug transition-colors ${
    invalid ? "text-warn" : "text-ink"
  }`;

  return (
    <motion.div
      ref={blockRef}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ENTER_TRANSITION}
      role={step.kind === "button" ? "radiogroup" : undefined}
      aria-label={step.kind === "button" ? step.prompt : undefined}
      aria-required={step.kind === "button" ? true : undefined}
      aria-invalid={invalid || undefined}
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
                  tabIndex={option.label === (step.options.some(item => item.label === value && !item.disabled) ? value : step.options.find(item => !item.disabled)?.label) ? 0 : -1}
                  disabled={option.disabled || readOnly}
                  onClick={() => onChange(option.label, true)}
                  onKeyDown={event => {
                    const movement = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
                    if (movement !== undefined || event.key === "Home" || event.key === "End") {
                      event.preventDefault();
                      const buttons = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button[role="radio"]:not(:disabled)') ?? []);
                      const position = buttons.indexOf(event.currentTarget);
                      const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (position + movement! + buttons.length) % buttons.length;
                      const target = buttons[next];
                      if (target) { target.focus({ preventScroll: true }); onChange(target.textContent?.trim() ?? "", false); }
                    } else onKeyDown(event);
                  }}
                  style={hideSelected && isOn ? { color: "transparent" } : undefined}
                  className={`${PILL} ${option.disabled ? "cursor-not-allowed border-line bg-[var(--control-disabled)] text-ink-3 opacity-55" : isOn ? PILL_ON : PILL_OFF}`}
                >
                  {option.label}
                  {option.disabled && <span className="ml-2 text-xs">em breve</span>}
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
            aria-invalid={invalid}
            aria-required="true"
            value={value}
            readOnly={readOnly}
            placeholder={step.placeholder || "Escreva sua resposta aqui…"}
            onChange={(e) => onChange(e.target.value, false)}
            onKeyDown={onKeyDown}
            className={`${FIELD} ${invalid ? "border-warn" : "border-line-strong focus:border-terra"}`}
          />
        </label>
      )}
    </motion.div>
  );
}
