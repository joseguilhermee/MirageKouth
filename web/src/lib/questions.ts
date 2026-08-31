export type Question = {
  /** Pergunta principal — o que precisa ser respondido. */
  text: string;
  /** Perguntas de apoio, opcionais: ajudam a aprofundar a resposta, não precisam ser respondidas à parte. */
  hints?: string[];
};

export const QUESTIONS: Question[] = [
  {
    text: "O que você faz numa tarde totalmente livre, em que ninguém espera nada de você?",
    hints: [
      "E as suas duas ou três últimas tardes livres de verdade — o que você fez em cada uma?",
    ],
  },
  {
    text: "Qual assunto faz você falar demais sem perceber?",
    hints: [
      "Conte a última vez que isso aconteceu: com quem você estava, e por quanto tempo você falou.",
    ],
  },
  {
    text: "O que te faz rir de verdade? Dá um exemplo recente.",
    hints: ["Já teve uma vez em que sua brincadeira criou problema? O que aconteceu?"],
  },
  {
    text: "Quando alguma coisa te incomoda de verdade num ambiente, o que costuma ser?",
  },
  {
    text: "Quem você procura primeiro quando acontece algo muito bom? E quando acontece algo muito ruim? É a mesma pessoa?",
    hints: ["O que essa pessoa tem que as outras não têm?"],
  },
  {
    text: "Qual elogio te dá mais prazer receber? E qual elogio te deixa indiferente, mesmo sendo um elogio bom?",
    hints: [
      "Qual foi o último elogio que te deixou genuinamente satisfeito? Quem disse, e sobre o quê?",
    ],
  },
  {
    text: "Em que as pessoas costumam te pedir ajuda?",
  },
  {
    text: "O que você olha e não consegue parar de olhar? Pode ser uma cena, um tipo de lugar, um objeto, o jeito de alguém fazer alguma coisa.",
  },
  {
    text: "Descreva um dia perfeito seu, do acordar ao dormir. Sem restrição de dinheiro nem obrigação.",
  },
  {
    text: "Se você pudesse ser bom numa coisa que hoje você não é, qual seria? Por quê essa?",
  },
  {
    text: "Pense em dois ou três momentos depois dos quais você não era mais a mesma pessoa. Pode ter sido uma conversa, uma viagem, um trabalho, alguém que apareceu, alguém que saiu, uma coisa que você leu, uma decisão. Não precisa ser dramático nem triste. Escolha um e conte em detalhe: o que aconteceu, o que você fez nos dias seguintes, o que passou a ser diferente.",
    hints: [
      "O que exatamente provocou a virada — uma pessoa, uma ideia, um lugar, uma perda, uma constatação?",
      "Você percebeu na hora ou só muito depois?",
    ],
  },
  {
    text: "Descreva uma decisão real em que você abriu mão de algo concreto e valioso. O que havia dos dois lados, quem sabia da decisão, e o que você perdeu de fato.",
    hints: [
      "O que você teria perdido se tivesse escolhido o outro lado?",
      "Já tinha feito escolhas parecidas antes?",
      "Rota alternativa: se nada grande vem à cabeça, conte uma escolha pequena e recente em que você abriu mão de algo que queria.",
    ],
  },
  {
    text: "Do que você mais se orgulha de ter feito acontecer? Pode ser qualquer coisa — um objeto, um projeto, um encontro, uma reconciliação, uma mudança em alguém, uma viagem, um grupo que existiu porque você juntou.",
    hints: [
      "Em que ponto foi mais difícil continuar, e o que você fez ali?",
      "O que aconteceu com aquilo depois que deixou de depender de você?",
    ],
  },
  {
    text: "Em que você já gastou tempo demais sem que ninguém tivesse pedido e sem que houvesse ganho nenhum à vista? O que te puxava, até onde você foi, e o que sobrou daquilo.",
  },
  {
    text: "Conte uma vez em que você continuou estudando ou investigando um assunto depois de já ter o que precisava para decidir ou agir. Quanto tempo a mais você gastou, e o que descobriu nesse excedente?",
    hints: ["O que sobrou daquilo hoje?"],
  },
  {
    text: "Conte sobre uma situação em que a maneira como as coisas estavam sendo feitas parecia errada para você — e você não tinha autoridade nenhuma para mudar aquilo. O que você efetivamente fez? Descreva a sequência de ações.",
    hints: [
      "O que mais te incomodava: o resultado, o método, ou quem estava decidindo?",
      "Depois que você falou ou agiu, quem passou a fazer o quê de diferente?",
      "Foi exceção ou você costuma reagir assim?",
    ],
  },
  {
    text: "Já aconteceu de alguém passar a depender de você de um jeito que você não escolheu? Conte quem, como começou, e o que você fez com isso no dia a dia.",
    hints: [
      "Em algum momento você quis sair dessa posição?",
      "Rota alternativa: se nunca aconteceu, conte de uma vez em que você dependeu de alguém desse jeito. O que essa pessoa fez?",
    ],
  },
  {
    text: "Existe alguém que é diferente hoje por causa de você. Quem, e o que exatamente você fez? Ações específicas, não intenções.",
    hints: [
      "Essa pessoa pediu, ou a iniciativa foi sua?",
      "O que você ganhou com essa mudança?",
    ],
  },
  {
    text: "Conte algo que você quis muito fazer e que as pessoas ao redor acharam sem sentido, errado ou besteira. Você fez? O que aconteceu?",
    hints: [
      "Hoje você acha que eles tinham razão?",
      "O que você estava protegendo ao insistir — ou o que você abriu mão ao desistir?",
    ],
  },
  {
    text: "Descreva um momento específico em que você se sentiu completamente vivo — presente, inteiro, sem querer estar em outro lugar. Onde você estava, o que estava acontecendo, quem estava lá.",
    hints: [
      "Isso acontece com que frequência hoje?",
      "Você procura esses momentos ou eles te encontram?",
    ],
  },
  {
    text: "Conte a última vez que você fez alguma coisa sem nenhuma finalidade — não ia levar a nada, não ia melhorar nada, só era bom naquele momento. Quando foi?",
    hints: ["Você precisou se justificar, para alguém ou para você mesmo?"],
  },
  {
    text: "Fale de um grupo do qual você fez parte de verdade. O que fazia de você um deles? E um momento específico em que você sentiu que estava de fora.",
    hints: [
      "Nesse momento você se afastou, se ajustou, provocou, ficou calado — o quê?",
      "Havia ali alguém claramente melhor que você em algo que te importava? O que você fez?",
    ],
  },
  {
    text: "Conte sobre uma vez em que alguém importante te decepcionou seriamente. O que você fez nas semanas seguintes, e o que aconteceu com a sua confiança depois — nessa pessoa e em geral.",
    hints: [
      "Você chegou a dizer alguma coisa? O quê, exatamente?",
      "Hoje, você acha que aquilo era previsível?",
    ],
  },
  {
    text: "(a) Conte sobre algo que você queria muito e não conseguiu, ou perdeu. Descreva os meses seguintes: o que você fez, o que disse a si mesmo, o que fez com o assunto depois. (b) Já aconteceu de você estragar, abandonar ou adiar alguma coisa justamente quando estava perto de dar certo? O que estava prestes a mudar na sua vida?",
  },
  {
    text: "Existe algum tipo de situação que você organiza a sua vida para não passar por? Como exatamente você faz isso?",
    hints: ["Quando foi a última vez que você não conseguiu evitar? O que aconteceu?"],
  },
  {
    text: "Descreva uma vez em que você agiu contra um princípio que considera seu. O que você protegeu ao abrir mão dele?",
    hints: ["Alguém ficou sabendo?", "Voltou a acontecer?"],
  },
  {
    text: "(a) Qual comportamento você repete, percebe que repete, e continua não gostando? (b) Qual crítica você já ouviu mais de uma vez, de pessoas diferentes que não se conhecem entre si? (c) São a mesma coisa?",
  },
  {
    text: "Pense numa pessoa real que você admira. Não liste qualidades — conte uma coisa específica que ela fez e que ficou com você.",
    hints: ["Você já fez algo parecido? Ou é justamente o que você não consegue fazer?"],
  },
  {
    text: 'Pense numa pessoa concreta cujo comportamento provoca em você uma irritação ou um desprezo desproporcionais. Não descreva o "tipo" — descreva um episódio e o que ela fez. O que exatamente naquilo é insuportável?',
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
  },
];
