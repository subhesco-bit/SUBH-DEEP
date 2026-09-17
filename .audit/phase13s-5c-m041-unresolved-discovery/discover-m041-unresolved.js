const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'backend', 'src');
const ROUTE = path.join(SRC, 'routes', 'M041VillageERP.js');
const OUT = path.join(ROOT, '.audit', 'phase13s-5c-m041-unresolved-discovery');

const METHODS = [
  'addFundingSource',
  'buildSubsidyAIContext',
  'createEstimate',
  'createProject',
  'getProject',
  'listProjects',
  'matchSubsidies',
  'upsertScheme'
];

const EXTENSIONS = new Set([
  '.js',
  '.cjs',
  '.mjs',
  '.ts'
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === '.git' ||
        entry.name === 'coverage'
      ) {
        continue;
      }

      walk(full, files);
      continue;
    }

    if (
      entry.isFile() &&
      EXTENSIONS.has(path.extname(entry.name).toLowerCase())
    ) {
      files.push(full);
    }
  }

  return files;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function lineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function lineAt(text, number) {
  return text.split(/\r?\n/)[number - 1] || '';
}

function context(text, number, radius = 2) {
  const lines = text.split(/\r?\n/);
  const start = Math.max(0, number - 1 - radius);
  const end = Math.min(lines.length, number + radius);

  return lines
    .slice(start, end)
    .map((line, i) => {
      const n = start + i + 1;
      return `${String(n).padStart(5)}: ${line}`;
    })
    .join('\n');
}

function detectDefinitions(text, method) {
  const e = escapeRegExp(method);

  const patterns = [
    {
      type: 'function declaration',
      regex: new RegExp(`\\b(?:async\\s+)?function\\s+${e}\\s*\\(`, 'g')
    },
    {
      type: 'class/object method',
      regex: new RegExp(`\\b(?:async\\s+)?${e}\\s*\\([^)]*\\)\\s*\\{`, 'g')
    },
    {
      type: 'const/let/var function',
      regex: new RegExp(
        `\\b(?:const|let|var)\\s+${e}\\s*=\\s*(?:async\\s*)?(?:function\\s*)?\\(?`,
        'g'
      )
    },
    {
      type: 'property function',
      regex: new RegExp(
        `\\b${e}\\s*:\\s*(?:async\\s*)?(?:function\\s*)?\\(?`,
        'g'
      )
    },
    {
      type: 'prototype method',
      regex: new RegExp(
        `\\.prototype\\.${e}\\s*=\\s*(?:async\\s*)?(?:function\\s*)?`,
        'g'
      )
    }
  ];

  const hits = [];

  for (const pattern of patterns) {
    let match;

    while ((match = pattern.regex.exec(text)) !== null) {
      hits.push({
        type: pattern.type,
        line: lineNumber(text, match.index)
      });

      if (pattern.regex.lastIndex === match.index) {
        pattern.regex.lastIndex++;
      }
    }
  }

  const seen = new Set();

  return hits.filter(hit => {
    const key = `${hit.type}:${hit.line}`;

    if (seen.has(key)) return false;

    seen.add(key);
    return true;
  });
}

function detectReferences(text, method) {
  const e = escapeRegExp(method);
  const regex = new RegExp(`\\b${e}\\b`, 'g');
  const hits = [];

  let match;

  while ((match = regex.exec(text)) !== null) {
    hits.push(lineNumber(text, match.index));

    if (regex.lastIndex === match.index) {
      regex.lastIndex++;
    }
  }

  return [...new Set(hits)];
}

