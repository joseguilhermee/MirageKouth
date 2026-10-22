import { encryptForPreview } from "./crypto";

// Prévia da cifra de cada resposta, com a chave descartável da sessão (ver
// encryptForPreview). Guardada por texto para que a animação de selar e a
// prancheta mostrem a mesma cifra para a mesma resposta. Não é o arquivo
// final: esse é cifrado de novo, com RSA, só na hora de selar.
const cache = new Map<string, Promise<string>>();

export function previewHex(sessionKey: CryptoKey, text: string): Promise<string> {
  let pending = cache.get(text);
  if (!pending) {
    pending = encryptForPreview(sessionKey, text);
    cache.set(text, pending);
    // Uma falha não pode ficar presa no cache.
    pending.catch(() => cache.delete(text));
  }
  return pending;
}
