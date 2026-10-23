import type { Question, Step } from "./questions";

export const OCCASION_VERSION = "OCASIAO-1";
export const MOMENTO_DO_DIA = {
  resposta: "qualquer hora",
  opcoes_ativas: ["qualquer hora"],
  uso: "reservado",
} as const;

const text = (prompt: string, placeholder?: string): Step => ({ kind: "text", prompt, placeholder });

export const OCCASION_QUESTIONS: Question[] = [
  {
    id: "O01", text: "Qual é a ocasião?", minMainChars: 1,
    placeholder: "um casamento, uma entrevista, um primeiro encontro, uma formatura, uma apresentação…",
    steps: [text("O que está em jogo pra você nela?")],
  },
  {
    id: "O02", text: "", noMain: true,
    steps: [{ kind: "button", prompt: "Nessa ocasião, você vai estar…", options: [
      { label: "no centro — é sobre mim" },
      { label: "em avaliação — alguém vai decidir sobre mim" },
      { label: "recebendo as pessoas" },
      { label: "a convite" },
      { label: "a trabalho, num papel definido" },
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
  { id: "O04", text: "Quem vai estar lá que mais importa pra você — e o que essa pessoa valoriza?", acceptedShortAnswers: ["não sei"], steps: [] },
  { id: "O05", text: "Como essas pessoas te veem hoje — ou como te veriam de primeira, se ainda não te conhecem?", acceptedShortAnswers: ["não sei"], steps: [] },
  {
    id: "O06", text: "Se você pudesse escolher uma palavra para como vão te ver lá, qual seria?", minMainChars: 1,
    steps: [text("E qual é a versão exagerada dessa palavra — a que você não quer passar de jeito nenhum?", "ex.: confiante → arrogante")],
  },
  { id: "O07", text: "Pense no momento mais importante dessa ocasião, dando certo. O que as pessoas veem você fazendo?", steps: [] },
  { id: "O08", text: "E por dentro, nesse momento: como você quer estar se sentindo?", steps: [] },
  {
    id: "O09", text: "", noMain: true,
    steps: [{ kind: "button", prompt: "Você já foi assim alguma vez?", options: [
      { label: "já", next: text("Conte quando. O que estava acontecendo?") },
      { label: "ainda não", next: text("Quem você conhece que é assim — e o que essa pessoa faz?") },
    ] }],
  },
  { id: "O10", text: "O que de você não pode ficar em casa, nem nessa ocasião?", steps: [] },
  { id: "O11", text: "Quando tudo acabar, o que você quer que as pessoas digam de você?", steps: [] },
];
