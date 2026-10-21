/** Pergunta fechada de resposta rápida: a pessoa toca numa das opções. */
export type Choice = {
  /** Enunciado curto acima das opções. Vazio quando as opções já se explicam. */
  prompt: string;
  options: string[];
};

export type Question = {
  /** Pergunta principal — o que precisa ser respondido, em texto livre. */
  text: string;
  /** Desdobramentos em botões: escolha única, obrigatória, nada vem marcado. */
  choices?: Choice[];
  /** Segunda pergunta em texto livre; obrigatória como a principal. */
  extra?: string;
};

/**
 * Entrevista de identidade narrativa (McAdams) lida contra os 12 arquétipos de
 * Pearson. Não há pontuação: as respostas são lidas de forma interpretativa.
 *
 * 15 itens. Cada item é uma cena principal em texto livre, seguida de
 * desdobramentos em botões e, em vários itens, de uma segunda pergunta
 * em texto livre (`extra`), também obrigatória. A ordem é a do
 * roteiro de origem (Q01–Q04, Q15, Q05–Q14): o item 5 é a Q15.
 */
export const QUESTIONS: Question[] = [
  {
    text: "Conte um momento em que você se sentiu completamente vivo: o que estava fazendo, e com quem?",
    choices: [
      { prompt: "Isso acontece hoje", options: ["com frequência", "às vezes", "quase nunca"] },
      {
        prompt: "A última coisa que você fez sem finalidade nenhuma foi",
        options: ["esta semana", "este mês", "faz tempo", "não lembro"],
      },
    ],
    extra: "Como é uma tarde livre boa pra você? O que foi essa última coisa sem finalidade?",
  },
  {
    text: "Em que você já gastou tempo demais sem ninguém pedir, e o que sobrou disso?",
    choices: [
      { prompt: "Você continuou mesmo depois de já ter o que precisava?", options: ["sim", "não"] },
    ],
    extra: "Tem algo que você ainda quer estudar?",
  },
  {
    text: "Qual elogio recente te deu prazer de verdade? E qual te deixa indiferente?",
    extra: "Quem disse?",
  },
  {
    text: "Conte uma decisão que te custou algo de verdade: do que você abriu mão, e para ficar com o quê?",
    choices: [
      { prompt: "Quem sabia", options: ["quase ninguém", "só os próximos", "todo mundo"] },
      { prompt: "Já fez escolhas parecidas antes?", options: ["sim", "não"] },
    ],
  },
  {
    text: "Do que você mais se orgulha de ter feito acontecer?",
    choices: [
      {
        prompt: "Isso hoje",
        options: ["ainda existe", "ainda acontece sem mim", "acabou", "foi algo pontual"],
      },
    ],
  },
  {
    text: "Conte uma vez em que você viu algo errado e não tinha poder nenhum pra mudar. O que você fez — ou o que te segurou?",
    choices: [
      {
        prompt: "O que mais te incomodava",
        options: ["o resultado", "o método", "quem decidia", "outra coisa"],
      },
      { prompt: "Você costuma agir assim?", options: ["sim", "não"] },
    ],
    extra: "Mudou alguma coisa depois?",
  },
  {
    text: "Conte uma vez em que o resultado dependeu de você. O que você fez, do começo ao fim?",
    choices: [
      {
        prompt: "Você",
        options: ["foi atrás dessa posição", "caiu nela e assumiu", "caiu nela e não gostou"],
      },
    ],
    extra: "Alguém deixou de fazer a parte dele? O que você fez?",
  },
  {
    text: "Tem alguém que é diferente hoje por sua causa? O que exatamente você fez?",
    choices: [
      { prompt: "Foi", options: ["de propósito", "só percebi depois"] },
      { prompt: "", options: ["a pessoa pediu", "foi iniciativa minha"] },
    ],
    extra: "No que as pessoas costumam te procurar? O que você ganhou com isso?",
  },
  {
    text: "Conte a última vez que você precisou de ajuda: você pediu, e como foi receber?",
    choices: [
      {
        prompt: "Prefere fazer sozinho, mesmo sabendo que sairia melhor com ajuda?",
        options: ["sim", "não"],
      },
    ],
  },
  {
    text: "Que situação você organiza sua vida pra evitar? O que fez da última vez que não conseguiu?",
  },
  {
    text: "Que crítica você já ouviu de pessoas diferentes, que nem se conhecem?",
    choices: [{ prompt: "Você concorda com ela?", options: ["sim", "em parte", "não"] }],
    extra: "Qual comportamento seu você repete e não gosta?",
  },
  {
    text: "O que te faz rir de verdade? Dá um exemplo.",
    choices: [{ prompt: "Você é mais", options: ["quem faz rir", "quem ri", "os dois"] }],
    extra: "Alguma brincadeira sua já deu problema? Tem assunto com que você nunca brinca?",
  },
  {
    text: "Conte um grupo em que você foi um deles de verdade. O que te fazia pertencer — e o que você fez quando se sentiu de fora?",
    extra: "Tinha alguém ali melhor que você em algo que te importava? O que você fez?",
  },
  {
    text: "Conte quando alguém importante te decepcionou. O que você fez depois, e como ficou sua confiança nas pessoas?",
    choices: [
      { prompt: "Era previsível?", options: ["sim, olhando pra trás", "não, nunca imaginei"] },
    ],
  },
  {
    text: "Conte um fracasso seu. O que você fez nos meses seguintes?",
    choices: [
      {
        prompt: "Já quis fazer algo que todos acharam besteira?",
        options: ["fiz", "quis e não fiz", "nunca"],
      },
    ],
    extra: "O que foi? Já sabotou algo seu quando estava perto de dar certo?",
  },
];

/** O que a pessoa marcou além do texto principal: opção por índice de `choices`, e o extra. */
export type QuestionDetail = {
  choices?: Record<number, string>;
  extra?: string;
};
