"use client";

import { motion } from "framer-motion";
import { ENTER_TRANSITION } from "@/lib/motion";
import { BTN_GHOST, BTN_PRIMARY, DISPLAY } from "@/lib/ui";

export function ResumePrompt({
  name,
  answered,
  total,
  purpose,
  onResume,
  onRestart,
}: {
  name: string;
  answered: number;
  total: number;
  purpose?: "para_mim" | "presente" | "ocasiao" | "quem_quero_ser" | null;
  onResume: () => void;
  onRestart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ENTER_TRANSITION}
      className="flex flex-col"
    >
      <h1 className={`${DISPLAY} mb-4 text-[40px] leading-[1.05] sm:text-6xl`}>
        Continuar de onde parou?
      </h1>
      <p className="mb-10 max-w-[48ch] text-lg leading-relaxed text-ink-2">
        {purpose === "ocasiao" || purpose === "presente" || purpose === "quem_quero_ser"
          ? `${name ? `${name}, encontramos` : "Encontramos"} sua entrevista ${purpose === "ocasiao" ? "de ocasião especial" : purpose === "presente" ? "de presente" : "Para quem eu quero ser"} em andamento neste navegador. Suas respostas continuam aqui.`
          : <>{name ? `${name}, encontramos` : "Encontramos"} respostas salvas neste navegador (
            {answered} de {total} perguntas). Pode ter sido um fechamento sem querer — suas
            respostas continuam aqui.</>}
      </p>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <button type="button" onClick={onRestart} className={BTN_GHOST}>
          Responder de novo
        </button>
        <button type="button" onClick={onResume} className={BTN_PRIMARY}>
          Voltar para onde estava
        </button>
      </div>
    </motion.div>
  );
}
