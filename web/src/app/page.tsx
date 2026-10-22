"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { Header } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { WelcomeStep } from "@/components/WelcomeStep";
import { InstructionsStep } from "@/components/InstructionsStep";
import { QuestionCard } from "@/components/QuestionCard";
import { FinalScreen } from "@/components/FinalScreen";
import { IntroSequence } from "@/components/IntroSequence";
import { ResumePrompt } from "@/components/ResumePrompt";
import { PranchetaButton, PranchetaDrawer, type PranchetaItem } from "@/components/Prancheta";
import { SealFlight, type Flight } from "@/components/SealFlight";
import { QUESTIONS, shownSteps, type QuestionDetail } from "@/lib/questions";
import { generateSessionKey } from "@/lib/crypto";
import { NIGHT, skyAt } from "@/lib/sky";

// v3: entrou um item novo no meio do roteiro (o portão do Sábio, depois do 14),
// então todos os índices a partir dali deslocaram. Progresso salvo em v2
// apontaria respostas para as perguntas erradas — por isso a chave muda.
// v7: fusão com a versão de 28 — 20 itens, ordem nova (ver questions.ts).
const STORAGE_KEY = "mirage-progress-v9";
const STEP_WELCOME = -2;
const STEP_INSTRUCTIONS = -1;

type SavedProgress = {
  name: string;
  answers: Record<number, string>;
  step: number;
  /** Milissegundos gastos em cada pergunta; opcional pra aceitar progresso salvo antes do contador. */
  timings?: Record<number, number>;
  details?: Record<number, QuestionDetail>;
};

type Stage = "intro" | "resume" | "app";

function hasMeaningfulProgress(saved: SavedProgress | null): saved is SavedProgress {
  if (!saved) return false;
  const answered = Object.values(saved.answers ?? {}).some((v) => v.trim().length > 0);
  return saved.name.trim().length > 0 || answered || (saved.step ?? STEP_WELCOME) > STEP_INSTRUCTIONS;
}

/** O céu da página: a tarde anda com as perguntas; a noite é só para selar. */
function SkyShell({
  progress,
  night,
  children,
}: {
  progress: number;
  night?: boolean;
  children: React.ReactNode;
}) {
  const sky = night ? NIGHT : skyAt(progress);
  return (
    // reducedMotion="user": toda animação do framer respeita a preferência do sistema.
    <MotionConfig reducedMotion="user">
      <div
        data-sky={night ? "night" : "day"}
        className="sky flex min-h-dvh flex-1 flex-col text-ink"
        style={{ "--sky-top": sky.top, "--sky-mid": sky.mid, "--sky-low": sky.low } as React.CSSProperties}
      >
        {children}
      </div>
    </MotionConfig>
  );
}

