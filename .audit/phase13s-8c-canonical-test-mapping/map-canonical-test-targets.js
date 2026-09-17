const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = process.cwd();
const BACKEND = path.join(ROOT, 'backend');
const SRC = path.join(BACKEND, 'src');
const OUT = path.join(
  ROOT,
  '.audit',
  'phase13s-8c-canonical-test-mapping'
);

const CRITICAL = path.join(
  SRC,
  '__tests__',
  'critical-phase1.test.js'
);

const LIBTEST = path.join(
  SRC,
  'tests',
  'libraryKnowledgeService.test.js'
);

const SOURCE_EXTS = new Set([
  '.js',
  '.cjs',
  '.mjs',
  '.ts'
]);

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

function isSource(file) {
  return SOURCE_EXTS.has(
    path.extname(file).toLowerCase()
  );
}

function read(file) {
  return fs.readFileSync(
    file,
    'utf8'
  );
}

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    '\\$&'
  );
}

function lineNumber(text, index) {
  return text
    .slice(0, index)
    .split(/\r?\n/)
    .length;
}

function findRequireSites(files, needle) {
  const hits = [];

  for (const file of files) {
    let text;

    try {
      text = read(file);
    } catch {
      continue;
    }

    const re =
      new RegExp(
        `require\\(\\s*['"][^'"]*${escapeRegex(needle)}[^'"]*['"]\\s*\\)`,
        'gi'
      );

    let m;

    while (
      (m = re.exec(text)) !== null
    ) {
      hits.push({
        file: rel(file),
        line: lineNumber(
          text,
          m.index
        ),
        match: m[0]
      });
    }
  }

  return hits;
}

function findTextSites(files, tokens) {
  const results = [];

  for (const file of files) {
    let text;

    try {
      text = read(file);
    } catch {
      continue;
    }

    const matched = [];

    for (const token of tokens) {
      if (
        text.toLowerCase().includes(
          token.toLowerCase()
        )
      ) {
        matched.push(token);
      }
    }

    if (matched.length) {
      results.push({
        file: rel(file),
        matched
      });
    }
  }

  return results;
}