function extractRouteCalls(routeText, method) {
  const e = escapeRegExp(method);
  const regex = new RegExp(`service\\.${e}\\s*\\(`, 'g');
  const results = [];

  let match;

  while ((match = regex.exec(routeText)) !== null) {
    const line = lineNumber(routeText, match.index);

    results.push({
      line,
      context: context(routeText, line, 4)
    });

    if (regex.lastIndex === match.index) {
      regex.lastIndex++;
    }
  }

  return results;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });

  console.log('');
  console.log('============================================================');
  console.log(' PHASE 13S-5C - M041 UNRESOLVED IMPLEMENTATION DISCOVERY');
  console.log('============================================================');

  if (!fs.existsSync(SRC)) {
    throw new Error('backend/src not found');
  }

  if (!fs.existsSync(ROUTE)) {
    throw new Error('M041VillageERP.js not found');
  }

  const routeText = fs.readFileSync(ROUTE, 'utf8');
  const files = walk(SRC);

  console.log(`Backend source files scanned         : ${files.length}`);
  console.log(`Unresolved method targets            : ${METHODS.length}`);

  const fileData = new Map();

  for (const file of files) {
    let text;

    try {
      text = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    fileData.set(file, text);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    methods: {},
    candidateFiles: []
  };

  const candidateCoverage = new Map();

  for (const method of METHODS) {
    const definitions = [];
    const references = [];

    for (const [file, text] of fileData.entries()) {
      const defs = detectDefinitions(text, method);

      for (const def of defs) {
        definitions.push({
          file: rel(file),
          line: def.line,
          type: def.type,
          source: lineAt(text, def.line).trim(),
          context: context(text, def.line, 3)
        });

        if (!candidateCoverage.has(file)) {
          candidateCoverage.set(file, new Set());
        }

        candidateCoverage.get(file).add(method);
      }

      const refs = detectReferences(text, method);

      if (refs.length) {
        references.push({
          file: rel(file),
          lines: refs.slice(0, 30)
        });
      }
    }

    const routeCalls = extractRouteCalls(routeText, method);

    report.methods[method] = {
      definitions,
      references,
      routeCalls
    };
  }

  report.candidateFiles = [...candidateCoverage.entries()]
    .map(([file, methods]) => ({
      file: rel(file),
      coverage: methods.size,
      methods: [...methods].sort()
    }))
    .sort((a, b) => {
      if (b.coverage !== a.coverage) {
        return b.coverage - a.coverage;
      }

      return a.file.localeCompare(b.file);
    });

  const text = [];

  text.push('============================================================');
  text.push('M041 UNRESOLVED IMPLEMENTATION DISCOVERY');
  text.push('============================================================');
  text.push('');

  text.push('CANDIDATE FILE COVERAGE');
  text.push('------------------------------------------------------------');

  if (!report.candidateFiles.length) {
    text.push('NO FUNCTION DEFINITIONS FOUND');
  }

  for (const item of report.candidateFiles) {
    text.push(
      `${String(item.coverage).padStart(2)}/8  ${item.file}`
    );

    text.push(`      ${item.methods.join(', ')}`);
  }

  text.push('');

  for (const method of METHODS) {
    const item = report.methods[method];

    text.push('============================================================');
    text.push(`METHOD: ${method}`);
    text.push('============================================================');

    text.push('');
    text.push('ROUTE CALLS');
    text.push('------------------------------------------------------------');

    if (!item.routeCalls.length) {
      text.push('NONE');
    }

    for (const call of item.routeCalls) {
      text.push(`Route line ${call.line}`);
      text.push(call.context);
      text.push('');
    }

    text.push('DEFINITIONS');
    text.push('------------------------------------------------------------');

    if (!item.definitions.length) {
      text.push('NONE');
    }

    for (const def of item.definitions) {
      text.push(
        `${def.file}:${def.line} [${def.type}]`
      );

      text.push(def.context);
      text.push('');
    }

    text.push('REFERENCING FILES');
    text.push('------------------------------------------------------------');

    for (const ref of item.references) {
      text.push(
        `${ref.file} : ${ref.lines.join(', ')}`
      );
    }

    text.push('');
  }

  const reportPath = path.join(
    OUT,
    'm041-unresolved-discovery.txt'
  );

  fs.writeFileSync(
    reportPath,
    text.join('\n'),
    'utf8'
  );

  fs.writeFileSync(
    path.join(OUT, 'm041-unresolved-discovery.json'),
    JSON.stringify(report, null, 2),
    'utf8'
  );

  console.log('');
  console.log('[CANDIDATE IMPLEMENTATION COVERAGE]');

  if (!report.candidateFiles.length) {
    console.log('NO DEFINITIONS FOUND');
  }

  for (const item of report.candidateFiles.slice(0, 20)) {
    console.log(
      `${String(item.coverage).padStart(2)}/8  ${item.file}`
    );

    console.log(
      `      ${item.methods.join(', ')}`
    );
  }

  console.log('');
  console.log('[METHOD SUMMARY]');

  for (const method of METHODS) {
    const defs = report.methods[method].definitions;

    console.log(
      `${method.padEnd(24)} definitions=${defs.length}`
    );

    for (const def of defs.slice(0, 10)) {
      console.log(
        `    ${def.file}:${def.line} [${def.type}]`
      );
    }
  }

  console.log('');
  console.log('APPLICATION SOURCE MODIFIED          : NO');
  console.log(`Text report                          : ${reportPath}`);
  console.log(
    `JSON report                          : ${path.join(
      OUT,
      'm041-unresolved-discovery.json'
    )}`
  );
}

try {
  main();
  process.exitCode = 0;
} catch (err) {
  console.error('');
  console.error('DISCOVERY FAILED');
  console.error(err.stack || err.message);
  console.error('APPLICATION SOURCE MODIFIED          : NO');
  process.exitCode = 1;
}
