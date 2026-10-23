import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const url = process.env.MIRAGE_E2E_URL || "http://localhost:3100";
const dir = "../.impeccable/review/texture";
mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  for (const width of [390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: "light", reducedMotion: "reduce", hasTouch: width < 640 });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", e => errors.push(e.message));
    await page.goto(url);
    const theme = () => page.locator("html").getAttribute("data-theme");
    assert.equal(await theme(), "dark", "Default must be dark even on light devices");
    assert.equal(await page.locator('meta[name="theme-color"]').getAttribute("content"), "#2e1f17");
    const capture = async label => {
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${dir}/${label}-${width}.png`, fullPage: true });
    };
    await capture("reception-textured");
    const flat = await page.addStyleTag({ content: '.sky::before,.kouth-reception-body::before { display:none!important; }' });
    await capture("reception-flat");
    await flat.evaluate(el => el.remove());
    await page.getByRole("switch", { name: "Tema escuro" }).click();
    assert.equal(await theme(), "light");
    await page.reload();
    assert.equal(await theme(), "light", "Saved preference must survive reload");
    const second = await context.newPage();
    await second.goto(url);
    assert.equal(await second.locator("html").getAttribute("data-theme"), "light");
    await page.evaluate(() => localStorage.removeItem("mirage-theme"));
    await second.waitForFunction(() => document.documentElement.dataset.theme === "dark");
    await second.close();
    await page.bringToFront();
    await page.reload();
    assert.equal(await theme(), "dark", "Clearing the preference restores the default");
    for (const name of ["Como responder", "E a privacidade?", "Vamos começar"]) await page.getByRole("button", { name, exact: true }).click();
    const nameField = page.getByRole("textbox", { name: "Seu nome", exact: true });
    await nameField.click();
    await page.keyboard.type("Pessoa Teste");
    await page.getByRole("button", { name: "Começar", exact: true }).click();
    await page.getByRole("radio", { name: "Para quem eu quero ser", exact: true }).click();
    await page.getByRole("button", { name: "Continuar", exact: true }).click();
    await page.getByRole("button", { name: "Começar", exact: true }).click();
    await page.getByRole("radio", { name: "1 ano", exact: true }).click();
    const input = page.locator("main textarea");
    await input.click();
    await page.keyboard.type("Minha escrita continua confortável sobre este fundo.");
    const point = await input.evaluate(el => {
      const box = el.getBoundingClientRect();
      return document.elementFromPoint(box.left + 12, box.top + 12) === el;
    });
    assert.ok(point, "Texture must never intercept the field");
    assert.equal(await input.evaluate(el => getComputedStyle(el).backgroundImage), "none", "Writing fields stay smooth");
    await capture("question-textured");
    const plain = await page.addStyleTag({ content: '.sky::before,.kouth-reception-body::before { display:none!important; }' });
    await capture("question-flat");
    await plain.evaluate(el => el.remove());
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    console.log(`${width}px: dark default, light preference, reload/tab sync, texture comparison and editable fields OK`);
    await context.close();
  }
  const noScript = await browser.newContext({ javaScriptEnabled: false });
  const page = await noScript.newPage();
  await page.goto(url);
  assert.equal(await page.locator("html").getAttribute("data-theme"), "dark", "Server HTML must already be dark");
  await noScript.close();
  const blocked = await browser.newContext();
  await blocked.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error("Storage unavailable"); }; });
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(url);
  assert.equal(await blockedPage.locator("html").getAttribute("data-theme"), "dark", "Unavailable storage must keep the dark default");
  await blocked.close();
} finally { await browser.close(); }
