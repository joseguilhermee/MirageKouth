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
 * 28 itens, quatro blocos:
 *  - Bloco 1 (1–8): autoconceito — o que a pessoa diz que é.
 *  - Bloco 2a (9–16): conduta sob custo — decisão, autoridade, mandato, ajuda
 *    recebida e dada. Traz os dois itens novos (14, 16) que fecham o vazio de
 *    "quando dependia de você" e "quando você precisou receber".
 *  - Sombra (17–19): movida para o meio da entrevista, não para o fim — no
 *    fim a fadiga derruba a especificidade da resposta bem no bloco que mais
 *    precisa dela.
 *  - Bloco 2b (20–25) e Fecho (26–28): conduta restante e síntese, em ordem
 *    decrescente de exigência.
 *
 * Regras de redação do conjunto:
 *  - nenhum hint pressupõe o fato que pergunta (vira sim/não + desdobramento);
 *  - toda lista fechada termina aberta ("ou outra coisa");
 *  - listas de exemplo não se aglomeram num domínio só;
 *  - sem negação primando o que se quer evitar ("não precisa ser dramático");
 *  - desdobramentos neutros de escala, para não desqualificar exemplos pequenos;
 *  - o conjunto equilibra "o que você faz sem ninguém pedir" (Explorador,
 *    Criador, Sábio) com "o que você faz quando depende de você, e quando
 *    precisa receber" (Governante, Herói, Cuidador, Amante). Sem esse
 *    contrapeso o instrumento inclina para Explorador.
 *  - nenhum item pode ter "dono": se dá para dizer "essa é a pergunta do
 *    Governante", o item virou placar em vez de cena.
 *
 * Os comentários abaixo saem do bundle de produção na minificação.
 */
