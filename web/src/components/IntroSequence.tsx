"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BTN_PRIMARY, DISPLAY } from "@/lib/ui";
import { ArrowRight } from "./Glyphs";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { IntroStoryDemo, IntroPrivacyDemo } from "./IntroDemos";

const TOPICS = ["O encontro", "A sua história", "O cuidado"];

export function IntroSequence({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    container.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0, behavior: "instant" });
    heading.current?.focus({ preventScroll: true });
  }, [step]);

  function advance() {
    if (step < 2) setStep(step + 1);
    else {
      window.scrollTo({ top: 0, behavior: "instant" });
      onDone();
    }
  }

  return <div ref={container} className="kouth-reception">
    <aside className="kouth-presence" aria-label="Universo KOUTH">
      <Image src="/brand/presence.webp" alt="" fill priority sizes="(min-width: 1024px) 44vw, 100vw" className="object-cover" />
      <div className="kouth-presence-content">
        <Logo mark="spark" height={54} />
        <div><Logo mark="wordmark" height={46} /><p className="mt-5 font-display text-lg italic">The final ingredient is your essence.</p></div>
        <p className="text-sm">Perfumaria de assinatura</p>
      </div>
    </aside>
    <div className="kouth-reception-body">
      <header className="flex items-center justify-between gap-5">
        <Logo mark="wordmark" height={25} className="text-brand" />
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col justify-center py-10 sm:py-14">
        <section key={step} aria-labelledby="intro-heading" className="intro-screen-enter">
          <h1 id="intro-heading" ref={heading} tabIndex={-1} className={`${DISPLAY} kouth-reception-title outline-none`}>
            {step === 0 && <>Primeiro a pessoa.<br /><em>Depois o perfume.</em></>}
            {step === 1 && <>A sua história,<br /><em>nas suas palavras.</em></>}
            {step === 2 && <>Um espaço seu.<br /><em>Com todo o cuidado.</em></>}
          </h1>
          {step === 0 && <>
            <p className="mt-7 max-w-[43ch] text-lg leading-relaxed text-ink-2">Uma fragrância pode começar com uma memória, um gesto, um jeito de estar no mundo. Aqui, ela começa com você.</p>
            <div className="my-8 border-y border-line py-6">
              <p className="font-display text-2xl text-ink">Antes de criar, queremos escutar.</p>
              <p className="mt-3 max-w-[47ch] text-base leading-relaxed text-ink-2">Uma conversa guiada sobre o que torna sua presença singular. Suas histórias vão inspirar a criação do seu perfume.</p>
            </div>
            <p className="max-w-[47ch] text-sm leading-relaxed text-ink-3">No seu tempo. Você pode fazer uma pausa e continuar depois neste navegador.</p>
          </>}
          {step === 1 && <>
            <p className="mt-7 max-w-[47ch] text-lg leading-relaxed text-ink-2">Não existe uma maneira ideal de ser. Conte o que aconteceu, o que você fez e como se sentiu.</p>
            <IntroStoryDemo />
            <p className="max-w-[47ch] text-base leading-relaxed text-ink-2">Uma lembrança pequena também tem valor. Escreva com liberdade, sem procurar a resposta perfeita.</p>
          </>}
          {step === 2 && <>
            <p className="mt-7 max-w-[47ch] text-lg leading-relaxed text-ink-2">Ao finalizar, suas respostas são criptografadas no seu aparelho. Só quem tem a chave privada consegue abrir o arquivo.</p>
            <IntroPrivacyDemo />
            <p className="text-base leading-relaxed text-ink-2">Depois, você envia o arquivo para quem vai criar seu perfume.</p>
            <p className="mt-4 max-w-[50ch] text-sm leading-relaxed text-ink-3">Durante a conversa, o rascunho fica salvo neste navegador para você continuar depois. A criptografia protege o arquivo gerado no final.</p>
          </>}
        </section>
      </main>
      <footer className="border-t border-line pt-6 pb-2">
        <div className="mb-6 flex items-center justify-between gap-3">
          <nav aria-label="Introdução"><ol className="flex gap-4 text-xs sm:gap-7 sm:text-sm">
            {TOPICS.map((topic, i) => <li key={topic} aria-current={i === step ? "step" : undefined} className={i === step ? "text-ink" : "text-ink-3"}><span className={`mb-2 block h-px ${i <= step ? "bg-action" : "bg-line"}`} />{topic}</li>)}
          </ol></nav>
          <span className="shrink-0 whitespace-nowrap text-xs tabular-nums text-ink-3">0{step + 1} / 03</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          {step > 0 ? <button type="button" onClick={() => setStep(step - 1)} className="min-h-12 px-2 text-sm text-ink-2 underline-offset-4 hover:underline">Voltar</button> : <span className="text-sm text-ink-3">Sem pressa.</span>}
          <button type="button" onClick={advance} className={BTN_PRIMARY}>{step === 0 ? "Como responder" : step === 1 ? "E a privacidade?" : "Vamos começar"}<ArrowRight /></button>
        </div>
      </footer>
    </div>
  </div>;
}
