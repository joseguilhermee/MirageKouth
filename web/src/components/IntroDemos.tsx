"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { encryptForPreview, generateSessionKey } from "@/lib/crypto";
import { EASE_OUT } from "@/lib/motion";

const SCENE = [
  ["O que aconteceu", "Minha irmã estava com medo da entrevista. "],
  ["O que você fez", "Fiquei com ela ensaiando até tarde, "],
  ["O que custou", "mesmo tendo que acordar cedo."],
];

export function IntroStoryDemo() {
  const [replay, setReplay] = useState(0);
  const reduceMotion = useReducedMotion();
  return (
    <div className="my-7 border-y border-line py-5 sm:my-8 sm:py-6">
      <p className="text-sm text-ink-3">Uma característica diz pouco</p>
      <p className="mt-1 text-lg text-ink-2">“Eu cuido de quem amo.”</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-brand">Uma cena mostra quem você é</p>
        <button type="button" onClick={() => setReplay(replay + 1)}
          className="shrink-0 rounded-lg px-2 py-2 text-xs text-brand underline decoration-line-strong underline-offset-4 hover:bg-terra-wash">
          Ver de novo
        </button>
      </div>
      <blockquote key={replay} className="mt-2 font-display text-[21px] leading-relaxed sm:text-2xl">
        “{SCENE.map(([label, text], index) => (
          <motion.span key={label}
            initial={false}
            animate={reduceMotion ? { backgroundColor: "#9c816626" } : { backgroundColor: ["#9c816600", "#9c816640", "#9c816626"] }}
            transition={{ duration: reduceMotion ? 0 : 1.25, delay: reduceMotion ? 0 : index * 0.85 + 0.25, times: [0, 0.45, 1] }}
            className="rounded-sm box-decoration-clone">
            {text}
          </motion.span>
        ))}”
      </blockquote>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2" aria-hidden="true" key={`labels-${replay}`}>
        {SCENE.map(([label], index) => (
          <span key={label} style={{ animationDelay: `${index * 0.85 + 0.25}s` }}
            className="intro-story-label text-xs font-semibold">{label}</span>
        ))}
      </div>
      <p className="mt-4 text-xs text-ink-3">Exemplo fictício de resposta.</p>
    </div>
  );
}

const DEMO_TEXT = "Minha história, com minhas palavras.";

export function IntroPrivacyDemo() {
  const [cipher, setCipher] = useState("");
  const [showCipher, setShowCipher] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [failed, setFailed] = useState(false);
  const figure = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;
    generateSessionKey().then(key => encryptForPreview(key, DEMO_TEXT)).then(result => {
      if (!cancelled) setCipher(result);
    }).catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let inView = true;
    const update = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    if (figure.current) observer.observe(figure.current);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    if (!cipher || paused || reduceMotion || !visible) return;
    const timer = setInterval(() => setShowCipher(current => !current), 1500);
    return () => clearInterval(timer);
  }, [cipher, paused, reduceMotion, visible]);

  return (
    <figure ref={figure} data-demo-phase={showCipher ? "criptografado" : "texto"}
      className="my-7 border-y border-line py-5 sm:my-8 sm:py-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-cipher">De palavras a código</span>
        <button type="button" disabled={!cipher}
          onClick={() => reduceMotion ? setShowCipher(!showCipher) : setPaused(!paused)}
          className="rounded-lg px-2 py-2 text-xs text-cipher underline decoration-line-strong underline-offset-4 hover:bg-terra-wash disabled:opacity-50">
          {reduceMotion ? (showCipher ? "Ver frase" : "Ver criptografia") : paused ? "Retomar animação" : "Pausar animação"}
        </button>
      </div>
      <div aria-hidden="true" className="relative isolate flex min-h-28 items-center overflow-hidden rounded-xl bg-[var(--paper)] p-4">
        <p className="font-display text-xl leading-snug">{DEMO_TEXT}</p>
        {cipher && <motion.div
          initial={false}
          animate={{ clipPath: showCipher ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
          transition={{ duration: reduceMotion ? 0 : 0.45, ease: EASE_OUT }}
          className="absolute inset-0 flex items-center bg-[var(--paper)] p-4">
          <p className="break-all font-mono text-[13px] leading-relaxed text-cipher">{cipher}</p>
        </motion.div>}
      </div>
      <figcaption className="mt-3 text-xs leading-relaxed text-ink-2">
        {failed ? "A demonstração não está disponível neste navegador." : cipher
          ? "Frase fictícia criptografada neste aparelho. Esta demonstração é descartável."
          : "Uma frase fictícia, para você ver como funciona."}
      </figcaption>
    </figure>
  );
}
