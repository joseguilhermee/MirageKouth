"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SOFT_TRANSITION } from "@/lib/motion";

export function MethodologyBadge() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col items-start gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={SOFT_TRANSITION}
            className="relative w-80 rounded-2xl border border-border bg-surface/95 backdrop-blur p-5 shadow-2xl shadow-black/50 text-sm leading-relaxed text-foreground/90"
          >
            <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-cipher mb-2">
              Base teórica
            </span>
            <p>
              O arquétipo é um conceito de <strong>Carl Jung</strong> — estruturas do
              inconsciente coletivo, não uma lista fechada. O conjunto de{" "}
              <strong>12 arquétipos</strong> usado aqui (Herói, Sábio, Criador…) é de{" "}
              <strong>Carol Pearson</strong>, formalizado em <em>The Hero Within</em> (1986).
            </p>
            <p className="mt-2 text-muted">
              As perguntas seguem o modelo de entrevista de identidade narrativa de{" "}
              <strong>Dan McAdams</strong> — cenas-chave, viradas, capítulos de vida — em vez
              de um teste de múltipla escolha. Mesmo assim, é uma leitura interpretativa, não
              um diagnóstico.
            </p>
            <div className="absolute -bottom-2 left-6 h-4 w-4 rotate-45 border-b border-l border-border bg-surface" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Qual a base teórica dessa leitura"
        className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface/90 backdrop-blur text-foreground/80 shadow-lg shadow-black/30 transition hover:border-cipher/50 hover:text-cipher"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.6}
          className="h-5 w-5"
        >
          <path d="M4 19.5V6a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0 0 4h13" />
          <path d="M8 7h8" />
        </svg>
      </button>
    </div>
  );
}
