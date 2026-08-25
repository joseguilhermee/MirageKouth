"use client";

import { motion } from "framer-motion";
import { ENTER_TRANSITION } from "@/lib/motion";

export function ResumePrompt({
  name,
  answered,
  total,
  onResume,
  onRestart,
}: {
  name: string;
  answered: number;
  total: number;
  onResume: () => void;
  onRestart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ENTER_TRANSITION}
      className="flex flex-col justify-center"
    >
      <span className="font-mono text-xs tracking-[0.2em] text-cipher mb-5">
        PROGRESSO ENCONTRADO
      </span>

      <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] tracking-tight text-glow mb-4 max-w-xl">
        Continuar de onde parou?
      </h1>
      <p className="text-muted text-base sm:text-lg mb-10 max-w-md">
        {name ? `${name}, encontramos` : "Encontramos"} respostas salvas neste navegador
        ({answered} de {total} perguntas). Pode ter sido um fechamento sem querer — suas
        respostas continuam aqui.
      </p>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onRestart}
          className="px-5 py-3.5 rounded-full border border-border text-sm text-foreground/80 hover:border-muted transition"
        >
          Responder de novo
        </button>
        <button
          type="button"
          onClick={onResume}
          className="px-7 py-3.5 rounded-full bg-gradient-to-r from-accent to-accent-2 text-background text-sm font-semibold tracking-wide hover:brightness-110 transition shadow-lg shadow-accent/20"
        >
          Voltar para onde estava
        </button>
      </div>
    </motion.div>
  );
}
