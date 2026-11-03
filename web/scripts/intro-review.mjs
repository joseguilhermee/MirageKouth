import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "msedge", headless: true });
try {
  for (const [width, height, reducedMotion] of [[390, 844, "no-preference"], [320, 568, "reduce"], [1440, 1000, "reduce"]]) {
    const context = await browser.newContext({ viewport: { width, height }, reducedMotion });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(`${message.text()} ${message.location().url}`); });
    await page.goto(process.env.MIRAGE_E2E_URL || "http://localhost:3100");
    // The local Next.js indicator overlaps the bottom-left control on mobile.
    await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
    for (const [index, title, button] of [
      [0, "Você é uma combinação. Seu perfume também.", "Como responder"],
      [1, "O perfume começa nos detalhes.", "E a privacidade?"],
      [2, "Sua história merece proteção.", "Vamos começar"],
    ]) {
      await page.getByRole("heading", { name: title, exact: true }).waitFor();
      await page.waitForTimeout(350);
      assert.equal(await page.locator('[aria-current="step"]').innerText(), ["Sua mistura", "Sua história", "Sua privacidade"][index]);
      assert.equal(await page.evaluate(() => document.activeElement?.id), "intro-heading");
      assert.equal(await page.locator("#intro-heading").evaluate(el => getComputedStyle(el).outlineStyle), "none");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      const intro = page.locator(".sky.fixed");
      assert.equal(await intro.evaluate(el => el.scrollWidth <= el.clientWidth), true);
      await page.screenshot({ path: `../.impeccable/intro-${width}-${index}.png`, fullPage: true });
      if (index === 0) {
        const categories = await page.locator("#intro-category option").allTextContents();
        assert.equal(categories.length, 13);
        for (const category of categories.slice(1)) {
          if (width < 640) await page.getByLabel("Explorar por arquétipo").selectOption(category);
          else await page.getByRole("button", { name: category, exact: true }).click();
          const region = page.getByRole("region", { name: `Pessoas: ${category}`, exact: true });
          await region.waitFor();
          assert.equal(await region.locator(":scope > ul > li").count(), 2);
          assert.equal(await page.locator("#people-heading").locator("..").locator(".min-h-11").count(), 1);
        }
        if (width < 640) await page.getByLabel("Explorar por arquétipo").selectOption("Criador");
        else await page.getByRole("button", { name: "Criador", exact: true }).click();
        await page.getByRole("heading", { name: "Leonardo da Vinci", exact: true }).waitFor();
        await page.waitForTimeout(500);
        await page.screenshot({ path: `../.impeccable/intro-${width}-creators.png` });
        if (width < 640) await page.getByLabel("Explorar por arquétipo").selectOption("Todos");
        else await page.getByRole("button", { name: "Todos", exact: true }).click();
        assert.equal(await page.getByRole("region", { name: "Pessoas: Todos" }).locator(":scope > ul > li").count(), 24);
      }
      if (index === 1) {
        await page.getByRole("button", { name: "Ver de novo", exact: true }).click();
        await page.waitForTimeout(500);
        const highlight = await page.locator("blockquote span").first().evaluate(el => getComputedStyle(el).backgroundColor);
        assert.notEqual(highlight, "rgba(0, 0, 0, 0)");
        await page.getByRole("button", { name: "Voltar", exact: true }).click();
        await page.getByRole("heading", { name: "Você é uma combinação. Seu perfume também.", exact: true }).waitFor();
        await page.getByRole("button", { name: "Como responder", exact: true }).click();
      }
      if (index === 2) {
        assert.equal(await page.getByText(/chave privada/i).count(), 0);
        const demo = page.locator("figure[data-demo-phase]");
        await demo.scrollIntoViewIfNeeded();
        const encrypted = page.locator("figure .font-mono");
        await encrypted.waitFor();
        const firstCipher = await encrypted.innerText();
        assert.match(firstCipher, /^[0-9a-f]{100,}$/);
        if (reducedMotion === "no-preference") {
          const times = await demo.evaluate(element => new Promise((resolve, reject) => {
            const changes = [];
            const timeout = setTimeout(() => { observer.disconnect(); reject(new Error("Encryption loop stopped")); }, 7000);
            const observer = new MutationObserver(() => {
              changes.push(performance.now());
              if (changes.length === 3) { clearTimeout(timeout); observer.disconnect(); resolve(changes); }
            });
            observer.observe(element, { attributes: true, attributeFilter: ["data-demo-phase"] });
          }));
          for (let i = 1; i < times.length; i++) assert.ok(times[i] - times[i - 1] > 1200 && times[i] - times[i - 1] < 1900);
          await page.getByRole("button", { name: "Pausar animação", exact: true }).click();
          const pausedPhase = await demo.getAttribute("data-demo-phase");
          await page.waitForTimeout(1700);
          assert.equal(await demo.getAttribute("data-demo-phase"), pausedPhase);
          await page.getByRole("button", { name: "Retomar animação", exact: true }).click();
        } else {
          assert.equal(await demo.getAttribute("data-demo-phase"), "texto");
          await page.getByRole("button", { name: "Ver criptografia", exact: true }).click();
          assert.equal(await demo.getAttribute("data-demo-phase"), "criptografado");
        }
        await page.waitForTimeout(500);
        await page.screenshot({ path: `../.impeccable/intro-${width}-encrypted.png` });
      }
      // Use the keyboard to activate the real control, avoiding global shortcuts.
      await page.getByRole("button", { name: button, exact: true }).focus();
      await page.keyboard.press("Enter");
    }
    await page.getByRole("textbox", { name: "Seu nome" }).waitFor();
    assert.deepEqual(errors, []);
    console.log(`${width}px / ${reducedMotion}: content, back, keyboard, focus, overflow and questionnaire entry OK`);
    await context.close();
  }
} finally {
  await browser.close();
}
