"use client";

import { useEffect, useState } from "react";
import { encryptForPreview, isCryptoSupported } from "@/lib/crypto";

function chunk(hex: string, size = 8): string[] {
  const out: string[] = [];
  for (let i = 0; i < hex.length; i += size) out.push(hex.slice(i, i + size));
  return out;
}

const IDLE_HEX =
  "9f2a1c7e4b8d0a3f6c1e2b9d7a4f0c3e8b1d6a2f9c4e7b0d3a8f1c6e2b9d4a7f";

export function CipherPreview({
  text,
  sessionKey,
}: {
  text: string;
  sessionKey: CryptoKey | null;
}) {
  const [result, setResult] = useState({ text: "", hex: "" });
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Feature-detection só existe no cliente; setState aqui é intencional
    // (o valor inicial "true" evita mismatch de hidratação com o servidor).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(isCryptoSupported());
  }, []);

  useEffect(() => {
    if (!sessionKey) return;
    const handle = setTimeout(() => {
      if (!text) {
        setResult({ text: "", hex: "" });
        return;
      }
      encryptForPreview(sessionKey, text)
        .then((hex) => setResult({ text, hex }))
        .catch(() => setResult({ text, hex: "" }));
    }, 180);
    return () => clearTimeout(handle);
  }, [text, sessionKey]);

  const hex = result.text === text ? result.hex : "";
  const display = hex || (text ? "" : IDLE_HEX);
  const blocks = chunk(display);
  const active = Boolean(hex);

  return (
    <div className="rounded-2xl border border-border bg-surface/60 backdrop-blur p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted">
          Seu texto criptografado
        </span>
        <span
          className={`text-[10px] font-mono uppercase tracking-[0.15em] rounded-full px-2.5 py-1 border transition-colors ${
            active
              ? "border-cipher/50 text-cipher"
              : "border-border text-muted"
          }`}
        >
          AES-256-GCM
        </span>
      </div>

      <div className="flex-1 rounded-xl bg-black/50 border border-border/70 p-4 overflow-y-auto max-h-64 lg:max-h-[420px]">
        {!supported ? (
          <p className="text-sm text-muted">
            Seu navegador não tem suporte à criptografia necessária. Tente um
            navegador mais recente.
          </p>
        ) : (
          <div
            className={`font-mono text-[13px] leading-relaxed break-all ${
              active ? "text-cipher text-cipher-glow" : "text-muted/50"
            } ${!active && !text ? "animate-cipher-flicker" : ""}`}
          >
            {blocks.map((b, i) => (
              <span key={i} className="mr-2 inline-block">
                {b}
              </span>
            ))}
            {!display && (
              <span className="text-muted/60">
                aguardando entrada de dados…
              </span>
            )}
          </div>
        )}
      </div>

      <p className="mt-4 text-[11px] text-muted leading-relaxed">
        Cada resposta é cifrada localmente antes de qualquer outra coisa
        acontecer.
      </p>
    </div>
  );
}
