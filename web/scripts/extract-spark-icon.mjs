// Extrai só o path da estrela (índice 2) do AppIcon original e gera um SVG
// standalone recortado, para usar como ícone sozinho (sem badge quadrado,
// sem wordmark) na sequência de abertura do site.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const srcPath = path.join(__dirname, "..", "..", "Logos", "MirageKouth_AppIcon.png.svg");
const src = readFileSync(srcPath, "utf-8");

const pathMatches = [...src.matchAll(/<path d="([^"]+)"/g)];
if (pathMatches.length < 3) throw new Error(`Esperava 3 paths, achei ${pathMatches.length}`);
const starD = pathMatches[2][1];

// bbox medido no navegador via getBBox(): x=147 y=145 w=541 h=548
const pad = 24;
const viewBox = `${147 - pad} ${145 - pad} ${541 + pad * 2} ${548 + pad * 2}`;

const svg = `<svg width="590" height="596" viewBox="${viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="${starD}" fill="white"/>
</svg>
`;

const outPath = path.join(__dirname, "..", "public", "logos", "spark-icon.svg");
writeFileSync(outPath, svg, "utf-8");
console.log("Salvo em:", outPath);
console.log("Tamanho do path:", starD.length, "caracteres");
