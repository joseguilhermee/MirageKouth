import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import { buildSteps, setStepValue, shownSteps } from "../src/lib/questions.ts";

const source = readFileSync(new URL("../src/lib/giftQuestions.ts", import.meta.url), "utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { giftQuestions } = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);

for (const relacao of ["amigo", "familia", "amor"]) {
  const info = { relacao, nome: "Ju", pronome: "neutro", ...(relacao === "familia" ? { papel: "madrinha" } : {}), tempo: "a vida toda", assinatura: "De quem te ama" };
  const questions = giftQuestions(info);
  assert.equal(questions.length, relacao === "amigo" ? 12 : 13);
  assert.deepEqual(questions.map(q => q.id), relacao === "amigo" ? ["P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08", "P09", "P11", "P12", "P13"] : Array.from({ length: 13 }, (_, i) => `P${String(i + 1).padStart(2, "0")}`));
  if (relacao === "familia") assert.match(questions.find(q => q.id === "P09").text, /madrinha/);
  for (const question of questions) {
    const main = question.noMain ? "" : "Resposta principal com mais de dez caracteres";
    const seen = new Set();
    const expected = new Set();
    function collect(step, key) {
      assert(!step.prompt.includes("{nome}") && !step.prompt.includes("{papel}"));
      if (step.kind === "button") for (const option of step.options) {
        expected.add(`${key}>${option.label}`);
        if (option.next) collect(option.next, `${key}>${option.label}`);
      } else if (step.next) collect(step.next, `${key}>texto`);
    }
    question.steps.forEach((step, i) => collect(step, String(i)));
    assert(!question.text.includes("{nome}") && !question.text.includes("{papel}"));
    function walk(detail) {
      const current = shownSteps(question, main, detail);
      if (current.complete) {
        const exported = buildSteps(question, main, detail);
        assert.deepEqual(exported.map(s => s.pergunta), current.shown.map(s => s.step.prompt));
        assert(exported.every(s => s.resposta));
        return;
      }
      const open = current.shown.find(s => !s.answered);
      assert(open, `Sem passo aberto: ${question.id}`);
      if (open.step.kind === "text") walk(setStepValue(detail, open.key, "Resposta curta"));
      else for (const option of open.step.options) {
        seen.add(`${open.key}>${option.label}`);
        walk(setStepValue(detail, open.key, option.label));
      }
    }
    assert.equal(shownSteps(question, question.noMain ? "" : "curto", {}).complete, false);
    walk({});
    assert.deepEqual(seen, expected, `${relacao} ${question.id}: ramo sem cobertura`);
  }
  const loss = questions.find(q => q.id === "P07");
  let detail = setStepValue({}, "0", "sim");
  detail = setStepValue(detail, "0>sim", "Seguiu em frente");
  detail = setStepValue(detail, "0>sim>texto", "voltou a confiar");
  detail = setStepValue(detail, "0", "não que eu saiba");
  assert.deepEqual(buildSteps(loss, "", detail).map(s => s.resposta), ["não que eu saiba"]);
  assert.equal(detail.steps["0>sim>texto"], undefined);
  console.log(`${relacao}: ${questions.length} perguntas, todos os ramos completos`);
}
