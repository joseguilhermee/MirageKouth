import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { chromium } from "playwright";

const url = process.env.MIRAGE_E2E_URL || "http://localhost:3100";
const motion = process.env.MIRAGE_E2E_MOTION || "reduce";
const dir = `../.impeccable/review/ux-pass/${motion}`;
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
const measurements = [];
const mainQuestion = "Conte um momento em que você se sentiu completamente vivo: o que estava fazendo, e com quem?";
async function enter(page) {
  await page.goto(url);
  for (const name of ["Como responder", "E a privacidade?", "Vamos começar"]) await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: "Voltar para onde estava", exact: true }).click();
}
async function centered(page, input, name, width) {
  await input.waitFor();
  await page.waitForFunction(() => {
    const control = document.activeElement;
    if (!(control instanceof HTMLTextAreaElement || control instanceof HTMLButtonElement)) return false;
    const block = control instanceof HTMLTextAreaElement ? control.closest("label")?.parentElement : control.closest('[role="radiogroup"]');
    if (!block) return false;
    const rect = block.getBoundingClientRect();
    const footer = document.querySelector(".kouth-progress");
    const middle = (innerHeight - (footer?.getBoundingClientRect().height ?? 0)) / 2;
    return Math.abs(rect.top + rect.height / 2 - middle) < 24;
  }, null, { timeout: 4000 });
  assert.ok(await input.evaluate(el => document.activeElement === el), `Focus: ${name}`);
  await page.waitForTimeout(400);
  const result = await input.evaluate(el => {
    const block = el instanceof HTMLTextAreaElement ? el.closest("label").parentElement : el.closest('[role="radiogroup"]');
    const rect = block.getBoundingClientRect();
    const footerHeight = document.querySelector(".kouth-progress")?.getBoundingClientRect().height ?? 0;
    return { y: rect.top, height: rect.height, viewport: innerHeight, centerDelta: rect.top + rect.height / 2 - (innerHeight - footerHeight) / 2, scrollY };
  });
  measurements.push({ width, name, ...result });
  await page.screenshot({ path: `${dir}/${name}-${width}.png` });
}
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: width < 640 ? 844 : 900 }, reducedMotion: motion, hasTouch: width < 640, isMobile: width < 640 });
    await context.addInitScript(() => {
      localStorage.setItem("mirage-progress-v10", JSON.stringify({ name: "Pessoa Teste", purpose: null, step: -2, answers: {}, details: {} }));
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await enter(page);
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark");
    assert.equal(await page.getByRole("button", { name: "Continuar", exact: true }).count(), 0);
    await page.screenshot({ path: `${dir}/purpose-${width}.png` });
    await page.getByRole("button", { name: "Para mim", exact: true }).press("Enter");
    const main = page.getByRole("textbox", { name: mainQuestion, exact: true });
    await main.waitFor();
    const choose = () => page.getByRole("button", { name: "Escolher outra opção", exact: true });
    assert.equal(await choose().count(), 1);
    assert.equal(await page.getByRole("button", { name: "Voltar", exact: true }).count(), 0);
    const long = "Relato fictício: estava perto de quem amo e escolhi estar presente. ".repeat(11);
    await main.pressSequentially(long);
    assert.equal(await main.inputValue(), long);
    assert.ok(await main.evaluate(el => document.activeElement === el), "Revealing steps while typing must not steal focus");
    await page.getByRole("button", { name: "Próxima", exact: true }).click();
    const firstRadio = page.getByRole("radio", { name: "com frequência", exact: true });
    await centered(page, firstRadio, "missing-step", width);
    await page.getByRole("radio", { name: "quase nunca", exact: true }).click();
    const branch = page.getByRole("textbox", { name: "O que mudou?", exact: true });
    await centered(page, branch, "long-branch", width);
    await branch.pressSequentially("Minha resposta continua com o foco aqui.");
    assert.ok(await branch.evaluate(el => document.activeElement === el));
    await choose().click();
    await page.getByRole("button", { name: "Para quem eu quero ser", exact: true }).click();
    await page.getByRole("radio", { name: "1 ano", exact: true }).click();
    const day = page.locator("main textarea");
    await centered(page, day, "horizon-branch", width);
    if (width < 640) {
      await page.setViewportSize({ width, height: 600 });
      await centered(page, day, "horizon-resized", width);
    }
    await day.pressSequentially("Passo o dia com calma e junto das pessoas que amo.");
    await page.getByRole("button", { name: "Próxima", exact: true }).click();
    await page.getByRole("heading", { name: "E num dia em que tudo dá errado, como essa versão sua reage?", exact: true }).waitFor();
    assert.equal(await choose().count(), 0, "The route switch belongs only to question one");
    await page.getByRole("button", { name: "Voltar", exact: true }).click();
    assert.match(await day.inputValue(), /Passo o dia/);
    await choose().click();
    await page.getByRole("button", { name: "Para mim", exact: true }).click();
    assert.equal(await main.inputValue(), long, "Switching purposes must keep the previous draft");
    assert.match(await branch.inputValue(), /Minha resposta/);
    await choose().click();
    await page.getByRole("button", { name: "Para uma ocasião especial", exact: true }).click();
    await page.locator("main textarea").waitFor();
    await choose().click();
    await page.getByRole("button", { name: "Para presente", exact: true }).click();
    await page.getByRole("radiogroup", { name: "O presente é para…", exact: true }).waitFor();
    await choose().click();
    await page.getByRole("heading", { name: "Para quem é esse perfume?", exact: true }).waitFor();
    assert.deepEqual(errors, []);
    await context.close();

    for (const [index, radioName, fieldName] of [[4, "em parte", "Pra quem mais essa mudança importa?"], [7, "uma vez", "O que te fez voltar ao jeito antigo?"], [10, "ainda não", "Qual foi a vez em que você chegou mais perto?"]]) {
      const branchContext = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: motion });
      await branchContext.addInitScript(index => {
        localStorage.setItem("mirage-progress-v10", JSON.stringify({ name: "Pessoa Teste", purpose: "quem_quero_ser", step: -1, answers: {}, details: {} }));
        localStorage.setItem("mirage-quem-progress-v1", JSON.stringify({ step: index, answers: {}, details: {} }));
      }, index);
      const branchPage = await branchContext.newPage();
      await enter(branchPage);
      const first = branchPage.getByRole("radio").first();
      await first.focus();
      await first.press("ArrowRight");
      const selected = branchPage.getByRole("radio", { name: radioName, exact: true });
      assert.equal(await selected.getAttribute("aria-checked"), "true");
      assert.ok(await selected.evaluate(el => document.activeElement === el), "Arrow browsing must keep focus in the choice group");
      await selected.press("Space");
      await centered(branchPage, branchPage.getByRole("textbox", { name: fieldName, exact: true }), `keyboard-branch-${index}`, width);
      await branchContext.close();
    }
    console.log(`${width}px: all four purposes open in one click, first-question return, drafts, validation focus, centered fields and radio keyboard OK`);
  }
  writeFileSync(`${dir}/center-metrics.json`, JSON.stringify(measurements, null, 2));
} finally { await browser.close(); }
