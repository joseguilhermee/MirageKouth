import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, unlinkSync, rmdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { QUESTIONS, shownSteps, setStepValue, buildSteps } from "../src/lib/questions.ts";
import { becomingQuestions } from "../src/lib/becomingQuestions.ts";
import { OCCASION_QUESTIONS } from "../src/lib/occasionQuestions.ts";
import { giftQuestions } from "../src/lib/giftQuestions.ts";

const url = process.env.MIRAGE_E2E_URL || "http://localhost:3100";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const temp = mkdtempSync(path.join(tmpdir(), "mirage-flow-review-"));
const browser = await chromium.launch({ channel: "msedge", headless: true });
const cases = [
  ["quem_quero_ser", "Para quem eu quero ser", "mirage-quem-progress-v1"],
  ["ocasiao", "Para uma ocasião especial", "mirage-ocasiao-progress-v1"],
  ["presente", "Para presente", "mirage-presente-progress-v1"],
  ["para_mim", "Para mim", "mirage-progress-v10"],
];
const gift = { relacao: "amigo", nome: "Ju", pronome: "ela", tempo: "menos de 2 anos", assinatura: "Pessoa Teste" };
const textFor = id => `História de teste ${id}: eu respirei, escutei a pessoa e escolhi agir com calma.\nFoi uma escolha importante para nós.`;

