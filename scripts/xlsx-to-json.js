/**
 * Reads KD#1_ Data Storage Matrix.xlsx and outputs app/data/services.json
 * - Data Storage Matrix sheet: services and criteria (first row = headers, first data column = service name)
 * - Questions sheet: question text and options (columns "Questions", "Options"); each question is mapped to a matrix column by option overlap
 * Run: npm run build-data
 */
const fs = require('fs');
const path = require('path');

let XLSX;
try {
  XLSX = require('xlsx');
} catch (_) {
  console.error('Run: npm install');
  process.exit(1);
}

const projectRoot = path.resolve(__dirname, '..');
const xlsxPath = path.join(projectRoot, 'KD#1_ Data Storage Matrix.xlsx');
const outDir = path.join(projectRoot, 'app', 'data');
const outPath = path.join(outDir, 'services.json');

if (!fs.existsSync(xlsxPath)) {
  console.error('Not found:', xlsxPath);
  process.exit(1);
}

const wb = XLSX.readFile(xlsxPath);

// --- Data Storage Matrix sheet ---
const matrixSheetName = wb.SheetNames.find((n) => /matrix|data storage/i.test(n)) || wb.SheetNames[0];
const wsMatrix = wb.Sheets[matrixSheetName];
const rows = XLSX.utils.sheet_to_json(wsMatrix, { header: 1, defval: '' });

const headers = rows[0] || [];
const dataRows = rows.slice(1).filter((row) => row.some((c) => c !== '' && c != null));

const services = dataRows.map((row) => {
  const obj = {};
  headers.forEach((h, i) => {
    const key = (h && String(h).trim()) || `Column_${i}`;
    obj[key] = row[i] == null || row[i] === '' ? '' : String(row[i]).trim();
  });
  return obj;
});

const nameKey =
  headers.find((h) => String(h || '').trim().toLowerCase() === 'service') ||
  (headers[0] && String(headers[0]).trim()) ||
  'Service';
const criteria = headers
  .filter((h) => h && String(h).trim() && String(h).trim() !== nameKey)
  .map((h) => ({ id: slug(h), label: String(h).trim() }));
function slug(s) {
  return String(s)
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase() || 'col';
}

// --- Questions sheet ---
const questionsSheetName = wb.SheetNames.find((n) => /^questions$/i.test(n.trim()));
let questions = [];
if (questionsSheetName) {
  const wsQ = wb.Sheets[questionsSheetName];
  const qRows = XLSX.utils.sheet_to_json(wsQ, { header: 1, defval: '' });
  const qHeaders = (qRows[0] || []).map((h) => (h != null ? String(h).trim() : ''));
  const questionCol = qHeaders.findIndex((h) => /question/i.test(h || ''));
  const optionsCol = qHeaders.findIndex((h) => /option/i.test(h || ''));
  if (questionCol >= 0 && optionsCol >= 0) {
    const optionValuesByColumn = {};
    criteria.forEach((c) => {
      const set = new Set();
      services.forEach((s) => {
        const raw = (s[c.label] || '').trim();
        raw.split(/[,;]/).forEach((part) => {
          const v = part.trim();
          if (v) set.add(normOpt(v));
        });
      });
      optionValuesByColumn[c.label] = set;
    });
    for (let r = 1; r < qRows.length; r++) {
      const row = qRows[r];
      const questionText = (row[questionCol] ?? '').toString().trim();
      if (!questionText) continue;
      const optionsRaw = (row[optionsCol] ?? '').toString();
      const options = optionsRaw
        .split(/\r?\n/)
        .map((o) => o.trim())
        .filter(Boolean);
      if (!options.length) continue;
      const qId = slug(questionText) || 'q' + r;
      let bestColumn = null;
      let bestScore = 0;
      const qOptSet = new Set(options.map(normOpt));
      for (const c of criteria) {
        const colSet = optionValuesByColumn[c.label];
        let score = 0;
        qOptSet.forEach((opt) => {
          if (colSet.has(opt)) score++;
        });
        if (score > bestScore) {
          bestScore = score;
          bestColumn = c.label;
        }
      }
      questions.push({
        id: qId,
        label: questionText,
        options: options,
        column: bestColumn || criteria[questions.length]?.label || null,
      });
    }
  }
}

function normOpt(s) {
  return String(s).trim().toLowerCase();
}

const output = { nameKey, criteria, services, questions };

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf8');
console.log('Wrote', outPath, '(', services.length, 'services,', criteria.length, 'criteria,', questions.length, 'questions)');
