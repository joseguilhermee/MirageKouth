import type { Question, Step } from "./questions";

export type GiftRelation = "amigo" | "familia" | "amor";
export type GiftPronoun = "ele" | "ela" | "neutro";
export type GiftInfo = {
  relacao: GiftRelation;
  nome: string;
  pronome: GiftPronoun;
  papel?: string;
  tempo: string;
  assinatura: string;
};

export const GIFT_VERSION = "PRESENTE-1";
export const FAMILY_ROLES = ["pai", "mãe", "irmão", "irmã", "filho", "filha", "avô", "avó", "tio", "tia", "primo", "prima", "outro"];
export const GIFT_TIMES = ["menos de 2 anos", "de 2 a 10 anos", "mais de 10 anos", "a vida toda"];

const t = (prompt: string, next?: Step, placeholder?: string): Step => ({ kind: "text", prompt, next, placeholder });
const b = (prompt: string, options: (string | [string, Step])[]): Step => ({
  kind: "button", prompt, options: options.map((option) => typeof option === "string" ? { label: option } : { label: option[0], next: option[1] }),
});

export function giftQuestions(info: GiftInfo): Question[] {
  const n = info.nome.trim();
  const papel = info.papel?.trim() || "família";
  const q = (id: string, text: string, steps: Step[] = [], placeholder?: string): Question => ({ id, text, steps, placeholder });
  const s = (id: string, steps: Step[]): Question => ({ id, text: "", noMain: true, steps });
  const p01 = info.relacao === "amigo"
    ? `Como começou a amizade de vocês — e quando você percebeu que ${n} era importante pra você?`
    : info.relacao === "familia"
      ? `Qual é a lembrança mais forte que você tem de ${n}?`
      : `Qual foi o momento em que você soube que era ${n}?`;
  const common: Question[] = [
    q("P01", p01),
    q("P02", `Conte um momento em que você viu ${n} completamente no elemento — o que estava fazendo, e com quem?`),
    q("P03", `Do que você mais se orgulha em ${n}?`, [b("Isso é…", [
      [`algo que ${n} fez`, t(`O que isso custou a ${n}?`)],
      [`um jeito de ${n} ser`, t("Quando você viu isso acontecer de verdade?")],
    ])]),
    q("P04", `Conte uma vez em que você — ou alguém — precisou de ${n}. O que ${n} fez?`, [t("O que isso mudou em você — ou nessa pessoa?")]),
    s("P05", [b(`${n} é mais…`, ["quem faz rir", "quem ri", "os dois", "nenhum dos dois"]), t(`O que faz ${n} rir de verdade?`)]),
    s("P06", [b(`Quando ${n} precisa de ajuda…`, [
      "pede numa boa",
      ["só aceita se alguém insistir", t(`E como você percebe quando ${n} precisa?`)],
      ["prefere se virar sem ninguém", t(`E como você percebe quando ${n} precisa?`)],
      ["quase nunca deixa perceber", t(`E como você percebe quando ${n} precisa?`)],
      "não sei",
      ["outra resposta", t("Explique com suas palavras.")],
    ])]),
    s("P07", [b(`Você já viu ${n} perder algo importante, ou se decepcionar com alguém?`, [
      ["sim", t(`O que ${n} fez depois?`, b(`E depois disso, ${n}…`, ["voltou a confiar", "ficou com o pé atrás", "cortou de vez", "seguiu como se nada fosse", "não sei", ["outra resposta", t("Explique com suas palavras.")]]))],
      "não que eu saiba",
      ["outra resposta", t("Explique com suas palavras.")],
    ])]),
    s("P08", [b(`${n} já comprou briga por algo que achava errado?`, [
      ["sim", t("O que era — e contra quem?", b(`O que mais incomodava ${n} ali?`, ["o resultado", "o jeito como era feito", "quem estava decidindo", "não sei", ["outra resposta", t("Explique com suas palavras.")]]))],
      "não que eu saiba",
      ["outra resposta", t("Explique com suas palavras.")],
    ])]),
  ];
  if (info.relacao === "amigo") common.push(q("P09", `Num grupo, o que ${n} faz que ninguém mais faz?`));
  if (info.relacao === "familia") {
    common.push(q("P09", `Quem ${n} é fora do papel de ${papel} — no trabalho, com os amigos, quando está só?`));
    common.push(q("P10", "O que vocês têm em comum?", [t(`E o que é só de ${n}, que ninguém mais da família tem?`)]));
  }
  if (info.relacao === "amor") {
    common.push(q("P09", `Quem ${n} é fora da relação — no trabalho, com os amigos, quando está só? O que você admira ali?`));
    common.push(q("P10", `Como ${n} demonstra amor — não só por você, por todo mundo que ama?`));
  }
  common.push(q("P11", `Como alguém que acabou de conhecer ${n} descreveria ${n}?`, [
    t(`Que palavra definitivamente não combina com ${n}?`),
    t(`E o que você sabe de ${n} que quase ninguém sabe?`, undefined, "não precisa ser segredo — um jeito, um cuidado, um medo, uma mania…"),
  ]));
  common.push(q("P12", info.relacao === "amor" ? `O que em ${n} às vezes te tira do sério?` : `Qual é o defeito de ${n} que você conhece de perto?`, [
    b("Se pudesse, você mudaria isso?", [["não", t("Por quê?")], ["em parte", t("Por quê?")], "sim"]),
  ]));
  common.push(q("P13", info.relacao === "amor" ? `O que você não diz o suficiente pra ${n}?` : `Se esse perfume pudesse dizer uma coisa a ${n} por você, o que seria?`));
  return common;
}
