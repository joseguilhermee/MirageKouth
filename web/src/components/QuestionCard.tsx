"use client";

import { motion } from "framer-motion";
import { useAutoGrowTextarea } from "@/lib/useAutoGrowTextarea";
import { ENTER_TRANSITION, EXIT_TRANSITION } from "@/lib/motion";
import type { Question } from "@/lib/questions";

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

      <h1 className="font-display text-2xl sm:text-3xl leading-snug tracking-tight text-glow mb-3 max-w-2xl">
        {question.text}
      </h1>

      {question.hints && question.hints.length > 0 && (
        <ul className="mb-8 max-w-xl flex flex-col gap-1.5">
          {question.hints.map((hint, i) => (
            <li key={i} className="text-sm text-muted leading-relaxed pl-4 relative">
              <span className="absolute left-0 text-accent/60">·</span>
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
            onNext();
          }
        }}
        placeholder="Conte sua história…"
        className="w-full max-w-xl bg-transparent border-b-2 border-border focus:border-accent outline-none text-lg sm:text-xl py-3 placeholder:text-muted/40 transition-colors font-display resize-none leading-snug"
      />

      <div className="flex items-center gap-4 mt-12">
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
          onClick={onNext}
          className="px-7 py-3 rounded-full bg-gradient-to-r from-accent to-accent-2 text-background text-sm font-semibold tracking-wide hover:brightness-110 transition shadow-lg shadow-accent/20"
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
