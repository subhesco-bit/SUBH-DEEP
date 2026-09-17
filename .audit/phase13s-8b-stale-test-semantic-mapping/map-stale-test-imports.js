const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = process.cwd();
const BACKEND = path.join(ROOT, 'backend');
const SRC = path.join(BACKEND, 'src');
const OUT = path.join(
  ROOT,
  '.audit',
  'phase13s-8b-stale-test-semantic-mapping'
);

const TARGET_TEST = path.join(
  SRC,
  '__tests__',
  'critical-phase1.test.js'
);

const SOURCE_EXTS = new Set([
  '.js',
  '.cjs',
  '.mjs',
  '.ts'
]);

const TEST_HINTS = [
  '/__tests__/',
  '/tests/',
  '/test/',
  '.test.',
  '.spec.'
];

function fail(message) {
  throw new Error(message);
}

function run(command, args, options = {}) {
  return cp.spawnSync(
    command,
    args,
    {
      cwd: options.cwd || ROOT,
      encoding: 'utf8',
      windowsHide: true,
      env: {
        ...process.env,
        ...(options.env || {})
      },
      maxBuffer: 100 * 1024 * 1024
    }
  );
}

function git(args) {
  return run(
    'git',
    args,
    { cwd: ROOT }
  );
}

function rel(file) {
  return path
    .relative(ROOT, file)
    .replace(/\\/g, '/');
}

function normalize(file) {
  return file.replace(/\\/g, '/');
}

function walk(dir, result = []) {
  if (!fs.existsSync(dir)) {
    return result;
  }

  for (
    const entry of fs.readdirSync(
      dir,
      { withFileTypes: true }
    )
  ) {
    const full = path.join(
      dir,
      entry.name
    );

    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === '.git' ||
        entry.name === '.audit' ||
        entry.name === 'coverage' ||
        entry.name === 'dist' ||
        entry.name === 'build'
      ) {
        continue;
      }

      walk(full, result);
      continue;
    }

    if (entry.isFile()) {
      result.push(full);
    }
  }

  return result;
}

function isSourceFile(file) {
  return SOURCE_EXTS.has(
    path.extname(file).toLowerCase()
  );
}

function isTestFile(file) {
  const n = normalize(file);

  return TEST_HINTS.some(
    hint => n.includes(hint)
  );
}

function read(file) {
  return fs.readFileSync(
    file,
    'utf8'
  );
}

function resolveRelative(fromFile, specifier) {
  const base = path.resolve(
    path.dirname(fromFile),
    specifier
  );

  const candidates = [
    base,
    ...[...SOURCE_EXTS].map(
      ext => base + ext
    ),
    ...[...SOURCE_EXTS].map(
      ext =>
        path.join(
          base,
          'index' + ext
        )
    )
  ];

  for (const candidate of candidates) {
    if (
      fs.existsSync(candidate) &&
      fs.statSync(candidate).isFile()
    ) {
      return candidate;
    }
  }

  return null;
}

function lineNumber(text, offset) {
  return (
    text.slice(0, offset)
      .split(/\r?\n/)
      .length
  );
}

function getLineWindow(text, line, radius = 5) {
  const lines =
    text.split(/\r?\n/);

  const start =
    Math.max(
      1,
      line - radius
    );

  const end =
    Math.min(
      lines.length,
      line + radius
    );

  const out = [];

  for (
    let i = start;
    i <= end;
    i++
  ) {
    out.push(
      `${String(i).padStart(5)} | ${lines[i - 1]}`
    );
  }

  return out.join('\n');
}

