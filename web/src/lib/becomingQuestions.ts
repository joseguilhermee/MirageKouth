import type { Question, Step } from "./questions";

export const BECOMING_VERSION = "QUEM-1";
export const HORIZONS = ["6 meses", "1 ano", "5 anos", "10 anos"] as const;

const text = (prompt: string): Step => ({ kind: "text", prompt });

export function becomingQuestions(horizon: string): Question[] {
  return [
    {
      id: "Y01", text: "", noMain: true,
      steps: [
        { kind: "button", prompt: "Pense em você daqui a…", options: HORIZONS.map(label => ({ label })) },
        text("Você já é quem quer ser. Descreva um dia comum — não um dia especial. O que você está fazendo, e com quem?"),
      ],
    },
    { id: "Y02", text: "E num dia em que tudo dá errado, como essa versão sua reage?", steps: [] },
    { id: "Y03", text: "Alguém próximo vai perceber a diferença. O que essa pessoa vai te dizer?", placeholder: "Você mudou — agora você…", steps: [] },
    { id: "Y04", text: "Quando você começou a querer ser assim — o que aconteceu?", steps: [] },
    {
      id: "Y05", text: "", noMain: true,
      steps: [{ kind: "button", prompt: "Se ninguém nunca soubesse que você mudou, ainda valeria a pena?", options: [
        { label: "sim", next: text("Por quê?") },
        { label: "em parte", next: text("Pra quem mais essa mudança importa?") },
        { label: "não", next: text("Pra quem mais essa mudança importa?") },
      ] }],
    },
    { id: "Y06", text: "O que você faz hoje que essa versão sua não faria mais?", steps: [text("Conte a última vez que isso aconteceu.")] },
    { id: "Y07", text: "Imagine que amanhã você faz exatamente o contrário disso. O que te preocupa?", steps: [text("E o que de pior você imagina que aconteceria?")] },
    {
      id: "Y08", text: "", noMain: true,
      steps: [{ kind: "button", prompt: "Você já tentou mudar isso antes?", options: [
        { label: "mais de uma vez", next: text("O que te fez voltar ao jeito antigo?") },
        { label: "uma vez", next: text("O que te fez voltar ao jeito antigo?") },
        { label: "nunca tentei", next: text("O que te fez esperar até agora?") },
      ] }],
    },
    { id: "Y09", text: `E se nada mudar: quem você tem medo de ser daqui a ${horizon}?`, steps: [] },
    { id: "Y10", text: "O que você vai ter que deixar pra trás pra ser essa pessoa?", steps: [
      { kind: "button", prompt: "Você topa pagar esse preço?", options: [
        { label: "topo" }, { label: "ainda não sei" }, { label: "não" },
      ] },
    ] },
    {
      id: "Y11", text: "", noMain: true,
      steps: [{ kind: "button", prompt: "Você já foi essa pessoa, nem que por pouco tempo?", options: [
        { label: "já", next: text("Conte quando. O que estava acontecendo?") },
        { label: "ainda não", next: text("Qual foi a vez em que você chegou mais perto?") },
      ] }],
    },
    { id: "Y12", text: "Quem é assim — alguém que você conhece ou admira? O que exatamente essa pessoa faz que você ainda não faz?", steps: [] },
    { id: "Y13", text: "O que de você hoje você não quer perder no caminho?", steps: [] },
    { id: "Y14", text: "Se você acordasse amanhã já sendo essa pessoa, qual seria a primeira coisa diferente que você faria?", steps: [] },
  ];
}
