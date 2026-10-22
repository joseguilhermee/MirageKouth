"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE_OUT, ENTER_TRANSITION, EXIT_TRANSITION, SOFT_TRANSITION } from "@/lib/motion";
import { DISPLAY } from "@/lib/ui";
import { ArrowRight, Kbd } from "./Glyphs";
import { Logo } from "./Logo";

type Phase = "icon" | "wordmark" | "text";

const ICON_MS = 1100;
const WORDMARK_MS = 950;
const DOT_COUNT = 6;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildLines(questionCount: number): ReactNode[] {
  return [
    "Vamos descobrir, juntos, os seus arquétipos.",
    <>
      A leitura usa os <span className="text-brand">12 arquétipos</span> de Carol
      Pearson, a partir do conceito criado por Carl Jung.
    </>,
    <>
      Suas respostas seguem <span className="text-brand">criptografadas</span> — ninguém
      vai lê-las.
    </>,
    <>
      Só pedimos uma coisa: <span className="text-brand">sinceridade</span>. É o que te
      aproxima do resultado real.
    </>,
    `${questionCount} perguntas abertas. Leve o tempo que precisar.`,
  ];
}

type ExampleCard = {
  name: string;
  initials: string;
  hint: string;
  /**
   * Foto real (retrato/pintura de domínio público — obra antiga o
   * suficiente, ou registro de governo como as da NASA). Nunca fotos de
   * celebridades vivas/recentes ou personagens fictícios com direito
   * autoral ativo — ver docs/superpowers/specs para o motivo. Se faltar
   * (arquivo ausente/erro de carregamento), cai no avatar de iniciais.
   */
  photo?: string;
  /** Ajusta o enquadramento do rosto no círculo, quando o padrão (centro) corta mal. */
  photoPosition?: string;
  archetypes: { name: string; dots: number }[];
};