function parseRelativeImports(text) {
  const found = [];

  /*
   * const x = require('../x')
   */
  let re =
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*require\(\s*(['"])(\.[^'"]+)\2\s*\)/g;

  let m;

  while ((m = re.exec(text)) !== null) {
    found.push({
      kind: 'require-default',
      localBindings: [m[1]],
      specifier: m[3],
      index: m.index,
      full: m[0]
    });
  }

  /*
   * const { a, b: c } = require('../x')
   */
  re =
    /\b(?:const|let|var)\s*\{\s*([^}]+)\s*\}\s*=\s*require\(\s*(['"])(\.[^'"]+)\2\s*\)/g;

  while ((m = re.exec(text)) !== null) {
    const bindings =
      m[1]
        .split(',')
        .map(x => x.trim())
        .filter(Boolean)
        .map(x => {
          const parts =
            x.split(':')
              .map(v => v.trim());

          return {
            imported: parts[0],
            local:
              parts[1] || parts[0]
          };
        });

    found.push({
      kind: 'require-destructure',
      namedBindings: bindings,
      localBindings:
        bindings.map(x => x.local),
      specifier: m[3],
      index: m.index,
      full: m[0]
    });
  }

  /*
   * import defaultName from '../x'
   */
  re =
    /\bimport\s+([A-Za-z_$][\w$]*)\s+from\s+(['"])(\.[^'"]+)\2/g;

  while ((m = re.exec(text)) !== null) {
    found.push({
      kind: 'import-default',
      localBindings: [m[1]],
      specifier: m[3],
      index: m.index,
      full: m[0]
    });
  }

  /*
   * import { a, b as c } from '../x'
   */
  re =
    /\bimport\s*\{\s*([^}]+)\s*\}\s*from\s*(['"])(\.[^'"]+)\2/g;

  while ((m = re.exec(text)) !== null) {
    const bindings =
      m[1]
        .split(',')
        .map(x => x.trim())
        .filter(Boolean)
        .map(x => {
          const parts =
            x.split(/\s+as\s+/i)
              .map(v => v.trim());

          return {
            imported: parts[0],
            local:
              parts[1] || parts[0]
          };
        });

    found.push({
      kind: 'import-named',
      namedBindings: bindings,
      localBindings:
        bindings.map(x => x.local),
      specifier: m[3],
      index: m.index,
      full: m[0]
    });
  }

  /*
   * Side-effect relative require/import.
   */
  re =
    /\brequire\(\s*(['"])(\.[^'"]+)\1\s*\)/g;

  while ((m = re.exec(text)) !== null) {
    const duplicate =
      found.some(
        item =>
          item.index <= m.index &&
          item.full.includes(m[0])
      );

    if (!duplicate) {
      found.push({
        kind: 'require-side-effect',
        localBindings: [],
        specifier: m[2],
        index: m.index,
        full: m[0]
      });
    }
  }

  return found
    .sort(
      (a, b) =>
        a.index - b.index
    );
}

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}

function usagesForBinding(text, binding) {
  const result = {
    memberAccesses: [],
    directCalls: 0,
    references: 0
  };

  const memberRe =
    new RegExp(
      `\\b${escapeRegex(binding)}\\.([A-Za-z_$][\\w$]*)`,
      'g'
    );

  let m;

  while (
    (m = memberRe.exec(text)) !== null
  ) {
    result.memberAccesses.push(
      m[1]
    );
  }

  result.memberAccesses =
    [...new Set(
      result.memberAccesses
    )];

  const directCallRe =
    new RegExp(
      `\\b${escapeRegex(binding)}\\s*\\(`,
      'g'
    );

  result.directCalls =
    [...text.matchAll(
      directCallRe
    )].length;

  const referenceRe =
    new RegExp(
      `\\b${escapeRegex(binding)}\\b`,
      'g'
    );

  result.references =
    [...text.matchAll(
      referenceRe
    )].length;

  return result;
}

function extractApiPaths(text) {
  const paths = new Set();

  const regex =
    /(['"`])(\/api\/[^'"`\s?#]+|\/[A-Za-z0-9][A-Za-z0-9_./:{}-]*)\1/g;

  let m;

  while (
    (m = regex.exec(text)) !== null
  ) {
    const p = m[2];

    if (
      p.length >= 2 &&
      !p.includes('${')
    ) {
      paths.add(p);
    }
  }

  return [...paths];
}

function extractHttpMethodsNearby(text) {
  const methods = new Set();

  const regex =
    /\.(get|post|put|patch|delete)\s*\(/gi;

  let m;

  while (
    (m = regex.exec(text)) !== null
  ) {
    methods.add(
      m[1].toUpperCase()
    );
  }

  return [...methods];
}

function scanBrokenImports() {
  const testFiles =
    walk(SRC)
      .filter(isSourceFile)
      .filter(isTestFile);

  const broken = [];

  for (const file of testFiles) {
    let text;

    try {
      text = read(file);
    } catch {
      continue;
    }

    const imports =
      parseRelativeImports(text);

    for (const item of imports) {
      if (
        resolveRelative(
          file,
          item.specifier
        )
      ) {
        continue;
      }

      broken.push({
        file: rel(file),
        absoluteFile: file,
        specifier:
          item.specifier,
        kind:
          item.kind,
        bindings:
          item.localBindings || [],
        line:
          lineNumber(
            text,
            item.index
          )
      });
    }
  }

  return broken;
}

function buildProductionCorpus() {
  const files =
    walk(SRC)
      .filter(isSourceFile)
      .filter(
        file =>
          !isTestFile(file)
      );

  const corpus = [];

  for (const file of files) {
    try {
      const text = read(file);

      corpus.push({
        file,
        rel: rel(file),
        text,
        lower:
          text.toLowerCase()
      });
    } catch {
      // Ignore unreadable files only.
    }
  }

  return corpus;
}

function candidateEvidence(
  corpusItem,
  expectedMethods,
  apiPaths,
  moduleStem
) {
  const evidence = [];
  let score = 0;

  const base =
    path.basename(
      corpusItem.file,
      path.extname(
        corpusItem.file
      )
    );

  const normalizedBase =
    base
      .replace(/[^a-z0-9]/gi, '')
      .toLowerCase();

  const normalizedStem =
    moduleStem
      .replace(/[^a-z0-9]/gi, '')
      .toLowerCase();

  /*
   * Filename evidence: weaker than behavioral evidence.
   */
  if (
    normalizedBase === normalizedStem
  ) {
    score += 25;
    evidence.push(
      'same normalized filename'
    );
  }

  if (
    normalizedBase.includes(
      normalizedStem.replace(
        /(service|routes?)$/,
        ''
      )
    )
  ) {
    score += 6;
    evidence.push(
      'related filename stem'
    );
  }

  /*
   * Behavioral method evidence.
   */
  for (const method of expectedMethods) {
    const methodPatterns = [
      new RegExp(
        `\\b${escapeRegex(method)}\\s*[:=]\\s*(?:async\\s*)?(?:function|\\([^)]*\\)\\s*=>|async\\s*\\([^)]*\\)\\s*=>)`
      ),
      new RegExp(
        `\\b(?:async\\s+)?${escapeRegex(method)}\\s*\\(`
      ),
      new RegExp(
        `\\bexports\\.${escapeRegex(method)}\\b`
      ),
      new RegExp(
        `\\bmodule\\.exports\\b[\\s\\S]{0,1000}\\b${escapeRegex(method)}\\b`
      )
    ];

    if (
      methodPatterns.some(
        re => re.test(
          corpusItem.text
        )
      )
    ) {
      score += 18;
      evidence.push(
        `method:${method}`
      );
    } else if (
      corpusItem.text.includes(
        method
      )
    ) {
      score += 4;
      evidence.push(
        `token:${method}`
      );
    }
  }

  /*
   * Route/path evidence.
   */
  for (const apiPath of apiPaths) {
    if (
      corpusItem.text.includes(
        apiPath
      )
    ) {
      score += 12;
      evidence.push(
        `route:${apiPath}`
      );
    }
  }

  /*
   * Prefer actual service/route locations when appropriate.
   */
  if (
    corpusItem.rel.includes(
      '/services/'
    )
  ) {
    score += 2;
  }

  if (
    corpusItem.rel.includes(
      '/routes/'
    )
  ) {
    score += 2;
  }

  return {
    score,
    evidence
  };
}

function main() {
  fs.mkdirSync(
    OUT,
    { recursive: true }
  );

  console.log('');
  console.log(
    '============================================================'
  );
  console.log(
    ' PHASE 13S-8B - STALE TEST SEMANTIC MAPPING'
  );
  console.log(
    '============================================================'
  );

  if (
    !fs.existsSync(
      TARGET_TEST
    )
  ) {
    fail(
      `Target test missing: ${TARGET_TEST}`
    );
  }

  /*
   * Verify this audit itself does not alter backend/src.
   */
  const sourceStatusBefore =
    git([
      'status',
      '--porcelain',
      '--',
      'backend/src'
    ]);

  if (
    sourceStatusBefore.status !== 0
  ) {
    fail(
      sourceStatusBefore.stderr ||
      'Unable to capture initial backend/src Git state.'
    );
  }

  const targetText =
    read(TARGET_TEST);

  const imports =
    parseRelativeImports(
      targetText
    );

  const brokenInTarget =
    imports.filter(
      item =>
        !resolveRelative(
          TARGET_TEST,
          item.specifier
        )
    );

  console.log(
    `critical-phase1 relative imports       : ${imports.length}`
  );

  console.log(
    `critical-phase1 broken imports         : ${brokenInTarget.length}`
  );

  /*
   * Full test-suite broken import census so the fourth case
   * is explicitly identified.
   */
  const allBroken =
    scanBrokenImports();

  console.log(
    `All broken relative test imports       : ${allBroken.length}`
  );

  console.log('');
  console.log(
    '[COMPLETE BROKEN IMPORT CENSUS]'
  );

  for (const item of allBroken) {
    console.log(
      `${item.file}:${item.line}`
    );

    console.log(
      `  ${item.specifier}`
    );

    console.log(
      `  bindings: ${
        item.bindings.length
          ? item.bindings.join(', ')
          : '(none)'
      }`
    );
  }

  const corpus =
    buildProductionCorpus();

  console.log('');
  console.log(
    `Production source files searched       : ${corpus.length}`
  );

  const mappings = [];

  for (
    const item of brokenInTarget
  ) {
    const line =
      lineNumber(
        targetText,
        item.index
      );

    const moduleStem =
      path.basename(
        item.specifier
      );

    const bindingEvidence = [];

    for (
      const binding of
      item.localBindings || []
    ) {
      bindingEvidence.push({
        binding,
        usage:
          usagesForBinding(
            targetText,
            binding
          )
      });
    }

    const expectedMethods =
      [
        ...new Set(
          bindingEvidence.flatMap(
            x =>
              x.usage.memberAccesses
          )
        )
      ];

    /*
     * Named destructuring itself is behavioral evidence.
     */
    if (
      item.namedBindings
    ) {
      for (
        const named of
        item.namedBindings
      ) {
        expectedMethods.push(
          named.imported
        );
      }
    }

    const uniqueMethods =
      [...new Set(
        expectedMethods
      )];

    /*
     * Get test block context around import/use and collect
     * API paths from the entire test. Ranking will strongly
     * prefer paths that appear in candidate route files.
     */
    const apiPaths =
      extractApiPaths(
        targetText
      );

    const httpMethods =
      extractHttpMethodsNearby(
        targetText
      );

    const candidates =
      corpus
        .map(source => {
          const ev =
            candidateEvidence(
              source,
              uniqueMethods,
              apiPaths,
              moduleStem
            );

          return {
            file:
              source.rel,
            score:
              ev.score,
            evidence:
              ev.evidence
          };
        })
        .filter(
          x => x.score > 0
        )
        .sort(
          (a, b) =>
            b.score - a.score ||
            a.file.localeCompare(
              b.file
            )
        )
        .slice(
          0,
          20
        );

    mappings.push({
      import: {
        line,
        specifier:
          item.specifier,
        kind:
          item.kind,
        bindings:
          item.localBindings || []
      },
      bindingEvidence,
      expectedMethods:
        uniqueMethods,
      apiPaths,
      httpMethods,
      candidates
    });

    console.log('');
    console.log(
      '------------------------------------------------------------'
    );

    console.log(
      `BROKEN IMPORT: ${item.specifier}`
    );

    console.log(
      `Line         : ${line}`
    );

    console.log(
      `Binding(s)   : ${
        (item.localBindings || []).join(', ') ||
        '(none)'
      }`
    );

    console.log(
      `Expected API : ${
        uniqueMethods.join(', ') ||
        '(no member methods detected)'
      }`
    );

    console.log('');
    console.log(
      '[IMPORT CONTEXT]'
    );

    console.log(
      getLineWindow(
        targetText,
        line,
        7
      )
    );

    console.log('');
    console.log(
      '[BINDING USAGE]'
    );

    for (
      const evidence of
      bindingEvidence
    ) {
      console.log(
        `${evidence.binding}: refs=${evidence.usage.references}, directCalls=${evidence.usage.directCalls}, members=${evidence.usage.memberAccesses.join(', ') || '(none)'}`
      );
    }

    console.log('');
    console.log(
      '[TOP PRODUCTION CANDIDATES]'
    );

    if (!candidates.length) {
      console.log(
        '  NONE'
      );
    }

    for (
      const candidate of candidates
    ) {
      console.log(
        `  score=${String(candidate.score).padStart(3)}  ${candidate.file}`
      );

      console.log(
        `       ${candidate.evidence.join(', ')}`
      );
    }
  }

  /*
   * Generate a compact behavioral token cross-reference.
   */
  const allExpectedMethods =
    [
      ...new Set(
        mappings.flatMap(
          x => x.expectedMethods
        )
      )
    ];

  const tokenCrossReference = {};

  for (
    const token of
    allExpectedMethods
  ) {
    tokenCrossReference[token] =
      corpus
        .filter(
          source =>
            source.text.includes(
              token
            )
        )
        .map(
          source =>
            source.rel
        )
        .slice(
          0,
          100
        );
  }

  /*
   * Save evidence.
   */
  fs.writeFileSync(
    path.join(
      OUT,
      'semantic-mapping.json'
    ),
    JSON.stringify(
      {
        targetTest:
          rel(TARGET_TEST),

        allBrokenRelativeTestImports:
          allBroken.map(
            item => ({
              file:
                item.file,
              line:
                item.line,
              specifier:
                item.specifier,
              bindings:
                item.bindings
            })
          ),

        targetMappings:
          mappings,

        behavioralTokenCrossReference:
          tokenCrossReference
      },
      null,
      2
    ),
    'utf8'
  );

  const humanReport = [];

  humanReport.push(
    'PHASE 13S-8B - STALE TEST SEMANTIC MAPPING'
  );

  humanReport.push(
    '='.repeat(60)
  );

  humanReport.push(
    `Target: ${rel(TARGET_TEST)}`
  );

  humanReport.push(
    `Total broken test imports: ${allBroken.length}`
  );

  humanReport.push('');

  for (
    const mapping of mappings
  ) {
    humanReport.push(
      `BROKEN: ${mapping.import.specifier}`
    );

    humanReport.push(
      `Line: ${mapping.import.line}`
    );

    humanReport.push(
      `Bindings: ${mapping.import.bindings.join(', ') || '(none)'}`
    );

    humanReport.push(
      `Expected methods: ${mapping.expectedMethods.join(', ') || '(none detected)'}`
    );

    humanReport.push(
      'Candidates:'
    );

    for (
      const candidate of
      mapping.candidates.slice(
        0,
        10
      )
    ) {
      humanReport.push(
        `  ${candidate.score} | ${candidate.file} | ${candidate.evidence.join(', ')}`
      );
    }

    humanReport.push('');
  }

  fs.writeFileSync(
    path.join(
      OUT,
      'semantic-mapping.txt'
    ),
    humanReport.join('\n'),
    'utf8'
  );

  /*
   * Confirm backend/src Git state is byte-for-byte equivalent
   * from Git's perspective before vs after.
   */
  const sourceStatusAfter =
    git([
      'status',
      '--porcelain',
      '--',
      'backend/src'
    ]);

  if (
    sourceStatusAfter.status !== 0
  ) {
    fail(
      sourceStatusAfter.stderr ||
      'Unable to capture final backend/src Git state.'
    );
  }

  if (
    sourceStatusAfter.stdout !==
    sourceStatusBefore.stdout
  ) {
    fail(
      'backend/src Git state changed during read-only audit.'
    );
  }

  console.log('');
  console.log(
    '============================================================'
  );

  console.log(
    ' SEMANTIC MAPPING AUDIT COMPLETE'
  );

  console.log(
    '============================================================'
  );

  console.log(
    `Broken relative test imports            : ${allBroken.length}`
  );

  console.log(
    `Broken imports in critical-phase1       : ${brokenInTarget.length}`
  );

  console.log(
    `Behavioral method tokens identified     : ${allExpectedMethods.length}`
  );

  console.log(
    'backend/src Git state changed           : NO'
  );

  console.log(
    'APPLICATION SOURCE MODIFIED             : NO'
  );

  console.log(
    'TEST SOURCE MODIFIED                    : NO'
  );

  console.log(
    `Evidence                               : ${OUT}`
  );

  process.exitCode = 0;
}

try {
  main();
} catch (error) {
  console.error('');
  console.error(
    '============================================================'
  );

  console.error(
    ' SEMANTIC MAPPING AUDIT FAILED'
  );

  console.error(
    '============================================================'
  );

  console.error(
    error.stack ||
    error.message ||
    String(error)
  );

  console.error(
    'APPLICATION SOURCE MODIFIED             : NO'
  );

  console.error(
    'TEST SOURCE MODIFIED                    : NO'
  );

  process.exitCode = 1;
}
