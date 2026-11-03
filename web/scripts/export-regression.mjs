import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, readdirSync, unlinkSync, rmdirSync } from "node:fs";
import { registerHooks } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Carrega o exportador usado pelo site, com os imports TypeScript sem extensão.
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.includes("/src/lib/") && specifier.startsWith("./") && !path.extname(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});
globalThis.window = { crypto: globalThis.crypto };
const { buildEncryptedFile } = await import("../src/lib/crypto.ts");
const { QUESTIONS, QUESTIONS_VERSION } = await import("../src/lib/questions.ts");
const { becomingQuestions, BECOMING_VERSION } = await import("../src/lib/becomingQuestions.ts");
const { OCCASION_QUESTIONS, OCCASION_VERSION, MOMENTO_DO_DIA } = await import("../src/lib/occasionQuestions.ts");
const { giftQuestions, GIFT_VERSION } = await import("../src/lib/giftQuestions.ts");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const temp = mkdtempSync(path.join(tmpdir(), "mirage-export-"));
const python = process.platform === "win32" ? "py" : "python3";
const pythonArgs = process.platform === "win32" ? ["-3"] : [];
const name = "Pessoa fictícia de teste";
const gift = { nome: "João", pronome: "ele", tempo: "a vida toda", assinatura: name, papel: "irmão" };
const routes = [
  { mode: "para_mim", version: QUESTIONS_VERSION, questions: () => QUESTIONS },
  { mode: "quem_quero_ser", version: BECOMING_VERSION, questions: () => becomingQuestions() },
  { mode: "ocasiao", version: OCCASION_VERSION, questions: () => OCCASION_QUESTIONS },
  ...["amigo", "familia", "amor"].map(relacao => ({
    mode: "presente", version: GIFT_VERSION, info: { ...gift, relacao },
    questions: () => giftQuestions({ ...gift, relacao }),
  })),
];

// Enumera os caminhos do roteiro sem usar buildSteps/shownSteps: o resultado
// esperado não pode repetir uma omissão do próprio exportador.
function pathsForStep(step, key, marker) {
  if (step.kind === "choices") {
    const picks = step.options.slice(0, step.max);
    return [{ values: { [key]: picks.join("\n") }, passos: [{ tipo: "escolhas", pergunta: step.prompt, resposta: picks.join("; ") }] }];
  }
  const options = step.kind === "button" ? step.options.filter(option => !option.disabled) : [{ label: `${marker}/${key}: ação, memória e decisão.\nSegunda linha da resposta.` }];
  return options.flatMap(option => {
    const value = option.label;
    const next = step.kind === "button" ? option.next : step.next;
    const children = next ? pathsForStep(next, `${key}>${step.kind === "button" ? value : "texto"}`, marker) : [{ values: {}, passos: [] }];
    return children.map(child => ({
      values: { [key]: value, ...child.values },
      passos: [{ tipo: step.kind === "button" ? "botao" : "texto", pergunta: step.prompt, resposta: value }, ...child.passos],
    }));
  });
}
function pathsForQuestion(question, marker) {
  return question.steps.reduce((paths, step, index) => paths.flatMap(prefix =>
    pathsForStep(step, String(index), marker).map(suffix => ({
      values: { ...prefix.values, ...suffix.values }, passos: [...prefix.passos, ...suffix.passos],
    }))), [{ values: {}, passos: [] }]);
}

const verify = `
import json, re, sys
from pathlib import Path
sys.path.insert(0, sys.argv[1])
from decrypt import decrypt_file, load_private_key, DEFAULT_PRIVATE_KEY, interpreter_json
from decrypt_gui import export_result
key = load_private_key(DEFAULT_PRIVATE_KEY)
fixtures = json.loads(Path(sys.argv[2]).read_text(encoding='utf-8'))
for fixture in fixtures:
    raw = decrypt_file(Path(fixture['file']), key)
    assert raw['qa'] == fixture['qa'], fixture['file']
    assert raw['version'] == fixture['version']
    assert raw['finalidade'] == fixture['mode']
    result = interpreter_json(raw)
    assert result['answers'] == [dict(id=q['id'], text=q['answer'], passos=q['passos']) for q in fixture['qa']]
    if fixture['mode'] == 'ocasiao':
        assert raw['momento_do_dia'] == fixture['momento_do_dia']
    if fixture['mode'] == 'presente':
        assert result['presente'] == fixture['presente']
    for suffix in ['.txt', '.md']:
        text = export_result(raw, suffix).replace('  \\n', '\\n')
        if suffix == '.md':
            assert len(re.findall(r'^### \\d{2}\\.', text, re.M)) == len(fixture['qa'])
            assert re.findall(r'^### \\d{2}\\. (.+)$', text, re.M) == [q['question'] for q in fixture['qa']]
        assert '(em branco)' not in text, fixture['file']
        for q in fixture['qa']:
            for value in [q['question'], q['answer']] + [v for p in q['passos'] for v in [p['pergunta'], p['resposta']]]:
                assert not value or value in text, (fixture['file'], suffix, q['id'], value)
# Formatos anteriores continuam legíveis (sem passos e até sem id/versão).
legacy = dict(name='Antigo', qa=[dict(question='Pergunta antiga', answer='Resposta antiga', choices=[dict(prompt='Botão antigo', answer='sim', specify='Detalhe antigo')], extra=dict(prompt='Extra antigo', answer='Resposta extra'))])
old = interpreter_json(legacy)['answers'][0]
assert old['botoes'] == dict(B='sim') and old['especifique'] == dict(B='Detalhe antigo') and old['extra'] == 'Resposta extra'
for suffix in ['.txt', '.md']:
    text = export_result(legacy, suffix)
    for value in ['Pergunta antiga', 'Resposta antiga', 'Botão antigo', 'sim', 'Detalhe antigo', 'Extra antigo', 'Resposta extra']:
        assert value in text
assert interpreter_json(dict(qa=[dict(answer='Antiga') for _ in range(15)]))['versao'] == '15B'
print(f"{len(fixtures)} arquivos cifrados: todos os caminhos preservados em JSON, TXT e Markdown; formatos antigos OK")
`;