async function finishIntro(page) {
  for (const name of ["Como responder", "E a privacidade?", "Vamos começar"]) await page.getByRole("button", { name, exact: true }).click();
}
async function progress(page, index) {
  await page.waitForFunction(index => document.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow") === String(index), index, { timeout: 8000 });
}
async function type(page, label, value) {
  const input = page.getByRole("textbox", { name: label, exact: true });
  await input.waitFor();
  assert.equal(await input.evaluate(el => el.readOnly || el.disabled), false, `Blocked field: ${label}`);
  // Locator typing focuses the field itself and can hide blocked mouse/touch input.
  await input.evaluate(el => el.blur());
  if (await page.evaluate(() => navigator.maxTouchPoints > 0)) await input.tap({ timeout: 5000 });
  else await input.click({ timeout: 5000 });
  assert.equal(await input.evaluate(el => document.activeElement === el), true, `Click did not focus: ${label}`);
  await input.fill("");
  await page.keyboard.type(value);
  assert.equal(await input.inputValue(), value, `Lost keystrokes: ${label}`);
  assert.equal(await input.evaluate(el => document.activeElement === el), true, `Focus moved while typing: ${label}`);
}

async function run([mode, purpose, storageKey], width) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width <= 640, hasTouch: width <= 640, reducedMotion: "no-preference", acceptDownloads: true });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  const answers = {}, details = {};
  const questionsFor = () => mode === "quem_quero_ser" ? becomingQuestions(details[0]?.steps?.["0"] || "")
    : mode === "ocasiao" ? OCCASION_QUESTIONS : mode === "presente" ? giftQuestions(gift) : QUESTIONS;
  try {
    await page.goto(url);
    if (width > 640) await page.getByRole("switch", { name: "Tema escuro" }).click();
    await finishIntro(page);
    await type(page, "Seu nome", "Pessoa Teste");
    await page.getByRole("button", { name: "Começar", exact: true }).click();
    await page.getByRole("button", { name: purpose, exact: true }).click();
    if (mode === "presente") {
      await page.getByRole("radio", { name: "Amigo(a)", exact: true }).click();
      await page.getByRole("button", { name: "Continuar", exact: true }).click();
      await type(page, "Como você chama essa pessoa?", gift.nome);
      await page.getByRole("button", { name: "Continuar", exact: true }).click();
      await page.getByRole("radio", { name: "ela", exact: true }).click();
      await page.getByRole("button", { name: "Continuar", exact: true }).click();
      await page.getByRole("radio", { name: gift.tempo, exact: true }).click();
      await page.getByRole("button", { name: "Continuar", exact: true }).click();
      await page.getByRole("button", { name: "Continuar", exact: true }).click();
    }

    for (let index = 0; index < questionsFor().length; index++) {
      await progress(page, index);
      const question = questionsFor()[index];
      const main = question.noMain ? "" : textFor(question.id);
      let detail = mode === "ocasiao" && question.id === "O03" ? { steps: { "0": "qualquer hora" } } : { steps: {} };
      if (index === 0) {
        await page.getByRole("button", { name: "Próxima", exact: true }).dispatchEvent("click");
        await progress(page, 0);
      }
      if (!question.noMain) await type(page, question.text, main);
      if (question.id === "Y05" || question.id === "Y08" || question.id === "Y11" || question.id === "Y10") {
        const stepIndex = question.steps.findIndex(step => step.kind === "button");
        const button = question.steps[stepIndex];
        for (const option of button.options) {
          await page.getByRole("radiogroup", { name: button.prompt, exact: true }).getByRole("radio", { name: option.label, exact: true }).click();
          detail = setStepValue(detail, String(stepIndex), option.label);
          if (option.next?.kind === "text") {
            const input = page.getByRole("textbox", { name: option.next.prompt, exact: true });
            assert.equal(await input.inputValue(), "", "Changing branches must clear the old branch");
            await type(page, option.next.prompt, textFor(`${question.id}-${option.label}`));
            detail = setStepValue(detail, `${stepIndex}>${option.label}`, textFor(`${question.id}-${option.label}`));
          }
        }
      }
      for (let guard = 0; guard < 20; guard++) {
        const state = shownSteps(question, main, detail);
        if (state.complete) break;
        const pending = state.shown.find(item => !item.answered);
        assert.ok(pending, `No visible next step in ${question.id}`);
        if (pending.step.kind === "text") {
          await type(page, pending.step.prompt, textFor(`${question.id}-${pending.key}`));
          detail = setStepValue(detail, pending.key, textFor(`${question.id}-${pending.key}`));
        } else {
          const options = pending.step.options.filter(option => !option.disabled);
          const option = options[(index + (width > 640 ? 1 : 0)) % options.length];
          await page.getByRole("radiogroup", { name: pending.step.prompt, exact: true }).getByRole("radio", { name: option.label, exact: true }).click();
          detail = setStepValue(detail, pending.key, option.label);
        }
      }
      assert.equal(shownSteps(question, main, detail).complete, true);
      answers[index] = main;
      details[index] = detail;
      if (index === 1) {
        await page.getByRole("button", { name: "Voltar", exact: true }).click();
        await progress(page, 0);
        const oldFields = await page.locator("main textarea").evaluateAll(fields => fields.map(el => ({ value: el.value, readOnly: el.readOnly })));
        assert.ok(oldFields.every(field => !field.readOnly));
        assert.ok(oldFields.every(field => field.value.length > 0));
        await page.getByRole("button", { name: "Próxima", exact: true }).click();
        await progress(page, 1);
        if (!question.noMain) assert.equal(await page.getByRole("textbox", { name: question.text, exact: true }).inputValue(), main);
      }
      if (index === 2) {
        await page.reload();
        await finishIntro(page);
        await page.getByRole("button", { name: "Voltar para onde estava", exact: true }).click();
        await progress(page, index);
        const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
        assert.equal(saved.answers[1] ?? "", answers[1], "Reload must keep the previous answer");
        assert.ok((await page.locator("main textarea").evaluateAll(fields => fields.map(el => el.readOnly))).every(value => !value));
      }
      await page.getByRole("button", { name: index === questionsFor().length - 1 ? "Concluir" : "Próxima", exact: true }).click();
      await progress(page, index + 1);
      if ((index + 1) % 5 === 0) console.log(`${mode} ${width}px: ${index + 1} questions typed with animations`);
    }
    const questions = questionsFor();
    await page.getByRole("button", { name: "Selar minhas respostas", exact: true }).click();
    await page.getByRole("button", { name: "Baixar arquivo", exact: true }).waitFor();
    assert.equal(await page.getByRole("dialog", { name: "Seu arquivo selado", exact: true }).count(), 0, "Sealing must keep the delivery actions visible");
    assert.equal(await page.getByRole("button", { name: "Gerar novamente", exact: true }).count(), 0);
    await page.getByRole("button", { name: "Ver arquivo protegido", exact: true }).click();
    await page.getByRole("dialog", { name: "Seu arquivo selado", exact: true }).waitFor();
    await page.getByRole("button", { name: "Fechar prancheta", exact: true }).click();
    const downloadEvent = page.waitForEvent("download");
    await page.getByRole("button", { name: "Baixar arquivo", exact: true }).click();
    const filename = path.join(temp, `${mode}-${width}.txt`);
    const decoded = path.join(temp, `${mode}-${width}.json`);
    await (await downloadEvent).saveAs(filename);
    const decodedOutput = execFileSync("py", ["-3", path.join(root, "decryptor/decrypt.py"), filename, "--out", decoded], { encoding: "utf8", stdio: "pipe" });
    const result = JSON.parse(readFileSync(decoded, "utf8"));
    assert.equal(result.finalidade, mode);
    assert.equal(result.answers.length, mode === "ocasiao" ? questions.length - 1 : questions.length);
    for (const answer of result.answers) {
      const index = questions.findIndex(question => question.id === answer.id);
      assert.equal(answer.text, answers[index]);
      assert.deepEqual(answer.passos ?? [], buildSteps(questions[index], answers[index], details[index]));
    }
    if (mode === "quem_quero_ser") assert.ok(decodedOutput.includes(`daqui a ${details[0].steps["0"]}?`), "The decrypted question must include the selected horizon");
    assert.deepEqual(errors, []);
    console.log(`${mode} ${width}px COMPLETE: all ${questions.length} questions editable, back/reload, branches, encryption/decryption OK`);
  } catch (error) {
    await page.screenshot({ path: `../.impeccable/flow-failed-${mode}-${width}.png`, fullPage: true }).catch(() => {});
    throw new Error(`${mode} ${width}px: ${error.message}`, { cause: error });
  } finally { await context.close(); }
}

