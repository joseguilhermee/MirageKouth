"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import { TrustBadge } from "@/components/TrustBadge";
import { MethodologyBadge } from "@/components/MethodologyBadge";
import { CipherPreview } from "@/components/CipherPreview";
import { WelcomeStep } from "@/components/WelcomeStep";
import { InstructionsStep } from "@/components/InstructionsStep";
import { QuestionCard } from "@/components/QuestionCard";
import { FinalScreen } from "@/components/FinalScreen";
import { IntroSequence } from "@/components/IntroSequence";
import { ResumePrompt } from "@/components/ResumePrompt";
import { QUESTIONS } from "@/lib/questions";
import { generateSessionKey } from "@/lib/crypto";

// v2: pergunta 21 questões abertas em vez das 52 antigas de múltipla escolha —
// progresso salvo no formato antigo (índices/step diferentes) não é compatível.
const STORAGE_KEY = "mirage-progress-v2";
const STEP_WELCOME = -2;
const STEP_INSTRUCTIONS = -1;

type SavedProgress = {
  name: string;
  answers: Record<number, string>;
  step: number;
};

type Stage = "intro" | "resume" | "app";

function hasMeaningfulProgress(saved: SavedProgress | null): saved is SavedProgress {
  if (!saved) return false;
  const answered = Object.values(saved.answers ?? {}).some((v) => v.trim().length > 0);
  return saved.name.trim().length > 0 || answered || (saved.step ?? STEP_WELCOME) > STEP_INSTRUCTIONS;
}

export default function Home() {
  const total = QUESTIONS.length;
  const [name, setName] = useState("");
  const [step, setStep] = useState(STEP_WELCOME);
  const [answers, setAnswers] = useState<Record<number, string>>({});
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
      const payload: SavedProgress = { name, answers, step };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Se não der pra salvar (modo privado, quota etc.), segue sem persistir.
    }
  }, [hydrated, name, answers, step]);

  const isFinal = step >= total;
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
    return <IntroSequence questionCount={total} onDone={handleIntroDone} />;
  }

  if (stage === "resume" && savedProgress) {
    return (
      <main className="flex-1 flex flex-col px-6 sm:px-10 lg:px-16">
        <Header />
        <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col justify-center py-8">
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
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col px-6 sm:px-10 lg:px-16">
      <Header />

      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col py-8">
        {step >= 0 && <ProgressBar current={Math.min(step, total)} total={total} />}

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.55fr_1fr] gap-10 lg:gap-16 mt-12 min-h-[480px]">
          {/* mode="wait": a pergunta anterior termina de sair antes da
              próxima entrar. Com popLayout as duas ficavam visíveis ao
              mesmo tempo (crossfade), e dois títulos grandes sobrepostos
              ficava poluído — sequencial fica limpo, e a saída é rápida
              o bastante (ver EXIT_TRANSITION) pra não parecer lento. */}
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
                onBack={() => setStep(total - 1)}
                onDone={clearSavedProgress}
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
                onNext={() => setStep((s) => Math.min(s + 1, total))}
                onBack={() => setStep((s) => Math.max(s - 1, 0))}
              />
            )}
          </AnimatePresence>

          <div>
            <CipherPreview
              text={step < 0 ? name : !isFinal ? answers[step] ?? "" : ""}
              sessionKey={sessionKey}
            />
          </div>
        </div>
      </div>

      <footer className="flex justify-center py-8 opacity-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logos/wordmark-horizontal.svg" alt="MirageKouth" className="h-3 w-auto" />
      </footer>

      <TrustBadge />
      <MethodologyBadge />
    </main>
  );
}