// 12 arquétipos de Pearson, 2 figuras históricas muito famosas para cada um
// (todas de domínio público), com os 3 arquétipos mais fortes de cada
// uma. Associações são interpretações — não são absolutas (esse é o
// próprio ponto da tela).
const EXAMPLE_CARDS: ExampleCard[] = [
  { name: "Joana d'Arc", initials: "JA", hint: "heroína francesa", photo: "/people/joana-darc.jpg", archetypes: [{ name: "Inocente", dots: 6 }, { name: "Herói", dots: 4 }, { name: "Rebelde", dots: 3 }] },
  { name: "Helen Keller", initials: "HK", hint: "escritora e ativista", photo: "/people/helen-keller.jpg", archetypes: [{ name: "Inocente", dots: 6 }, { name: "Sábio", dots: 4 }, { name: "Herói", dots: 3 }] },
  { name: "Abraham Lincoln", initials: "AL", hint: "16º presidente dos EUA", photo: "/people/abraham-lincoln.jpg", archetypes: [{ name: "Pessoa Comum", dots: 6 }, { name: "Governante", dots: 4 }, { name: "Herói", dots: 3 }] },
  { name: "Charlie Chaplin", initials: "CC", hint: "o vagabundo genial", photo: "/people/charlie-chaplin.jpg", archetypes: [{ name: "Pessoa Comum", dots: 6 }, { name: "Bobo", dots: 4 }, { name: "Criador", dots: 3 }] },
  { name: "Napoleão", initials: "NB", hint: "imperador francês", photo: "/people/napoleao.jpg", archetypes: [{ name: "Herói", dots: 6 }, { name: "Governante", dots: 4 }, { name: "Criador", dots: 3 }] },
  { name: "Alexandre o Grande", initials: "AG", hint: "conquistador macedônio", photo: "/people/alexandre-o-grande.jpg", archetypes: [{ name: "Herói", dots: 6 }, { name: "Governante", dots: 4 }, { name: "Explorador", dots: 3 }] },
  { name: "Florence Nightingale", initials: "FN", hint: "pioneira da enfermagem", photo: "/people/florence-nightingale.jpg", archetypes: [{ name: "Cuidador", dots: 6 }, { name: "Sábio", dots: 4 }, { name: "Rebelde", dots: 3 }] },
  { name: "Clara Barton", initials: "CB", hint: "fundadora da Cruz Vermelha", photo: "/people/clara-barton.jpg", archetypes: [{ name: "Cuidador", dots: 6 }, { name: "Herói", dots: 4 }, { name: "Criador", dots: 3 }] },
  { name: "Cristóvão Colombo", initials: "CC", hint: "navegador genovês", photo: "/people/cristovao-colombo.jpg", archetypes: [{ name: "Explorador", dots: 6 }, { name: "Herói", dots: 4 }, { name: "Rebelde", dots: 3 }] },
  { name: "Amelia Earhart", initials: "AE", hint: "pioneira da aviação", photo: "/people/amelia-earhart.jpg", archetypes: [{ name: "Explorador", dots: 6 }, { name: "Herói", dots: 4 }, { name: "Rebelde", dots: 3 }] },
  { name: "Mahatma Gandhi", initials: "MG", hint: "líder da não-violência", photo: "/people/mahatma-gandhi.jpg", archetypes: [{ name: "Rebelde", dots: 6 }, { name: "Sábio", dots: 4 }, { name: "Cuidador", dots: 3 }] },
  { name: "Robespierre", initials: "MR", hint: "revolucionário francês", photo: "/people/robespierre.jpg", archetypes: [{ name: "Rebelde", dots: 6 }, { name: "Governante", dots: 4 }, { name: "Herói", dots: 3 }] },
  { name: "Cleópatra", initials: "CL", hint: "última faraó do Egito", photo: "/people/cleopatra.jpg", archetypes: [{ name: "Amante", dots: 6 }, { name: "Governante", dots: 4 }, { name: "Mago", dots: 3 }] },
  { name: "Casanova", initials: "GC", hint: "o sedutor original", photo: "/people/casanova.jpg", archetypes: [{ name: "Amante", dots: 6 }, { name: "Explorador", dots: 4 }, { name: "Criador", dots: 3 }] },
  { name: "Leonardo da Vinci", initials: "LV", hint: "gênio renascentista", photo: "/people/leonardo-da-vinci.jpg", photoPosition: "52% 32%", archetypes: [{ name: "Criador", dots: 6 }, { name: "Sábio", dots: 4 }, { name: "Mago", dots: 3 }] },
  { name: "Michelangelo", initials: "MI", hint: "escultor e pintor", photo: "/people/michelangelo.jpg", archetypes: [{ name: "Criador", dots: 6 }, { name: "Herói", dots: 4 }, { name: "Sábio", dots: 3 }] },
  { name: "Mark Twain", initials: "MT", hint: "escritor e humorista", photo: "/people/mark-twain.jpg", archetypes: [{ name: "Bobo", dots: 6 }, { name: "Sábio", dots: 4 }, { name: "Criador", dots: 3 }] },
  { name: "Voltaire", initials: "VO", hint: "filósofo iluminista", photo: "/people/voltaire.jpg", archetypes: [{ name: "Bobo", dots: 6 }, { name: "Sábio", dots: 4 }, { name: "Rebelde", dots: 3 }] },
  { name: "Sócrates", initials: "SO", hint: "filósofo grego", photo: "/people/socrates.jpg", archetypes: [{ name: "Sábio", dots: 6 }, { name: "Bobo", dots: 4 }, { name: "Rebelde", dots: 3 }] },
  { name: "Confúcio", initials: "CF", hint: "sábio chinês", photo: "/people/confucio.jpg", archetypes: [{ name: "Sábio", dots: 6 }, { name: "Governante", dots: 4 }, { name: "Cuidador", dots: 3 }] },
  { name: "Nikola Tesla", initials: "NT", hint: "inventor visionário", photo: "/people/nikola-tesla.jpeg", archetypes: [{ name: "Mago", dots: 6 }, { name: "Criador", dots: 4 }, { name: "Sábio", dots: 3 }] },
  { name: "Nostradamus", initials: "NO", hint: "profeta e astrólogo", photo: "/people/nostradamus.jpg", archetypes: [{ name: "Mago", dots: 6 }, { name: "Sábio", dots: 4 }, { name: "Criador", dots: 3 }] },
  { name: "Júlio César", initials: "JC", hint: "imperador romano", photo: "/people/julio-cesar.jpg", archetypes: [{ name: "Governante", dots: 6 }, { name: "Herói", dots: 4 }, { name: "Rebelde", dots: 3 }] },
  { name: "Elizabeth I", initials: "EI", hint: "rainha da Era de Ouro", photo: "/people/elizabeth-i.jpg", archetypes: [{ name: "Governante", dots: 6 }, { name: "Sábio", dots: 4 }, { name: "Herói", dots: 3 }] },
];

