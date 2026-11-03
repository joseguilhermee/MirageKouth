import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmdirSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const siteUrl = process.env.MIRAGE_E2E_URL || "http://localhost:3100/";
const temp = mkdtempSync(path.join(tmpdir(), "mirage-ocasiao-"));
const browser = await chromium.launch({ headless: true, channel: "msedge" });

async function answerMain(page, answer) {
  await page.locator("main textarea").first().fill(answer);
  await page.getByRole("button", { name: /Próxima|Concluir/ }).click();
}

async function run(branch) {
  const context = await browser.newContext({ reducedMotion: "reduce", acceptDownloads: true });
  const page = await context.newPage();
  try {
    await page.goto(siteUrl);
    await page.getByRole("textbox", { name: "Seu nome" }).fill("Pessoa Teste");
    await page.getByRole("button", { name: "Começar" }).click();
    assert.equal(await page.getByRole("radio", { name: /Para quem eu quero ser/ }).isDisabled(), false);
    await page.getByRole("radio", { name: "Para uma ocasião especial" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();

    await page.getByRole("textbox", { name: "Qual é a ocasião?" }).fill("casamento");
    await page.locator("main textarea").nth(1).fill("Quero celebrar com calma");
    await page.getByRole("button", { name: "Próxima" }).click();

    await page.getByRole("radio", { name: "a convite" }).click();
    await page.getByRole("button", { name: "Próxima" }).click();

    assert.equal(await page.getByRole("radio", { name: "qualquer hora" }).getAttribute("aria-checked"), "true");
    for (const option of ["de manhã", "à tarde", "à noite", "atravessa o dia"]) {
      const radio = page.locator('button[role="radio"][disabled]').filter({ hasText: option });
      assert.equal(await radio.isDisabled(), true);
      assert.match(await radio.innerText(), /em breve/);
    }
    await page.getByRole("button", { name: "Próxima" }).click();

    await answerMain(page, "não sei");
    await answerMain(page, "não sei");
    await page.locator("main textarea").first().fill("calmo");
    await page.locator("main textarea").nth(1).fill("frio e distante");
    await page.getByRole("button", { name: "Próxima" }).click();
    await answerMain(page, "Conversando com todos e escutando com atenção");
    await answerMain(page, "Seguro e presente durante toda a festa");

    if (branch === "já") {
      await page.getByRole("radio", { name: "ainda não" }).click();
      await page.locator("main textarea").fill("texto do ramo descartado");
    }
    await page.getByRole("radio", { name: branch, exact: true }).click();
    await page.locator("main textarea").fill("Resposta do ramo escolhido");
    await page.getByRole("button", { name: "Próxima" }).click();
    await answerMain(page, "Minha curiosidade e meu cuidado com as pessoas");
    await answerMain(page, "Que fui acolhedor e que estive presente de verdade");

    assert.equal(await page.locator("[data-sky]").getAttribute("data-sky"), "night");
    await page.getByRole("button", { name: "Selar minhas respostas" }).click();
    await page.getByRole("button", { name: "Ver arquivo protegido", exact: true }).click();
    await page.getByRole("dialog", { name: "Seu arquivo selado" }).waitFor();
    await page.getByRole("button", { name: "Fechar prancheta" }).click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Baixar arquivo" }).click();
    const download = await downloadPromise;
    const encrypted = path.join(temp, `ocasiao-${branch}.txt`);
    const decoded = path.join(temp, `ocasiao-${branch}.json`);
    await download.saveAs(encrypted);
    const output = execFileSync("py", ["-3", path.join(root, "decryptor/decrypt.py"), encrypted, "--out", decoded], { encoding: "utf8" });
    const result = JSON.parse(readFileSync(decoded, "utf8"));
    assert.equal(result.versao, "OCASIAO-1");
    assert.equal(result.finalidade, "ocasiao");
    assert.equal(result.nome, "Pessoa Teste");
    assert.deepEqual(result.momento_do_dia, { resposta: "qualquer hora", opcoes_ativas: ["qualquer hora"], uso: "reservado" });
    assert.equal(result.answers.length, 10);
    assert.equal(result.answers.some((item) => item.id === "O03"), false);
    assert.deepEqual(result.answers.find((item) => item.id === "O09").passos.map((step) => step.resposta), [branch, "Resposta do ramo escolhido"]);
    assert.equal(output.includes("texto do ramo descartado"), false);
    assert.match(output, /Finalidade: ocasiao/);
    assert.match(output, /Momento do dia: qualquer hora \(reservado/);
    const formatters = `import json, sys\nfrom pathlib import Path\nsys.path.insert(0, sys.argv[1])\nfrom decrypt import decrypt_file, load_private_key, DEFAULT_PRIVATE_KEY\nfrom decrypt_gui import format_result, format_result_markdown\nr = decrypt_file(Path(sys.argv[2]), load_private_key(DEFAULT_PRIVATE_KEY))\nprint(json.dumps({'txt': format_result(r), 'md': format_result_markdown(r)}, ensure_ascii=False))`;
    const formatted = JSON.parse(execFileSync("py", ["-3", "-c", formatters, path.join(root, "decryptor"), encrypted], { encoding: "utf8" }));
    for (const text of [formatted.txt, formatted.md]) {
      assert.match(text, /Finalidade:\*\* ocasiao|Finalidade: ocasiao/);
      assert.match(text, /Momento do dia:.*qualquer hora.*reservado/);
      assert.match(text, /O09/);
      assert.match(text, /Você já foi assim alguma vez\?: (já|ainda não)/);
      assert.equal(text.includes("texto do ramo descartado"), false);
    }
    console.log(`Ocasião ${branch}: interface, cifra e decifra OK`);
  } finally {
    await context.close();
  }
}

try {
  await run("já");
  await run("ainda não");
} finally {
  await browser.close();
  for (const file of readdirSync(temp)) unlinkSync(path.join(temp, file));
  rmdirSync(temp);
}
