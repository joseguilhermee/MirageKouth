"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { buildEncryptedFile } from "@/lib/crypto";
import { DELIVERY_INSTRUCTIONS } from "@/lib/siteConfig";
import type { QuestionDetail } from "@/lib/questions";
import type { Question } from "@/lib/questions";
import type { GiftInfo } from "@/lib/giftQuestions";
import { ENTER_TRANSITION, EXIT_TRANSITION } from "@/lib/motion";
import { BTN_GHOST, BTN_PRIMARY, DISPLAY } from "@/lib/ui";

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
  onViewFile,
  gift,
  occasion,
  becoming,
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
  onViewFile?: () => void;
  gift?: { info: GiftInfo; questions: Question[] };
  occasion?: { questions: Question[] };
  becoming?: { questions: Question[] };
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [encryptedContent, setEncryptedContent] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">("idle");
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status === "done") headingRef.current?.focus();
  }, [status]);

  async function handleGenerate() {
    setStatus("processing");
    setCopyStatus("idle");

    try {
      const content = await buildEncryptedFile(name, answers, timings, details, gift, occasion, becoming);
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
      <h1 ref={headingRef} tabIndex={-1} style={{ outline: "none" }} className={`${DISPLAY} mb-5 max-w-[19ch] text-[40px] leading-[1.12] sm:text-6xl`}>
        {status === "done" ? "Sua história, pronta para seguir." : becoming ? "Um novo capítulo começa aqui." : occasion ? "Uma ocasião, com a sua presença." : gift ? "Um presente começa com uma história." : "Sua história é o ponto de partida."}
      </h1>
      {status === "done" && encryptedContent ? <>
        <p className="mb-8 max-w-[48ch] text-lg leading-relaxed text-ink-2">
          {name ? `${name}, obrigado` : "Obrigado"} por dedicar este tempo à sua história.
          Suas respostas estão reunidas em um arquivo protegido, pronto para você entregar à KOUTH.
        </p>
        <div className="mb-7 flex max-w-lg items-center gap-5 border-y border-line py-6">
          <Logo mark="spark" height={38} className="text-brand" />
          <div className="min-w-0">
            <h2 className="font-display text-2xl text-ink">{name ? `A conversa de ${name}` : "A sua conversa"}</h2>
            <p role="status" className="mt-2 text-sm text-ink-2">{answered} respostas · Arquivo protegido</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={handleDownload} className={BTN_PRIMARY}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" aria-hidden>
              <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Baixar arquivo
          </button>
          <button type="button" onClick={handleCopy} className={BTN_GHOST}>
            {copyStatus === "copied" ? "Copiado!" : "Copiar texto"}
          </button>
        </div>
        <p role="status" className="mt-3 min-h-5 text-sm text-ink-2">
          {copyStatus === "copied" ? "O conteúdo protegido foi copiado. Você já pode colar onde for enviar."
            : copyStatus === "error" ? "Não foi possível copiar. Baixe o arquivo ou abra o conteúdo abaixo para selecionar e copiar."
            : "Baixar e copiar entregam as mesmas respostas protegidas."}
        </p>
        <div className="mt-7 max-w-[52ch] border-t border-line pt-6">
          <h2 className="mb-2 font-display text-2xl text-ink">Agora, envie para a KOUTH.</h2>
          <p className="text-base leading-relaxed text-ink-2">
            {gift ? "Envie o arquivo a quem está conduzindo a criação do presente. Depois da análise, você poderá revisar o texto que o acompanha."
              : occasion ? "Envie o arquivo a quem está conduzindo a criação para a sua ocasião."
              : becoming ? "Envie o arquivo a quem está conduzindo a criação da sua fragrância."
              : DELIVERY_INSTRUCTIONS}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-3">O envio é feito por você. As respostas ainda não foram enviadas à KOUTH.</p>
        </div>
        <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-2">
          {onViewFile && <button type="button" onClick={onViewFile} className="min-h-11 underline decoration-line-strong underline-offset-4 hover:text-ink">Ver arquivo protegido</button>}
          <button type="button" onClick={onBack} className="min-h-11 underline decoration-line-strong underline-offset-4 hover:text-ink">Revisar minhas respostas</button>
        </div>
        {gift && <a href="/presente/revisar" className="mt-4 w-fit py-3 text-sm text-brand underline underline-offset-4">Revisar o texto do presente</a>}
      </> : <>
        <p className="mb-8 max-w-[48ch] text-lg leading-relaxed text-ink-2">
          {name ? `${name}, você` : "Você"} respondeu {answered} de {total} perguntas.
          Ao selar, suas respostas serão protegidas neste aparelho. Depois, você poderá baixar o arquivo e enviá-lo à KOUTH.
        </p>
        <div className="mb-8 max-w-[48ch] border-y border-line py-5 text-base leading-relaxed text-ink-2">
          Cada lembrança acrescenta algo à conversa. Se quiser reler alguma resposta, este é um bom momento.
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <button type="button" onClick={onBack} disabled={status === "processing"} className={BTN_GHOST}>Voltar</button>
          <button type="button" onClick={handleGenerate} disabled={status === "processing"} className={BTN_PRIMARY}>
            {status === "processing" ? "Protegendo suas respostas…" : status === "error" ? "Tentar novamente" : "Selar minhas respostas"}
          </button>
        </div>
        <p role={status === "error" ? "alert" : "status"} aria-live="polite" className={`mt-5 max-w-[48ch] text-sm leading-relaxed ${status === "error" ? "text-warn" : "text-ink-2"}`}>
          {status === "error" ? "Não foi possível proteger o arquivo. Suas respostas continuam neste navegador. Tente novamente."
            : status === "processing" ? "Preparando seu arquivo neste aparelho…"
            : "Só quem tem a chave privada consegue abrir o arquivo final."}
        </p>
      </>}
    </motion.div>
  );
}