function PersonAvatar({ card }: { card: ExampleCard }) {
  const [failed, setFailed] = useState(false);

  if (!card.photo || failed) {
    return (
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-terra font-display text-base font-semibold text-terra-ink">
        {card.initials}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={card.photo}
      alt={card.name}
      onError={() => setFailed(true)}
      style={card.photoPosition ? { objectPosition: card.photoPosition } : undefined}
      className="h-16 w-16 shrink-0 rounded-full object-cover"
    />
  );
}

function DotMeter({ value }: { value: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: DOT_COUNT }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i < value ? "bg-terra" : "bg-line"}`}
        />
      ))}
    </div>
  );
}

export function IntroSequence({
  questionCount,
  onDone,
}: {
  questionCount: number;
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<Phase>("icon");
  const [stepIndex, setStepIndex] = useState(0);
  const [showSkip, setShowSkip] = useState(false);

  const lines = buildLines(questionCount);

  // Refs pra evitar closures desatualizadas no listener global de teclado
  // (que é anexado uma única vez, ver useEffect mais abaixo). Atualizadas
  // em efeitos (não durante o render) porque refs não são estado de UI.
  const phaseRef = useRef(phase);
  const stepIndexRef = useRef(stepIndex);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    stepIndexRef.current = stepIndex;
  }, [stepIndex]);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    let cancelled = false;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    async function run() {
      if (reduceMotion) {
        onDoneRef.current();
        return;
      }

      await wait(ICON_MS);
      if (cancelled) return;
      setPhase("wordmark");

      await wait(WORDMARK_MS);
      if (cancelled) return;
      setPhase("text");
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => setShowSkip(true), 700);
    return () => clearTimeout(handle);
  }, []);

  function advanceStep() {
    if (stepIndexRef.current >= lines.length) {
      onDoneRef.current();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, lines.length));
  }

  // Listener anexado uma única vez (deps vazias) — lê phase/stepIndex via
  // refs pra nunca agir sobre um valor desatualizado. Enter/espaço avançam.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (phaseRef.current !== "text") return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        advanceStep();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const iconShrunk = phase !== "icon";
  const showingCards = phase === "text" && stepIndex >= lines.length;

  return (
    <div className="sky fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-5 py-10 text-ink">
      <AnimatePresence>
        {(phase === "icon" || phase === "wordmark") && (
          <motion.div
            key="mark"
            exit={{ opacity: 0, transition: { duration: 0.6, ease: EASE_OUT } }}
            className="flex flex-col items-center"
          >
            <div className="relative flex items-center justify-center">
              <motion.span
                initial={{ scale: 0.3, opacity: 0, rotate: -18 }}
                animate={{
                  scale: iconShrunk ? 0.42 : 1,
                  opacity: 1,
                  rotate: 0,
                }}
                transition={{ duration: iconShrunk ? 0.8 : 1.1, ease: EASE_OUT }}
                className="relative text-brand"
              >
                <Logo mark="spark" height={168} label="" />
              </motion.span>
            </div>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: iconShrunk ? 1 : 0, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT }}
              className="mt-1 text-brand"
            >
              <Logo mark="wordmark" height={30} />
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "text" && !showingCards && (
        <div className="flex flex-col items-center max-w-2xl">
          <span className="mb-6 text-sm tabular-nums text-ink-3">
            {String(stepIndex + 1).padStart(2, "0")} / {String(lines.length).padStart(2, "0")}
          </span>

          <AnimatePresence mode="wait">
            <motion.p
              key={stepIndex}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: EXIT_TRANSITION }}
              transition={ENTER_TRANSITION}
              className={`${DISPLAY} text-center text-[28px] leading-[1.2] sm:text-[44px] sm:leading-[1.15]`}
            >
              {lines[stepIndex]}
            </motion.p>
          </AnimatePresence>

          <button
            type="button"
            onClick={advanceStep}
            aria-label="Próxima"
            className="mt-12 flex h-14 w-14 items-center justify-center rounded-full bg-action text-action-ink transition hover:brightness-110"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-6 w-6">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="mt-3 text-[13px] text-ink-3">
            clique ou pressione <Kbd>Enter</Kbd>
          </span>
        </div>
      )}

      {showingCards && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={ENTER_TRANSITION}
          className="flex flex-col items-center max-w-5xl w-full h-full"
        >
          <h2 className={`${DISPLAY} mb-2 shrink-0 text-center text-[28px] leading-tight sm:text-4xl`}>
            Cada arquétipo, duas pessoas muito famosas
          </h2>
          <p className="mb-8 max-w-[52ch] shrink-0 text-center text-[15px] leading-relaxed text-ink-2">
            Ninguém é só uma coisa — cada pessoa carrega uma combinação dos 3 arquétipos
            mais fortes nela. As associações abaixo são só um gostinho de como a leitura
            funciona.
          </p>

          <div className="flex-1 min-h-0 w-full overflow-y-auto px-1">
            <div className="grid w-full grid-cols-1 gap-x-10 pb-4 sm:grid-cols-2 lg:grid-cols-3">
              {EXAMPLE_CARDS.map((card) => (
                <div
                  key={card.name}
                  className="flex flex-col gap-4 border-t border-line py-5 text-left"
                >
                  <div className="flex items-center gap-4">
                    <PersonAvatar card={card} />
                    <div className="min-w-0">
                      <p className="truncate font-display text-lg font-semibold text-ink">
                        {card.name}
                      </p>
                      <p className="truncate text-[13px] text-ink-2">{card.hint}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {card.archetypes.map((a) => (
                      <div key={a.name} className="flex items-center justify-between gap-3">
                        <span className="text-[15px] text-ink">{a.name}</span>
                        <DotMeter value={a.dots} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onDone}
            aria-label="Começar"
            className="mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-action text-action-ink transition hover:brightness-110"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} className="h-6 w-6">
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="mt-3 shrink-0 text-[13px] text-ink-3">
            clique ou pressione <Kbd>Enter</Kbd>
          </span>
        </motion.div>
      )}

      <AnimatePresence>
        {showSkip && (
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SOFT_TRANSITION}
            onClick={onDone}
            className="fixed bottom-6 right-6 rounded-full px-4 py-2 text-sm text-ink-2 transition hover:bg-terra-wash hover:text-ink"
          >
            <span className="flex items-center gap-1.5">Pular <ArrowRight /></span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
