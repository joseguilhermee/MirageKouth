"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { buildEncryptedFile } from "@/lib/crypto";
import { DELIVERY_INSTRUCTIONS } from "@/lib/siteConfig";
import type { QuestionDetail } from "@/lib/questions";
import { ENTER_TRANSITION, EXIT_TRANSITION, SOFT_TRANSITION } from "@/lib/motion";

const LOG_LINES = [
  "Coletando respostas…",
  "Derivando chave AES-256…",
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
}: {
  name: string;
  answered: number;
  total: number;
  answers: Record<number, string>;
  timings: Record<number, number>;
  details: Record<number, QuestionDetail>;
  onBack: () => void;
  onDone: () => void;
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
      className="flex flex-col justify-center h-full"
    >
      <span className="font-mono text-xs tracking-[0.2em] text-cipher mb-5">
        SELAR RESPOSTAS
      </span>
      <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] tracking-tight text-glow mb-4 max-w-xl">
        A miragem está pronta pra virar arquétipo
      </h1>
      <p className="text-muted text-base sm:text-lg mb-10 max-w-md">
        {name ? `${name}, você` : "Você"} respondeu {answered} de {total}{" "}
        perguntas. Ao gerar, tudo é criptografado no seu navegador — depois
        você escolhe se baixa como arquivo ou copia o texto cifrado. Nada é
        enviado para nenhum servidor nesse processo.
      </p>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={status === "processing"}
          className="px-5 py-3.5 rounded-full border border-border text-sm text-foreground/80 disabled:opacity-30 disabled:cursor-not-allowed hover:border-muted transition"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={status === "processing"}
          className="px-7 py-3.5 rounded-full bg-gradient-to-r from-accent to-accent-2 text-background text-sm font-semibold tracking-wide disabled:opacity-60 hover:brightness-110 transition shadow-lg shadow-accent/20"
        >
          {status === "done" ? "Gerar novamente" : "Gerar Criptografia"}
        </button>
      </div>

      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={SOFT_TRANSITION}
            className="mt-6 rounded-xl bg-black/50 border border-border/70 p-4 font-mono text-xs text-cipher overflow-hidden max-w-lg"
          >
            {LOG_LINES.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SOFT_TRANSITION}
                className="py-0.5"
              >
                <span className="text-muted mr-2">$</span>
                {line}
              </motion.div>
            ))}
            {status === "done" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SOFT_TRANSITION}
                className="py-0.5 text-foreground"
              >
                <span className="text-muted mr-2">$</span>
                Arquivo cifrado pronto.
              </motion.div>
            )}
            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={SOFT_TRANSITION}
                className="py-0.5 text-red-400"
              >
                <span className="text-muted mr-2">$</span>
                Algo deu errado. Tente novamente.
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status === "done" && encryptedContent && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={SOFT_TRANSITION}
            className="mt-6 flex flex-col gap-3 max-w-lg"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
              Como prefere entregar?
            </span>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-3 rounded-full border border-border text-sm text-foreground/90 hover:border-accent hover:text-accent transition"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
                  <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Baixar arquivo
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-2 px-5 py-3 rounded-full border border-border text-sm text-foreground/90 hover:border-accent hover:text-accent transition"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-4 w-4">
                  <rect x="8" y="8" width="12" height="12" rx="2" />
                  <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {copyStatus === "copied" ? "Copiado!" : "Copiar texto"}
              </button>
              {copyStatus === "error" && (
                <span className="text-xs text-red-400">
                  Não deu pra copiar automaticamente — tente selecionar o texto manualmente.
                </span>
              )}
            </div>
            <p className="text-xs text-muted max-w-md">
              Baixar salva o arquivo <code className="text-foreground/80">{FILE_NAME}</code>{" "}
              no dispositivo. Copiar coloca o mesmo conteúdo cifrado na área de
              transferência, pra colar direto onde for enviar (útil no celular
              ou se preferir não baixar nada).
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {status === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SOFT_TRANSITION, delay: 0.15 }}
            className="mt-4 rounded-xl border border-accent/25 bg-accent/5 p-4 text-sm text-foreground/90 leading-relaxed max-w-lg"
          >
            <strong className="text-accent">Próximo passo:</strong>{" "}
            {DELIVERY_INSTRUCTIONS}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
