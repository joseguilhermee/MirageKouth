import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmdirSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const siteUrl = process.env.MIRAGE_E2E_URL || "http://localhost:3100/";
const temp = mkdtempSync(path.join(tmpdir(), "mirage-quem-"));
const browser = await chromium.launch({ headless: true, channel: "msedge" });
const variants = [
  { risco: "quero", ja: "já", conhece: "conheço", motivo: "porque é importante pra mim" },
  { risco: "ainda não sei", ja: "ainda não", conhece: "prefiro pular", motivo: "porque eu ia gostar de viver assim" },
  { risco: "não agora", ja: "já", conhece: "conheço", motivo: "porque eu me sentiria mal se não mudasse" },
  { risco: "quero", ja: "ainda não", conhece: "prefiro pular", motivo: "porque alguém espera isso de mim" },
];
const picks = ["rir de verdade", "dizer o que eu penso", "gente por perto, sem pose"];

async function next(page) {
  await page.getByRole("button", { name: /Próxima|Concluir/ }).click();
}

async function answerMain(page, answer) {
  await page.locator("main textarea").first().fill(answer);
  await next(page);
}

async function run(variant, index) {
  const context = await browser.newContext({ reducedMotion: "reduce", acceptDownloads: true });
  const page = await context.newPage();
  try {
    await page.goto(siteUrl);
    for (const name of ["Como responder", "E a privacidade?", "Vamos começar"]) await page.getByRole("button", { name, exact: true }).click();
    await page.getByRole("textbox", { name: "Seu nome" }).fill("Pessoa Teste");
    await page.getByRole("button", { name: "Começar" }).click();
    await page.getByRole("button", { name: "Para quem eu quero ser", exact: true }).click();
    await page.locator("main textarea").fill("Passo o dia trabalhando com calma e encontrando meus amigos");
    await next(page);
    await answerMain(page, "Eu escuto, respiro e decido o que fazer sem fugir");

    const group = page.getByRole("group", { name: "Nessa vida nova, o que não pode faltar? Escolha até 3 opções.", exact: true });
    assert.equal(await group.getByRole("checkbox").count(), 12);
    for (const label of picks) await group.getByRole("checkbox", { name: label, exact: true }).click();
    await group.getByRole("checkbox", { name: "tempo pra aprender e pensar", exact: true }).click({ force: true });
    assert.equal(await group.getByRole("checkbox", { checked: true }).count(), 3, "No more than three choices");
    if (index === 0) {
      await page.waitForFunction(() => JSON.parse(localStorage.getItem("mirage-quem-progress-v2") || "{}").step === 2);
      await page.reload();
      for (const name of ["Como responder", "E a privacidade?", "Vamos começar"]) await page.getByRole("button", { name, exact: true }).click();
      await page.getByRole("button", { name: "Voltar para onde estava" }).click();
      await page.getByRole("group", { name: "Nessa vida nova, o que não pode faltar? Escolha até 3 opções.", exact: true }).waitFor();
    }
    await next(page);

    await answerMain(page, "Agora você age com calma e cuida melhor de si");

    await page.locator("main textarea").first().fill("Hoje adio conversas difíceis e decisões importantes");
    await page.locator("main textarea").nth(1).fill("Foi ontem, numa reunião longa, e senti um aperto no peito");
    await next(page);

    await page.locator("main textarea").first().fill("Tenho medo de magoar alguém próximo de mim");
    await page.locator("main textarea").nth(1).fill("Imagino que essa pessoa se afaste de mim");
    await page.getByRole("radio", { name: variant.risco, exact: true }).click();
    await next(page);

    await answerMain(page, "Tenho medo de continuar distante das pessoas que amo");

    await page.getByRole("radio", { name: variant.ja, exact: true }).click();
    await page.locator("main textarea").fill("Fui direto falar com ela e a conversa acabou bem");
    await next(page);

    await answerMain(page, "Quero preservar minha curiosidade e meu senso de humor");

    await page.getByRole("radio", { name: variant.conhece, exact: true }).click();
    if (variant.conhece === "conheço") await page.locator("main textarea").fill("Uma amiga que fala com clareza e escuta com atenção");
    await next(page);

    await page.getByRole("radio", { name: variant.motivo, exact: true }).click();
    const alguem = /mal|alguém/.test(variant.motivo);
    if (alguem) await page.locator("main textarea").fill("Para minha família");
    await next(page);

    await answerMain(page, "Eu ligaria para meu irmão e teria a conversa adiada");

    assert.equal(await page.locator("[data-sky]").getAttribute("data-sky"), "night");
    await page.getByRole("button", { name: "Selar minhas respostas" }).click();
    await page.getByRole("button", { name: "Ver arquivo protegido", exact: true }).click();
    await page.getByRole("dialog", { name: "Seu arquivo selado" }).waitFor();
    await page.getByRole("button", { name: "Fechar prancheta" }).click();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Baixar arquivo" }).click();
    const download = await downloadPromise;
    const encrypted = path.join(temp, `quem-${index}.txt`);
    const decoded = path.join(temp, `quem-${index}.json`);
    await download.saveAs(encrypted);
    const output = execFileSync("py", ["-3", path.join(root, "decryptor/decrypt.py"), encrypted, "--out", decoded], { encoding: "utf8" });
    const result = JSON.parse(readFileSync(decoded, "utf8"));
    assert.equal(result.versao, "QUEM-2");
    assert.equal(result.finalidade, "quem_quero_ser");
    assert.equal(result.nome, "Pessoa Teste");
    assert.deepEqual(result.answers.map(item => item.id), Array.from({ length: 12 }, (_, i) => `Y${String(i + 1).padStart(2, "0")}`));
    assert.deepEqual(result.answers[0].passos.map(step => step.resposta), ["Passo o dia trabalhando com calma e encontrando meus amigos"]);
    assert.deepEqual(result.answers[2].passos.map(step => step.resposta).join("; ").split("; ").sort(), [...picks].sort());
    assert.deepEqual(result.answers[5].passos.map(step => step.resposta), ["Imagino que essa pessoa se afaste de mim", variant.risco]);
    assert.equal(result.answers[6].text, "Tenho medo de continuar distante das pessoas que amo");
    assert.deepEqual(result.answers[7].passos.map(step => step.resposta), [variant.ja, "Fui direto falar com ela e a conversa acabou bem"]);
    assert.deepEqual(result.answers[9].passos.map(step => step.resposta), variant.conhece === "conheço" ? [variant.conhece, "Uma amiga que fala com clareza e escuta com atenção"] : [variant.conhece]);
    assert.deepEqual(result.answers[10].passos.map(step => step.resposta), alguem ? [variant.motivo, "Para minha família"] : [variant.motivo]);
    assert.equal(output.includes("daqui a 6 meses"), false);
    assert.match(output, /daqui a um ano/);
    const formatters = `import json, sys\nfrom pathlib import Path\nsys.path.insert(0, sys.argv[1])\nfrom decrypt import decrypt_file, load_private_key, DEFAULT_PRIVATE_KEY\nfrom decrypt_gui import format_result, format_result_markdown\nr = decrypt_file(Path(sys.argv[2]), load_private_key(DEFAULT_PRIVATE_KEY))\nprint(json.dumps({'txt': format_result(r), 'md': format_result_markdown(r)}, ensure_ascii=False))`;
    const formatted = JSON.parse(execFileSync("py", ["-3", "-c", formatters, path.join(root, "decryptor"), encrypted], { encoding: "utf8" }));
    for (const text of [formatted.txt, formatted.md]) {
      assert.match(text, /finalidade:\*\* quem_quero_ser|Finalidade: quem_quero_ser/i);
      assert.match(text, /daqui a um ano/);
      assert.match(text, /escolhas|rir de verdade/);
      assert.equal(text.includes("(em branco)"), false);
      assert.equal(text.includes("Texto do ramo descartado"), false);
    }
    console.log(`QUEM-2 ${index + 1}: ${variant.motivo}; ramos e decifra OK`);
  } finally {
    await context.close();
  }
}

try {
  for (const [index, variant] of variants.entries()) await run(variant, index);
} finally {
  await browser.close();
  for (const file of readdirSync(temp)) unlinkSync(path.join(temp, file));
  rmdirSync(temp);
}
