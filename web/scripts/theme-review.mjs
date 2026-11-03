import assert from "node:assert/strict";
import { chromium } from "playwright";
import { QUESTIONS, shownSteps } from "../src/lib/questions.ts";
import { OCCASION_QUESTIONS } from "../src/lib/occasionQuestions.ts";
import { becomingQuestions } from "../src/lib/becomingQuestions.ts";
import { giftQuestions } from "../src/lib/giftQuestions.ts";

const url = process.env.MIRAGE_E2E_URL || "http://localhost:3100";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const sample = "Num dia difícil, fiquei com minha irmã e escutei o que ela precisava dizer.";
const gift = { relacao: "amigo", nome: "Pessoa Exemplo", pronome: "ela", tempo: "de 2 a 10 anos", assinatura: "Teste" };
const modes = [
  ["para_mim", QUESTIONS, null],
  ["ocasiao", OCCASION_QUESTIONS, "mirage-ocasiao-progress-v1"],
  ["quem_quero_ser", becomingQuestions(), "mirage-quem-progress-v2"],
  ["presente", giftQuestions(gift), "mirage-presente-progress-v1"],
];

function fixture(question) {
  const detail = { steps: {} };
  for (let i = 0; i < 20; i++) {
    const { shown, complete } = shownSteps(question, sample, detail);
    if (complete) return detail;
    const next = shown.find(item => !item.answered);
    assert.ok(next, "Test fixture could not answer a visible step");
    detail.steps[next.key] = next.step.kind === "text" ? sample
      : next.step.kind === "choices" ? next.step.options.slice(0, next.step.max).join("\n")
      : next.step.options.find(option => !option.disabled && !option.next)?.label
        ?? next.step.options.find(option => !option.disabled).label;
  }
  throw new Error("Fixture did not complete");
}

async function finishIntro(page) {
  for (const name of ["Como responder", "E a privacidade?", "Vamos começar"]) await page.getByRole("button", { name, exact: true }).click();
}

async function sky(page) {
  return page.locator("[data-sky]").evaluate(element => {
    const style = getComputedStyle(element);
    return { top: style.getPropertyValue("--sky-top").trim(), mid: style.getPropertyValue("--sky-mid").trim(), low: style.getPropertyValue("--sky-low").trim(), ink: style.color };
  });
}

function rgb(value) { return value.match(/[\d.]+/g).slice(0, 3).map(Number); }
function luminance(value) {
  const channels = rgb(value).map(v => { const n = v / 255; return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4; });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }

