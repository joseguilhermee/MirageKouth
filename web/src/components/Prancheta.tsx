"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { previewHex } from "@/lib/previewCipher";
import { EASE_OUT } from "@/lib/motion";
import { CipherText, LockSeal } from "./CipherText";

export type PranchetaItem = { index: number; question: string; text: string };

const ClipboardIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-4 w-4" aria-hidden>
    <rect x="5" y="4.5" width="14" height="16.5" rx="2" />
    <path d="M9 4.5V3.8A1.3 1.3 0 0 1 10.3 2.5h3.4A1.3 1.3 0 0 1 15 3.8v.7" />
    <path d="M8.5 10h7M8.5 13.5h7M8.5 17h4" />
  </svg>
);

/** Botão da prancheta na barra do topo; é também o alvo para onde as respostas voam. */
export const PranchetaButton = forwardRef<
  HTMLButtonElement,
  { count: number; total: number; pulse: number; open: boolean; onClick: () => void }
>(function PranchetaButton({ count, total, pulse, open, onClick }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-label={`Prancheta: ${count} de ${total} respostas guardadas`}
      className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-2 text-sm text-ink-2 sm:gap-2 sm:px-3 transition hover:bg-terra-wash hover:text-ink"
    >
      {ClipboardIcon}
      <span className="hidden sm:inline">Prancheta</span>
      <motion.span
        key={pulse}
        initial={pulse ? { scale: 1.35 } : false}
        animate={{ scale: 1 }}
        transition={{ duration: 0.45, ease: EASE_OUT }}
        className="min-w-6 rounded-full bg-action px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums text-action-ink"
      >
        {count}
      </motion.span>
    </button>
  );
});

function CipherLine({ sessionKey, text }: { sessionKey: CryptoKey | null; text: string }) {
  const [hex, setHex] = useState("");
  useEffect(() => {
    if (!sessionKey) return;
    let alive = true;
    previewHex(sessionKey, text)
      .then((h) => alive && setHex(h))
      .catch(() => alive && setHex(""));
    return () => {
      alive = false;
    };
  }, [sessionKey, text]);

  return (
    <div className="flex items-start gap-2">
      <LockSeal label="cifrado" />
      <p className="line-clamp-3 min-w-0 flex-1 font-mono text-[12.5px] leading-relaxed break-all">
        {hex ? <CipherText text={hex} /> : <span className="text-[#6b5448]">cifrando…</span>}
      </p>
    </div>
  );
}

/**
 * A prancheta: placa de terra roxa com uma folha presa no clipe. Mostra cada
 * resposta completa como ela vai sair (prévia da cifra) e, depois de selar, o
 * conteúdo real do arquivo. Cores fixas, porque a folha é papel claro de dia e
 * de noite.
 */
export function PranchetaDrawer({
  open,
  onClose,
  items,
  total,
  sessionKey,
  fileContent,
  onEdit,
}: {
  open: boolean;
  onClose: () => void;
  items: PranchetaItem[];
  total: number;
  sessionKey: CryptoKey | null;
  fileContent: string | null;
  onEdit: (index: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  // No celular a prancheta sobe de baixo; no computador entra pela direita.
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const sync = () => setWide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  const hidden = wide ? { x: "100%", y: 0 } : { x: 0, y: "100%" };

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            className="absolute inset-0 bg-[#2a1712]/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={fileContent ? "Seu arquivo selado" : "Prancheta"}
            className="absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-3xl bg-[#5e2317] px-3 pt-8 pb-3 shadow-[0_-20px_50px_-20px_rgba(42,23,18,0.5)] sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[460px] sm:rounded-l-3xl sm:rounded-tr-none sm:px-4 sm:pt-10 sm:pb-4"
            initial={hidden}
            animate={{ x: 0, y: 0 }}
            exit={hidden}
            transition={{ duration: 0.5, ease: EASE_OUT }}
          >
            {/* Clipe da prancheta. */}
            <div aria-hidden className="absolute top-3 left-1/2 h-6 w-28 -translate-x-1/2 rounded-lg bg-[#cdb8a6] shadow-[0_2px_4px_rgba(42,23,18,0.35)] sm:top-5">
              <div className="mx-auto mt-2 h-2 w-14 rounded-full bg-[#a98d7a]" />
            </div>

            <div className="flex min-h-0 flex-1 flex-col rounded-2xl bg-[#fbf6ef] text-[#2a1b17]">
              <div className="flex items-start justify-between gap-4 border-b border-[#e6d6c6] px-5 pt-6 pb-4">
                <div>
                  <h2 className="font-display text-xl font-semibold">
                    {fileContent ? "Seu arquivo selado" : "Prancheta"}
                  </h2>
                  <p className="mt-1 text-[14px] leading-relaxed text-[#4f3c33]">
                    {fileContent
                      ? "Este é exatamente o conteúdo de mirage-respostas.txt. Só a chave privada de quem monta os arquétipos consegue abrir."
                      : `${items.length} de ${total} respostas, como vão sair do seu aparelho. É uma prévia: a cifra definitiva (RSA-4096 + AES-256-GCM) acontece quando você selar, no fim.`}
                  </p>
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar prancheta"
                  className="-mr-2 shrink-0 rounded-full p-2 text-[#4f3c33] transition hover:bg-[#7a2e1e]/10 hover:text-[#2a1b17]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
                {fileContent ? (
                  <div className="my-3">
                    <LockSeal label="RSA-4096 + AES-256-GCM · selado" />
                    <pre className="mt-3 font-mono text-[12px] leading-relaxed break-all whitespace-pre-wrap">
                      <CipherText text={fileContent} />
                    </pre>
                  </div>
                ) : items.length === 0 ? (
                  <p className="py-8 text-[15px] leading-relaxed text-[#4f3c33]">
                    Nada aqui ainda. Cada resposta que você completar vem pra cá, já cifrada.
                  </p>
                ) : (
                  <ol>
                    {items.map((item) => (
                      <li key={item.index} className="border-b border-[#ecdfd2] py-4 last:border-b-0">
                        <div className="mb-2 flex items-baseline justify-between gap-3">
                          <p className="line-clamp-2 text-[14px] leading-snug">
                            <span className="mr-2 font-display font-semibold text-[#7a2e1e] tabular-nums">
                              {String(item.index + 1).padStart(2, "0")}
                            </span>
                            {item.question}
                          </p>
                          <button
                            type="button"
                            onClick={() => onEdit(item.index)}
                            className="shrink-0 rounded-full px-2 py-1 text-[13px] font-medium text-[#7a2e1e] underline-offset-4 transition hover:underline"
                          >
                            Editar
                          </button>
                        </div>
                        <CipherLine sessionKey={sessionKey} text={item.text} />
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
