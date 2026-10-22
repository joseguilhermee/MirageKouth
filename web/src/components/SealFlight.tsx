"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { previewHex } from "@/lib/previewCipher";
import { CipherText, LockSeal } from "./CipherText";

/** Retrato de um campo de texto no instante de selar. */
export type FieldSnap = {
  text: string;
  rect: { left: number; top: number; width: number; height: number };
  scrollTop: number;
  font: string;
  lineHeight: string;
  padding: string;
};

/** Todos os campos de texto da pergunta; o primeiro é a resposta principal. */
export type Flight = { id: number; fields: FieldSnap[] };

const SCRAMBLE_MS = 520;
/** Pausa com a cifra pronta e o selo à vista, antes de voar. */
const HOLD_MS = 260;
const FLY_S = 0.5;
// Se a prévia não chegar a tempo, a resposta voa como está: nunca mostra cifra inventada.
const HEX_WAIT_MS = 400;

/**
 * O momento de selar: cada texto da pergunta vira a sua prévia de cifra no
 * lugar onde foi escrito, letra por letra, ganha o selo "cifrado" e voa para a
 * prancheta. A cifra é a prévia real (chave da sessão), não números sorteados.
 */
export function SealFlight({
  flight,
  sessionKey,
  getTarget,
  onScrambled,
  onLanded,
}: {
  flight: Flight;
  sessionKey: CryptoKey | null;
  getTarget: () => DOMRect | null;
  onScrambled: () => void;
  onLanded: () => void;
}) {
  return (
    <>
      {flight.fields.map((field, i) => (
        <FieldSeal
          key={i}
          field={field}
          lead={i === 0}
          sessionKey={sessionKey}
          getTarget={getTarget}
          onScrambled={i === 0 ? onScrambled : undefined}
          onLanded={i === 0 ? onLanded : undefined}
        />
      ))}
    </>
  );
}

function FieldSeal({
  field,
  lead,
  sessionKey,
  getTarget,
  onScrambled,
  onLanded,
}: {
  field: FieldSnap;
  lead: boolean;
  sessionKey: CryptoKey | null;
  getTarget: () => DOMRect | null;
  onScrambled?: () => void;
  onLanded?: () => void;
}) {
  // null = ainda esperando a prévia; "" = desistiu, voa sem embaralhar.
  const [hex, setHex] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [sealed, setSealed] = useState(false);
  const [to, setTo] = useState<{ x: number; y: number; scale: number } | null>(null);
  const callbacks = useRef({ onScrambled, onLanded, getTarget });

  useEffect(() => {
    callbacks.current = { onScrambled, onLanded, getTarget };
  });

  useEffect(() => {
    let alive = true;
    const giveUp = setTimeout(() => alive && setHex((h) => h ?? ""), HEX_WAIT_MS);
    if (sessionKey) {
      previewHex(sessionKey, field.text)
        .then((h) => alive && setHex((cur) => (cur === null ? h : cur)))
        .catch(() => alive && setHex((cur) => cur ?? ""));
    }
    return () => {
      alive = false;
      clearTimeout(giveUp);
    };
  }, [sessionKey, field.text]);

  // Embaralha da esquerda para a direita, mostra o selo, e então avisa a
  // página para trocar de pergunta e parte para a prancheta.
  useEffect(() => {
    if (hex === null) return;
    const len = hex ? field.text.length : 0;
    const start = performance.now();
    let frame = 0;
    let hold: ReturnType<typeof setTimeout> | undefined;
    function fly() {
      const target = callbacks.current.getTarget();
      const { left, top, width, height } = field.rect;
      setTo(
        target
          ? {
              x: target.left + target.width / 2 - (left + width / 2),
              y: target.top + target.height / 2 - (top + height / 2),
              scale: Math.max(0.04, Math.min(target.width / width, target.height / height)),
            }
          : { x: 0, y: -40, scale: 0.6 }
      );
      callbacks.current.onScrambled?.();
    }
    function tick(now: number) {
      const p = len ? Math.min(1, (now - start) / SCRAMBLE_MS) : 1;
      // Começa devagar e acelera, como uma linha sendo tomada.
      setRevealed(Math.floor(len * p * p));
      if (p < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }
      if (len) {
        setSealed(true);
        hold = setTimeout(fly, HOLD_MS);
      } else {
        fly();
      }
    }
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      if (hold) clearTimeout(hold);
    };
  }, [field, hex]);

  const text = field.text;
  let cipher = "";
  for (let i = 0; i < revealed; i++) {
    const c = text[i];
    // Espaço e quebra de linha ficam, para o bloco manter a forma do texto.
    cipher += c === " " || c === "\n" || !hex ? c : hex[i % hex.length];
  }

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-[60]"
      style={{
        left: field.rect.left,
        top: field.rect.top,
        width: field.rect.width,
        height: field.rect.height,
        transformOrigin: "50% 50%",
      }}
      initial={{ x: 0, y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }}
      animate={
        to
          ? { x: to.x, y: to.y, scale: to.scale, opacity: 0.15, filter: "blur(1.5px)" }
          : { x: 0, y: 0, scale: 1, opacity: 1, filter: "blur(0px)" }
      }
      transition={{ duration: FLY_S, ease: [0.65, 0, 0.35, 1] }}
      onAnimationComplete={() => {
        if (to) callbacks.current.onLanded?.();
      }}
    >
      <div className="h-full overflow-hidden">
        <div
          className="whitespace-pre-wrap break-words"
          style={{
            font: field.font,
            lineHeight: field.lineHeight,
            padding: field.padding,
            transform: `translateY(${-field.scrollTop}px)`,
          }}
        >
          <CipherText text={cipher} palette="page" />
          <span className="text-ink">{text.slice(revealed)}</span>
        </div>
      </div>
      {sealed && (
        <motion.span
          className="absolute -top-3 right-0"
          initial={{ opacity: 0, y: 4, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <LockSeal label={lead ? "cifrado" : "cifrado"} tone="page" />
        </motion.span>
      )}
    </motion.div>
  );
}
