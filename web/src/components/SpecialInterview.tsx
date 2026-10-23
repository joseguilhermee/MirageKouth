"use client";

import { useEffect, useRef, useState } from "react";
import { Header } from "./Header";
import { QuestionCard } from "./QuestionCard";
import { FinalScreen } from "./FinalScreen";
import { ProgressBar } from "./ProgressBar";
import { PranchetaButton, PranchetaDrawer, type PranchetaItem } from "./Prancheta";
import { SealFlight, type Flight } from "./SealFlight";
import { SkyShell } from "./SkyShell";
import { buildSteps, shownSteps, type Question, type QuestionDetail } from "@/lib/questions";
import { generateSessionKey } from "@/lib/crypto";
import { captureFlight } from "@/lib/captureFlight";
import type { GiftInfo } from "@/lib/giftQuestions";

export function SpecialInterview({
  name, label, questions, step, answers, details, detailAt, gift, occasion, becoming,
  onAnswer, onDetail, onStep, onBack, onChoosePurpose, onCompleted,
}: {
  name: string;
  label: string;
  questions: Question[];
  step: number;
  answers: Record<number, string>;
  details: Record<number, QuestionDetail>;
  detailAt?: (index: number) => QuestionDetail;
  gift?: { info: GiftInfo; questions: Question[] };
  occasion?: { questions: Question[] };
  becoming?: { questions: Question[] };
  onAnswer: (index: number, value: string) => void;
  onDetail: (index: number, detail: QuestionDetail) => void;
  onStep: (index: number) => void;
  onBack: () => void;
  onChoosePurpose: () => void;
  onCompleted: () => void;
}) {
  const total = questions.length;
  const isFinal = step >= total;
  const getDetail = (index: number) => detailAt?.(index) ?? details[index] ?? {};
  const [sessionKey, setSessionKey] = useState<CryptoKey | null>(null);
  const [pranchetaOpen, setPranchetaOpen] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [departingStep, setDepartingStep] = useState<number | null>(null);
  const [pulse, setPulse] = useState(0);
  const [editRevision, setEditRevision] = useState(0);
  const pranchetaButtonRef = useRef<HTMLButtonElement>(null);
  const flightFrom = useRef(0);

  useEffect(() => {
    generateSessionKey().then(setSessionKey).catch(() => setSessionKey(null));
  }, []);

  const items: PranchetaItem[] = questions.flatMap((question, index) => {
    if (occasion && question.id === "O03" && step < index) return [];
    const answer = answers[index] ?? "";
    const detail = getDetail(index);
    if (!shownSteps(question, answer, detail).complete) return [];
    const responses = [answer.trim(), ...buildSteps(question, answer, detail).map(step => step.resposta)].filter(Boolean);
    return [{ index, question: question.text || question.steps[0]?.prompt || question.id, text: responses.join("\n") }];
  });

  function startSeal(field: HTMLElement) {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
    const fields = captureFlight(field);
    if (!fields.length) return false;
    flightFrom.current = step;
    setFlight({ id: Date.now(), fields });
    return true;
  }

  function closePrancheta() {
    setPranchetaOpen(false);
    pranchetaButtonRef.current?.focus();
  }

  return <SkyShell progress={isFinal ? 1 : step / Math.max(total - 1, 1)} night={isFinal}>
    <Header extra={<PranchetaButton ref={pranchetaButtonRef} count={items.length} total={total} pulse={pulse}
      open={pranchetaOpen} onClick={() => setPranchetaOpen(true)} />} />

    <main className="mx-auto w-full max-w-[1200px] flex-1 px-5 pt-10 pb-4 sm:px-10 sm:pt-14 lg:px-16 lg:pt-20">
      <div className="mx-auto min-w-0 max-w-[760px]">
          {isFinal ? <FinalScreen name={name} answered={items.length} total={total}
            answers={answers} timings={{}} details={details} gift={gift} occasion={occasion} becoming={becoming}
            onBack={() => { setFileContent(null); onStep(total - 1); }} onDone={onCompleted}
            onGenerated={content => {
              setFileContent(content);
            }} onViewFile={() => setPranchetaOpen(true)} />
          : <>
              <p className="mb-6 text-sm text-ink-2">{label}</p>
              <QuestionCard key={`${questions[step].id}:${editRevision}`} index={step} total={total} question={questions[step]} value={answers[step] ?? ""}
                onChange={value => onAnswer(step, value)} detail={getDetail(step)} onDetailChange={detail => onDetail(step, detail)}
                onNext={() => onStep(Math.min(step + 1, total))} onBack={onBack} canBackFirst
                onChoosePurpose={onChoosePurpose} firstBackLabel={gift ? "Rever dados do presente" : undefined}
                onSeal={startSeal} departing={departingStep === step} />
            </>}
      </div>
    </main>

    <ProgressBar current={Math.min(step, total)} total={total} />

    {flight && <SealFlight key={flight.id} flight={flight} sessionKey={sessionKey}
      getTarget={() => pranchetaButtonRef.current?.getBoundingClientRect() ?? null}
      onScrambled={() => setDepartingStep(flightFrom.current)}
      onLanded={() => {
        onStep(Math.min(flightFrom.current + 1, total));
        setFlight(null);
        setDepartingStep(null);
        setPulse(value => value + 1);
      }} />}

    <PranchetaDrawer open={pranchetaOpen} onClose={closePrancheta} items={items} total={total}
      sessionKey={sessionKey} fileContent={isFinal ? fileContent : null}
      onEdit={index => {
        setFlight(null);
        setDepartingStep(null);
        setEditRevision(value => value + 1);
        setPranchetaOpen(false);
        setFileContent(null);
        onStep(index);
      }} />
  </SkyShell>;
}
