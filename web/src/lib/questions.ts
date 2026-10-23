/** Passo em texto livre: uma pergunta curta só. */
export type TextStep = { kind: "text"; prompt: string; placeholder?: string; next?: Step };

/** Uma opção de botão. `next` é o passo que ela abre (o ramo da árvore). */
export type ButtonOption = { label: string; next?: Step; disabled?: boolean };

/** Passo em botões: escolha única, nada vem marcado. */
export type ButtonStep = { kind: "button"; prompt: string; options: ButtonOption[] };

export type Step = TextStep | ButtonStep;

export type Question = {
  /** Código do roteiro de origem (Q01…Q15); não segue a ordem de exibição. */
  id: string;
  /** Pergunta principal — o que precisa ser respondido, em texto livre. */
  text: string;
  /** Perguntas que começam diretamente pelo primeiro passo. */
  noMain?: boolean;
  /** Algumas perguntas aceitam uma palavra ou uma resposta curta explícita. */
  minMainChars?: number;
  acceptedShortAnswers?: string[];
  /** Texto de apoio do campo principal; só onde o roteiro pede. */
  placeholder?: string;
  /** Passos que aparecem um por vez depois da principal. */
  steps: Step[];
};

/**
 * Respostas dos passos de uma pergunta, pela chave do passo: o índice do passo
 * de topo ("1"), seguido de ">opção" para cada ramo ("1>sim"). Botão guarda o
 * rótulo marcado; texto guarda o que foi escrito.
 */
export type QuestionDetail = { steps?: Record<string, string> };

/** Principal: "nunca aconteceu" já conta, mas em branco não. */
export const MIN_MAIN_CHARS = 10;
/** Passo em texto responde coisas curtas ("minha mãe"); só não pode ficar vazio. */
export const MIN_STEP_CHARS = 2;

export function isMainAnswered(question: Question, value: string): boolean {
  if (question.noMain) return true;
  const answer = value.trim();
  return answer.length >= (question.minMainChars ?? MIN_MAIN_CHARS)
    || Boolean(answer && question.acceptedShortAnswers?.includes(answer.toLocaleLowerCase("pt-BR")));
}

// ---------- Atalhos ----------

const text = (prompt: string): TextStep => ({ kind: "text", prompt });

/** Opções sem ramo como string; com ramo como [rótulo, passo]. */
const button = (prompt: string, ...options: (string | [string, Step])[]): ButtonStep => ({
  kind: "button",
  prompt,
  options: options.map((o) => (typeof o === "string" ? { label: o } : { label: o[0], next: o[1] })),
});

/**
 * Entrevista de identidade narrativa (McAdams) lida contra os 12 arquétipos de
 * Pearson. Não há pontuação: as respostas são lidas de forma interpretativa
 * por uma IA, então a pessoa conta a cena com as próprias palavras.
 *
 * 15 itens. Cada um é uma conversa curta: a principal em texto livre e depois
 * passos, um por vez, alguns decididos pelo botão anterior. Nenhum botão
 * classifica o assunto da resposta (quem, onde, que tipo): isso é trabalho do
 * interpretador. A ordem é a do roteiro de origem (Q01–Q04, Q15, Q05–Q14).
 */
/** Versão do conjunto, enviada no arquivo para o decryptor saber como ler. */
export const QUESTIONS_VERSION = "15D";

