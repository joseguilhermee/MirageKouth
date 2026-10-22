"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ENTER_TRANSITION, EXIT_TRANSITION } from "@/lib/motion";
import { BTN_GHOST, BTN_PRIMARY, DISPLAY } from "@/lib/ui";
import { Kbd } from "./Glyphs";

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
      className="flex flex-col"
    >
      <h1 className={`${DISPLAY} mb-8 text-[40px] leading-[1.05] sm:text-6xl`}>
        Não há <span className="text-brand">respostas certas</span>
      </h1>

      <div className="mb-10 flex max-w-[58ch] flex-col gap-5 text-lg leading-relaxed">
        <p className="text-ink">
          Sempre que possível, conte um <strong className="font-semibold text-brand">episódio
          específico</strong>: quando foi, quem estava envolvido, o que você fez.
        </p>
        <p className="text-ink-2">
          Uma história pequena e concreta vale mais do que uma descrição geral sobre como você
          é.
        </p>
        <p className="text-ink">
          A resposta <strong className="font-semibold text-brand">óbvia</strong> costuma ser a
          certa. Não tente adivinhar o que a gente está medindo — a tentativa é o único jeito
          de estragar a leitura.
        </p>
        <p className="text-ink-2">
          &ldquo;Nada&rdquo;, &ldquo;não sei&rdquo; e &ldquo;nunca aconteceu comigo&rdquo; são
          respostas completas. Se não lembrar de um caso, diga isso.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <button type="button" onClick={onBack} className={BTN_GHOST}>
          Voltar
        </button>
        <button type="button" onClick={onNext} className={BTN_PRIMARY}>
          Entendi, vamos começar
        </button>
        <span className="hidden text-[13px] text-ink-3 sm:inline">pressione <Kbd>Enter</Kbd></span>
      </div>
    </motion.div>
  );
}
