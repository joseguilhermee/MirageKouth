import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, channel: "msedge" });
const url = process.env.MIRAGE_E2E_URL || "http://localhost:3100";
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" });
  await page.goto(url);
  await page.addStyleTag({ content: "nextjs-portal { display:none!important; }" });
  for (const name of ["Como responder", "E a privacidade?", "Vamos começar"]) await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("textbox", { name: "Seu nome" }).fill("Pessoa Teste");
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await page.getByRole("radio", { name: "Para quem eu quero ser", exact: true }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Começar", exact: true }).click();
  await page.getByRole("radio", { name: "1 ano", exact: true }).click();
  await page.locator("main textarea").pressSequentially("Passo o dia criando coisas e encontrando pessoas de quem gosto.");
  await page.getByRole("button", { name: "Próxima", exact: true }).click();
  const second = page.getByRole("textbox", { name: "E num dia em que tudo dá errado, como essa versão sua reage?", exact: true });
  await second.waitFor();
  console.log("Y02 input state:", await second.evaluate(el => ({ readOnly: el.readOnly, disabled: el.disabled, value: el.value })));
  await page.waitForTimeout(700);
  await page.screenshot({ path: "../.impeccable/y02-input.png" });
  assert.equal(await second.evaluate(el => el.readOnly), false, "Y02 must be editable after the sealing animation");
  await second.pressSequentially("Eu respiro, escuto e decido o próximo passo com calma.");
  assert.match(await second.inputValue(), /próximo passo/);
  console.log("Y01 → Y02 with real animation and keyboard typing OK");
  await page.evaluate(() => {
    const original = Element.prototype.animate;
    window.__mirageRestoreAnimation = () => { Element.prototype.animate = original; };
    window.__miragePausedFlights = 0;
    Element.prototype.animate = function (...args) {
      const animation = original.apply(this, args);
      if (this.classList.contains("z-[60]")) {
        // Emulate a browser that never reports native animation completion.
        Object.defineProperty(animation, "onfinish", { configurable: true, get: () => null, set: () => {} });
        Object.defineProperty(animation, "finished", { configurable: true, get: () => new Promise(() => {}) });
        window.__miragePausedFlights++;
      }
      return animation;
    };
  });
  const started = Date.now();
  await page.getByRole("button", { name: "Próxima", exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow") === "2", null, { timeout: 8000 });
  assert.ok(await page.evaluate(() => window.__miragePausedFlights > 0), "Test must actually interrupt a flight animation");
  assert.ok(Date.now() - started >= 3500, "The safety timeout should recover the interrupted animation");
  const third = page.getByRole("textbox", { name: "Alguém próximo vai perceber a diferença. O que essa pessoa vai te dizer?", exact: true });
  assert.equal(await third.evaluate(el => el.readOnly), false);
  await third.pressSequentially("Agora você escuta e age com mais calma.");
  console.log("Interrupted animation recovered automatically; Y03 remains editable OK");
  await page.getByRole("button", { name: "Próxima", exact: true }).click();
  await page.getByRole("button", { name: /Prancheta:/ }).click();
  const drawer = page.getByRole("dialog", { name: "Prancheta", exact: true });
  await drawer.waitFor();
  assert.ok(await page.locator('[class*="z-[60]"]').count() > 0, "Edit must happen while the flight is still active");
  await drawer.getByRole("button", { name: "Editar", exact: true }).last().click();
  await drawer.waitFor({ state: "hidden" });
  assert.equal(await third.evaluate(el => el.readOnly), false, "Editing the outgoing question must unlock its fields");
  await third.fill("Texto revisado: agora você escuta com atenção e age com mais calma.");
  await page.waitForTimeout(4300);
  assert.equal(await page.getByRole("progressbar").getAttribute("aria-valuenow"), "2", "A cancelled flight must never change the editing destination");
  assert.match(await third.inputValue(), /Texto revisado/);
  await page.evaluate(() => window.__mirageRestoreAnimation());
  console.log("Clipboard editing cancels the active flight, unlocks the current question and prevents delayed navigation OK");
} finally { await browser.close(); }
