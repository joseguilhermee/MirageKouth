"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ENTER_TRANSITION, EXIT_TRANSITION } from "@/lib/motion";

export function InstructionsStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") {
        e.preventDefault();
        onNext();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNext]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, transition: EXIT_TRANSITION }}
      transition={ENTER_TRANSITION}
      className="flex flex-col justify-center h-full"
    >
      <span className="font-mono text-xs tracking-[0.2em] text-accent mb-5">
        INSTRUÇÕES
      </span>

      <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] tracking-tight text-glow mb-8 max-w-xl">
        Não há <em className="italic text-accent">respostas certas</em>
      </h1>

      <div className="flex flex-col gap-4 mb-10 max-w-lg">
        <p className="text-foreground/90 text-base sm:text-lg leading-relaxed">
          Sempre que possível, conte um <em className="italic text-cipher">episódio
          específico</em>: quando foi, quem estava envolvido, o que você fez.
        </p>
        <p className="text-muted text-base sm:text-lg leading-relaxed">
          Uma história pequena e concreta vale mais do que uma descrição geral sobre
          como você é.
        </p>
        <p className="text-foreground/90 text-base sm:text-lg leading-relaxed">
          A resposta <em className="italic text-cipher">óbvia</em> costuma ser a certa.
          Não tente adivinhar o que a gente está medindo — a tentativa é o único jeito
          de estragar a leitura.
        </p>
        <p className="text-muted text-base sm:text-lg leading-relaxed">
          &ldquo;Nada&rdquo;, &ldquo;não sei&rdquo; e &ldquo;nunca aconteceu comigo&rdquo;
          são respostas completas. Se não lembrar de um caso, diga isso.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-full border border-border text-sm text-foreground/80 hover:border-muted transition"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={onNext}
          className="px-7 py-3 rounded-full bg-gradient-to-r from-accent to-accent-2 text-background text-sm font-semibold tracking-wide hover:brightness-110 transition shadow-lg shadow-accent/20"
        >
          Entendi, vamos começar
        </button>
        <span className="text-xs text-muted hidden sm:inline">
          pressione Enter ↵
        </span>
      </div>
    </motion.div>
  );
}