export const QUESTIONS: Question[] = [
  // ---------- Bloco 1 — autoconceito ----------
  {
    // Objetivo: linha de base do desejo — para onde a pessoa vai quando nada a
    // empurra. Absorve o antigo item sobre "fazer algo sem finalidade": é o
    // mesmo regime (tempo sem demanda) contado duas vezes por itens diferentes.
    text: "O que você faz numa tarde totalmente livre, sem nenhum compromisso marcado?",
    hints: [
      "Você procurou alguém, ou ficou por sua conta?",
      "E a última coisa pequena que você fez sem nenhuma finalidade — não ia levar a nada, só era boa naquele momento? Se demorou pra lembrar, diga isso também.",
    ],
  },
  {
    // Objetivo: Bobo — o humor como modo de estar no mundo, e se ele tem custo.
    // Única via de entrada do Bobo no Bloco 1; não tem substituto no conjunto.
    text: "O que te faz rir de verdade? Dá um exemplo recente.",
    hints: [
      "Você é mais quem faz rir ou quem ri?",
      "Já teve uma vez em que sua brincadeira criou problema? O que aconteceu?",
    ],
  },
  {
    // Objetivo: o padrão implícito que a pessoa carrega — o que ela acha que as
    // coisas DEVERIAM ser. Probe central de Governante; o hint 1 discrimina
    // Governante (arruma) / Rebelde (confronta) / Órfão (aguenta).
    text: "Quando alguma coisa te incomoda de verdade num ambiente, o que costuma ser? Dá um exemplo concreto.",
    hints: [
      "Você mexe nisso, fala, ou aguenta calado?",
      "Quando foi a última vez que aconteceu?",
    ],
  },
  {
    // Objetivo: topologia do vínculo — para quem a experiência precisa ir para
    // virar real. O hint 1 aceita proximidade como resposta; o 2 aceita ninguém.
    text: "Quem você procura primeiro quando acontece algo muito bom? E quando acontece algo muito ruim? É a mesma pessoa?",
    hints: [
      "Por que essa pessoa, e não outra?",
      "Já aconteceu de você não contar pra ninguém? Quando?",
    ],
  },
  {
    // Objetivo: ideal do ego — em que moeda a pessoa quer ser paga. O elogio
    // indiferente costuma discriminar mais do que o elogio que agrada, e é a
    // única fonte de contrassinal do instrumento inteiro.
    text: "Qual elogio te dá mais prazer receber? E qual elogio te deixa indiferente, mesmo sendo um elogio bom?",
    hints: [
      "Qual foi o último elogio que te deixou genuinamente satisfeito? Quem disse, e sobre o quê?",
    ],
  },
  {
    // Objetivo: o papel que os outros já atribuíram a ela — função social
    // observada, não declarada. O hint 2 revela competência não reconhecida.
    text: "Em que as pessoas costumam te pedir ajuda?",
    hints: [
      "Você gosta de ser procurado pra isso?",
      "Tem alguma coisa em que ninguém te procura e você acha que deveriam?",
    ],
  },
  {
    // Objetivo: Amante/Criador — onde a atenção gruda sem utilidade nenhuma.
    // "Vale a coisa mais óbvia" existe porque respondentes descartam a resposta
    // verdadeira por achá-la banal demais.
    text: "O que você olha e não consegue parar de olhar? Vale a coisa mais óbvia que te vier à cabeça — uma cena, um lugar, um objeto, o jeito de alguém fazer alguma coisa.",
  },
  {
    // Objetivo: a vida desejada em forma de rotina. "Repetiria muitas vezes"
    // impede que o item vire catálogo de férias e revela o ritmo real —
    // inclui estrutura (há trabalho? há gente? há responsabilidade?).
    text: "Descreva um dia perfeito seu, do acordar ao dormir. Não um dia único e especial — um dia que você repetiria muitas vezes.",
    hints: ["Tem alguém junto? Em que partes do dia?"],
  },

  // ---------- Bloco 2a — conduta sob custo ----------
  {
    // Objetivo: turning point de McAdams — como a pessoa narra descontinuidade
    // em si mesma. Exemplo banal no lugar de "não precisa ser dramático", que
    // primava justamente o drama. O hint 2 é sobre atraso de consciência, não
    // sobre velocidade da mudança — a redação antiga sugeria instantaneidade.
    text: "Pense em dois ou três momentos depois dos quais você não era mais a mesma pessoa. Pode ser pequeno: uma conversa de dez minutos, um trabalho, uma coisa que você leu, alguém que apareceu, alguém que saiu. Escolha um e conte em detalhe: o que aconteceu, o que você fez nos dias seguintes, o que passou a ser diferente.",
    hints: [
      "O que exatamente provocou a virada — uma pessoa, uma ideia, um lugar, uma perda, uma constatação?",
      "Você percebeu enquanto acontecia, ou só olhando pra trás?",
    ],
  },
  {
    // Objetivo: hierarquia de valores sob custo real. "Quem sabia" separa quem
    // decide em público (Governante, Herói) de quem decide sozinho.
    text: "Descreva uma decisão real em que você abriu mão de algo concreto e valioso. O que havia dos dois lados, quem sabia da decisão, e o que você perdeu de fato.",
    hints: [
      "O que você teria perdido se tivesse escolhido o outro lado?",
      "Rota alternativa: se nada grande vem à cabeça, conte uma escolha pequena e recente em que você abriu mão de algo que queria.",
    ],
  },
  {
    // Objetivo: agência — o que a pessoa reivindica como obra sua. A lista de
    // exemplos foi reequilibrada (era 5 de 7 relacionais, o que puxava orgulho
    // para vínculos). O hint 2 antigo ("depois que deixou de depender de você")
    // só funcionava para coisas que continuam existindo; agora aceita objeto.
    text: "Do que você mais se orgulha de ter feito acontecer? Pode ser qualquer coisa — uma coisa que você construiu com as mãos, um projeto, um lugar aonde você chegou, uma reconciliação, um grupo que existiu porque você juntou.",
    hints: [
      "Em que ponto foi mais difícil continuar, e o que você fez ali?",
      "Aquilo ainda existe, ou ainda acontece sem você? O que sobrou?",
    ],
  },
  {
    // Objetivo: investimento além do necessário sem ninguém pedir — a marca
    // mais confiável de vocação. Absorve o antigo item sobre "continuar
    // estudando depois de já ter o que precisava": era o mesmo comportamento
    // com outro objeto, e os dois colhiam a mesma história.
    text: "Em que você já gastou tempo demais sem que ninguém tivesse pedido e sem que houvesse ganho nenhum à vista? O que te puxava, até onde você foi, e o que sobrou daquilo.",
    hints: [
      "Já aconteceu de você continuar estudando ou investigando um assunto depois de já ter o que precisava para decidir? O que apareceu nesse excedente?",
    ],
  },
  {
    // Objetivo: o que a pessoa faz com discordância quando NÃO tem poder —
    // ação, saída, silêncio, sabotagem. "Se não fez nada, conte também" existe
    // porque a redação antiga pressupunha ação e bloqueava a resposta mais
    // informativa do item.
    text: "Conte sobre uma situação em que a maneira como as coisas estavam sendo feitas parecia errada para você — e você não tinha autoridade nenhuma para mudar aquilo. O que você fez? Se não fez nada, conte também: o que te segurou?",
    hints: [
      "O que mais te incomodava: o resultado, o método, quem estava decidindo — ou outra coisa?",
      "Foi exceção ou você costuma reagir assim?",
    ],
  },
  {
    // Objetivo: contrapeso do item anterior — o que a pessoa faz quando o
    // resultado dependia dela. Corrige o vazio de Governante do conjunto
    // antigo: sem esta cena, o decodificador tinha a linha do Governante mas
    // o enunciado nunca colocava a pessoa num regime onde governar era
    // possível. Rota alternativa garante sinal mesmo de quem nunca conduziu
    // nada — o modelo de autoridade que admira ou recusa também é dado.
    text: "Conte uma vez em que o resultado de alguma coisa dependeu de você: gente contando com você, prazo apertado, alguém cobrando. O que você fez, concretamente, do começo ao fim.",
    hints: [
      "Você queria estar nessa posição, caiu nela, ou foi atrás dela?",
      "Rota alternativa: se nunca aconteceu, conte de alguém que conduziu bem ou muito mal alguma coisa de que você participou. O que essa pessoa fez, exatamente?",
    ],
  },
  {
    // Objetivo: Cuidador — obrigação não escolhida, e o que a pessoa faz com
    // ela no dia a dia. A rota alternativa colhe Órfão pelo outro lado.
    text: "Já aconteceu de alguém passar a depender de você de um jeito que você não escolheu? Conte quem, como começou, e o que você fez com isso no dia a dia.",
    hints: [
      "Em algum momento você quis sair dessa posição?",
      "Rota alternativa: se nunca aconteceu, conte de uma vez em que você dependeu de alguém desse jeito. O que essa pessoa fez?",
    ],
  },
  {
    // Objetivo: o outro lado do cuidar — como a pessoa lida com precisar e
    // receber. Cuidador se desconforta ao receber, Amante quer receber tanto
    // quanto dá, e a sombra do Herói é a incapacidade de pedir ajuda: três
    // arquétipos com marcador nuclear aqui, e o conjunto antigo não tinha
    // nenhum item que perguntasse por isso diretamente.
    text: "Conte a última vez em que você precisou de ajuda de verdade. Você pediu, ou alguém percebeu? O que a pessoa fez, e como foi pra você receber aquilo.",
    hints: [
      "Tem alguma coisa que você prefere fazer sozinho, mesmo sabendo que sairia melhor com ajuda? O quê?",
      "Rota alternativa: se não lembra de ter precisado de ajuda de verdade, diga isso — e conte a última vez que te ofereceram ajuda e você recusou.",
    ],
  },

  // ---------- Sombra — no meio da entrevista, não no fim ----------
  {
    // Objetivo: o medo central — o motor negativo do arquétipo, lido pela
    // logística de evitação em vez da declaração de medo.
    text: "Existe algum tipo de situação que você organiza a sua vida para não passar por? Como exatamente você faz isso?",
    hints: ["Quando foi a última vez que você não conseguiu evitar? O que aconteceu?"],
  },
  {
    // Objetivo: sombra observável — o que a pessoa sabe de si cruzado com o que
    // os outros veem nela. A convergência entre (a) e (b) é o dado.
    text: "(a) Qual comportamento você repete, percebe que repete, e continua não gostando? (b) Qual crítica você já ouviu mais de uma vez, de pessoas diferentes que não se conhecem entre si? (c) São a mesma coisa?",
  },
  {
    // Objetivo: projeção de sombra — irritação desproporcional com quem se dá
    // bem fazendo o que a pessoa se proíbe. O hint 1 foi reescrito: "bem
    // sucedida naquilo que faz" era lido como carreira, quando o construto é se
    // o comportamento funciona para quem o pratica.
    text: 'Pense numa pessoa concreta cujo comportamento provoca em você uma irritação ou um desprezo desproporcionais. Descreva um episódio e o que ela fez — não o "tipo". O que exatamente naquilo é insuportável?',
    hints: [
      "Essa pessoa se dá bem agindo assim?",
      "Alguém já disse que você tem algo dela?",
    ],
  },

  // ---------- Bloco 2b — conduta sob custo (continuação) ----------
  {
    // Objetivo: poder de transformação sobre outro (Mago, Cuidador, Sábio).
    // "De propósito ou percebeu depois" separa quem opera intencionalmente
    // sobre pessoas de quem influencia sem projeto.
    text: "Existe alguém que é diferente hoje por causa de você. Quem, e o que exatamente você fez? Ações específicas, não intenções.",
    hints: [
      "Essa pessoa pediu, ou a iniciativa foi sua?",
      "Você fez de propósito, ou só percebeu depois?",
    ],
  },
  {
    // Objetivo: Rebelde/Criador — autonomia de juízo contra o consenso próximo.
    text: "Conte algo que você quis muito fazer e que as pessoas ao redor acharam sem sentido, errado ou besteira. Você fez? O que aconteceu?",
    hints: [
      "Hoje você acha que eles tinham razão?",
      "O que você estava protegendo ao insistir — ou o que você abriu mão ao desistir?",
    ],
  },
  {
    // Objetivo: pico de presença — o estado que a pessoa persegue. A ordem foi
    // invertida (o que → quem → onde): perguntar o lugar primeiro fazia o
    // cenário roubar o foco do que estava acontecendo.
    text: "Descreva um momento específico em que você se sentiu completamente vivo — presente, inteiro, sem querer estar em outro lugar. O que estava acontecendo, quem estava lá, onde você estava.",
    hints: [
      "Isso acontece com que frequência hoje?",
      "Você procura esses momentos ou eles te encontram?",
    ],
  },
  {
    // Objetivo: Órfão/Cara Comum — pertencimento e exclusão — mais a resposta à
    // rivalidade, que discrimina muito. As duas listas foram abertas: a de
    // reações era menu fechado, e a comparação pressupunha que havia alguém.
    text: "Fale de um grupo do qual você fez parte de verdade. O que fazia de você um deles? E um momento específico em que você sentiu que estava de fora.",
    hints: [
      "Nesse momento você se afastou, se ajustou, provocou, ficou calado — ou outra coisa?",
      "Havia ali alguém claramente melhor que você em algo que te importava? Se havia, o que você fez?",
    ],
  },
  {
    // Objetivo: a ferida de confiança e o que ela ensinou sobre o mundo.
    text: "Conte sobre uma vez em que alguém importante te decepcionou seriamente. O que você fez nas semanas seguintes, e o que aconteceu com a sua confiança depois — nessa pessoa e em geral.",
    hints: [
      "Você chegou a dizer alguma coisa? O quê, exatamente?",
      "Hoje, você acha que aquilo era previsível?",
    ],
  },
  {
    // Objetivo: como a pessoa processa perda e fracasso, e o medo do que o
    // sucesso exigiria. Os dois construtos (perder algo / sabotar algo perto
    // de dar certo) são adjacentes — a mesma resistência vista de dois
    // ângulos — e ficam fundidos para não repetir a cena de custo com outro
    // rótulo. O desdobramento é neutro de escala: "mudar sua vida" desqualificava
    // exemplos pequenos.
    text: "Conte sobre algo que você queria muito e não conseguiu, ou perdeu. Descreva os meses seguintes: o que você fez, o que disse a si mesmo, e o que fez com o assunto depois.",
    hints: [
      "Você tentou de novo, por outro caminho? Ou fechou o assunto?",
      "Já aconteceu de você estragar, abandonar ou adiar alguma coisa justamente quando estava perto de dar certo? Se sim: o que ia acontecer se aquilo desse certo?",
    ],
  },

  // ---------- Fecho — síntese ----------
  {
    // Objetivo: ideal do ego projetado numa pessoa concreta. A instrução virou
    // positiva ("um episódio, não uma lista"): a proibição antiga era sobre
    // formato, mas era lida como proibição de mencionar qualidades.
    text: "Pense numa pessoa real que você admira. Conte um episódio — uma coisa específica que ela fez e que ficou com você. Um episódio, não uma lista de qualidades.",
    hints: ["Você já fez algo parecido? Ou é justamente o que você não consegue fazer?"],
  },
  {
    // Objetivo: cosmovisão operacional — otimismo, cinismo ou resignação. O
    // hint separa quem se alinha à regra de quem vive apesar dela.
    text: "Qual regra você acha que o mundo segue de verdade, mesmo que ninguém diga em voz alta? Conte o episódio que te ensinou isso.",
    hints: ["Você age de acordo com essa regra, ou apesar dela?"],
  },
  {
    // Objetivo: o valor supremo. A contradição virou hint: no enunciado, ela
    // fazia a pessoa escolher um valor que tivesse uma contradição conveniente
    // à mão, em vez do valor que ela de fato considera indispensável.
    text: "Para que a sua vida tivesse valido a pena, o que precisaria ser verdade no fim?",
    hints: ["Tem alguma coisa na sua vida hoje que vai contra isso?"],
  },
];
