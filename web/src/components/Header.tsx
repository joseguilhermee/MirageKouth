"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SOFT_TRANSITION } from "@/lib/motion";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

/** Botão de texto na barra que abre uma explicação curta; fecha com Esc ou clique fora. */
function InfoPopover({
  label,
  icon,
  title,
  compact = false,
  shortLabel,
  children,
}: {
  /** Versão curta do rótulo para o celular. */
  shortLabel?: string;
  label: string;
  icon: ReactNode;
  title: string;
  /** No celular mostra só o ícone, para a barra caber numa linha. */
  compact?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={ref} className="sm:relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2 py-2 text-xs text-ink-2 sm:gap-2 sm:px-3 sm:text-sm transition hover:bg-terra-wash hover:text-ink"
      >
        {icon}
        {shortLabel ? (
          <>
            <span className="sm:hidden">{shortLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </>
        ) : (
          <span className={compact ? "sr-only sm:not-sr-only" : undefined}>{label}</span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label={title}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={SOFT_TRANSITION}
            className="absolute right-5 left-5 top-full z-50 mt-2 rounded-2xl bg-[var(--paper)] p-5 text-[15px] leading-relaxed text-[var(--popover-ink)] shadow-[0_18px_40px_-12px_rgba(60,30,20,0.35)] sm:right-0 sm:left-auto sm:w-[22rem]"
          >
            <p className="mb-2 font-display text-base font-semibold text-[var(--paper-brand)]">{title}</p>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const LockIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-4 w-4" aria-hidden>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const BookIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="h-4 w-4" aria-hidden>
    <path d="M4 19.5V6a2 2 0 0 1 2-2h13v15H6a2 2 0 0 0 0 4h13" />
  </svg>
);

export function Header({ extra }: { extra?: ReactNode }) {
  return (
    <header className="relative z-40 mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-5 sm:px-10 sm:py-7 lg:px-16">
      <span className="flex text-brand sm:hidden">
        <Logo mark="wordmark" height={21} />
      </span>
      <span className="hidden text-brand sm:flex">
        <Logo mark="wordmark" height={26} />
      </span>
      <div className="ml-auto"><ThemeToggle /></div>
      <nav className="flex w-full items-center justify-between gap-0.5 sm:w-auto sm:justify-start sm:gap-2" aria-label="Sobre o questionário">
        {extra}
        <InfoPopover label="Base teórica" icon={BookIcon} title="Base teórica" compact>
          <p>
            O arquétipo é um conceito de <strong>Carl Jung</strong> — estruturas do
            inconsciente coletivo, não uma lista fechada. O conjunto de{" "}
            <strong>12 arquétipos</strong> usado aqui (Herói, Sábio, Criador…) é de{" "}
            <strong>Carol Pearson</strong>, formalizado em <em>The Hero Within</em> (1986).
          </p>
          <p className="mt-2 text-[var(--paper-muted)]">
            As perguntas seguem o modelo de entrevista de identidade narrativa de{" "}
            <strong>Dan McAdams</strong> — cenas-chave, viradas, capítulos de vida — em vez
            de um teste de múltipla escolha. Mesmo assim, é uma leitura interpretativa, não
            um diagnóstico.
          </p>
        </InfoPopover>
        <InfoPopover
          label="Cifrado neste aparelho"
          shortLabel="Cifrado aqui"
          icon={LockIcon}
          title="Como isso é protegido"
        >
          <p>
            Durante a conversa, o rascunho fica salvo <strong>neste navegador</strong>,
            para você poder continuar depois. Ele ainda não é o arquivo criptografado.
          </p>
          <p className="mt-2 text-[var(--paper-muted)]">
            Ao finalizar, você gera um arquivo protegido no próprio aparelho.
            Só quem tem a chave privada consegue abri-lo. Nada é enviado automaticamente:
            você escolhe como entregar o arquivo à KOUTH.
          </p>
          <details className="mt-3 text-sm text-[var(--paper-muted)]">
            <summary className="cursor-pointer py-2 underline underline-offset-4">Detalhes da proteção</summary>
            <p className="mt-2">O arquivo final usa RSA-OAEP-4096 e AES-256-GCM, com a criptografia executada no seu navegador.</p>
          </details>
        </InfoPopover>
      </nav>
    </header>
  );
}
