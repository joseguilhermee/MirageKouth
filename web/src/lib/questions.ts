export type Question = {
  /** Pergunta principal — o que precisa ser respondido. */
  text: string;
  /** Perguntas de apoio, opcionais: ajudam a aprofundar a resposta, não precisam ser respondidas à parte. */
  hints?: string[];
};

/**
 * Entrevista de identidade narrativa (McAdams) lida contra os 12 arquétipos de
 * Pearson. Não há pontuação: as respostas são lidas de forma interpretativa.
 *
 * 15 itens. Cada item é uma cena principal (`text`) seguida de desdobramentos
 * (`hints`) que aprofundam a mesma cena. A ordem é a do roteiro de origem
 * (Q01–Q04, Q15, Q05–Q14): o item 5 é a Q15.
 */
export const QUESTIONS: Question[] = [
  {
    text: "Me conta um momento em que você se sentiu completamente vivo. O que estava acontecendo, com quem, e onde.",
    hints: [
      "Com que frequência isso acontece hoje — e você vai atrás desses momentos ou eles te encontram?",
      "E no dia a dia: como é uma tarde boa pra você? Você procura alguém ou fica por sua conta?",
      "Qual foi a última coisa que você fez sem finalidade nenhuma?",
    ],
  },
  {
    text: "Me conta uma coisa em que você investiu tempo demais sem ninguém ter pedido. O que sobrou disso?",
    hints: [
      "Em algum momento você já podia decidir ou já tinha o que precisava, e continuou investigando?",
      "E tem alguma coisa que você ainda quer estudar?",
    ],
  },
  {
    text: "Qual foi o último elogio que te deu prazer de verdade — quem disse e sobre o quê?",
    hints: [
      "E tem algum elogio que as pessoas te fazem e que te deixa indiferente?",
    ],
  },
  {
    text: "Me conta uma decisão que te custou algo de verdade. O que você abriu mão.",
    hints: [
      "Quem sabia dessa decisão?",
      "Você já fez escolhas parecidas antes?",
    ],
  },
  {
    text: "Do que você mais se orgulha de ter feito acontecer — uma coisa que construiu, um projeto, uma pessoa, um grupo, um lugar aonde chegou?",
    hints: [
      "Aquilo ainda existe, ou ainda acontece sem você?",
    ],
  },
  {
    text: "Me conta uma vez em que você viu algo errado acontecendo e não tinha autoridade nenhuma sobre aquilo. O que você fez — ou o que te segurou.",
    hints: [
      "O que mais te incomodava ali: o resultado, o método, quem estava decidindo, ou outra coisa?",
      "Mudou alguma coisa depois?",
      "Você costuma agir assim?",
    ],
  },
  {
    text: "Me conta uma vez em que o resultado dependeu de você. Como você conduziu.",
    hints: [
      "Alguém não entregou a parte dele — o que você fez?",
      "Você queria estar nessa posição, caiu nela, ou foi atrás?",
      "O que ficou funcionando depois que você soltou?",
    ],
  },
  {
    text: "No que as pessoas te procuram?",
    hints: [
      "Você gosta de ser procurado pra isso?",
      "E tem alguém que é diferente hoje por sua causa — o que você fez?",
      "Essa pessoa pediu, ou foi iniciativa sua?",
      "Você fez de propósito, ou só percebeu depois?",
      "O que você ganhou com isso?",
    ],
  },
  {
    text: "Me conta uma vez em que você precisou de ajuda. Você pediu? Como foi receber?",
    hints: [
      "Você prefere fazer sozinho mesmo sabendo que sairia melhor com ajuda?",
    ],
  },
  {
    text: "Tem alguma situação que você organiza sua vida pra evitar?",
    hints: [
      "Quando foi a última vez que você não conseguiu evitar?",
    ],
  },
  {
    text: "Tem algum padrão que se repete na sua vida e que você não gosta?",
    hints: [
      "E tem alguma crítica que você já ouviu mais de uma vez, de pessoas diferentes?",
      "São a mesma coisa?",
    ],
  },
  {
    text: "O que te faz rir de verdade?",
    hints: [
      "Você é mais quem faz rir ou quem ri?",
      "Alguma brincadeira sua já criou problema?",
      "Tem algum assunto sobre o qual você nunca brinca?",
    ],
  },
  {
    text: "Me conta um grupo em que você se sentiu um deles de verdade. O que te fazia pertencer ali?",
    hints: [
      "E uma vez em que você se sentiu de fora — o que você fez?",
      "Teve alguém naquele grupo que era melhor que você em algo que importava pra você?",
    ],
  },
  {
    text: "Me conta uma vez em que alguém te decepcionou de verdade. O que você fez depois.",
    hints: [
      "Isso mudou como você confia nas pessoas?",
      "Era previsível?",
    ],
  },
  {
    text: "Teve alguma coisa que você quis fazer e as pessoas em volta acharam besteira? Você fez?",
    hints: [
      "E me conta um fracasso seu — o que aconteceu nos meses seguintes.",
      "Já teve alguma vez em que você sabotou algo seu justo quando estava perto de dar certo?",
      "O que ia acontecer se aquilo desse certo?",
    ],
  },
];
