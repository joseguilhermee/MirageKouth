import { MIRAGE_PUBLIC_KEY_PEM } from "./publicKey";
import { QUESTIONS, QUESTIONS_VERSION, formatChoiceAnswer, type QuestionDetail } from "./questions";

// Envelope final: RSA-OAEP-4096 (SHA-256) envelopa uma chave AES-256, que
// cifra o payload real com AES-GCM. Formato compativel com decryptor/decrypt.py.
type Envelope = {
  alg: "RSA-OAEP-4096+AES-256-GCM";
  encryptedKey: string; // base64
  iv: string; // base64
  ciphertext: string; // base64 (inclui o auth tag do GCM, como o Web Crypto entrega)
};

let cachedPublicKey: Promise<CryptoKey> | null = null;

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function isCryptoSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.crypto?.subtle &&
    typeof window.crypto.subtle.importKey === "function"
  );
}

function getPublicKey(): Promise<CryptoKey> {
  if (!cachedPublicKey) {
    cachedPublicKey = window.crypto.subtle.importKey(
      "spki",
      pemToArrayBuffer(MIRAGE_PUBLIC_KEY_PEM),
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );
  }
  return cachedPublicKey;
}

/** Chave de sessão só para a prévia visual (não é a chave usada no arquivo final). */
export function generateSessionKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, [
    "encrypt",
  ]);
}

/**
 * Cifra um texto com a chave de sessão e devolve hex real (iv + ciphertext).
 * Usado só para o painel "seu texto criptografado" — cifra de verdade, mas
 * descartável, nunca é enviada nem persistida.
 */
export async function encryptForPreview(
  sessionKey: CryptoKey,
  text: string
): Promise<string> {
  if (!text) return "";
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(text);
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sessionKey,
    data
  );
  return bufferToHex(iv.buffer) + bufferToHex(ciphertext);
}

/**
 * Cifra o payload final (nome + todas as respostas) com AES-256-GCM e
 * envelopa a chave AES com RSA-OAEP (chave pública). Retorna o conteúdo em
 * base64 pronto para virar o .txt baixado — só quem tiver a chave privada
 * RSA consegue abrir.
 */
export async function buildEncryptedFile(
  name: string,
  answers: Record<number, string>,
  timings: Record<number, number> = {},
  details: Record<number, QuestionDetail> = {}
): Promise<string> {
  const publicKey = await getPublicKey();

  const aesKey = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  );

  const qa = QUESTIONS.map((question, i) => ({
    id: question.id,
    question: question.text,
    answer: answers[i] ?? "",
    // Botões e extra seguem junto da pergunta, com o enunciado, pra leitura
    // não depender de saber o índice. `answer` é o texto pronto ("família →
    // mãe, avó"); `selected`/`sub` guardam o mesmo dado estruturado.
    choices: (question.choices ?? []).map((choice, c) => {
      const picked = details[i]?.choices?.[c];
      return {
        prompt: choice.prompt,
        options: choice.options.map((o) => o.label),
        answer: formatChoiceAnswer(picked),
        selected: picked?.selected ?? [],
        sub: picked?.sub ?? {},
        specify: (picked?.specify ?? "").trim(),
      };
    }),
    ...(question.extra ? { extra: { prompt: question.extra, answer: details[i]?.extra ?? "" } } : {}),
  }));

  // Segundos por pergunta, na mesma ordem de qa. Metadado: o decryptor mostra
  // no fim do arquivo com aviso para o interpretador ignorar.
  const tempoPorPergunta = QUESTIONS.map((_, i) => Math.round((timings[i] ?? 0) / 1000));

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const payload = new TextEncoder().encode(JSON.stringify({ name: name.trim(), version: QUESTIONS_VERSION, qa, timings: tempoPorPergunta }));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    payload
  );

  const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
  const encryptedKey = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    rawAesKey
  );

  const envelope: Envelope = {
    alg: "RSA-OAEP-4096+AES-256-GCM",
    encryptedKey: bufferToBase64(encryptedKey),
    iv: bufferToBase64(iv.buffer),
    ciphertext: bufferToBase64(ciphertext),
  };

  return btoa(JSON.stringify(envelope));
}
