import type { Question, Step } from "./questions";

export const OCCASION_VERSION = "OCASIAO-2";
export const MOMENTO_DO_DIA = {
  resposta: "qualquer hora",
  opcoes_ativas: ["qualquer hora"],
  uso: "reservado",
} as const;

/** Índice de O04 (a palavra do sentimento) na lista de perguntas. */
export const WORD_INDEX = 3;

const text = (prompt: string): Step => ({ kind: "text", prompt });

/** As doze opções de toque de O04b e O05 (a tela as embaralha). */
export const CARD_OPTIONS = [
  "Paz — nada a provar",
  "Pertencer — em casa, no meio dos meus",
  "Coragem — encarar o que vier",
  "Cuidar — deixar todo mundo bem",
  "Liberdade — sem roteiro",
  "Rebeldia — do meu jeito, sem pedir licença",
  "Desejo — olhar, pele, vontade",
  "Criatividade — o meu estilo",
  "Diversão — rir, leve",
  "Clareza — a cabeça clara",
  "Transformação — mudar o clima de onde eu estou",
  "Comando — a situação na mão",
];

const NONE_OF_THESE = "nenhum desses";
const ONLY_THAT = "só isso";
const NOBODY_AROUND = "não vai ter ninguém perto";
const NEVER_FELT = "nunca senti";

/** Linhas do léxico: palavras que casam → opções de "‹Palavra› como quem…". */
const LEXICON: { words: string[]; options: string[] }[] = [
  { words: ["confiante", "seguro", "preparado", "confiança", "segurança"],
    options: ["encara o que vier sem tremer", "tem a situação na mão", "sabe exatamente do que está falando", "está em paz, sem nada a provar"] },
  { words: ["tranquilo", "calmo", "relaxado", "em paz", "paz", "tranquilidade", "calma"],
    options: ["não tem nada a provar", "sabe o que está fazendo", "tem tudo sob controle", "sabe que todo mundo está bem", "não tem hora pra nada"] },
  { words: ["feliz", "alegre", "animado", "pleno", "felicidade", "alegria", "animação", "plenitude"],
    options: ["ri e faz rir", "não sente falta de nada", "está no meio dos seus", "está com quem ama", "está vivendo algo novo"] },
  { words: ["livre", "aventureiro", "corajoso", "determinado", "liberdade", "aventura", "coragem", "determinação"],
    options: ["vai pra onde nunca foi", "encara o que dá medo", "larga o roteiro de propósito"] },
  { words: ["leve", "solto", "leveza"],
    options: ["ri à toa", "não carrega peso nenhum", "está sem amarra nenhuma"] },
  { words: ["divertido", "engraçado", "carismático", "diversão", "carisma"],
    options: ["faz a mesa inteira rir", "entra na brincadeira de todo mundo", "zoa o que é sério demais", "muda o clima quando chega"] },
  { words: ["poderoso", "forte", "invencível", "poder", "força"],
    options: ["venceu uma batalha", "construiu tudo isso", "não deve satisfação a ninguém", "muda o clima quando chega"] },
  { words: ["realizado", "orgulhoso", "vitorioso", "realização", "orgulho", "vitória"],
    options: ["chegou lá depois de tudo", "olha em volta e vê o que construiu", "fez algo que é a sua cara"] },
  { words: ["bonito", "lindo", "radiante", "beleza"],
    options: ["desperta desejo", "brilha sem esforço", "tem um estilo que é só seu", "está impecável"] },
  { words: ["desejado", "atraente", "sexy", "desejo", "atração"],
    options: ["desperta desejo e sabe disso", "envolve e muda o clima"] },
  { words: ["magnético", "envolvente", "misterioso", "magnetismo", "mistério"],
    options: ["muda o clima quando chega", "atrai todos os olhares", "fala pouco e todo mundo quer ouvir"] },
  { words: ["especial", "único"],
    options: ["tem algo que é só seu", "foi a escolha de alguém", "encanta quem está em volta"] },
  { words: ["importante", "respeitado", "admirado", "importância", "respeito", "admiração"],
    options: ["tem a palavra final", "mostrou do que é capaz", "é a voz que todo mundo quer ouvir"] },
  { words: ["inteligente", "capaz", "competente", "focado", "inteligência", "capacidade", "competência", "foco"],
    options: ["explica e todo mundo entende", "resolve na hora, sob pressão", "enxerga o jogo inteiro e decide"] },
  { words: ["elegante", "sofisticado", "elegância", "sofisticação"],
    options: ["está impecável, no comando", "tem um estilo que é só seu", "fala pouco e diz tudo", "desperta desejo sem esforço"] },
  { words: ["inspirado", "criativo", "inspiração", "criatividade"],
    options: ["está fazendo algo seu", "inspira quem está em volta", "vê tudo com outros olhos"] },
  { words: ["ousado", "diferente", "irreverente", "ousadia", "irreverência"],
    options: ["quebra uma regra de propósito", "aparece com algo que ninguém tem", "vai aonde ninguém ali iria"] },
  { words: ["autêntico", "verdadeiro", "eu mesmo", "autenticidade", "verdade"],
    options: ["não segue roteiro", "não pede licença pra ser quem é", "é simples, sem pose", "tem um jeito que é só seu"] },
  { words: ["à vontade", "em casa", "acolhido", "amado", "acolhimento", "amor"],
    options: ["está no meio dos seus, de igual pra igual", "está em paz consigo", "cuida e se deixa cuidar", "está com quem ama"] },
  { words: ["útil", "presente", "generoso", "carinhoso", "generosidade", "carinho", "presença"],
    options: ["cuida pra que ninguém precise de nada", "faz uma pessoa se sentir única", "está junto, de igual pra igual"] },
  { words: ["simples", "humilde", "próximo", "simplicidade", "humildade"],
    options: ["conversa de igual com qualquer um", "não precisa provar nada", "lembra de cada um"] },
];

