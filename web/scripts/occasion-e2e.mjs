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
    for (const name of ["Como responder", "E a privacidade?", "Vamos começar"]) await page.getByRole("button", { name, exact: true }).click();
    await page.getByRole("textbox", { name: "Seu nome", exact: true }).fill("Pessoa Teste");
    await page.getByRole("button", { name: "Começar", exact: true }).click();
    await page.getByRole("button", { name: "Para uma ocasião especial", exact: true }).click();

    await page.getByRole("textbox", { name: "Qual é a ocasião?" }).fill("casamento");
    await page.locator("main textarea").nth(1).fill("Quero celebrar com calma");
    await page.getByRole("button", { name: "Próxima" }).click();

    // O02: "outro" abre um passo em texto.
    await page.getByRole("radio", { name: "outro" }).click();
    await page.getByRole("textbox", { name: "Conta em poucas palavras." }).fill("um nó na garganta");
    await page.getByRole("button", { name: "Próxima" }).click();

    assert.equal(await page.getByRole("radio", { name: "qualquer hora" }).getAttribute("aria-checked"), "true");
    for (const option of ["de manhã", "à tarde", "à noite", "atravessa o dia"]) {
      const radio = page.locator('button[role="radio"][disabled]').filter({ hasText: option });
      assert.equal(await radio.isDisabled(), true);
      assert.match(await radio.innerText(), /em breve/);
    }
    await page.getByRole("button", { name: "Próxima" }).click();

    // O04: palavra do léxico → afinação; "nenhum desses" → cartão; depois o limite.
    await page.getByRole("textbox", { name: "Como você quer se sentir lá? Uma palavra." }).fill("segura");
    await page.getByRole("radiogroup", { name: "Segura como quem…" }).waitFor();
    const tuning = await page.getByRole("radiogroup", { name: "Segura como quem…" }).getByRole("radio").allInnerTexts();
    assert.equal(tuning.length, 5);
    assert.equal(tuning.at(-1), "nenhum desses");
    await page.getByRole("radio", { name: "nenhum desses" }).click();
    const card = await page.getByRole("radiogroup", { name: "Qual destes chega mais perto?" }).getByRole("radio").allInnerTexts();
    assert.equal(card.length, 12);
    await page.getByRole("radio", { name: /^Paz — nada a provar/ }).click();
    await page.getByRole("textbox", { name: /E quando esse sentimento passa do ponto/ }).fill("arrogante e fechada");
    await page.getByRole("button", { name: "Próxima" }).click();

    // O05: até dois; "só isso" desmarca as outras.
    const group = page.getByRole("group", { name: /E o que mais você quer sentir junto/ });
    await group.getByRole("checkbox", { name: /^Coragem/ }).click();
    await group.getByRole("checkbox", { name: "só isso" }).click();
    assert.equal(await group.getByRole("checkbox", { name: /^Coragem/ }).getAttribute("aria-checked"), "false");
    await group.getByRole("checkbox", { name: /^Liberdade/ }).click();
    assert.equal(await group.getByRole("checkbox", { name: "só isso" }).getAttribute("aria-checked"), "false");
    await group.getByRole("checkbox", { name: /^Clareza/ }).click();
    await page.getByRole("button", { name: "Próxima" }).click();

    // O06 traz a palavra como foi escrita.
    await page.getByRole("heading", { name: /mais quer se sentir segura?/ }).waitFor();
    await answerMain(page, "Na hora do brinde, de pé, olhando todo mundo");
    await answerMain(page, "Eu penso: respira, está tudo certo");
    await answerMain(page, "Ombros soltos, voz baixa e firme, olhar parado");
    await page.getByRole("button", { name: "não vai ter ninguém perto" }).click();
    await page.getByRole("button", { name: "Próxima" }).click();

    if (branch === "já") {
      await page.getByRole("button", { name: "nunca senti" }).click();
      await page.getByRole("button", { name: "nunca senti" }).click();
      await page.locator("main textarea").first().fill("Na formatura, por uns minutos, sem pressa nenhuma");
    } else {
      await page.getByRole("button", { name: "nunca senti" }).click();
      await page.getByRole("textbox", { name: "Quem você conhece que vive isso? O que essa pessoa faz?" }).fill("Minha tia, que recebe todo mundo");
    }
    await page.getByRole("button", { name: "Próxima" }).click();
    await answerMain(page, "Minha curiosidade e meu cuidado com as pessoas");
    await answerMain(page, "Calma e orgulho de ter estado ali");

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
    assert.equal(result.versao, "OCASIAO-2");
    assert.equal(result.finalidade, "ocasiao");
    assert.equal(result.nome, "Pessoa Teste");
    assert.deepEqual(result.momento_do_dia, { resposta: "qualquer hora", opcoes_ativas: ["qualquer hora"], uso: "reservado" });
    assert.equal(result.answers.length, 11);
    assert.equal(result.answers.some((item) => item.id === "O03"), false);
    const byId = id => result.answers.find((item) => item.id === id);
    assert.equal(byId("O04").text, "segura");
    assert.deepEqual(byId("O04").passos.map((step) => step.pergunta), ["Segura como quem…", "Qual destes chega mais perto?", "E quando esse sentimento passa do ponto, vira o quê? Qual versão você não quer de jeito nenhum?"]);
    assert.match(output, /mais quer se sentir segura?/);
    assert.equal(byId("O09").text, "não vai ter ninguém perto");
    assert.equal(byId("O10").passos.length, branch === "já" ? 0 : 1);
    assert.match(output, /Finalidade: ocasiao/);
    assert.match(output, /Momento do dia: qualquer hora \(reservado/);
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