export default function Home() {
  const total = QUESTIONS.length;
  const [name, setName] = useState("");
  const [step, setStep] = useState(STEP_WELCOME);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timings, setTimings] = useState<Record<number, number>>({});
  const [details, setDetails] = useState<Record<number, QuestionDetail>>({});
  const [sessionKey, setSessionKey] = useState<CryptoKey | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [stage, setStage] = useState<Stage>("intro");
  const [savedProgress, setSavedProgress] = useState<SavedProgress | null>(null);

  useEffect(() => {
    generateSessionKey().then(setSessionKey).catch(() => setSessionKey(null));
  }, []);

  // Lê o progresso salvo (se houver) mas NÃO aplica ainda — só guarda pra
  // perguntar depois da abertura (ver ResumePrompt). A abertura em si
  // sempre toca, mesmo com progresso salvo, a pedido do usuário.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSavedProgress(JSON.parse(raw) as SavedProgress);
      }
    } catch {
      // localStorage indisponível ou dado corrompido: ignora, começa do zero.
    }
  }, []);

  // Chamado quando a abertura termina (ou é pulada). Se havia progresso de
  // verdade salvo, pergunta antes de aplicar; senão já libera o app com
  // estado vazio.
  function handleIntroDone() {
    if (hasMeaningfulProgress(savedProgress)) {
      setStage("resume");
    } else {
      setHydrated(true);
      setStage("app");
    }
  }

  function handleResume() {
    if (savedProgress) {
      setName(savedProgress.name ?? "");
      setAnswers(savedProgress.answers ?? {});
      setTimings(savedProgress.timings ?? {});
      setDetails(savedProgress.details ?? {});
      setStep(savedProgress.step ?? STEP_WELCOME);
    }
    setHydrated(true);
    setStage("app");
  }

  function handleRestart() {
    clearSavedProgress();
    setHydrated(true);
    setStage("app");
  }

  // Salva progresso a cada mudança, só depois de resolvida a decisão de
  // retomar/recomeçar (evita sobrescrever o progresso salvo antes da hora).
  useEffect(() => {
    if (!hydrated) return;
    try {
      const payload: SavedProgress = { name, answers, step, timings, details };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Se não der pra salvar (modo privado, quota etc.), segue sem persistir.
    }
  }, [hydrated, name, answers, step, timings, details]);

  // Soma o tempo em que cada pergunta ficou na tela (só enquanto a aba está
  // visível). Voltar e reabrir uma pergunta acumula no mesmo item.
  useEffect(() => {
    if (stage !== "app" || step < 0 || step >= total) return;
    const current = step;
    let startedAt: number | null = document.hidden ? null : Date.now();

    function flush() {
      if (startedAt === null) return;
      const elapsed = Date.now() - startedAt;
      startedAt = null;
      setTimings((prev) => ({ ...prev, [current]: (prev[current] ?? 0) + elapsed }));
    }
    function handleVisibility() {
      if (document.hidden) flush();
      else startedAt = Date.now();
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      flush();
    };
  }, [stage, step, total]);

  const isFinal = step >= total;

  const [pranchetaOpen, setPranchetaOpen] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [departingStep, setDepartingStep] = useState<number | null>(null);
  const [pulse, setPulse] = useState(0);
  const pranchetaButtonRef = useRef<HTMLButtonElement>(null);
  const flightFrom = useRef(0);

  // Copia a geometria do campo para a resposta virar cifra exatamente onde
  // foi escrita. Sem animação (preferência do sistema), segue direto.
  function startSeal(field: HTMLTextAreaElement, from: number) {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
    if (!field.value.trim()) return false;
    // A principal primeiro; depois os passos em texto da mesma pergunta.
    const others = [...(field.closest("main")?.querySelectorAll("textarea") ?? [])].filter(
      (t) => t !== field && t.value.trim()
    );
    const fields = [field, ...others].map((t) => {
      const r = t.getBoundingClientRect();
      const cs = getComputedStyle(t);
      return {
        text: t.value,
        rect: { left: r.left, top: r.top, width: r.width, height: r.height },
        scrollTop: t.scrollTop,
        font: cs.font,
        lineHeight: cs.lineHeight,
        padding: cs.padding,
      };
    });
    flightFrom.current = from;
    setFlight({ id: Date.now(), fields });
    return true;
  }
  const answered = useMemo(
    () => Object.values(answers).filter((v) => v.trim().length > 0).length,
    [answers]
  );

  // Avisa antes de fechar/recarregar se já tem progresso e ainda não terminou.
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      const hasProgress = name.trim().length > 0 || answered > 0;
      if (hasProgress && !isFinal) {
        e.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [name, answered, isFinal]);

  function clearSavedProgress() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nada a fazer se não der pra limpar.
    }
  }

  if (stage === "intro") {
    return (
      <SkyShell progress={0}>
        <IntroSequence questionCount={total} onDone={handleIntroDone} />
      </SkyShell>
    );
  }

  if (stage === "resume" && savedProgress) {
    return (
      <SkyShell progress={0}>
        <Header />
        <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-5 py-12 sm:px-10 lg:px-16">
          <ResumePrompt
            name={savedProgress.name}
            answered={
              Object.values(savedProgress.answers ?? {}).filter((v) => v.trim().length > 0)
                .length
            }
            total={total}
            onResume={handleResume}
            onRestart={handleRestart}
          />
        </main>
      </SkyShell>
    );
  }

  const progress = step < 0 ? 0 : Math.min(step, total - 1) / Math.max(1, total - 1);

  // Prancheta: só entram perguntas completas (principal e todos os passos).
  const pranchetaItems: PranchetaItem[] = QUESTIONS.flatMap((q, i) =>
    shownSteps(q, answers[i] ?? "", details[i]).complete
      ? [{ index: i, question: q.text, text: (answers[i] ?? "").trim() }]
      : []
  );

  function closePrancheta() {
    setPranchetaOpen(false);
    pranchetaButtonRef.current?.focus();
  }

  return (
    <SkyShell progress={progress} night={isFinal}>
      <Header
        extra={
          step >= 0 && (
            <PranchetaButton
              ref={pranchetaButtonRef}
              count={pranchetaItems.length}
              total={total}
              pulse={pulse}
              open={pranchetaOpen}
              onClick={() => setPranchetaOpen(true)}
            />
          )
        }
      />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pt-10 pb-4 sm:px-10 sm:pt-14 lg:px-16 lg:pt-20">
        <div className="mx-auto min-w-0 max-w-[760px]">
          <AnimatePresence mode="wait">
            {step === STEP_WELCOME ? (
              <WelcomeStep
                key="welcome"
                value={name}
                onChange={setName}
                onNext={() => setStep(STEP_INSTRUCTIONS)}
              />
            ) : step === STEP_INSTRUCTIONS ? (
              <InstructionsStep
                key="instructions"
                onNext={() => setStep(0)}
                onBack={() => setStep(STEP_WELCOME)}
              />
            ) : isFinal ? (
              <FinalScreen
                key="final"
                name={name}
                answered={answered}
                total={total}
                answers={answers}
                timings={timings}
                details={details}
                onBack={() => setStep(total - 1)}
                onDone={clearSavedProgress}
                onGenerated={(content) => {
                  setFileContent(content);
                  // Um instante para a lista de etapas aparecer antes da prancheta abrir.
                  setTimeout(() => setPranchetaOpen(true), 500);
                }}
              />
            ) : (
              <QuestionCard
                key={step}
                index={step}
                total={total}
                question={QUESTIONS[step]}
                value={answers[step] ?? ""}
                onChange={(value) =>
                  setAnswers((prev) => ({ ...prev, [step]: value }))
                }
                detail={details[step] ?? {}}
                onDetailChange={(detail) =>
                  setDetails((prev) => ({ ...prev, [step]: detail }))
                }
                // Relativo à própria pergunta, não ao passo atual: durante a
                // animação de saída o card anterior ainda recebe clique, e um
                // segundo "Próxima" nele pularia a pergunta seguinte em branco.
                onNext={() => setStep(Math.min(step + 1, total))}
                onBack={() => setStep(Math.max(step - 1, 0))}
                onSeal={(field) => startSeal(field, step)}
                departing={departingStep === step}
              />
            )}
          </AnimatePresence>
        </div>
      </main>

      {step >= 0 && <ProgressBar current={Math.min(step, total)} total={total} />}

      {flight && (
        <SealFlight
          key={flight.id}
          flight={flight}
          sessionKey={sessionKey}
          getTarget={() => pranchetaButtonRef.current?.getBoundingClientRect() ?? null}
          onScrambled={() => setDepartingStep(flightFrom.current)}
          onLanded={() => {
            setStep(Math.min(flightFrom.current + 1, total));
            setFlight(null);
            setDepartingStep(null);
            setPulse((p) => p + 1);
          }}
        />
      )}

      <PranchetaDrawer
        open={pranchetaOpen}
        onClose={closePrancheta}
        items={pranchetaItems}
        total={total}
        sessionKey={sessionKey}
        fileContent={isFinal ? fileContent : null}
        onEdit={(i) => {
          setPranchetaOpen(false);
          setStep(i);
        }}
      />
    </SkyShell>
  );
}
