"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAutoGrowTextarea } from "@/lib/useAutoGrowTextarea";
import { ENTER_TRANSITION, EXIT_TRANSITION } from "@/lib/motion";
import type { Question } from "@/lib/questions";

// Resposta em branco não é "sem dado": pelo §AUSÊNCIA do protocolo, cinco itens
// vazios nos blocos de conduta derrubam a confiança do perfil inteiro para
// baixa. Por isso não dá pra avançar sem escrever nada. O mínimo é curto de
// propósito — "nunca aconteceu" é resposta legítima em vários itens.
const MIN_CHARS = 10;

export function QuestionCard({
  index,
  total,
  question,
  value,
  onChange,
  onNext,
  onBack,
}: {
  index: number;
  total: number;
  question: Question;
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const textareaRef = useAutoGrowTextarea(value);
  const [triedToAdvance, setTriedToAdvance] = useState(false);

  const canAdvance = value.trim().length >= MIN_CHARS;
  // Derivado, não sincronizado por efeito: o aviso some sozinho assim que a
  // resposta fica longa o bastante, e volta se ela for apagada de novo.
  const blocked = triedToAdvance && !canAdvance;

  function handleNext() {
    if (!canAdvance) {
      setTriedToAdvance(true);
      textareaRef.current?.focus();
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

      <h1 className="font-display text-2xl sm:text-3xl leading-snug tracking-tight text-glow mb-1 max-w-2xl">
        {question.text}
      </h1>

      {question.hints && question.hints.length > 0 && (
        <ul className="mb-8 max-w-xl flex flex-col gap-2 border-l-2 border-accent/30 pl-4">
          {question.hints.map((hint, i) => (
            <li key={i} className="text-base text-foreground/70 leading-relaxed">
              {hint}
            </li>
          ))}
        </ul>
      )}

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