function normalize(value: string): string {
  return value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();
}

const LEXICON_INDEX = new Map<string, string[]>();
for (const line of LEXICON) for (const word of line.words) {
  const key = normalize(word);
  if (!LEXICON_INDEX.has(key)) LEXICON_INDEX.set(key, line.options);
}

/** Como está; sem o "s" final; com o "a" final trocado por "o" (segura → seguro). */
function variants(candidate: string): string[] {
  const noPlural = candidate.endsWith("s") ? candidate.slice(0, -1) : candidate;
  const noEs = candidate.endsWith("es") ? candidate.slice(0, -2) : candidate; // felizes → feliz
  const swap = (value: string) => value.endsWith("a") ? `${value.slice(0, -1)}o` : value;
  return [candidate, noPlural, noEs, swap(candidate), swap(noPlural)];
}

/** Linha do léxico que casa com a palavra escrita em O04, ou undefined. */
export function matchLexicon(written: string): string[] | undefined {
  const normalized = normalize(written);
  if (!normalized) return undefined;
  const tokens = normalized.split(" ");
  const candidates = [normalized];
  if (tokens.length > 1) {
    for (let i = 0; i < tokens.length; i++) {
      candidates.push(tokens[i]);
      if (i + 1 < tokens.length) candidates.push(`${tokens[i]} ${tokens[i + 1]}`);
    }
  }
  for (const candidate of candidates) for (const variant of variants(candidate)) {
    const options = LEXICON_INDEX.get(variant);
    if (options) return options;
  }
  return undefined;
}

const capitalize = (word: string) => word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1);

const cardStep = (): Step => ({
  kind: "button", prompt: "Qual destes chega mais perto?", shuffle: true,
  options: CARD_OPTIONS.map(label => ({ label })),
});

/** O04: afinação (se a palavra casar com o léxico), cartão (se não casar ou "nenhum desses") e limite. */
function feelingSteps(main: string): Step[] {
  const written = main.trim();
  const options = matchLexicon(written);
  const first: Step = options
    ? {
      kind: "button", prompt: `${capitalize(written)} como quem…`, shuffle: true, keepLast: true,
      options: [...options.map(label => ({ label })), { label: NONE_OF_THESE, next: cardStep() }],
    }
    : cardStep();
  return [first, text("E quando esse sentimento passa do ponto, vira o quê? Qual versão você não quer de jeito nenhum?")];
}

/**
 * As 12 perguntas da ocasião. `word` é a palavra que a pessoa escreveu em O04
 * (como escreveu); ela entra no enunciado de O06.
 */
export function occasionQuestions(word = ""): Question[] {
  const feeling = word.trim() || "isso";
  return [
    { id: "O01", text: "Qual é a ocasião?", minMainChars: 1, steps: [text("Por que ela importa pra você?")] },
    {
      id: "O02", text: "", noMain: true,
      steps: [{ kind: "button", prompt: "Hoje, pensando nessa ocasião, o que você sente?", options: [
        { label: "frio na barriga" },
        { label: "empolgação" },
        { label: "insegurança" },
        { label: "calma" },
        { label: "nada de especial" },
        { label: "outro", next: text("Conta em poucas palavras.") },
      ] }],
    },
    {
      id: "O03", text: "", noMain: true,
      steps: [{ kind: "button", prompt: "Em que momento do dia vai ser?", options: [
        { label: "de manhã", disabled: true },
        { label: "à tarde", disabled: true },
        { label: "à noite", disabled: true },
        { label: "atravessa o dia", disabled: true },
        { label: "qualquer hora" },
      ] }],
    },
    { id: "O04", text: "Como você quer se sentir lá? Uma palavra.", minMainChars: 1, steps: [], stepsFor: feelingSteps },
    {
      id: "O05", text: "", noMain: true,
      steps: [{ kind: "choices", prompt: "E o que mais você quer sentir junto? Até dois.", options: [...CARD_OPTIONS, ONLY_THAT], max: 2, exclusive: ONLY_THAT }],
    },
    {
      id: "O06", text: `Em que momento dessa ocasião você mais quer se sentir ${feeling}? O que está acontecendo e o que você está fazendo?`,
      steps: [],
    },
    { id: "O07", text: "Nesse momento, o que passa pela sua cabeça? Escreva como você pensaria.", steps: [] },
    { id: "O08", text: "Quando você se sente assim de verdade, como isso aparece em você — no jeito, na voz, no olhar?", steps: [] },
    { id: "O09", text: "E quem estiver perto de você: o que vai sentir?", alternative: NOBODY_AROUND, minMainChars: 1, steps: [] },
    {
      id: "O10", text: "Quando foi a última vez que você se sentiu assim de verdade, nem que por alguns minutos? O que estava acontecendo?",
      alternative: NEVER_FELT, minMainChars: 1, steps: [],
      stepsFor: main => main.trim() === NEVER_FELT ? [text("Quem você conhece que vive isso? O que essa pessoa faz?")] : [],
    },
    { id: "O11", text: "O que de você não pode ficar em casa, nem nessa ocasião?", steps: [] },
    { id: "O12", text: "Quando tudo acabar, voltando pra casa, o que você quer ainda estar sentindo?", steps: [] },
  ];
}

/** Conjunto sem palavra, para checagens de estrutura. */
export const OCCASION_QUESTIONS: Question[] = occasionQuestions();