function extractAppUseSites(files) {
  const hits = [];

  const patterns = [
    /\bapp\.use\s*\(/g,
    /\brouter\.use\s*\(/g
  ];

  for (const file of files) {
    let text;

    try {
      text = read(file);
    } catch {
      continue;
    }

    for (const re of patterns) {
      re.lastIndex = 0;

      let m;

      while (
        (m = re.exec(text)) !== null
      ) {
        const start =
          Math.max(
            0,
            m.index - 200
          );

        const end =
          Math.min(
            text.length,
            m.index + 500
          );

        const context =
          text.slice(
            start,
            end
          );

        if (
          /marketplace|finance/i.test(
            context
          )
        ) {
          hits.push({
            file: rel(file),
            line:
              lineNumber(
                text,
                m.index
              ),
            context:
              context
                .replace(/\r?\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
          });
        }
      }
    }
  }

  return hits;
}

function extractExports(text) {
  const exports = new Set();

  let m;

  const direct =
    /\bexports\.([A-Za-z_$][\w$]*)\s*=/g;

  while (
    (m = direct.exec(text)) !== null
  ) {
    exports.add(m[1]);
  }

  const moduleObject =
    /module\.exports\s*=\s*\{([\s\S]{0,3000}?)\}/g;

  while (
    (m = moduleObject.exec(text)) !== null
  ) {
    const body = m[1];

    const tokenRe =
      /\b([A-Za-z_$][\w$]*)\b\s*(?:,|:)/g;

    let t;

    while (
      (t = tokenRe.exec(body)) !== null
    ) {
      exports.add(t[1]);
    }
  }

  return [...exports];
}

function resolveRelative(fromFile, specifier) {
  const base =
    path.resolve(
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

function candidatesByName(files, regex) {
  return files
    .filter(
      file =>
        regex.test(
          path.basename(file)
        )
    )
    .map(file => {
      const text = read(file);

      return {
        file: rel(file),
        exports:
          extractExports(text)
      };
    });
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
    ' PHASE 13S-8C - CANONICAL TEST TARGET MAPPING'
  );
  console.log(
    '============================================================'
  );

  if (
    !fs.existsSync(CRITICAL)
  ) {
    fail(
      `Missing test: ${CRITICAL}`
    );
  }

  if (
    !fs.existsSync(LIBTEST)
  ) {
    fail(
      `Missing test: ${LIBTEST}`
    );
  }

  const statusBefore =
    git([
      'status',
      '--porcelain',
      '--',
      'backend/src'
    ]);

  if (
    statusBefore.status !== 0
  ) {
    fail(
      statusBefore.stderr ||
      'Unable to capture backend/src state.'
    );
  }

  const files =
    walk(SRC)
      .filter(isSource);

  console.log(
    `Backend source files indexed           : ${files.length}`
  );

  /*
   * --------------------------------------------------------
   * MARKETPLACE
   * --------------------------------------------------------
   */

  const marketplaceCandidates =
    candidatesByName(
      files,
      /marketplace/i
    );

  const marketplaceRequires =
    findRequireSites(
      files,
      'marketplace'
    );

  const marketplaceText =
    findTextSites(
      files,
      [
        'marketplace',
        '/api/marketplace',
        '/marketplace'
      ]
    );

  /*
   * --------------------------------------------------------
   * FINANCE
   * --------------------------------------------------------
   */

  const financeCandidates =
    candidatesByName(
      files,
      /finance/i
    );

  const financeRequires =
    findRequireSites(
      files,
      'finance'
    );

  const financeText =
    findTextSites(
      files,
      [
        'financeService',
        '/api/finance',
        '/finance'
      ]
    );

  /*
   * --------------------------------------------------------
   * APPLICATION MOUNT / ROUTE USAGE
   * --------------------------------------------------------
   */

  const mountSites =
    extractAppUseSites(
      files
    );

  /*
   * --------------------------------------------------------
   * M645100 LIBRARY KNOWLEDGE
   * --------------------------------------------------------
   */

  const libTestText =
    read(LIBTEST);

  const brokenLibSpecifier =
    './modules/M645100_LIBRARYKNOWLEDGE/backend/service.js';

  const libCurrentResolution =
    resolveRelative(
      LIBTEST,
      brokenLibSpecifier
    );

  const libraryCandidates =
    files
      .filter(file =>
        /M645100_LIBRARYKNOWLEDGE|libraryKnowledge/i.test(
          rel(file)
        )
      )
      .map(file => ({
        file: rel(file),
        exports:
          extractExports(
            read(file)
          )
      }));

  const libRequireSites =
    findRequireSites(
      files,
      'M645100_LIBRARYKNOWLEDGE'
    );

  /*
   * --------------------------------------------------------
   * PRINT REPORT
   * --------------------------------------------------------
   */

  console.log('');
  console.log(
    '[MARKETPLACE CANDIDATE FILES]'
  );

  for (const item of marketplaceCandidates) {
    console.log(
      `${item.file}`
    );

    console.log(
      `  exports: ${
        item.exports.length
          ? item.exports.join(', ')
          : '(none detected)'
      }`
    );
  }

  console.log('');
  console.log(
    '[MARKETPLACE REQUIRE / IMPORT EVIDENCE]'
  );

  for (
    const item of
    marketplaceRequires
  ) {
    console.log(
      `${item.file}:${item.line}`
    );

    console.log(
      `  ${item.match}`
    );
  }

  console.log('');
  console.log(
    '[FINANCE CANDIDATE FILES]'
  );

  for (const item of financeCandidates) {
    console.log(
      `${item.file}`
    );

    console.log(
      `  exports: ${
        item.exports.length
          ? item.exports.join(', ')
          : '(none detected)'
      }`
    );
  }

  console.log('');
  console.log(
    '[FINANCE REQUIRE / IMPORT EVIDENCE]'
  );

  for (
    const item of
    financeRequires
  ) {
    console.log(
      `${item.file}:${item.line}`
    );

    console.log(
      `  ${item.match}`
    );
  }

  console.log('');
  console.log(
    '[APP / ROUTER MOUNT EVIDENCE]'
  );

  for (
    const item of
    mountSites
  ) {
    console.log(
      `${item.file}:${item.line}`
    );

    console.log(
      `  ${item.context}`
    );
  }

  console.log('');
  console.log(
    '[M645100 LIBRARY KNOWLEDGE CANDIDATES]'
  );

  console.log(
    `Current broken resolution              : ${
      libCurrentResolution
        ? rel(libCurrentResolution)
        : 'NONE'
    }`
  );

  for (
    const item of
    libraryCandidates
  ) {
    console.log(
      `${item.file}`
    );

    console.log(
      `  exports: ${
        item.exports.length
          ? item.exports.join(', ')
          : '(none detected)'
      }`
    );
  }

  console.log('');
  console.log(
    '[M645100 REQUIRE EVIDENCE]'
  );

  for (
    const item of
    libRequireSites
  ) {
    console.log(
      `${item.file}:${item.line}`
    );

    console.log(
      `  ${item.match}`
    );
  }

  /*
   * --------------------------------------------------------
   * SAVE MACHINE-READABLE EVIDENCE
   * --------------------------------------------------------
   */

  const report = {
    criticalTest:
      rel(CRITICAL),

    libraryTest:
      rel(LIBTEST),

    marketplace: {
      candidates:
        marketplaceCandidates,
      requireSites:
        marketplaceRequires,
      textSites:
        marketplaceText
    },

    finance: {
      candidates:
        financeCandidates,
      requireSites:
        financeRequires,
      textSites:
        financeText
    },

    mountSites,

    libraryKnowledge: {
      brokenSpecifier:
        brokenLibSpecifier,
      currentResolution:
        libCurrentResolution
          ? rel(libCurrentResolution)
          : null,
      candidates:
        libraryCandidates,
      requireSites:
        libRequireSites
    }
  };

  fs.writeFileSync(
    path.join(
      OUT,
      'canonical-test-target-mapping.json'
    ),
    JSON.stringify(
      report,
      null,
      2
    ),
    'utf8'
  );

  const statusAfter =
    git([
      'status',
      '--porcelain',
      '--',
      'backend/src'
    ]);

  if (
    statusAfter.status !== 0
  ) {
    fail(
      statusAfter.stderr ||
      'Unable to capture final backend/src state.'
    );
  }

  if (
    statusAfter.stdout !==
    statusBefore.stdout
  ) {
    fail(
      'backend/src Git state changed during read-only mapping.'
    );
  }

  console.log('');
  console.log(
    '============================================================'
  );
  console.log(
    ' CANONICAL MAPPING COMPLETE'
  );
  console.log(
    '============================================================'
  );

  console.log(
    `Marketplace named candidates           : ${marketplaceCandidates.length}`
  );

  console.log(
    `Marketplace require/import evidence    : ${marketplaceRequires.length}`
  );

  console.log(
    `Finance named candidates               : ${financeCandidates.length}`
  );

  console.log(
    `Finance require/import evidence        : ${financeRequires.length}`
  );

  console.log(
    `Marketplace/finance mount evidence     : ${mountSites.length}`
  );

  console.log(
    `M645100 candidates                     : ${libraryCandidates.length}`
  );

  console.log(
    `M645100 require evidence               : ${libRequireSites.length}`
  );

  console.log(
    'backend/src Git state changed          : NO'
  );

  console.log(
    'APPLICATION SOURCE MODIFIED            : NO'
  );

  console.log(
    'TEST SOURCE MODIFIED                   : NO'
  );

  console.log(
    `Evidence                              : ${OUT}`
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
    ' CANONICAL MAPPING FAILED'
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
    'APPLICATION SOURCE MODIFIED            : NO'
  );

  console.error(
    'TEST SOURCE MODIFIED                   : NO'
  );

  process.exitCode = 1;
}
