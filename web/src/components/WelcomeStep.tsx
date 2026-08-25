"use client";

import { motion } from "framer-motion";
import { ENTER_TRANSITION, EXIT_TRANSITION } from "@/lib/motion";

export function WelcomeStep({
  value,
  onChange,
  onNext,
}: {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}) {
  const canStart = value.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, transition: EXIT_TRANSITION }}
      transition={ENTER_TRANSITION}
      className="flex flex-col justify-center h-full"
    >
      <span className="font-mono text-xs tracking-[0.2em] text-accent mb-5">
        ANTES DE COMEÇAR
      </span>

      <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] tracking-tight text-glow mb-4 max-w-xl">
        Como podemos <em className="italic text-accent">te chamar</em>?
      </h1>
      <p className="text-muted text-base sm:text-lg mb-10 max-w-md">
        Seu nome vai junto no arquivo cifrado — só assim quem for ler as
        respostas depois sabe de quem é cada arquétipo.
      </p>

      <input
        autoFocus
        aria-label="Seu nome"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && canStart) onNext();
        }}
        placeholder="Digite seu nome…"
        className="w-full max-w-lg bg-transparent border-b-2 border-border focus:border-accent outline-none text-xl sm:text-2xl py-3 placeholder:text-muted/40 transition-colors font-display"
      />

      <div className="flex items-center gap-4 mt-12">
        <button
          type="button"
          onClick={onNext}
          disabled={!canStart}
          className="px-7 py-3 rounded-full bg-gradient-to-r from-accent to-accent-2 text-background text-sm font-semibold tracking-wide disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition shadow-lg shadow-accent/20"
        >
          Começar
        </button>
        <span className="text-xs text-muted hidden sm:inline">
          pressione Enter ↵
        </span>
      </div>
    </motion.div>
  );
}
