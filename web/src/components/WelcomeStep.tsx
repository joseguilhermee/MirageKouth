"use client";

import { motion } from "framer-motion";
import { ENTER_TRANSITION, EXIT_TRANSITION } from "@/lib/motion";
import { BTN_PRIMARY, DISPLAY } from "@/lib/ui";
import { Kbd } from "./Glyphs";

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
      className="flex flex-col"
    >
      <h1 className={`${DISPLAY} mb-4 text-[40px] leading-[1.05] sm:text-6xl`}>
        Como podemos <span className="text-brand">te chamar</span>?
      </h1>
      <p className="mb-10 max-w-[46ch] text-lg leading-relaxed text-ink-2">
        Vamos começar pelo seu nome. Ele identifica a sua conversa e acompanha
        as respostas que você vai entregar à KOUTH.
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
        className="kouth-input w-full max-w-lg text-xl placeholder:text-ink-3"
      />

      <div className="mt-10 flex items-center gap-4">
        <button type="button" onClick={onNext} disabled={!canStart} className={BTN_PRIMARY}>
          Começar
        </button>
        <span className="hidden text-[13px] text-ink-3 sm:inline">pressione <Kbd>Enter</Kbd></span>
      </div>
    </motion.div>
  );
}
