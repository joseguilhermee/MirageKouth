// Material surfaces of the KOUTH journey. Names retained for existing consumers.

type Stop = { at: number; top: string; mid: string; low: string };

const DAY: Stop[] = [
  { at: 0, top: "#f2eee6", mid: "#f2eee6", low: "#f2eee6" },
  { at: 0.5, top: "#f2eee6", mid: "#f2eee6", low: "#f2eee6" },
  { at: 1, top: "#f2eee6", mid: "#f2eee6", low: "#f2eee6" },
];

export const NIGHT = { top: "#2e1f17", mid: "#2e1f17", low: "#2e1f17" };

const DARK: Stop[] = [
  { at: 0, top: "#2e1f17", mid: "#2e1f17", low: "#2e1f17" },
  { at: 0.5, top: "#2e1f17", mid: "#2e1f17", low: "#2e1f17" },
  { at: 1, top: "#2e1f17", mid: "#2e1f17", low: "#2e1f17" },
];
export const DARK_NIGHT = { top: "#2e1f17", mid: "#2e1f17", low: "#2e1f17" };

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${c(ar, br)} ${c(ag, bg)} ${c(ab, bb)})`;
}

/** Cores do céu para um progresso de 0 (primeira pergunta) a 1 (última). */
export function skyAt(progress: number, theme: "light" | "dark" = "light"): { top: string; mid: string; low: string } {
  const stops = theme === "dark" ? DARK : DAY;
  const p = Math.min(1, Math.max(0, progress));
  const i = p <= stops[1].at ? 0 : 1;
  const from = stops[i];
  const to = stops[i + 1];
  const t = (p - from.at) / (to.at - from.at);
  return {
    top: mix(from.top, to.top, t),
    mid: mix(from.mid, to.mid, t),
    low: mix(from.low, to.low, t),
  };
}
