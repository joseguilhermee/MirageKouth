import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { becomingQuestions } from "../src/lib/becomingQuestions.ts";
import { shownSteps, setStepValue } from "../src/lib/questions.ts";

const url = process.env.MIRAGE_E2E_URL || "http://localhost:3100";
const dir = "../.impeccable/review/luxury";
mkdirSync(dir, { recursive: true });
const answers = {}, details = {};
const questions = becomingQuestions("6 meses");
for (const [index, question] of questions.entries()) {
  const main = question.noMain ? "" : "Relato fictício: eu escuto, reflito e escolho estar presente para quem amo.";
  let detail = {};
  for (let guard = 0; guard < 20; guard++) {
    const state = shownSteps(question, main, detail);
    if (state.complete) break;
    const pending = state.shown.find(step => !step.answered);
    assert.ok(pending);
    detail = setStepValue(detail, pending.key, pending.step.kind === "button" ? pending.step.options[0].label : "Relato fictício de um momento importante.");
  }
  answers[index] = main;
  details[index] = detail;
}
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce", permissions: ["clipboard-read", "clipboard-write"], acceptDownloads: true });
    await context.addInitScript(({ answers, details }) => {
      localStorage.setItem("mirage-progress-v10", JSON.stringify({ name: "Pessoa Teste", purpose: "quem_quero_ser", step: -1, answers: {}, details: {} }));
      localStorage.setItem("mirage-quem-progress-v1", JSON.stringify({ step: 14, answers, details }));
    }, { answers, details });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    const capture = async name => {
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: `${dir}/${name}-${width}.png`, fullPage: true });
    };
    await page.goto(url);
    for (const name of ["Como responder", "E a privacidade?", "Vamos começar"]) await page.getByRole("button", { name, exact: true }).click();
    await page.getByRole("button", { name: "Voltar para onde estava", exact: true }).click();
    await page.getByRole("button", { name: "Selar minhas respostas", exact: true }).waitFor();
    assert.equal(await page.getByRole("progressbar").evaluate(el => getComputedStyle(el.closest("footer")).position), "static", "Completion progress must not cover the delivery instructions");
    await capture("delivery-ready");
    const trigger = page.getByRole("button", { name: /Prancheta:/ });
    await trigger.click();
    const drawer = page.getByRole("dialog", { name: "Prancheta", exact: true });
    await drawer.waitFor();
    assert.ok(await drawer.evaluate(el => el.matches(":modal")), "Responses must use a native modal");
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      assert.ok(await drawer.evaluate(el => el.contains(document.activeElement) || document.activeElement === document.body), "Focus reached the background");
    }
    await capture("delivery-review");
    await page.keyboard.press("Escape");
    await drawer.waitFor({ state: "hidden" });
    assert.ok(await trigger.evaluate(el => document.activeElement === el), "Closing must restore focus");

    await page.evaluate(() => {
      const original = SubtleCrypto.prototype.encrypt;
      SubtleCrypto.prototype.encrypt = function (...args) {
        SubtleCrypto.prototype.encrypt = original;
        void args;
        return Promise.reject(new Error("Synthetic encryption failure"));
      };
    });
    await page.getByRole("button", { name: "Selar minhas respostas", exact: true }).click();
    await page.getByRole("button", { name: "Tentar novamente", exact: true }).waitFor();
    assert.ok(await page.evaluate(() => localStorage.getItem("mirage-quem-progress-v1")), "Failure must preserve the draft");
    await capture("delivery-error");
    await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
    const download = page.getByRole("button", { name: "Baixar arquivo", exact: true });
    await download.waitFor();
    await page.waitForTimeout(750);
    assert.equal(await page.getByRole("dialog").count(), 0, "Delivery must not open a modal automatically");
    assert.equal(await page.getByRole("button", { name: "Gerar novamente", exact: true }).count(), 0);
    await page.getByRole("heading", { name: "A conversa de Pessoa Teste", exact: true }).waitFor();
    await capture("delivery-done");
    await page.getByRole("button", { name: "Copiar texto", exact: true }).click();
    await page.getByRole("button", { name: "Copiado!", exact: true }).waitFor();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    assert.ok(copied.length > 1000);
    const downloadEvent = page.waitForEvent("download");
    await download.click();
    assert.equal((await downloadEvent).suggestedFilename(), "mirage-respostas.txt");
    await page.getByRole("button", { name: "Ver arquivo protegido", exact: true }).click();
    const sealed = page.getByRole("dialog", { name: "Seu arquivo selado", exact: true });
    await sealed.waitFor();
    assert.equal(await sealed.locator("pre").innerText(), copied);
    await page.getByRole("button", { name: "Fechar prancheta", exact: true }).click();
    await sealed.waitFor({ state: "hidden" });
    await page.getByRole("button", { name: "Revisar minhas respostas", exact: true }).click();
    await page.getByRole("button", { name: "Concluir", exact: true }).waitFor();
    assert.ok((await page.locator("main textarea").inputValue()).includes("Relato fictício"));
    await page.locator("main textarea").fill("Relato fictício revisado depois de selar o primeiro arquivo.");
    await page.getByRole("button", { name: "Concluir", exact: true }).click();
    await page.getByRole("button", { name: "Selar minhas respostas", exact: true }).waitFor();
    await trigger.click();
    await drawer.waitFor();
    assert.equal(await page.getByRole("dialog", { name: "Seu arquivo selado", exact: true }).count(), 0, "Editing must invalidate the previous encrypted file");
    assert.equal(await drawer.locator("pre").count(), 0);
    await page.getByRole("button", { name: "Fechar prancheta", exact: true }).click();
    assert.deepEqual(errors, []);
    console.log(`${width}px: modal focus, error/retry, personal completion, actual copy/download, optional file and editing OK`);
    await context.close();
  }
} finally { await browser.close(); }
