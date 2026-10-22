"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { buildEncryptedFile } from "@/lib/crypto";
import { DELIVERY_INSTRUCTIONS } from "@/lib/siteConfig";
import type { QuestionDetail } from "@/lib/questions";
import { ENTER_TRANSITION, EXIT_TRANSITION, SOFT_TRANSITION } from "@/lib/motion";
import { BTN_GHOST, BTN_PRIMARY, DISPLAY } from "@/lib/ui";

const LOG_LINES = [
  "Coletando respostas…",
  "Gerando chave AES-256…",
  "Cifrando payload com AES-GCM…",
  "Envelopando chave com RSA-4096…",
  "Selando arquivo…",
];

const FILE_NAME = "mirage-respostas.txt";

type Status = "idle" | "processing" | "done" | "error";

/** Copia texto pra área de transferência, com fallback pra contextos sem Clipboard API (http antigo, browsers mais raros). */
async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const ok = document.execCommand("copy");
  textarea.remove();
  if (!ok) throw new Error("copy command failed");
}

export function FinalScreen({
  name,
  answered,
  total,
  answers,
  timings,
  details,
  onBack,
  onDone,
  onGenerated,
}: {
  name: string;
  answered: number;
  total: number;
  answers: Record<number, string>;
  timings: Record<number, number>;
  details: Record<number, QuestionDetail>;
  onBack: () => void;
  onDone: () => void;
  /** O arquivo real, para a prancheta mostrar exatamente o que vai ser entregue. */
  onGenerated?: (content: string) => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [visibleLines, setVisibleLines] = useState(0);
  const [encryptedContent, setEncryptedContent] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");

  async function handleGenerate() {
    setStatus("processing");
    setVisibleLines(0);
    setCopyStatus("idle");

    for (let i = 0; i < LOG_LINES.length; i++) {
      await new Promise((r) => setTimeout(r, 260));
      setVisibleLines((v) => v + 1);
    }

    try {
      const content = await buildEncryptedFile(name, answers, timings, details);
      setEncryptedContent(content);
      setStatus("done");
      onDone();
      onGenerated?.(content);
    } catch {
      setStatus("error");
    }
  }

  function handleDownload() {
    if (!encryptedContent) return;
    const blob = new Blob([encryptedContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = FILE_NAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function handleCopy() {
    if (!encryptedContent) return;
    try {
      await copyToClipboard(encryptedContent);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, transition: EXIT_TRANSITION }}
      transition={ENTER_TRANSITION}
      className="flex flex-col"
    >
      <h1 className={`${DISPLAY} mb-4 max-w-[16ch] text-[40px] leading-[1.05] sm:text-6xl`}>
        A miragem está pronta pra virar arquétipo
      </h1>
      <p className="mb-10 max-w-[52ch] text-lg leading-relaxed text-ink-2">
        {name ? `${name}, você` : "Você"} respondeu {answered} de {total}{" "}
        perguntas. Ao gerar, tudo é criptografado no seu navegador — depois
        você escolhe se baixa como arquivo ou copia o texto cifrado. Nada é
        enviado para nenhum servidor nesse processo.
      </p>

      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={status === "processing"}
          className={BTN_GHOST}
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={status === "processing"}
          className={BTN_PRIMARY}
        >
          {status === "done" ? "Gerar novamente" : "Gerar Criptografia"}
        </button>
      </div>

      <AnimatePresence>
        {status !== "idle" && (
          <motion.ol
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={SOFT_TRANSITION}
            aria-live="polite"
            className="mt-8 flex max-w-lg flex-col overflow-hidden"
          >
            {LOG_LINES.slice(0, visibleLines).map((line, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SOFT_TRANSITION}
                className="flex items-center gap-3 border-t border-line py-2.5 text-[15px] text-ink-2"
              >
                <CheckIcon />
                {line.replace(/…$/, "")}
              </motion.li>
            ))}
            {status === "done" && (
              <motion.li
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SOFT_TRANSITION}
                className="flex items-center gap-3 border-t border-line py-2.5 text-[15px] font-semibold text-ink"
              >
                <CheckIcon />
                Arquivo cifrado pronto.
              </motion.li>
            )}
            {status === "error" && (
              <motion.li
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SOFT_TRANSITION}
                className="border-t border-line py-2.5 text-[15px] font-semibold text-warn"
              >
                Algo deu errado. Tente novamente.
              </motion.li>
            )}
          </motion.ol>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status === "done" && encryptedContent && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={SOFT_TRANSITION}
            className="mt-8 flex max-w-lg flex-col gap-3"
          >
            <h2 className="font-display text-xl font-semibold text-ink">Como prefere entregar?</h2>
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={handleDownload} className={BTN_PRIMARY}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden>
                  <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Baixar arquivo
              </button>
              <button type="button" onClick={handleCopy} className={BTN_GHOST}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden>
                  <rect x="8" y="8" width="12" height="12" rx="2" />
                  <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {copyStatus === "copied" ? "Copiado!" : "Copiar texto"}
              </button>
            </div>
            {copyStatus === "error" && (
              <p className="text-[15px] text-warn">
                Não deu pra copiar automaticamente — tente selecionar o texto manualmente.
              </p>
            )}
            <p className="max-w-md text-[14px] leading-relaxed text-ink-2">
              Baixar salva o arquivo <code className="font-mono text-[13px] text-ink">{FILE_NAME}</code>{" "}
              no dispositivo. Copiar coloca o mesmo conteúdo cifrado na área de
              transferência, pra colar direto onde for enviar (útil no celular
              ou se preferir não baixar nada).
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status === "done" && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SOFT_TRANSITION, delay: 0.15 }}
            className="mt-6 max-w-lg rounded-2xl bg-terra-wash px-5 py-4 text-[15px] leading-relaxed text-ink"
          >
            <strong className="font-semibold text-brand">Próximo passo:</strong>{" "}
            {DELIVERY_INSTRUCTIONS}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0 text-brand" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
