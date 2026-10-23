import assert from "node:assert/strict";
import { mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { chromium } from "playwright";

const root = new URL("../../", import.meta.url);
const out = new URL(".impeccable/review/kouth/", root);
mkdirSync(out, { recursive: true });
const hashes = JSON.parse(readFileSync(new URL("./fixtures/question-hashes.json", import.meta.url)));
for (const [name, hash] of Object.entries(hashes)) {
  assert.equal(createHash("sha256").update(readFileSync(new URL(`web/src/lib/${name}`, root))).digest("hex"), hash, `Question source changed: ${name}`);
}
const browser = await chromium.launch({ channel: "msedge", headless: true });
const url = process.env.MIRAGE_E2E_URL || "http://localhost:3100";
try {
  for (const width of [320, 390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, isMobile: width < 640, hasTouch: width < 640 });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    const capture = async name => {
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow: ${name} ${width}`);
      await page.screenshot({ path: new URL(`${name}-${width}.png`, out).pathname.replace(/^\/(\w:)/, "$1"), fullPage: true });
    };
    await page.goto(url);
    assert.equal(await page.locator("html").getAttribute("data-theme"), "dark", "New visits default to dark");
    await page.getByRole("switch", { name: "Tema escuro" }).click();
    await capture("reception");
    await page.getByRole("switch", { name: "Tema escuro" }).click();
    await capture("reception-dark");
    await page.getByRole("switch", { name: "Tema escuro" }).click();
    await page.getByRole("button", { name: "Como responder", exact: true }).click();
    await page.waitForFunction(() => scrollY === 0);
    await capture("story");
    await page.getByRole("button", { name: "E a privacidade?", exact: true }).click();
    await page.waitForFunction(() => scrollY === 0);
    await capture("privacy");
    await page.getByRole("button", { name: "Vamos começar", exact: true }).click();
    await capture("welcome");
    const name = page.getByRole("textbox", { name: "Seu nome", exact: true });
    await name.click();
    await page.keyboard.type("Pessoa Teste");
    await page.getByRole("button", { name: "Começar", exact: true }).click();
    await capture("purpose");
    await page.getByRole("radio", { name: "Para quem eu quero ser", exact: true }).click();
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await page.getByRole("button", { name: "Começar", exact: true }).click();
    await page.getByRole("radio", { name: "1 ano", exact: true }).click();
    const field = page.locator("main textarea");
    if (width < 640) await field.tap(); else await field.click();
    assert.ok(await field.evaluate(el => el === document.activeElement));
    await page.keyboard.type("Escrevo minha história com calma, lembrando de quem eu sou.");
    await capture("question");
    await page.getByRole("switch", { name: "Tema escuro" }).click();
    await capture("question-dark");
    assert.match(await field.inputValue(), /história/);
    await page.getByRole("button", { name: /Prancheta:/ }).click();
    await page.getByRole("dialog", { name: "Prancheta", exact: true }).waitFor();
    await capture("answers");
    await page.getByRole("button", { name: "Fechar prancheta" }).click();
    for (const [button, dialog, shot] of [
      ["Base teórica", "Base teórica", "method-popover"],
      ["Cifrado neste aparelho Cifrado aqui", "Como isso é protegido", "privacy-popover"],
    ]) {
      const opener = shot === "method-popover" ? page.getByRole("button", { name: button, exact: true })
        : page.getByRole("button", { name: /Cifrado (aqui|neste aparelho)/ });
      await opener.click();
      const panel = page.getByRole("dialog", { name: dialog, exact: true });
      await panel.waitFor();
      await page.waitForTimeout(400);
      const box = await panel.boundingBox();
      assert.ok(box && box.x >= 0 && box.x + box.width <= width, `Popover outside viewport: ${shot} ${width}`);
      await capture(shot);
      await page.keyboard.press("Escape");
      await panel.waitFor({ state: "hidden" });
      await opener.click();
      await panel.waitFor();
      await page.locator("main textarea").click();
      await panel.waitFor({ state: "hidden" });
    }
    assert.deepEqual(errors, []);
    console.log(`${width}px: captures, touch/click, keyboard, themes and no overflow OK`);
    await context.close();
  }
} finally { await browser.close(); }
console.log("All question source files unchanged byte for byte.");
