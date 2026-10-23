// Cifra com cor por tipo de caractere: números em azul de céu, letras em terra
// roxa, o resto (+ / = do base64) apagado. Agrupa em trechos para não criar um
// <span> por caractere em arquivos longos.

type Kind = "digit" | "letter" | "other";

function kindOf(c: string): Kind {
  if (c >= "0" && c <= "9") return "digit";
  if ((c >= "a" && c <= "z") || (c >= "A" && c <= "Z")) return "letter";
  return "other";
}

export const CIPHER_COLORS = {
  /** Sobre o céu (página): segue os tokens. */
  page: { digit: "text-cipher", letter: "text-terra", other: "text-ink-3" },
  /** Sobre a folha da prancheta: segue a preferência de aparência, inclusive na tela de selar. */
  paper: { digit: "text-[var(--paper-cipher)]", letter: "text-[var(--paper-brand)]", other: "text-[var(--paper-cipher-muted)]" },
} as const;

export function CipherText({
  text,
  palette = "paper",
}: {
  text: string;
  palette?: keyof typeof CIPHER_COLORS;
}) {
  const colors = CIPHER_COLORS[palette];
  const runs: { kind: Kind; text: string }[] = [];
  for (const c of text) {
    const kind = c === " " || c === "\n" ? "other" : kindOf(c);
    const last = runs[runs.length - 1];
    if (last && last.kind === kind) last.text += c;
    else runs.push({ kind, text: c });
  }
  return (
    <>
      {runs.map((r, i) => (
        <span key={i} className={colors[r.kind]}>
          {r.text}
        </span>
      ))}
    </>
  );
}

export function LockSeal({ label, tone = "paper" }: { label: string; tone?: "paper" | "page" }) {
  const cls =
    tone === "paper"
      ? "bg-[var(--paper-brand)] text-[var(--paper-seal-ink)]"
      : "bg-action text-action-ink";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3 w-3" aria-hidden>
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
      {label}
    </span>
  );
}
