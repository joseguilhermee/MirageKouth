// O céu da travessia, em três faixas (alto, meio, horizonte): cada pergunta
// respondida empurra a tarde um pouco mais para o anoitecer. Três paradas (tarde clara, hora dourada, fim de tarde) e
// uma noite só para a hora de selar. Todas as paradas claras mantêm a tinta
// escura com contraste de texto.

type Stop = { at: number; top: string; mid: string; low: string };

const DAY: Stop[] = [
  { at: 0, top: "#d6e6ef", mid: "#e4ece9", low: "#eef0e6" },
  { at: 0.5, top: "#dfe1ea", mid: "#eedfd6", low: "#f3d8c4" },
  { at: 1, top: "#d9cad8", mid: "#e9cdc8", low: "#efc2ae" },
];

export const NIGHT = { top: "#2a1a22", mid: "#34202a", low: "#4a2b25" };

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
export function skyAt(progress: number): { top: string; mid: string; low: string } {
  const p = Math.min(1, Math.max(0, progress));
  const i = p <= DAY[1].at ? 0 : 1;
  const from = DAY[i];
  const to = DAY[i + 1];
  const t = (p - from.at) / (to.at - from.at);
  return {
    top: mix(from.top, to.top, t),
    mid: mix(from.mid, to.mid, t),
    low: mix(from.low, to.low, t),
  };
}