try {
  const fixtures = [];
  for (const route of routes) {
    const routeName = `${route.mode}${route.info ? `-${route.info.relacao}` : ""}`;
    const base = route.questions();
    const allPaths = base.map(q => pathsForQuestion(q, `${routeName}/${q.id}`));
    const count = Math.max(...allPaths.map(paths => paths.length));
    for (let variant = 0; variant < count; variant++) {
      const questions = route.questions();
      const answers = {}, details = {}, qa = [];
      for (const [index, question] of questions.entries()) {
        const chosen = allPaths[index][variant % allPaths[index].length];
        answers[index] = question.noMain ? "" : `${routeName}/${question.id}: resposta principal completa.\nCom acentos e duas linhas.`;
        details[index] = { steps: chosen.values };
        if (question.id !== "O03") qa.push({ id: question.id, question: question.noMain ? question.steps[0].prompt : question.text, answer: answers[index], passos: chosen.passos });
      }
      const content = await buildEncryptedFile(name, answers, {}, details,
        route.mode === "presente" ? { info: route.info, questions } : undefined,
        route.mode === "ocasiao" ? { questions } : undefined,
        route.mode === "quem_quero_ser" ? { questions } : undefined);
      const file = path.join(temp, `${routeName}-${variant}.txt`);
      writeFileSync(file, content);
      fixtures.push({ file, mode: route.mode, routeName, version: route.version, qa,
        ...(route.info ? { presente: route.info } : {}),
        ...(route.mode === "ocasiao" ? { momento_do_dia: MOMENTO_DO_DIA } : {}),
      });
    }
    console.log(`${routeName}: ${base.length} perguntas, ${allPaths.reduce((sum, paths) => sum + paths.length, 0)} caminhos completos em ${count} arquivos`);
  }
  const manifest = path.join(temp, "fixtures.json");
  writeFileSync(manifest, JSON.stringify(fixtures));
  console.log(execFileSync(python, [...pythonArgs, "-c", verify, path.join(root, "decryptor"), manifest], { encoding: "utf8" }).trim());

  // Confere também os formatadores e a chave realmente incluídos no .exe.
  if (process.argv.includes("--exe")) {
    const exe = path.join(root, "decryptor/dist/MirageKouth-Decifrador.exe");
    for (const routeName of new Set(fixtures.map(fixture => fixture.routeName))) {
      const fixture = fixtures.filter(item => item.routeName === routeName).sort((a, b) => b.qa.reduce((sum, q) => sum + q.passos.length, 0) - a.qa.reduce((sum, q) => sum + q.passos.length, 0))[0];
      for (const suffix of [".md", ".txt", ".json"]) {
        const output = path.join(temp, `${routeName}-exe${suffix}`);
        execFileSync(exe, [fixture.file, "--out", output], { timeout: 60000 });
        const text = readFileSync(output, "utf8").replaceAll("\r\n", "\n").replaceAll("  \n", "\n");
        if (suffix === ".json") {
          assert.deepEqual(JSON.parse(text).answers, fixture.qa.map(q => ({ id: q.id, text: q.answer, passos: q.passos })));
        } else {
          if (suffix === ".md") assert.deepEqual([...text.matchAll(/^### \d{2}\. (.+)$/gm)].map(match => match[1]), fixture.qa.map(q => q.question));
          for (const q of fixture.qa) {
            for (const value of [q.question, q.answer, ...q.passos.flatMap(step => [step.pergunta, step.resposta])].filter(Boolean)) {
              assert.ok(text.includes(value), `${routeName} ${q.id} ${suffix}: missing ${value}`);
            }
          }
        }
      }
      console.log(`Executável: ${routeName} preservado em Markdown, TXT e JSON`);
    }
  }
} finally {
  for (const file of readdirSync(temp)) unlinkSync(path.join(temp, file));
  rmdirSync(temp);
}