export const QUESTIONS: Question[] = [
  {
    id: "Q01",
    text: "Conte um momento em que você se sentiu completamente vivo: o que estava fazendo, e com quem?",
    steps: [
      button("Isso acontece hoje?", "com frequência", "às vezes", ["quase nunca", text("O que mudou?")]),
      button(
        "A última coisa que você fez sem finalidade nenhuma foi…",
        ["esta semana", text("O que foi?")],
        ["este mês", text("O que foi?")],
        "faz tempo",
        "não lembro"
      ),
    ],
  },
  {
    id: "Q02",
    text: "Em que você já gastou tempo demais sem ninguém pedir, e o que sobrou disso?",
    steps: [
      button(
        "Você continuou mesmo depois de já ter o que precisava?",
        ["sim", text("O que você foi buscar nesse tempo a mais?")],
        ["não", text("O que te fez parar?")]
      ),
    ],
  },
  {
    id: "Q03",
    text: "Qual elogio recente te deu prazer de verdade?",
    placeholder: "quem disse, e sobre o quê",
    steps: [text("E qual te deixa indiferente?")],
  },
  {
    id: "Q04",
    text: "Conte uma decisão que te custou algo de verdade: do que você abriu mão, e para ficar com o quê?",
    steps: [
      button("Quem sabia dessa decisão?", "quase ninguém", "só os mais próximos", "todo mundo"),
      button(
        "Você já fez escolhas parecidas antes?",
        ["sim", text("Qual foi outra, e do que você abriu mão nela?")],
        ["não", text("O que você perdeu de fato?")]
      ),
    ],
  },
  {
    id: "Q15",
    text: "Do que você mais se orgulha de ter feito acontecer?",
    placeholder: "uma coisa que construiu, um projeto, uma pessoa, um grupo, um lugar aonde chegou…",
    steps: [text("Qual foi a parte mais difícil, e o que você fez ali?")],
  },
  {
    id: "Q05",
    text: "Conte uma vez em que você viu algo errado e não tinha poder nenhum pra mudar. O que você fez — ou o que te segurou?",
    steps: [
      button("O que mais te incomodava?", "o resultado", "o método", "quem decidia", [
        "outra coisa",
        text("O quê?"),
      ]),
      button(
        "Mudou alguma coisa depois?",
        ["sim", text("O que mudou, e qual foi a sua parte nisso?")],
        ["não", button("E você?", "continuei ali", "saí de lá")]
      ),
      button("Você costuma agir assim?", "sim", "não"),
    ],
  },
  {
    id: "Q06",
    text: "Conte uma vez em que o resultado dependeu de você. O que você fez, do começo ao fim?",
    placeholder: "gente contando com você, prazo apertado, alguém cobrando…",
    steps: [
      button(
        "Você foi atrás dessa posição ou caiu nela?",
        "fui atrás",
        "caí nela e assumi",
        "caí nela e não gostei"
      ),
      button(
        "Alguém deixou de fazer a parte dele?",
        ["sim", text("O que você fez?")],
        ["não", text("O que ficou funcionando depois que você saiu?")]
      ),
    ],
  },
  {
    id: "Q07",
    text: "Tem alguém que é diferente hoje por sua causa? O que exatamente você fez?",
    steps: [
      button("Quem tomou a iniciativa?", "a pessoa pediu", "fui eu"),
      button(
        "Foi de propósito?",
        ["foi de propósito", text("O que você queria que mudasse nela?")],
        ["só percebi depois", text("O que você ganhou com isso?")]
      ),
    ],
  },
  {
    id: "Q08",
    text: "Conte a última vez que você precisou de ajuda.",
    steps: [
      button(
        "Você pediu?",
        ["pedi", text("Como foi receber?")],
        ["alguém percebeu sem eu pedir", text("Como foi receber sem ter pedido?")],
        ["não pedi", text("Por que não pediu, e como você resolveu?")]
      ),
      button("Você prefere fazer sozinho, mesmo sabendo que sairia melhor com ajuda?", "sim", "não"),
    ],
  },
  {
    id: "Q09",
    text: "Que situação você organiza sua vida pra evitar?",
    steps: [
      button(
        "Já aconteceu de não conseguir evitar?",
        ["sim", text("O que você fez nessa vez?")],
        ["não", text("Como exatamente você faz pra evitar?")]
      ),
    ],
  },
  {
    id: "Q10",
    text: "Que crítica você já ouviu de pessoas diferentes, que nem se conhecem?",
    steps: [
      button(
        "Você concorda com ela?",
        ["sim", text("Conte a última vez que isso apareceu. O que você fez depois?")],
        ["em parte", text("Conte a última vez que isso apareceu. O que você fez depois?")],
        ["não", text("Então qual comportamento seu você repete e não gosta?")]
      ),
    ],
  },
  {
    id: "Q11",
    text: "O que te faz rir de verdade? Dá um exemplo.",
    steps: [
      button("Você é mais…", "quem faz rir", "quem ri", "os dois"),
      button(
        "Alguma brincadeira sua já deu problema?",
        ["sim", text("O que aconteceu? Faria de novo?")],
        ["não", text("Tem algum assunto com que você nunca brinca?")]
      ),
    ],
  },
  {
    id: "Q12",
    text: "Conte um grupo em que você foi um deles de verdade. O que te fazia pertencer?",
    steps: [
      button(
        "Você chegou a se sentir de fora ali?",
        ["sim", text("O que você fez?")],
        ["não", text("Tinha alguém ali melhor que você em algo que te importava? O que você fez com isso?")]
      ),
    ],
  },
  {
    id: "Q13",
    text: "Conte quando alguém importante te decepcionou. O que você fez depois?",
    steps: [
      text("E como ficou sua confiança — nessa pessoa e nas pessoas em geral?"),
      button("Era previsível?", "sim, olhando pra trás", "não, nunca imaginei"),
    ],
  },
  {
    id: "Q14",
    text: "Conte um fracasso seu. O que você fez nos meses seguintes?",
    steps: [
      button(
        "Já quis fazer algo que as pessoas em volta acharam besteira?",
        ["fiz", text("O que era, e o que aconteceu?")],
        ["quis e não fiz", text("O que era, e o que te segurou?")],
        "nunca"
      ),
    ],
  },
];