try {
  for (const width of [390, 1440]) for (const [mode, questions, key] of modes) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: "reduce", colorScheme: "dark" });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    const answers = { 0: sample }, details = { 0: fixture(questions[0]) };
    const stored = { "mirage-theme": "light", "mirage-progress-v10": JSON.stringify({ name: "Pessoa Teste", purpose: mode, step: 0, answers, details }) };
    if (key) stored[key] = JSON.stringify(mode === "presente" ? { setup: 0, question: 0, values: gift, answers, details } : { step: 0, answers, details });
    await page.addInitScript(values => {
      if (sessionStorage.getItem("theme-review-seeded")) return;
      for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value);
      sessionStorage.setItem("theme-review-seeded", "yes");
    }, stored);
    await page.goto(url);
    await page.addStyleTag({ content: "nextjs-portal { display:none!important; }" });
    assert.equal(await page.locator("html").getAttribute("data-theme"), "light", "Saved light must override dark device preference");
    const initial = await sky(page);
    assert.deepEqual(initial, { top: "rgb(214, 230, 239)", mid: "rgb(228, 236, 233)", low: "rgb(238, 240, 230)", ink: "rgb(42, 27, 23)" });
    await page.getByRole("switch", { name: "Tema escuro" }).click();
    const dark = await sky(page);
    assert.equal(dark.top, "rgb(11, 16, 21)");
    assert.equal(dark.ink, "rgb(244, 231, 218)");
    await page.reload();
    await page.addStyleTag({ content: "nextjs-portal { display:none!important; }" });
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark", "Explicit preference must survive reload");
    await finishIntro(page);
    await page.getByRole("button", { name: "Voltar para onde estava" }).click();
    const input = page.locator("main textarea").first();
    await input.waitFor();
    const before = await input.inputValue();
    const progress = await page.getByRole("progressbar").getAttribute("aria-valuenow");
    await page.getByRole("switch", { name: "Tema escuro" }).click();
    assert.equal(await input.inputValue(), before);
    assert.equal(await page.getByRole("progressbar").getAttribute("aria-valuenow"), progress);
    assert.deepEqual(await sky(page), initial);
    await page.getByRole("button", { name: /Prancheta: / }).click();
    const drawer = page.getByRole("dialog", { name: "Prancheta", exact: true });
    const paper = drawer.locator(".bg-\\[var\\(--paper\\)\\]");
    assert.equal(await paper.evaluate(el => getComputedStyle(el).backgroundColor), "rgb(251, 246, 239)");
    assert.equal(await paper.evaluate(el => getComputedStyle(el).color), "rgb(42, 27, 23)");
    await page.getByRole("button", { name: "Fechar prancheta" }).click();
    await page.getByRole("switch", { name: "Tema escuro" }).click();
    await page.getByRole("button", { name: /Prancheta: / }).click();
    assert.equal(await paper.evaluate(el => getComputedStyle(el).backgroundColor), "rgb(21, 18, 22)");
    assert.equal(await paper.evaluate(el => getComputedStyle(el).color), "rgb(244, 231, 218)");
    await page.screenshot({ path: `../.impeccable/theme-${mode}-${width}-clipboard.png` });
    await page.getByRole("button", { name: "Fechar prancheta" }).click();
    await page.getByRole("button", { name: "Base teórica", exact: true }).click();
    const popover = page.getByRole("dialog", { name: "Base teórica", exact: true });
    assert.equal(await popover.evaluate(el => getComputedStyle(el).backgroundColor), "rgb(21, 18, 22)");
    await page.keyboard.press("Escape");
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `../.impeccable/theme-${mode}-${width}-dark.png` });
    if (mode === "para_mim") {
      for (const [step, lightTop] of [[Math.floor((questions.length - 1) / 2), null], [questions.length - 1, "rgb(217, 202, 216)"], [questions.length, "rgb(42, 26, 34)"]]) {
        await page.evaluate(step => { const data = JSON.parse(localStorage.getItem("mirage-progress-v10")); data.step = step; localStorage.setItem("mirage-progress-v10", JSON.stringify(data)); }, step);
        await page.reload();
        await page.addStyleTag({ content: "nextjs-portal { display:none!important; }" });
        await finishIntro(page);
        await page.getByRole("button", { name: "Voltar para onde estava" }).click();
        await page.getByRole("progressbar").waitFor();
        const colors = await sky(page);
        if (step >= questions.length - 1) {
          for (const color of [colors.top, colors.mid, colors.low]) assert.equal(color, "rgb(0, 0, 0)", "The dark journey must finish at pure black");
        }
        assert.notEqual(colors.top, dark.top, "The dark sky must evolve with progress");
        const muted = await page.locator("[data-sky]").evaluate(el => getComputedStyle(el).getPropertyValue("--ink-3"));
        for (const background of [colors.top, colors.mid, colors.low]) {
          assert.ok(contrast(colors.ink, background) >= 4.5);
          assert.ok(contrast(getRgb(muted), background) >= 4.5);
        }
        await page.waitForTimeout(700); // Let the existing page entrance finish before visual review.
        await page.screenshot({ path: `../.impeccable/theme-${width}-stage-${step}.png` });
        await page.getByRole("switch", { name: "Tema escuro" }).click();
        if (lightTop) assert.equal((await sky(page)).top, lightTop, "The original light sunset and seal must remain intact");
        await page.getByRole("switch", { name: "Tema escuro" }).click();
      }
    }
    assert.deepEqual(errors, []);
    console.log(`${mode} ${width}px: light unchanged, dark, persistence, inputs, sky, clipboard and menus OK`);
    await context.close();
  }
  const context = await browser.newContext({ colorScheme: "dark", reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto(url);
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light", "A new visit must default to light even on a dark device");
  await page.getByRole("switch", { name: "Tema escuro" }).waitFor();
  await page.waitForFunction(() => document.querySelector('[role="switch"]')?.getAttribute("aria-checked") === "false");
  await page.emulateMedia({ colorScheme: "light" });
  await page.waitForFunction(() => document.documentElement.dataset.theme === "light");
  await page.getByRole("switch", { name: "Tema escuro" }).click();
  await page.emulateMedia({ colorScheme: "dark" });
  await page.emulateMedia({ colorScheme: "light" });
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark", "Explicit choice must override later device changes");
  const secondTab = await context.newPage();
  await secondTab.goto(url);
  await secondTab.waitForFunction(() => document.querySelector('[role="switch"]')?.getAttribute("aria-checked") === "true");
  await page.getByRole("switch", { name: "Tema escuro" }).click();
  await secondTab.waitForFunction(() => document.documentElement.dataset.theme === "light");
  await context.close();
  const blocked = await browser.newContext({ colorScheme: "dark", reducedMotion: "reduce" });
  await blocked.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new Error("Storage unavailable"); };
    Storage.prototype.setItem = () => { throw new Error("Storage unavailable"); };
  });
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(url);
  await blockedPage.waitForFunction(() => document.querySelector('[role="switch"]')?.getAttribute("aria-checked") === "false");
  await blockedPage.getByRole("switch", { name: "Tema escuro" }).click();
  assert.equal(await blockedPage.locator("html").getAttribute("data-theme"), "dark");
  await blocked.close();
  console.log("Light default on dark devices, explicit override, tab sync and unavailable storage OK");
  const animated = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "light", reducedMotion: "no-preference" });
  const animatedPage = await animated.newPage();
  await animatedPage.goto(url);
  await animatedPage.getByRole("switch", { name: "Tema escuro" }).click();
  await animatedPage.waitForFunction(() => !document.documentElement.hasAttribute("data-theme-changing"));
  assert.equal((await sky(animatedPage)).top, "rgb(11, 16, 21)", "Switching themes must change canvas and ink together");
  await animatedPage.waitForTimeout(250); // Small control transitions finish independently of the sky.
  await animatedPage.addStyleTag({ content: "nextjs-portal { display:none!important; }" });
  await animatedPage.screenshot({ path: "../.impeccable/theme-intro-dark.png" });
  await animated.close();
} finally { await browser.close(); }

function getRgb(value) {
  const hex = value.trim().replace("#", "");
  return `rgb(${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)})`;
}
