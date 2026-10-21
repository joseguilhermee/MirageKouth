/** Uma opção de botão. Pode abrir uma segunda camada de opções (`sub`). */
export type ChoiceOption = {
  label: string;
  /** Segunda camada, de múltipla escolha: aparece quando a opção é marcada e exige ao menos uma marcação. */
  sub?: { prompt: string; options: string[] };
  /** "outro", "outra coisa": marcar abre o campo "especificar" e exige que seja preenchido. */
  needsSpecify?: boolean;
  /** Em linha de múltipla escolha, não combina com as outras ("sozinho", "ninguém"). */
  exclusive?: boolean;
};

/** Uma linha de botões. */
export type Choice = {
  /** Enunciado curto acima das opções. */
  prompt: string;
  options: ChoiceOption[];
  /** Permite marcar mais de uma opção. Padrão: escolha única. */
  multi?: boolean;
};

export type Question = {
  /** Código do roteiro de origem (Q01…Q15); não segue a ordem de exibição. */
  id: string;
  /** Pergunta principal — o que precisa ser respondido, em texto livre. */
  text: string;
  /** Linhas de botões: todas obrigatórias, nada vem marcado. */
  choices?: Choice[];
  /** Segunda pergunta em texto livre; obrigatória como a principal. */
  extra?: string;
};

/** Resposta de uma linha de botões. */
export type ChoiceAnswer = {
  selected: string[];
  /** Marcações da segunda camada, por rótulo da opção que a abriu. */
  sub?: Record<string, string[]>;
  /** Texto livre do "especificar". */
  specify?: string;
};

/** O que a pessoa marcou além do texto principal: botões por índice de `choices`, e o extra. */
export type QuestionDetail = {
  choices?: Record<number, ChoiceAnswer>;
  extra?: string;
};

// ---------- Blocos reaproveitados ----------

const opt = (...labels: string[]): ChoiceOption[] => labels.map((label) => ({ label }));
const OUTRO: ChoiceOption = { label: "outro", needsSpecify: true };
const OUTRA_COISA: ChoiceOption = { label: "outra coisa", needsSpecify: true };

const FAMILIA: ChoiceOption = {
  label: "família",
  sub: {
    prompt: "Quem da família?",
    options: [
      "pai",
      "mãe",
      "irmão",
      "irmã",
      "avô",
      "avó",
      "filho",
      "filha",
      "tio ou tia",
      "primo ou prima",
      "padrasto ou madrasta",
      "outro parente",
    ],
  },
};
const PARCEIRO: ChoiceOption = {
  label: "parceiro(a)",
  sub: { prompt: "Qual?", options: ["namorado(a)", "marido ou esposa", "ex", "ficante"] },
};
const AMIGOS: ChoiceOption = {
  label: "amigos",
  sub: {
    prompt: "De onde?",
    options: ["de infância", "da escola", "da faculdade", "do trabalho", "da internet", "do bairro"],
  },
};
const TRABALHO_PESSOAS: ChoiceOption = {
  label: "gente do trabalho ou estudo",
  sub: {
    prompt: "Quem?",
    options: ["colega", "chefe", "liderado(a)", "cliente", "sócio(a)", "professor(a)", "aluno(a)"],
  },
};

/** Lista padrão de "quem": usada em várias perguntas. */
const PESSOAS: ChoiceOption[] = [FAMILIA, PARCEIRO, AMIGOS, TRABALHO_PESSOAS, OUTRO];

/**
 * Entrevista de identidade narrativa (McAdams) lida contra os 12 arquétipos de
 * Pearson. Não há pontuação: as respostas são lidas de forma interpretativa.
 *
 * 15 itens. Cada item é uma cena principal em texto livre, seguida de linhas
 * de botões (algumas em árvore: opção → quem/qual) e, em vários itens, de uma
 * segunda pergunta em texto livre (`extra`). Tudo é obrigatório. A ordem é a
 * do roteiro de origem (Q01–Q04, Q15, Q05–Q14): o item 5 é a Q15.
 */
