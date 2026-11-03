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
      steps: [text("Imagine que daqui a um ano você já é a pessoa que quer ser. Como é um dia comum da sua vida, não um dia especial? O que você faz e com quem está?")],
    },
    { id: "Y02", text: "E num dia em que tudo dá errado, o que essa nova versão de você faz?", steps: [] },
    {
      id: "Y03", text: "", noMain: true,
      steps: [{ kind: "choices", prompt: "Nessa vida nova, o que não pode faltar? Escolha até 3 opções.", options: ESSENTIALS, max: 3 }],
    },
    { id: "Y04", text: "Alguém próximo vai notar que você mudou. O que essa pessoa vai te dizer?", placeholder: "Você mudou — agora você…", steps: [] },
    {
      id: "Y05", text: "O que você faz hoje que a pessoa que você quer ser não faria mais?",
      steps: [text("Conte a última vez que você fez isso. Onde você estava? O que aconteceu? O que você sentiu na hora?")],
    },
    {
      id: "Y06", text: "Se amanhã você começasse a agir como essa nova pessoa, o que te preocuparia?",
      steps: [
        text("E qual é a pior coisa que você imagina que poderia acontecer?"),
        { kind: "button", prompt: "Sabendo disso, você quer tentar mesmo assim?", options: [
          { label: "quero" }, { label: "ainda não sei" }, { label: "não agora" },
        ] },
      ],
    },
    { id: "Y07", text: "E se nada mudar? Que tipo de pessoa você tem medo de ser daqui a um ano?", steps: [] },
    {
      id: "Y08", text: "", noMain: true,
      steps: [{ kind: "button", prompt: "Alguma vez você já foi essa pessoa, nem que por pouco tempo?", options: [
        { label: "já", next: text("Conte essa vez. O que você fez e o que aconteceu depois?") },
        { label: "ainda não", next: text("Conte a vez em que você chegou mais perto disso. O que você fez e o que aconteceu depois?") },
      ] }],
    },
    { id: "Y09", text: "O que você é ou tem hoje que não quer perder nessa mudança?", steps: [] },
    {
      id: "Y10", text: "", noMain: true,
      steps: [{ kind: "button", prompt: "Você conhece alguém que já vive assim?", options: [
        { label: "conheço", next: text("Quem é essa pessoa? E o que ela faz que você ainda não faz?") },
        { label: "prefiro pular" },
      ] }],
    },
    {
      id: "Y11", text: "", noMain: true,
      steps: [{ kind: "button", prompt: "Por que você quer essa mudança?", options: [
        { label: "porque é importante pra mim" },
        { label: "porque eu ia gostar de viver assim" },
        { label: "porque eu me sentiria mal se não mudasse", next: text("Para quem mais isso importa?") },
        { label: "porque alguém espera isso de mim", next: text("Para quem mais isso importa?") },
      ] }],
    },
    { id: "Y12", text: "Se amanhã você acordasse já sendo essa pessoa, qual seria a primeira coisa diferente que você faria?", steps: [] },
  ];
}
