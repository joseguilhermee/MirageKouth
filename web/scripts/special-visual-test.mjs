import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, channel: "msedge" });
const siteUrl = process.env.MIRAGE_E2E_URL || "http://localhost:3100/";

async function enter(page, purpose) {
  await page.goto(siteUrl);
  await page.getByRole("textbox", { name: "Seu nome" }).fill("Pessoa Teste");
  await page.getByRole("button", { name: "Começar" }).click();
  await page.getByRole("radio", { name: purpose }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
}

async function checkQuestionFlight(page, label) {
  const sky = page.locator('[data-sky="day"]');
  const firstSky = await sky.getAttribute("style");
  const progress = page.getByRole("progressbar", { name: "Progresso do questionário" });
  assert.equal(await progress.getAttribute("aria-valuenow"), "0");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  assert.equal(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches), false);
  await page.getByRole("button", { name: "Próxima" }).click();
  await page.locator('[class*="z-[60]"]').first().waitFor({ state: "visible" });
  await page.waitForFunction(() => document.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow") === "1");
  assert.notEqual(await sky.getAttribute("style"), firstSky, "o céu não avançou");
  const button = page.getByRole("button", { name: /Prancheta: 1 de \d+ respostas guardadas/ });
  await button.click();
  const drawer = page.getByRole("dialog", { name: "Prancheta" });
  await drawer.waitFor();
  assert.match(await drawer.innerText(), /1 de \d+ respostas/);
  await drawer.getByRole("button", { name: "Editar" }).first().click();
  await page.waitForFunction(() => document.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow") === "0");
  console.log(`${label}: cifra visual, prancheta, régua e céu OK`);
}

try {
  for (const mode of ["occasion", "becoming", "gift"]) {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    try {
      if (mode === "occasion") {
        await enter(page, "Para uma ocasião especial");
        await page.getByRole("textbox", { name: "Qual é a ocasião?" }).fill("casamento");
        await page.locator("main textarea").nth(1).fill("Quero estar bem com quem amo");
      } else if (mode === "becoming") {
        await enter(page, "Para quem eu quero ser");
        await page.getByRole("button", { name: "Começar" }).click();
        await page.locator("main textarea").fill("Passo o dia construindo algo com meus amigos");
      } else {
        await enter(page, "Para presente");
        await page.getByRole("radio", { name: "Amigo(a)" }).click();
        await page.getByRole("button", { name: "Continuar" }).click();
        await page.getByRole("textbox", { name: "Como você chama essa pessoa?" }).fill("Ju");
        await page.getByRole("button", { name: "Continuar" }).click();
        await page.getByRole("radio", { name: "ela" }).click();
        await page.getByRole("button", { name: "Continuar" }).click();
        await page.getByRole("radio", { name: "menos de 2 anos" }).click();
        await page.getByRole("button", { name: "Continuar" }).click();
        await page.getByRole("button", { name: "Continuar" }).click();
        await page.locator("main textarea").fill("Nós nos conhecemos no trabalho e ficamos amigos");
      }
      await checkQuestionFlight(page, mode);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
