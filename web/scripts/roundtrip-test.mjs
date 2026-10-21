// Teste de round-trip: replica a logica de src/lib/crypto.ts
// (buildEncryptedFile) usando o WebCrypto nativo do Node, para confirmar
// que o formato do envelope segue compatível com decryptor/decrypt.py
// sempre que o payload (lista de perguntas) mudar.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
const { QUESTIONS, QUESTIONS_VERSION, formatChoiceAnswer } = await import("../src/lib/questions.ts");

const publicKey = await crypto.subtle.importKey(
  "spki",
  pemToArrayBuffer(PEM),
  { name: "RSA-OAEP", hash: "SHA-256" },
  false,
  ["encrypt"]
);

// Simula algumas respostas preenchidas, o resto fica em branco de propósito.
const name = "Zé Roundtrip";
const answers = {
  0: "Azul petróleo",
  1: "Montanha",
  [QUESTIONS.length - 1]: "Um axolote 🦎",
};

const qa = QUESTIONS.map((question, i) => ({
  id: question.id,
  question: question.text,
  answer: answers[i] ?? "",
  choices: (question.choices ?? []).map((choice, c) => {
    // Primeira linha da Q01 simula a árvore: família → mãe, avó, mais o especificar.
    const picked =
      i === 0 && c === 0
        ? {
            selected: ["família", "amigos"],
            sub: { família: ["mãe", "avó"], amigos: ["da escola"] },
            specify: "minha avó estava doente",
          }
        : undefined;
    return {
      prompt: choice.prompt,
      options: choice.options.map((o) => o.label),
      answer: formatChoiceAnswer(picked),
      selected: picked?.selected ?? [],
      sub: picked?.sub ?? {},
      specify: picked?.specify ?? "",
    };
  }),
  ...(question.extra ? { extra: { prompt: question.extra, answer: i === 0 ? "Uma tarde de chuva" : "" } } : {}),
}));

const aesKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
  "encrypt",
]);
const iv = crypto.getRandomValues(new Uint8Array(12));
const payload = new TextEncoder().encode(JSON.stringify({ name, version: QUESTIONS_VERSION, qa, timings: QUESTIONS.map((_, i) => i * 7) }));
const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, payload);
const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);
const encryptedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, rawAesKey);

const envelope = {
  alg: "RSA-OAEP-4096+AES-256-GCM",
  encryptedKey: Buffer.from(encryptedKey).toString("base64"),
  iv: Buffer.from(iv).toString("base64"),
  ciphertext: Buffer.from(ciphertext).toString("base64"),
};

const fileContent = Buffer.from(JSON.stringify(envelope)).toString("base64");
const outPath = path.join(__dirname, "..", "..", "decryptor", "roundtrip-test.txt");
writeFileSync(outPath, fileContent, "utf-8");

console.log(`Perguntas: ${QUESTIONS.length}, respondidas: ${Object.keys(answers).length}`);
console.log("Arquivo de teste salvo em:", outPath);