/** Versão do conjunto, enviada no arquivo para o decryptor saber como ler. */
export const QUESTIONS_VERSION = "15B";

export const QUESTIONS: Question[] = [
  {
    id: "Q01",
    text: "Conte um momento em que você se sentiu completamente vivo: o que estava fazendo, e com quem?",
    choices: [
      { prompt: "Com quem você estava", multi: true, options: [{ label: "sozinho", exclusive: true }, ...PESSOAS] },
      { prompt: "Isso acontece hoje", options: opt("com frequência", "às vezes", "quase nunca") },
      {
        prompt: "A última coisa que você fez sem finalidade nenhuma foi",
        options: opt("esta semana", "este mês", "faz tempo", "não lembro"),
      },
    ],
    extra: "Como é uma tarde livre boa pra você? O que foi essa última coisa sem finalidade?",
  },
  {
    id: "Q02",
    text: "Em que você já gastou tempo demais sem ninguém pedir, e o que sobrou disso?",
    choices: [
      {
        prompt: "Isso era mais",
        options: [
          ...opt(
            "estudo ou pesquisa",
            "trabalho manual",
            "arte ou criação",
            "tecnologia",
            "jogo",
            "esporte ou corpo",
            "coleção",
            "cuidar de alguém ou de algo"
          ),
          OUTRA_COISA,
        ],
      },
      { prompt: "Você continuou mesmo depois de já ter o que precisava?", options: opt("sim", "não") },
    ],
    extra: "Tem algo que você ainda quer estudar?",
  },
  {
    id: "Q03",
    text: "Qual elogio recente te deu prazer de verdade? E qual te deixa indiferente?",
    choices: [
      {
        prompt: "O elogio que te deu prazer era sobre",
        options: [
          ...opt(
            "algo que você fez",
            "seu jeito de ser",
            "sua competência ou inteligência",
            "seu cuidado com alguém",
            "sua aparência",
            "sua coragem"
          ),
          OUTRA_COISA,
        ],
      },
    ],
    extra: "Quem disse?",
  },
  {
    id: "Q04",
    text: "Conte uma decisão que te custou algo de verdade: do que você abriu mão, e para ficar com o quê?",
    choices: [
      {
        prompt: "A decisão envolvia principalmente",
        options: [
          ...opt(
            "trabalho ou carreira",
            "estudo",
            "relacionamento",
            "família",
            "dinheiro",
            "onde morar",
            "saúde"
          ),
          OUTRA_COISA,
        ],
      },
      {
        prompt: "Quem sabia",
        options: [
          { label: "quase ninguém" },
          {
            label: "só os próximos",
            sub: { prompt: "Quem?", options: ["família", "parceiro(a)", "amigos", "colegas"] },
          },
          { label: "todo mundo" },
        ],
      },
      { prompt: "Já fez escolhas parecidas antes?", options: opt("sim", "não") },
    ],
  },
  {
    id: "Q15",
    text: "Do que você mais se orgulha de ter feito acontecer?",
    choices: [
      {
        prompt: "Isso é",
        options: [
          ...opt(
            "algo que construí com as mãos",
            "um projeto ou trabalho",
            "uma pessoa que ajudei",
            "um grupo que juntei",
            "um lugar aonde cheguei",
            "uma reconciliação"
          ),
          OUTRA_COISA,
        ],
      },
      {
        prompt: "Isso hoje",
        options: opt("ainda existe", "ainda acontece sem mim", "acabou", "foi algo pontual"),
      },
    ],
  },
  {
    id: "Q05",
    text: "Conte uma vez em que você viu algo errado e não tinha poder nenhum pra mudar. O que você fez — ou o que te segurou?",
    choices: [
      {
        prompt: "O que você fez",
        options: [
          { label: "falei com quem decidia" },
          {
            label: "falei com outra pessoa",
            sub: {
              prompt: "Com quem?",
              options: ["colega", "superior", "RH ou ouvidoria", "família", "amigo(a)", "nas redes"],
            },
          },
          { label: "agi por conta própria" },
          { label: "saí daquele lugar" },
          { label: "não fiz nada" },
          OUTRA_COISA,
        ],
      },
      {
        prompt: "O que mais te incomodava",
        options: [...opt("o resultado", "o método", "quem decidia"), OUTRA_COISA],
      },
      { prompt: "Você costuma agir assim?", options: opt("sim", "não") },
    ],
    extra: "Mudou alguma coisa depois?",
  },
  {
    id: "Q06",
    text: "Conte uma vez em que o resultado dependeu de você. O que você fez, do começo ao fim?",
    choices: [
      {
        prompt: "Onde foi",
        options: [
          ...opt(
            "trabalho",
            "estudo",
            "família",
            "amigos",
            "esporte",
            "comunidade, igreja ou voluntariado"
          ),
          OUTRO,
        ],
      },
      {
        prompt: "Você",
        options: opt("foi atrás dessa posição", "caiu nela e assumiu", "caiu nela e não gostou"),
      },
    ],
    extra: "Alguém deixou de fazer a parte dele? O que você fez?",
  },
  {
    id: "Q07",
    text: "Tem alguém que é diferente hoje por sua causa? O que exatamente você fez?",
    choices: [
      {
        prompt: "Essa pessoa é",
        options: [
          {
            label: "família",
            sub: {
              prompt: "Quem da família?",
              options: [
                "pai",
                "mãe",
                "irmão",
                "irmã",
                "filho",
                "filha",
                "sobrinho",
                "sobrinha",
                "avô",
                "avó",
                "primo ou prima",
                "outro parente",
              ],
            },
          },
          PARCEIRO,
          { label: "amigo(a)" },
          TRABALHO_PESSOAS,
          OUTRO,
        ],
      },
      { prompt: "Foi", options: opt("de propósito", "só percebi depois") },
      { prompt: "De quem foi a iniciativa", options: opt("a pessoa pediu", "foi iniciativa minha") },
    ],
    extra: "No que as pessoas costumam te procurar? O que você ganhou com isso?",
  },
  {
    id: "Q08",
    text: "Conte a última vez que você precisou de ajuda: você pediu, e como foi receber?",
    choices: [
      {
        prompt: "Como a ajuda chegou",
        options: opt("pedi", "alguém percebeu sem eu pedir", "não pedi e ninguém ajudou"),
      },
      {
        prompt: "Quem ajudou",
        multi: true,
        options: [
          { label: "ninguém", exclusive: true },
          ...PESSOAS.slice(0, 4),
          { label: "vizinho(a)" },
          {
            label: "profissional",
            sub: { prompt: "Qual?", options: ["médico(a)", "psicólogo(a)", "advogado(a)", "professor(a)"] },
          },
          OUTRO,
        ],
      },
      {
        prompt: "Prefere fazer sozinho, mesmo sabendo que sairia melhor com ajuda?",
        options: opt("sim", "não"),
      },
    ],
  },
  {
    id: "Q09",
    text: "Que situação você organiza sua vida pra evitar? O que fez da última vez que não conseguiu?",
    choices: [
      {
        prompt: "Essa situação tem mais a ver com",
        options: [
          ...opt(
            "conflito ou briga",
            "depender de alguém",
            "ser avaliado ou julgado",
            "ficar sozinho",
            "perder o controle",
            "ser o centro das atenções",
            "ser rejeitado"
          ),
          OUTRA_COISA,
        ],
      },
    ],
  },
  {
    id: "Q10",
    text: "Que crítica você já ouviu de pessoas diferentes, que nem se conhecem?",
    choices: [
      { prompt: "Você ouviu isso de", multi: true, options: PESSOAS },
      { prompt: "Você concorda com ela?", options: opt("sim", "em parte", "não") },
    ],
    extra: "Qual comportamento seu você repete e não gosta?",
  },
  {
    id: "Q11",
    text: "O que te faz rir de verdade? Dá um exemplo.",
    choices: [
      {
        prompt: "O que mais te faz rir",
        multi: true,
        options: [
          ...opt(
            "situações do dia a dia",
            "piadas e trocadilhos",
            "humor absurdo",
            "ironia e sarcasmo",
            "gente se atrapalhando",
            "memes e vídeos",
            "rir de mim mesmo"
          ),
          OUTRA_COISA,
        ],
      },
      { prompt: "Você é mais", options: opt("quem faz rir", "quem ri", "os dois") },
    ],
    extra: "Alguma brincadeira sua já deu problema? Tem assunto com que você nunca brinca?",
  },
  {
    id: "Q12",
    text: "Conte um grupo em que você foi um deles de verdade. O que te fazia pertencer — e o que você fez quando se sentiu de fora?",
    choices: [
      {
        prompt: "Que grupo era",
        options: [
          ...opt(
            "família",
            "amigos de escola",
            "faculdade",
            "trabalho",
            "time ou esporte",
            "religião",
            "internet ou jogo",
            "bairro"
          ),
          OUTRO,
        ],
      },
      {
        prompt: "Quando se sentiu de fora, você",
        options: [...opt("se afastou", "se ajustou", "provocou", "ficou calado"), OUTRA_COISA],
      },
    ],
    extra: "Tinha alguém ali melhor que você em algo que te importava? O que você fez?",
  },
  {
    id: "Q13",
    text: "Conte quando alguém importante te decepcionou. O que você fez depois, e como ficou sua confiança nas pessoas?",
    choices: [
      { prompt: "Quem te decepcionou", options: PESSOAS },
      {
        prompt: "Sua confiança depois disso",
        options: [
          ...opt(
            "voltou ao normal",
            "ficou menor só com essa pessoa",
            "ficou menor com todo mundo",
            "acabou com essa pessoa"
          ),
          OUTRA_COISA,
        ],
      },
      { prompt: "Era previsível?", options: opt("sim, olhando pra trás", "não, nunca imaginei") },
    ],
  },
  {
    id: "Q14",
    text: "Conte um fracasso seu. O que você fez nos meses seguintes?",
    choices: [
      {
        prompt: "O fracasso foi em",
        options: [
          ...opt(
            "trabalho ou negócio",
            "estudo",
            "relacionamento",
            "esporte",
            "projeto pessoal",
            "saúde",
            "dinheiro"
          ),
          OUTRA_COISA,
        ],
      },
      {
        prompt: "Já quis fazer algo que todos acharam besteira?",
        options: opt("fiz", "quis e não fiz", "nunca"),
      },
    ],
    extra: "O que foi? Já sabotou algo seu quando estava perto de dar certo?",
  },
];

/**
 * Resposta de uma linha em texto, para o arquivo: "família → mãe, avó; amigos → da escola".
 * O decryptor e o interpretador leem esta string; o detalhe estruturado vai junto.
 */
export function formatChoiceAnswer(answer: ChoiceAnswer | undefined): string {
  if (!answer) return "";
  return answer.selected
    .map((label) => {
      const sub = answer.sub?.[label];
      return sub && sub.length > 0 ? `${label} → ${sub.join(", ")}` : label;
    })
    .join("; ");
}

/** Linhas de botões ainda incompletas: sem marcação, sem sub-opção, ou "outro" sem especificar. */
export function missingChoiceRows(question: Question, detail: QuestionDetail | undefined): number[] {
  return (question.choices ?? [])
    .map((choice, c) => ({ choice, c, answer: detail?.choices?.[c] }))
    .filter(({ choice, answer }) => {
      if (!answer || answer.selected.length === 0) return true;
      return answer.selected.some((label) => {
        const option = choice.options.find((o) => o.label === label);
        if (option?.sub && !answer.sub?.[label]?.length) return true;
        if (option?.needsSpecify && (answer.specify ?? "").trim().length < 2) return true;
        return false;
      });
    })
    .map(({ c }) => c);
}
