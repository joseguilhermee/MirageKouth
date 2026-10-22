// Curva de easing compartilhada — desaceleração suave ("expo out"), usada
// em toda transição de tela/texto pra manter a sensação consistente e
// nunca abrupta.
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/**
 * Entrada de tela/pergunta: um pouco mais lenta e "respirada" — é o que o
 * olho acompanha. Usar como prop `transition` (afeta o `animate`).
 */
export const ENTER_TRANSITION = { duration: 0.62, ease: EASE_OUT };

/**
 * Saída de tela/pergunta: mais rápida que a entrada de propósito — some
 * decidida, sem competir por atenção com o que está entrando. Usar dentro
 * do próprio objeto `exit` (`exit={{ ...valores, transition: EXIT_TRANSITION }}`),
 * nunca na prop `transition` de fora (que controla a entrada).
 */
export const EXIT_TRANSITION = { duration: 0.38, ease: EASE_OUT };

/** Transição mais curta, pra elementos pequenos (popover, badges, linhas de log). */
export const SOFT_TRANSITION = { duration: 0.35, ease: EASE_OUT };