/** Um passo na tela, com a chave em que sua resposta fica guardada. */
export type ShownStep = { key: string; step: Step; value: string; answered: boolean };

function isAnswered(step: Step, value: string): boolean {
  return step.kind === "button"
    ? step.options.some((o) => o.label === value && !o.disabled)
    : value.trim().length >= MIN_STEP_CHARS;
}

/**
 * Passos que aparecem agora, na ordem: segue a árvore pelos botões marcados e
 * para no primeiro passo ainda sem resposta. Um passo que já tem resposta
 * guardada continua na tela mesmo se um anterior for apagado, para não sumir
 * o que a pessoa escreveu. `complete` diz se a pergunta inteira pode avançar.
 */
export function shownSteps(
  question: Question,
  main: string,
  detail: QuestionDetail | undefined
): { shown: ShownStep[]; complete: boolean } {
  const values = detail?.steps ?? {};
  const shown: ShownStep[] = [];
  let gated = !isMainAnswered(question, main);
  let complete = !gated;

  for (let i = 0; i < question.steps.length; i++) {
    let key = String(i);
    let step: Step | undefined = question.steps[i];
    while (step) {
      const value = values[key] ?? "";
      if (gated && !value) return { shown, complete: false };
      const answered = isAnswered(step, value);
      shown.push({ key, step, value, answered });
      if (!answered) {
        gated = true;
        complete = false;
      }
      if (step.kind === "text") {
        step = answered ? step.next : undefined;
        key = `${key}>texto`;
        continue;
      }
      step = step.options.find((o) => o.label === value)?.next;
      key = `${key}>${value}`;
    }
  }
  return { shown, complete };
}

/**
 * Passos para o arquivo, na ordem em que apareceram e com a pergunta exatamente
 * como foi mostrada. Respostas de ramos que a pessoa desfez não entram.
 */
export function buildSteps(question: Question, main: string, detail: QuestionDetail | undefined) {
  return shownSteps(question, main, detail).shown.map(({ step, value }) => ({
    tipo: step.kind === "button" ? "botao" : "texto",
    pergunta: step.prompt,
    resposta: value.trim(),
  }));
}

/** Grava a resposta de um passo. Trocar o botão apaga tudo o que o ramo antigo abriu. */
export function setStepValue(detail: QuestionDetail, key: string, value: string): QuestionDetail {
  const steps = { ...detail.steps };
  if (steps[key] !== value) {
    const prefix = `${key}>`;
    for (const k of Object.keys(steps)) if (k.startsWith(prefix)) delete steps[k];
  }
  steps[key] = value;
  return { ...detail, steps };
}
