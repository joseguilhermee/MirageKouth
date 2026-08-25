"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SOFT_TRANSITION } from "@/lib/motion";

export function TrustBadge() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
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
              Como isso é protegido
            </span>
            <p>
              Suas respostas são criptografadas <strong>no seu navegador</strong>{" "}
              (RSA-4096 + AES-256-GCM) antes mesmo de saírem da sua tela. Nada é
              enviado para nenhum servidor.
            </p>
            <p className="mt-2 text-muted">
              O resultado é um arquivo que só abre com uma chave privada
              guardada localmente por quem monta os arquétipos — ninguém mais
              consegue ler suas respostas, nem no caminho até chegar lá.
            </p>
            <div className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 border-b border-r border-border bg-surface" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Como funciona a criptografia"
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
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          <circle cx="12" cy="15.5" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      </button>
    </div>
  );
}
