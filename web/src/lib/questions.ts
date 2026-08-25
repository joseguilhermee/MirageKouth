export type Question = {
  /** Pergunta principal — o que precisa ser respondido. */
  text: string;
  /** Perguntas de apoio, opcionais: ajudam a aprofundar a resposta, não precisam ser respondidas à parte. */
  hints?: string[];
};

export const QUESTIONS: Question[] = [
  {
    text: "Pense em dois ou três momentos depois dos quais você não era mais a mesma pessoa. Não precisam ter sido momentos ruins. Escolha um e descreva em detalhe: o que aconteceu, o que você fez nos dias seguintes, e o que passou a ser diferente.",
    hints: [
      "O que exatamente provocou a virada — uma pessoa, uma ideia, um lugar, uma perda, uma constatação?",
      "Você percebeu na hora ou só depois?",
    ],
  },
  {
    text: "Descreva uma decisão real em que você abriu mão de algo concreto e valioso. Quero saber o que havia dos dois lados, quem sabia da decisão, e o que você efetivamente perdeu.",
    hints: [
      "O que você teria perdido se tivesse escolhido o outro lado?",
      "Você já tinha feito escolhas parecidas antes?",
    ],
  },
  {
    text: "Conte sobre uma situação em que a maneira como as coisas estavam sendo feitas parecia errada para você — e você não tinha autoridade nenhuma para mudar aquilo. O que você efetivamente fez? Descreva a sequência de ações.",
    hints: [
      "O que mais te incomodava: o resultado, o método, ou quem estava decidindo?",
      "Isso foi exceção ou você costuma reagir assim?",
    ],
  },
  {
    text: "Descreva uma vez em que você teve de decidir algo que afetava outras pessoas que não tinham voz na decisão. Como você decidiu, o que você contou a elas, e o que guardou para si?",
    hints: [
      "O que teria acontecido se você tivesse dividido a decisão?",
      "Como você se sentiu depois, e por quanto tempo?",
    ],
  },
  {
    text: "Conte algo que você fez e que a maioria das pessoas classificaria como erro — e que você, até hoje, não considera erro. O que você estava protegendo ao fazer aquilo?",
    hints: ["Quem discordou de você na época, e o que essa pessoa dizia?"],
  },
  {
    text: "Descreva algo que existe hoje e não existiria se você não tivesse feito. Pode ser grande ou pequeno. Conte como começou, como foi o meio do processo, e o que aconteceu com aquilo depois.",
    hints: [
      "Em que ponto foi mais difícil continuar, e o que você fez ali?",
      "Alguém já pegou algo seu — ideia, método, trabalho — e apresentou como próprio? O que você sentiu?",
    ],
  },
  {
    text: "Conte sobre algo que você foi atrás de entender a fundo sem que houvesse nenhum ganho prático à vista. O que te puxou, até onde você foi, e o que fez com aquilo depois.",
    hints: ["Você chegou a alguma conclusão? Ela mudou algo na sua vida prática?"],
  },
  {
    text: "Existe alguém que é diferente hoje por causa de você. Quem, e o que exatamente você fez? Descreva ações específicas, não intenções.",
    hints: [
      "Essa pessoa pediu, ou a iniciativa foi sua?",
      "O que você ganhou com essa mudança?",
    ],
  },
  {
    text: "Descreva uma relação — de qualquer tipo — que mudou você. O que você deu, o que recebeu, e o que exatamente teria acabado na sua vida se ela tivesse terminado?",
    hints: [
      "Havia algo que você fazia por essa pessoa e que te custava caro?",
      "O que ela enxergava em você que os outros não enxergavam?",
    ],
  },
  {
    text: "Descreva um momento específico em que você se sentiu completamente vivo — presente, inteiro, sem querer estar em outro lugar. Onde você estava, o que estava acontecendo, quem estava lá?",
    hints: [
      "Isso acontece com que frequência na sua vida hoje?",
      "Você procura esses momentos ou eles te encontram?",
    ],
  },
  {
    text: "Conte a última vez que você fez alguma coisa sem nenhuma finalidade — não ia levar a nada, não ia melhorar nada, só era bom naquele momento. Quando foi?",
    hints: ["Você teve que se justificar — para alguém ou para você mesmo?"],
  },
  {
    text: "Fale de um grupo do qual você fez parte de verdade. O que fazia de você um deles? E descreva um momento específico em que sentiu que estava de fora.",
    hints: [
      "Naquele momento você se afastou, se ajustou, provocou, ficou calado — o quê?",
      "Havia ali alguém claramente melhor que você em algo que importava para você? O que você fez?",
    ],
  },
  {
    text: "Descreva uma situação em que sua ironia, brincadeira ou irreverência criou problema. O que você estava fazendo com aquilo naquele momento?",
    hints: ["Você faria de novo?", "Existe algum assunto sobre o qual você nunca brinca?"],
  },
  {
    text: "Conte sobre uma vez em que alguém importante te decepcionou seriamente. O que você fez nas semanas seguintes, e o que aconteceu com a sua confiança depois — nessa pessoa e em geral.",
    hints: [
      "Você chegou a dizer alguma coisa a ela? O que exatamente?",
      "Hoje, você acha que aquilo era previsível?",
    ],
  },
  {
    text: "(a) Conte sobre algo que você queria muito e não conseguiu, ou perdeu. Descreva os meses seguintes: o que você fez, o que disse a si mesmo, e o que fez com o assunto depois. (b) E já aconteceu de você estragar, abandonar ou adiar algo justamente quando estava perto de dar certo? O que estava prestes a mudar na sua vida?",
    hints: [
      "Você tentou de novo? De que forma?",
      "De quem foi a responsabilidade, na sua leitura de hoje?",
    ],
  },
  {
    text: "Existe algum tipo de situação que você organiza a sua vida para não passar por? Como exatamente você faz isso?",
    hints: ["Quando foi a última vez que você não conseguiu evitar? O que aconteceu?"],
  },
  {
    text: "Descreva uma vez em que você agiu contra um princípio que considera seu. O que você protegeu ao abrir mão dele?",
    hints: ["Alguém ficou sabendo?", "Isso voltou a acontecer?"],
  },
  {
    text: "(a) Qual comportamento você repete, percebe que repete, e continua não gostando? (b) Qual crítica você já ouviu mais de uma vez, de pessoas diferentes que não se conhecem entre si? (c) Essas duas coisas são a mesma?",
    hints: ["Em que circunstância esse comportamento aparece com mais força?"],
  },
  {
    text: 'Pense em uma pessoa concreta cujo comportamento provoca em você irritação ou desprezo desproporcionais. Não descreva o "tipo" de pessoa — descreva um episódio específico e o que ela fez. O que exatamente naquilo é insuportável?',
    hints: [
      "Essa pessoa é bem-sucedida naquilo que faz?",
      "Alguém já disse que você tem algo dela?",
    ],
  },
  {
    text: "Qual regra você acha que o mundo segue de verdade, mesmo que ninguém diga em voz alta? Conte o episódio que te ensinou isso.",
    hints: ["Você age de acordo com essa regra, ou apesar dela?"],
  },
  {
    text: "Para que a sua vida tivesse valido a pena, o que precisaria ser verdade no fim? E, hoje, o que você está fazendo que contradiz isso?",
    hints: ["Há quanto tempo essa contradição existe?"],
  },
];
