import type { Question, Step } from "./questions";

export const BECOMING_VERSION = "QUEM-2";

const text = (prompt: string): Step => ({ kind: "text", prompt });

/**
 * Doze opções de toque, uma por arquétipo (01_ARQUETIPOS). A ordem aqui é a do
 * roteiro; a tela as embaralha para nenhuma ganhar vantagem pela posição.
 */
export const ESSENTIALS = [
  "tempo pro que é simples, sem culpa",
  "gente por perto, sem pose",
  "fazer o que eu disse que ia fazer",
  "cuidar dos outros sem me esquecer",
  "escolher o meu próprio caminho",
  "dizer o que eu penso",
  "estar por inteiro com quem eu amo",
  "uma coisa minha sendo criada",
  "rir de verdade",
  "tempo pra aprender e pensar",
  "ver as coisas mudando perto de mim",
  "a minha vida organizada, nas minhas mãos",
];

/** Doze itens, do sonho ao primeiro passo; termina em ação, não no medo. */
export function becomingQuestions(): Question[] {
  return [
    {
      id: "Y01", text: "", noMain: true,
      steps: [text("Daqui a um ano, você já é quem quer ser. Descreva um dia comum — não um dia especial. O que você está fazendo, e com quem?")],
    },
    { id: "Y02", text: "E num dia em que tudo dá errado, como essa versão sua reage?", steps: [] },
    {
      id: "Y03", text: "", noMain: true,
      steps: [{ kind: "choices", prompt: "Nessa vida nova, o que não pode faltar? Escolha até 3.", options: ESSENTIALS, max: 3 }],
    },
    { id: "Y04", text: "Alguém próximo vai perceber a diferença. O que essa pessoa vai te dizer?", placeholder: "Você mudou — agora você…", steps: [] },
    {
      id: "Y05", text: "O que você faz hoje que essa versão sua não faria mais?",
      steps: [text("Conte a última vez que isso aconteceu: onde você estava, o que aconteceu e o que você sentiu na hora.")],
    },
    {
      id: "Y06", text: "Imagine que amanhã você faz exatamente o contrário disso. O que te preocupa?",
      steps: [
        text("E o que de pior você imagina que aconteceria?"),
        { kind: "button", prompt: "Mesmo assim, você quer arriscar?", options: [
          { label: "quero" }, { label: "ainda não sei" }, { label: "não agora" },
        ] },
      ],
    },
    { id: "Y07", text: "E se nada mudar: quem você tem medo de ser daqui a um ano?", steps: [] },
    {
      id: "Y08", text: "", noMain: true,
      steps: [{ kind: "button", prompt: "Você já foi essa pessoa, nem que por pouco tempo?", options: [
        { label: "já", next: text("Conte essa vez: o que você fez — e o que aconteceu depois?") },
        { label: "ainda não", next: text("Conte a vez em que você chegou mais perto: o que você fez — e o que aconteceu depois?") },
      ] }],
    },
    { id: "Y09", text: "O que de você hoje você não quer perder no caminho?", steps: [] },
    {
      id: "Y10", text: "", noMain: true,
      steps: [{ kind: "button", prompt: "Você conhece alguém que já é assim?", options: [
        { label: "conheço", next: text("Quem é, e o que exatamente essa pessoa faz que você ainda não faz?") },
        { label: "prefiro pular" },
      ] }],
    },
    {
      id: "Y11", text: "", noMain: true,
      steps: [{ kind: "button", prompt: "Por que você quer essa mudança?", options: [
        { label: "porque é importante pra mim" },
        { label: "porque eu ia gostar de viver assim" },
        { label: "porque eu me sentiria mal se não mudasse", next: text("Pra quem mais isso importa?") },
        { label: "porque alguém espera isso de mim", next: text("Pra quem mais isso importa?") },
      ] }],
    },
    { id: "Y12", text: "Se você acordasse amanhã já sendo essa pessoa, qual seria a primeira coisa diferente que você faria?", steps: [] },
  ];
}
