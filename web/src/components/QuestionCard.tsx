"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAutoGrowTextarea } from "@/lib/useAutoGrowTextarea";
import { ENTER_TRANSITION, EXIT_TRANSITION } from "@/lib/motion";
import {
  missingChoiceRows,
  type ChoiceAnswer,
  type Question,
  type QuestionDetail,
} from "@/lib/questions";
import { ChoiceRow } from "./ChoiceRow";

// Resposta em branco não é "sem dado": pelo §AUSÊNCIA do protocolo, cinco itens
// vazios nos blocos de conduta derrubam a confiança do perfil inteiro para
// baixa. Por isso não dá pra avançar sem escrever nada. O mínimo é curto de
// propósito — "nunca aconteceu" é resposta legítima em vários itens.
const MIN_CHARS = 10;
// O extra também é obrigatório, mas responde coisas curtas ("Quem disse?" →
// "minha mãe"), então o mínimo é só pra não passar em branco.
const MIN_EXTRA_CHARS = 2;

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
  const extraRef = useAutoGrowTextarea(detail.extra ?? "");

  function setChoice(c: number, answer: ChoiceAnswer) {
    onDetailChange({ ...detail, choices: { ...detail.choices, [c]: answer } });
  }
  const [triedToAdvance, setTriedToAdvance] = useState(false);

  const mainOk = value.trim().length >= MIN_CHARS;
  const extraOk = !question.extra || (detail.extra ?? "").trim().length >= MIN_EXTRA_CHARS;
  // Nenhum botão vem marcado: cada linha precisa de uma escolha da pessoa,
  // com a segunda camada preenchida e o "outro" especificado.
  const missingChoices = missingChoiceRows(question, detail);
  const choicesOk = missingChoices.length === 0;
  const canAdvance = mainOk && extraOk && choicesOk;
  // Derivado, não sincronizado por efeito: o aviso some sozinho assim que a
  // resposta fica longa o bastante, e volta se ela for apagada de novo.
  const blocked = triedToAdvance && !mainOk;
  const extraBlocked = triedToAdvance && !extraOk;
  const choicesBlocked = triedToAdvance && !choicesOk;

  function handleNext() {
    if (!canAdvance) {
      setTriedToAdvance(true);
      if (!mainOk) textareaRef.current?.focus();
      else if (!extraOk) extraRef.current?.focus();
      return;
    }
    onNext();
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
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleNext();
          }
        }}
        aria-invalid={blocked}
        aria-describedby={blocked ? `blocked-${index}` : undefined}
        placeholder="Conte sua história…"
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
          : " "}
      </p>

      {question.choices && question.choices.length > 0 && (
        <div className="mt-4 max-w-xl flex flex-col gap-5 border-l-2 border-accent/30 pl-4">
          {question.choices.map((choice, c) => (
            <ChoiceRow
              key={c}
              choice={choice}
              answer={detail.choices?.[c]}
              invalid={choicesBlocked && missingChoices.includes(c)}
              onChange={(answer) => setChoice(c, answer)}
            />
          ))}
          <p
            role="status"
            aria-live="polite"
            className={`text-sm -mt-2 transition-opacity ${
              choicesBlocked ? "opacity-100 text-accent-2" : "opacity-0"
            }`}
          >
            {choicesBlocked ? "Complete os botões antes de seguir: uma opção em cada linha, quem/qual quando abrir, e o que é quando marcar “outro”." : " "}
          </p>
        </div>
      )}

      {question.extra && (
        <label className="mt-7 max-w-xl flex flex-col gap-1">
          <span className="font-display text-lg sm:text-xl leading-snug text-foreground">
            {question.extra}
          </span>
          <textarea
            ref={extraRef}
            rows={2}
            aria-invalid={extraBlocked}
            aria-describedby={extraBlocked ? `extra-blocked-${index}` : undefined}
            placeholder="Sua resposta…"
            value={detail.extra ?? ""}
            onChange={(e) => onDetailChange({ ...detail, extra: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleNext();
              }
            }}
            className={`w-full bg-transparent border-b-2 outline-none text-lg sm:text-xl py-3 placeholder:text-muted/40 transition-colors font-display resize-none leading-snug ${
              extraBlocked ? "border-accent-2" : "border-border focus:border-accent"
            }`}
          />
          <span
            id={`extra-blocked-${index}`}
            role="status"
            aria-live="polite"
            className={`text-sm mt-2 transition-opacity ${
              extraBlocked ? "opacity-100 text-accent-2" : "opacity-0"
            }`}
          >
            {extraBlocked ? "Essa parte também precisa de resposta antes de seguir." : " "}
          </span>
        </label>
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
          aria-disabled={!canAdvance}
          className={`px-7 py-3 rounded-full text-sm font-semibold tracking-wide transition ${
            canAdvance
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
