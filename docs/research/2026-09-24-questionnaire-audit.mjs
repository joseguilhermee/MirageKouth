// Read-only inventory. Never calls a model or modifies the source interviews.
// Usage: node docs/research/2026-09-24-questionnaire-audit.mjs [summary|read|items|review|narratives|selection-evidence] [IDs/items]
import fs from 'node:fs';
import path from 'node:path';

const root = 'E:/OBSIDIAN_MIRAGEKOUTH/OBSIDIAN_MIRAGEKOUTH/Pessoas';
const normalize = s => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const words = s => (s.match(/\S+/g) ?? []).length;
const median = a => {
  const v = [...a].sort((x, y) => x - y);
  return v.length % 2 ? v[(v.length - 1) / 2] : (v[v.length / 2 - 1] + v[v.length / 2]) / 2;
};
const people = fs.readdirSync(root).filter(n => /^\d\d_/.test(n) && !n.startsWith('00_')).sort().map(file => {
  const source = fs.readFileSync(path.join(root, file), 'utf8').replace(/\r/g, '');
  const headings = [...source.matchAll(/^(?:#{1,6}\s*)?(\d{1,2})\.\s+([^\n]+)$/gm)]
    .filter(m => !/\d\s*%/.test(m[2]) && Number(m[1]) <= 31 && m[2].length > 35);
  const questions = headings.map((m, i) => {
    let answer = source.slice(m.index + m[0].length, headings[i + 1]?.index ?? source.length).trim();
    // The last answer ends at a Markdown separator or profile, not at EOF.
    answer = answer.split(/\n\s*(?:-{3,}|—{2,}|\*{3,})\s*\n|\n(?:#{1,6}\s*)?\*{0,2}PERFIL ARQUET[IÍ]PICO/i)[0].trim();
    answer = answer.replace(/^\s*->\s*/, '').trim();
    return {n: Number(m[1]), heading: m[2], answer, chars: answer.length, words: words(answer)};
  });
  const ranks = [...source.matchAll(/^[ \t]*(?:#{1,6}\s*)?\*{0,2}(?:(\d{1,2})[.)]\s*)?(?:\*{0,2})?\s*((?:Herói|Explorador|Governante|Amante|Sábio|Mago|Mágico|Cuidador|Inocente|Criador|Todos|Rebelde|Bobo)[A-Za-zÀ-ÿ /]*?)\s*[—–-]\s*(\d+)\s*%[^\n]*/gm)]
    .map((m, i) => ({rank: m[1] ? Number(m[1]) : i + 1, archetype: m[2].trim(), percent: Number(m[3]), line: m[0].trim(), index: m.index}));
  const firstRank = ranks.find(r => r.rank === 1);
  const firstRankIndex = firstRank ? ranks.indexOf(firstRank) : -1;
  const profile = firstRankIndex >= 0 ? ranks.slice(firstRankIndex, firstRankIndex + 12) : [];
  let narrative = '';
  if (profile.length) narrative = source.slice(profile.at(-1).index + profile.at(-1).line.length).split(/MIRAGEKOUTH\s*[—–-]|#{1,6}\s*(?:F[oó]rmula|Perfume)|F[ÓO]RMULA SELECIONADA|#{1,6}\s*Receita/i)[0].trim();
  const totalWords = questions.reduce((s, q) => s + q.words, 0);
  return {id: file.slice(0, 2), file, questions, profile, narrative, totalWords, source};
});
const command = process.argv[2] ?? 'summary';
for (const p of people) {
  if (![28, 30].includes(p.questions.length) || p.questions.some((q, i) => q.n !== i + 1)) throw new Error(`Unexpected question sequence: ${p.id}`);
  if (p.profile.length && (p.profile.length !== 12 || p.profile.reduce((s, r) => s + r.percent, 0) !== 100)) throw new Error(`Unexpected profile: ${p.id}`);
}
if (command === 'selection-evidence') {
  const selection = JSON.parse(fs.readFileSync('docs/research/2026-09-24-questionnaire-selection.json', 'utf8'));
  const cohort = people.filter(p => p.questions.length === 28 && p.profile.length === 12);
  if (JSON.stringify(cohort.map(p => p.id)) !== JSON.stringify(selection.caseIds)) throw new Error('Selection cohort mismatch');
  if (selection.readItems.length !== 28 || new Set(selection.readItems).size !== 28) throw new Error('Incomplete review manifest');
  if (selection.questions.length !== 14 || new Set(selection.questions.map(q => q.id)).size !== 14) throw new Error('Invalid candidate set');
  for (const o of selection.observations) {
    if (new Set(o.caseIds).size !== o.caseIds.length) throw new Error('Duplicate case in observation');
    for (const id of o.caseIds) {
      if (!selection.caseIds.includes(id) || !cohort.find(p => p.id === id)?.questions.find(q => q.n === o.item)) throw new Error('Invalid observation reference');
    }
  }
  const paragraphs = id => people.find(p => p.id === id).narrative.split(/\n\s*\n/).map(s => s.trim()).filter(s => s.length > 120);
  const p22 = paragraphs('22');
  const p23 = paragraphs('23');
  const duplicates = p23.filter(s => p22.includes(s));
  if (!duplicates.length) throw new Error('Reported duplicated narrative not reproduced');
  console.log(JSON.stringify({
    cases: cohort.length,
    answersInReviewedCohort: cohort.reduce((n, p) => n + p.questions.length, 0),
    candidateItems: selection.questions.length,
    candidatePromptWords: selection.questions.reduce((n, q) => n + words(q.text), 0),
    observations: selection.observations.map(o => ({item: o.item, label: o.label, count: o.caseIds.length, denominator: cohort.length, ids: o.caseIds, qualification: o.qualification})),
    duplicatedNarrative: {sourceCase: '22', otherCase: '23', exactParagraphMatches: duplicates.length, otherNarrativeParagraphs: p23.length, matchedCharacters: duplicates.reduce((n, s) => n + s.length, 0)},
    note: 'Checks references, structure and literal duplication, NOT the validity of qualitative coding or the accuracy of the new questionnaire.'
  }, null, 2));
} else if (command === 'review') {
  const items = (process.argv[3] ?? '').split(',').map(Number);
  for (const n of items) {
    console.log(`\nITEM ${n}`);
    for (const p of people.filter(p => p.questions.length === 28 && p.profile.length === 12)) {
      const q = p.questions.find(q => q.n === n);
      console.log(`CASE ${p.id}: ${q.answer}`);
    }
  }
} else if (command === 'narratives') {
  const ids = (process.argv[3] ?? '').split(',');
  for (const p of people.filter(p => ids.includes(p.id))) console.log(`\nCASE ${p.id}\n${p.narrative}`);
} else if (command === 'read') {
  const ids = (process.argv[3] ?? '').split(',');
  for (const p of people.filter(p => ids.includes(p.id))) {
    console.log(`\nCASE ${p.id} | ${p.questions.length} questions | ${p.totalWords} words`);
    for (const q of p.questions) console.log(`Q${q.n}: ${q.answer}`);
    console.log('STORED PROFILE', JSON.stringify(p.profile.map(({archetype, percent}) => ({archetype, percent}))));
    console.log('STORED NARRATIVE', p.narrative.slice(0, 6000));
  }
} else if (command === 'items') {
  const items = (process.argv[3] ?? '').split(',').map(Number);
  for (const p of people.filter(p => p.questions.length === 28)) {
    console.log(`\nCASE ${p.id}`);
    for (const q of p.questions.filter(q => items.includes(q.n))) console.log(`Q${q.n}: ${q.answer.slice(0, 1800)}${q.answer.length > 1800 ? ' [TRUNCATED FOR REVIEW]' : ''}`);
  }
} else {
  const homogeneous = people.filter(p => p.questions.length === 28);
  const distribution = {};
  for (const p of people.filter(p => p.profile.length === 12)) {
    const a = normalize(p.profile[0].archetype.split('/')[0].trim());
    distribution[a] = (distribution[a] ?? 0) + 1;
  }
  const perItem = Array.from({length: 28}, (_, i) => {
    const answers = homogeneous.map(p => p.questions.find(q => q.n === i + 1));
    return {item: i + 1, medianChars: median(answers.map(q => q.chars)), medianWords: median(answers.map(q => q.words)), under100Chars: answers.filter(q => q.chars < 100).length, explicitEmpty: answers.filter(q => /^\(?em branco\)?$|^\(n[aã]o respondida\)$/i.test(q.answer.replace(/[_*]/g, ''))).length};
  });
  const questionSource = fs.readFileSync('web/src/lib/questions.ts', 'utf8');
  const promptStrings = [...questionSource.matchAll(/^\s*(?:text:\s*)?["']([^\n]+)["'],?$/gm)].map(m => m[1]);
  const briefItems = [1, 10, 11, 12, 13, 14, 16, 17, 18, 20, 23, 24, 25, 28];
  console.log(JSON.stringify({
    sourceFiles: people.length,
    homogeneous28: homogeneous.length,
    completeStoredProfiles: people.filter(p => p.profile.length === 12).length,
    homogeneousWithProfile: homogeneous.filter(p => p.profile.length === 12).length,
    storedTop1: distribution,
    storedTop1Homogeneous28: homogeneous.filter(p => p.profile.length === 12).reduce((counts, p) => {
      const a = normalize(p.profile[0].archetype.split('/')[0].trim());
      counts[a] = (counts[a] ?? 0) + 1;
      return counts;
    }, {}),
    medianInterviewWords28: median(homogeneous.map(p => p.totalWords)),
    rangeInterviewWords28: [Math.min(...homogeneous.map(p => p.totalWords)), Math.max(...homogeneous.map(p => p.totalWords))],
    medianRetainedWordFraction14: median(homogeneous.map(p => p.questions.filter(q => briefItems.includes(q.n)).reduce((s,q) => s + q.words, 0) / p.totalWords)),
    liveQuestionCount: (questionSource.match(/^\s+text: ["']/gm) ?? []).length,
    storedProfileSums: people.filter(p => p.profile.length).map(p => ({id: p.id, sum: p.profile.reduce((s, r) => s + r.percent, 0)})),
    livePromptWordsApprox: words(promptStrings.join(' ')),
    perPerson: people.map(p => ({id: p.id, n: p.questions.length, profileRows: p.profile.length, words: p.totalWords, top3: p.profile.slice(0,3).map(({archetype, percent}) => ({archetype, percent}))})),
    perItem,
    notes: ['Word/character length is not specificity, accuracy or duration.', 'First complete stored ranking only; no fresh inference or blind ablation.', 'Renumbered legacy questionnaire must not be pooled by item number.', 'Narrative output in read mode is truncated to 6000 characters; item output to 1800.']
  }, null, 2));
}
