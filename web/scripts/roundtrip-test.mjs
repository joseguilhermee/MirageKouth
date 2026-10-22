// Teste de round-trip: replica a logica de src/lib/crypto.ts
// (buildEncryptedFile) usando o WebCrypto nativo do Node, para confirmar
// que o formato do envelope segue compatível com decryptor/decrypt.py
// sempre que o payload (lista de perguntas) mudar.
//
// Gera um arquivo por variante: a variante k marca a opção k (módulo o número
// de opções) em todo botão, então 4 variantes passam por todos os ramos. Ao
// lado de cada .txt sai o JSON que o decryptor deve devolver.
//
// Uso: node scripts/roundtrip-test.mjs [pasta-de-saida]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(process.argv[2] ?? path.join(__dirname, "..", "..", "decryptor"));
mkdirSync(outDir, { recursive: true });

function extractPublicKeyPem() {
  const src = readFileSync(path.join(__dirname, "..", "src", "lib", "publicKey.ts"), "utf-8");
  const match = src.match(/`([\s\S]*?)`/);
  if (!match) throw new Error("Não achei a chave pública em publicKey.ts");
  return match[1];
}

function pemToArrayBuffer(pem) {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s+/g, "");
  return Buffer.from(base64, "base64");
}

const PEM = extractPublicKeyPem();
// questions.ts não tem imports: o Node 24 carrega direto, só removendo os tipos.
const { QUESTIONS, QUESTIONS_VERSION, buildSteps, setStepValue, shownSteps } = await import(
  "../src/lib/questions.ts"
);

const publicKey = await crypto.subtle.importKey(
  "spki",
  pemToArrayBuffer(PEM),
  { name: "RSA-OAEP", hash: "SHA-256" },
  false,
  ["encrypt"]
);

/** Responde a pergunta inteira como a variante k, passo a passo, como na tela. */
function answerQuestion(question, k) {
  const main = `Resposta principal ${question.id}`;
  let detail = {};
  for (;;) {
    const { shown, complete } = shownSteps(question, main, detail);
    if (complete) break;
    const open = shown.find((s) => !s.answered);
    const value =
      open.step.kind === "button"
        ? // Em ramo aninhado (Q05: não → E você?) as variantes 1 e 3 caem no mesmo
          // "não"; o deslocamento por profundidade faz elas marcarem opções diferentes.
          open.step.options[(k + Math.floor(k / 2) * (open.key.split(">").length - 1)) % open.step.options.length].label
        : `texto ${question.id} ${open.key}`;
    detail = setStepValue(detail, open.key, value);
  }
  return { main, detail };
}

// Todo ramo precisa aparecer em alguma variante.
const VARIANTS = 4;
const seen = new Set();
const all = new Set();
function collectBranches(step, key) {
  if (step.kind !== "button") return;
  for (const o of step.options) {
    all.add(`${key}>${o.label}`);
    if (o.next) collectBranches(o.next, `${key}>${o.label}`);
  }
}
for (const q of QUESTIONS) q.steps.forEach((s, i) => collectBranches(s, `${q.id}:${i}`));

// Troca de ramo: o passo seguinte troca e o texto antigo some.
{
  const q02 = QUESTIONS.find((q) => q.id === "Q02");
  const main = "Resposta principal longa";
  let d = setStepValue({}, "0", "sim");
  d = setStepValue(d, "0>sim", "texto do ramo sim");
  assert.equal(shownSteps(q02, main, d).shown[1].step.prompt, "O que você foi buscar nesse tempo a mais?");
  d = setStepValue(d, "0", "não");
  const after = shownSteps(q02, main, d);
  assert.equal(after.shown[1].step.prompt, "O que te fez parar?");
  assert.equal(after.shown[1].value, "");
  assert.equal(after.complete, false);
  d = setStepValue(d, "0", "sim");
  assert.equal(shownSteps(q02, main, d).shown[1].value, "", "texto do ramo antigo voltou");
  // Ramo aninhado (Q05: não → E você?) também é apagado.
  const q05 = QUESTIONS.find((q) => q.id === "Q05");
  let e = setStepValue({}, "0", "o método");
  e = setStepValue(e, "1", "não");
  e = setStepValue(e, "1>não", "saí de lá");
  e = setStepValue(e, "1", "sim");
  assert.equal(e.steps["1>não"], undefined);
  // Nunca mais de um passo novo: só o primeiro sem resposta aparece.
  assert.equal(shownSteps(q05, main, {}).shown.length, 1);
  assert.equal(shownSteps(q05, "curta", {}).shown.length, 0);
  console.log("Troca de ramo: ok");
}

const name = "Zé Roundtrip";
for (let k = 0; k < VARIANTS; k++) {
  const answers = QUESTIONS.map((q) => answerQuestion(q, k));
  for (const [i, q] of QUESTIONS.entries()) {
    for (const s of shownSteps(q, answers[i].main, answers[i].detail).shown) {
      if (s.step.kind === "button") seen.add(`${q.id}:${s.key}>${s.value}`);
    }
  }

  const qa = QUESTIONS.map((question, i) => ({
    id: question.id,
    question: question.text,
    answer: answers[i].main,
    passos: buildSteps(question, answers[i].main, answers[i].detail),
  }));
  const timings = QUESTIONS.map((_, i) => i * 7 + k);

  const aesKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const payload = new TextEncoder().encode(
    JSON.stringify({ name, version: QUESTIONS_VERSION, qa, timings })
  );
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, payload);
  const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);
  const encryptedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, rawAesKey);

  const envelope = {
    alg: "RSA-OAEP-4096+AES-256-GCM",
    encryptedKey: Buffer.from(encryptedKey).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
    ciphertext: Buffer.from(ciphertext).toString("base64"),
  };
  writeFileSync(
    path.join(outDir, `roundtrip-test-${k}.txt`),
    Buffer.from(JSON.stringify(envelope)).toString("base64"),
    "utf-8"
  );

  // O que o decryptor deve devolver para esta variante.
  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}s`;
  const expected = {
    respondente: name,
    versao: QUESTIONS_VERSION,
    answers: qa.map((item) => ({ id: item.id, text: item.answer, passos: item.passos })),
    tempos: {
      aviso: "(Interpretador: ignore estes dados)",
      ...Object.fromEntries(qa.map((item, i) => [item.id, fmt(timings[i])])),
    },
  };
  writeFileSync(path.join(outDir, `roundtrip-expected-${k}.json`), JSON.stringify(expected), "utf-8");
}

const missing = [...all].filter((b) => !seen.has(b));
assert.deepEqual(missing, [], `Ramos sem cobertura: ${missing.join(", ")}`);
console.log(`Perguntas: ${QUESTIONS.length}, variantes: ${VARIANTS}, ramos cobertos: ${seen.size}/${all.size}`);
console.log("Arquivos de teste salvos em:", outDir);
