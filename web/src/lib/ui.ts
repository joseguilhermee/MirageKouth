// Vocabulário de controles compartilhado por todas as telas, para que botão e
// opção sejam o mesmo objeto da abertura ao selar.

export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-2 rounded-full bg-action px-7 py-3.5 text-[15px] font-semibold text-action-ink transition hover:brightness-110 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-40";

/** Visual de "ainda falta algo": o botão continua clicável para mostrar o que falta. */
export const BTN_PRIMARY_WAITING =
  "inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-action px-7 py-3.5 text-[15px] font-semibold text-action transition hover:bg-terra-wash";

export const BTN_GHOST =
  "inline-flex items-center justify-center gap-2 rounded-full border border-line-strong px-5 py-3.5 text-[15px] text-ink-2 transition hover:border-action hover:text-ink disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line-strong";

export const PILL =
  "rounded-full border px-4 py-2.5 text-[15px] leading-tight transition";
export const PILL_ON = "border-action bg-action text-action-ink";
export const PILL_OFF =
  "border-line-strong bg-white/35 text-ink-2 hover:border-action hover:text-ink";

/** Campo de escrita: só a linha de base, sem caixa, para a história respirar. */
export const FIELD =
  "w-full resize-none bg-transparent border-b-2 py-3 text-lg sm:text-xl leading-relaxed text-ink outline-none transition-colors placeholder:text-ink-3";

export const DISPLAY =
  "font-display font-semibold tracking-[-0.015em] text-balance text-ink";