async function reviewGift(width) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width <= 640, hasTouch: width <= 640 });
  try {
    const page = await context.newPage();
    await page.goto(`${url}/presente/revisar`);
    await type(page, "Perfume escolhido", "Perfume de teste");
    await type(page, "Texto para quem vai receber", "Texto fictício do presente, escrito e revisado pelo teclado.");
    await type(page, "Texto para quem vai receber", "Texto fictício revisado uma segunda vez.");
    assert.equal(await page.getByRole("button", { name: "Imprimir texto", exact: true }).isEnabled(), true);
    console.log(`/presente/revisar ${width}px: both fields accept click/touch, typing and editing`);
  } finally { await context.close(); }
}

try {
  const widths = process.env.MIRAGE_E2E_WIDTH ? [Number(process.env.MIRAGE_E2E_WIDTH)] : [390, 1440];
  const selected = process.env.MIRAGE_E2E_MODES ? cases.filter(([mode]) => process.env.MIRAGE_E2E_MODES.split(",").includes(mode)) : cases;
  assert.ok(selected.length > 0);
  for (const width of widths) {
    const results = await Promise.allSettled(selected.map(mode => run(mode, width)));
    const failures = results.filter(result => result.status === "rejected");
    if (failures.length) throw new AggregateError(failures.map(result => result.reason), "Full flow regression failed");
    await reviewGift(width);
  }
} finally {
  await browser.close();
  for (const file of readdirSync(temp)) unlinkSync(path.join(temp, file));
  rmdirSync(temp);
}
