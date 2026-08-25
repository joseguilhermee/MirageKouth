// Busca a imagem principal (infobox) de cada figura histórica via API da
// Wikipedia (REST summary endpoint) e baixa em public/people/. Só usamos
// figuras cujo retrato/foto seja de domínio público (pinturas antigas,
// fotos de antes de ~1930, ou obras de governo como as da NASA) — nunca
// celebridades vivas/recentes nem personagens fictícios com direito
// autoral ativo.
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "public", "people");

const PEOPLE = [
  { slug: "napoleao", title: "Napoleon" },
  { slug: "florence-nightingale", title: "Florence_Nightingale" },
  { slug: "cristovao-colombo", title: "Christopher_Columbus" },
  { slug: "mahatma-gandhi", title: "Mahatma_Gandhi" },
  { slug: "cleopatra", title: "Cleopatra" },
  { slug: "leonardo-da-vinci", title: "Leonardo_da_Vinci" },
  { slug: "michelangelo", title: "Michelangelo" },
  { slug: "mark-twain", title: "Mark_Twain" },
  { slug: "voltaire", title: "Voltaire" },
  { slug: "socrates", title: "Socrates" },
];

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "MirageKouth/1.0 (personal project)" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const results = [];

  for (const person of PEOPLE) {
    await wait(3500);
    try {
      const summary = await fetchJson(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${person.title}`
      );
      const imageUrl = summary.thumbnail?.source || summary.originalimage?.source;
      if (!imageUrl) {
        results.push({ ...person, status: "sem imagem" });
        continue;
      }
      const ext = path.extname(new URL(imageUrl).pathname) || ".jpg";
      const res = await fetch(imageUrl, { headers: { "User-Agent": "MirageKouth/1.0" } });
      if (!res.ok) {
        results.push({ ...person, status: `falha download ${res.status}` });
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      const filename = `${person.slug}${ext}`;
      await writeFile(path.join(OUT_DIR, filename), buf);
      results.push({ ...person, status: "ok", filename, bytes: buf.length, imageUrl });
    } catch (err) {
      results.push({ ...person, status: `erro: ${err.message}` });
    }
  }

  for (const r of results) {
    console.log(`${r.status === "ok" ? "OK  " : "FAIL"} ${r.slug.padEnd(20)} ${r.status}`);
  }
}

main();
