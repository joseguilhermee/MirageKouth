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

// ---------- Atalhos ----------

const opt = (...labels: string[]): ChoiceOption[] => labels.map((label) => ({ label }));
const OUTRA_COISA: ChoiceOption = { label: "outra coisa", needsSpecify: true };

/**
 * Entrevista de identidade narrativa (McAdams) lida contra os 12 arquétipos de
 * Pearson. Não há pontuação: as respostas são lidas de forma interpretativa
 * por uma IA, então a pessoa conta a cena com as próprias palavras.
 *
 * 15 itens. A base é o texto corrido do roteiro original: o que antes eram
 * subperguntas ficou no enunciado ou no `extra`. Botões só aparecem onde
 * há um contraste curto que a história não entrega sozinha (frequência,
 * "sim ou não", "de propósito ou só percebi depois"); nunca para classificar
 * o assunto da resposta, que é trabalho do interpretador. Tudo é obrigatório.
 * A ordem é a do roteiro de origem (Q01–Q04, Q15, Q05–Q14): o item 5 é a Q15.
 */
/** Versão do conjunto, enviada no arquivo para o decryptor saber como ler. */
export const QUESTIONS_VERSION = "15B";

export const QUESTIONS: Question[] = [
  {
    id: "Q01",
    text: "Conte um momento em que você se sentiu completamente vivo: o que estava acontecendo, com quem e onde? Você vai atrás desses momentos ou eles te encontram?",
    choices: [
      { prompt: "Isso acontece hoje", options: opt("com frequência", "às vezes", "quase nunca") },
      {
        prompt: "A última coisa que você fez sem finalidade nenhuma foi",
        options: opt("esta semana", "este mês", "faz tempo", "não lembro"),
      },
    ],
    extra:
      "Como é uma tarde livre boa pra você? Você procura alguém ou fica por sua conta? O que foi essa última coisa sem finalidade?",
  },
  {
    id: "Q02",
    text: "Em que você já gastou tempo demais sem ninguém pedir, e o que sobrou disso?",
    choices: [
      { prompt: "Você continuou mesmo depois de já ter o que precisava?", options: opt("sim", "não") },
    ],
    extra: "Tem algo que você ainda quer estudar?",
  },
  {
    id: "Q03",
    text: "Qual foi o último elogio que te deu prazer de verdade — quem disse e sobre o quê? E tem algum elogio que as pessoas te fazem e que te deixa indiferente?",
  },
  {
    id: "Q04",
    text: "Conte uma decisão que te custou algo de verdade: do que você abriu mão, e para ficar com o quê?",
    choices: [
      {
        prompt: "Quem sabia",
        options: [
          { label: "quase ninguém" },
          {
            label: "só os próximos",
            sub: {
              prompt: "Quem?",
              options: [
                "pai",
                "mãe",
                "irmão ou irmã",
                "avô ou avó",
                "filho ou filha",
                "parceiro(a)",
                "amigos",
                "colegas",
                "outro",
              ],
            },
          },
          { label: "todo mundo" },
        ],
      },
      { prompt: "Já fez escolhas parecidas antes?", options: opt("sim", "não") },
    ],
  },
  {
    id: "Q15",
    text: "Do que você mais se orgulha de ter feito acontecer — uma coisa que construiu, um projeto, uma pessoa, um grupo, um lugar aonde chegou? Aquilo ainda existe, ou ainda acontece sem você?",
  },
  {
    id: "Q05",
    text: "Conte uma vez em que você viu algo errado e não tinha poder nenhum pra mudar. O que você fez — ou o que te segurou?",
    choices: [
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
        prompt: "Você",
        options: opt("foi atrás dessa posição", "caiu nela e assumiu", "caiu nela e não gostou"),
      },
    ],
    extra:
      "Alguém deixou de fazer a parte dele? O que você fez? E o que ficou funcionando depois que você soltou?",
  },
  {
    id: "Q07",
    text: "Tem alguém que é diferente hoje por sua causa? O que exatamente você fez?",
    choices: [
      { prompt: "Foi", options: opt("de propósito", "só percebi depois") },
      { prompt: "De quem foi a iniciativa", options: opt("a pessoa pediu", "foi iniciativa minha") },
    ],
    extra:
      "No que as pessoas costumam te procurar? Você gosta de ser procurado pra isso? O que você ganhou com isso?",
  },
  {
    id: "Q08",
    text: "Conte a última vez que você precisou de ajuda: você pediu, e como foi receber?",
    choices: [
      {
        prompt: "Prefere fazer sozinho, mesmo sabendo que sairia melhor com ajuda?",
        options: opt("sim", "não"),
      },
    ],
  },
  {
    id: "Q09",
    text: "Que situação você organiza sua vida pra evitar? O que fez da última vez que não conseguiu?",
  },
  {
    id: "Q10",
    text: "Que crítica você já ouviu de pessoas diferentes, que nem se conhecem?",
    choices: [{ prompt: "Você concorda com ela?", options: opt("sim", "em parte", "não") }],
    extra: "Qual comportamento seu você repete e não gosta? É a mesma coisa que a crítica?",
  },
  {
    id: "Q11",
    text: "O que te faz rir de verdade? Dá um exemplo.",
    choices: [{ prompt: "Você é mais", options: opt("quem faz rir", "quem ri", "os dois") }],
    extra: "Alguma brincadeira sua já deu problema? Tem assunto com que você nunca brinca?",
  },
  {
    id: "Q12",
    text: "Conte um grupo em que você foi um deles de verdade. O que te fazia pertencer — e o que você fez quando se sentiu de fora?",
    extra: "Tinha alguém ali melhor que você em algo que te importava? O que você fez?",
  },
  {
    id: "Q13",
    text: "Conte quando alguém importante te decepcionou. O que você fez depois, e como ficou sua confiança nas pessoas?",
    choices: [
      { prompt: "Era previsível?", options: opt("sim, olhando pra trás", "não, nunca imaginei") },
    ],
  },
  {
    id: "Q14",
    text: "Conte um fracasso seu. O que você fez nos meses seguintes?",
    choices: [
      {
        prompt: "Já quis fazer algo que todos acharam besteira?",
        options: opt("fiz", "quis e não fiz", "nunca"),
      },
    ],
    extra:
      "O que foi? Já sabotou algo seu quando estava perto de dar certo? Se sim, o que ia acontecer se aquilo tivesse dado certo?",
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
