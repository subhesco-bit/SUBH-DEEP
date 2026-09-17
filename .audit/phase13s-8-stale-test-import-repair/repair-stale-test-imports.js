const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = process.cwd();
const BACKEND = path.join(ROOT, 'backend');
const SRC = path.join(BACKEND, 'src');
const OUT = path.join(
  ROOT,
  '.audit',
  'phase13s-8-stale-test-import-repair'
);

const TEST_HINTS = [
  '.test.',
  '.spec.',
  '__tests__',
  '/tests/',
  '\\tests\\',
  '/test/',
  '\\test\\'
];

const SOURCE_EXTS = [
  '.js',
  '.cjs',
  '.mjs',
  '.ts'
];

const KNOWN_STALE = new Set([
  'marketplaceService',
  'financeService',
  'marketplaceRoutes'
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
        entry.name === 'coverage' ||
        entry.name === '.audit'
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

function isTestFile(file) {
  const normalized =
    file.replace(/\\/g, '/');

  return TEST_HINTS.some(
    hint =>
      normalized.includes(
        hint.replace(/\\/g, '/')
      )
  );
}

function isSourceFile(file) {
  return SOURCE_EXTS.includes(
    path.extname(file).toLowerCase()
  );
}

function resolveRelative(fromFile, specifier) {
  const base = path.resolve(
    path.dirname(fromFile),
    specifier
  );

  const candidates = [
    base,
    ...SOURCE_EXTS.map(
      ext => base + ext
    ),
    ...SOURCE_EXTS.map(
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

function parseRelativeImports(text) {
  const results = [];

  const patterns = [
    {
      type: 'require',
      regex:
        /require\(\s*(['"])(\.[^'"]+)\1\s*\)/g
    },
    {
      type: 'import-from',
      regex:
        /(?:import|export)\s+[\s\S]*?\sfrom\s*(['"])(\.[^'"]+)\1/g
    },
    {
      type: 'side-effect-import',
      regex:
        /import\s*(['"])(\.[^'"]+)\1/g
    }
  ];

  for (const item of patterns) {
    let match;

    item.regex.lastIndex = 0;

    while (
      (match =
        item.regex.exec(text)) !== null
    ) {
      const specifier = match[2];

      results.push({
        type: item.type,
        specifier,
        start: match.index,
        full: match[0]
      });

      if (
        item.regex.lastIndex ===
        match.index
      ) {
        item.regex.lastIndex++;
      }
    }
  }

  return results;
}

function moduleStem(specifier) {
  let value =
    path.basename(specifier);

  value =
    value.replace(
      /\.(js|cjs|mjs|ts)$/i,
      ''
    );

  return value;
}

function normalizedStem(value) {
  return String(value)
    .replace(
      /\.(js|cjs|mjs|ts)$/i,
      ''
    )
    .replace(
      /[^a-z0-9]/gi,
      ''
    )
    .toLowerCase();
}

function buildSourceIndex() {
  const files =
    walk(SRC)
      .filter(isSourceFile)
      .filter(
        file =>
          !isTestFile(file)
      );

  return files.map(file => ({
    file,
    rel: rel(file),
    basename:
      path.basename(
        file,
        path.extname(file)
      ),
    normalized:
      normalizedStem(
        path.basename(
          file,
          path.extname(file)
        )
      )
  }));
}

function candidateScore(
  broken,
  candidate
) {
  const stem =
    moduleStem(
      broken.specifier
    );

  const normalized =
    normalizedStem(stem);

  let score = 0;

  if (
    candidate.basename === stem
  ) {
    score += 100;
  }

  if (
    candidate.basename.toLowerCase() ===
    stem.toLowerCase()
  ) {
    score += 95;
  }

  if (
    candidate.normalized ===
    normalized
  ) {
    score += 90;
  }

  /*
   * Permit legacy/platform relocation only when the module
   * identity itself is still exact.
   */
  if (
    candidate.rel.includes('/legacy/')
  ) {
    score += 1;
  }

  if (
    candidate.rel.includes('/platform/')
  ) {
    score += 1;
  }

  return score;
}

function relativeSpecifier(
  fromFile,
  targetFile
) {
  let spec =
    path.relative(
      path.dirname(fromFile),
      targetFile
    )
      .replace(/\\/g, '/')
      .replace(
        /\.(js|cjs|mjs|ts)$/i,
        ''
      );

  if (
    !spec.startsWith('.')
  ) {
    spec = './' + spec;
  }

  return spec;
}

function replaceSpecifier(
  text,
  oldSpecifier,
  newSpecifier
) {
  const escaped =
    oldSpecifier.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );

  const regex =
    new RegExp(
      `(['"])${escaped}\\1`,
      'g'
    );

  let count = 0;

  const replaced =
    text.replace(
      regex,
      (full, quote) => {
        count++;

        return (
          quote +
          newSpecifier +
          quote
        );
      }
    );

  return {
    text: replaced,
    count
  };
}

function syntaxCheck(file) {
  if (
    path.extname(file).toLowerCase() ===
    '.ts'
  ) {
    return;
  }

  const result =
    run(
      process.execPath,
      [
        '--check',
        file
      ]
    );

  if (
    result.status !== 0
  ) {
    console.error(
      result.stdout || ''
    );

    console.error(
      result.stderr || ''
    );

    fail(
      `Syntax failed: ${rel(file)}`
    );
  }
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
    ' PHASE 13S-8 - STALE TEST IMPORT RECTIFICATION'
  );
  console.log(
    '============================================================'
  );

  const sourceIndex =
    buildSourceIndex();

  const testFiles =
    walk(BACKEND)
      .filter(isSourceFile)
      .filter(isTestFile);

  console.log(
    `Backend test/spec source files scanned : ${testFiles.length}`
  );

  console.log(
    `Backend production source candidates   : ${sourceIndex.length}`
  );

  const broken = [];

  for (const file of testFiles) {
    let text;

    try {
      text =
        fs.readFileSync(
          file,
          'utf8'
        );
    } catch {
      continue;
    }

    const imports =
      parseRelativeImports(text);

    for (const item of imports) {
      const resolved =
        resolveRelative(
          file,
          item.specifier
        );

      if (resolved) {
        continue;
      }

      broken.push({
        file,
        fileRel: rel(file),
        ...item,
        stem:
          moduleStem(
            item.specifier
          )
      });
    }
  }

  console.log(
    `Broken relative test imports found     : ${broken.length}`
  );

  const knownBroken =
    broken.filter(
      item =>
        KNOWN_STALE.has(
          item.stem
        )
    );

  console.log(
    `Known stale-name imports found         : ${knownBroken.length}`
  );

  const resolutions = [];
  const ambiguous = [];
  const unresolved = [];

  for (const item of broken) {
    const scored =
      sourceIndex
        .map(candidate => ({
          ...candidate,
          score:
            candidateScore(
              item,
              candidate
            )
        }))
        .filter(
          candidate =>
            candidate.score >= 90
        )
        .sort(
          (a, b) =>
            b.score - a.score ||
            a.rel.localeCompare(
              b.rel
            )
        );

    if (!scored.length) {
      unresolved.push({
        ...item,
        candidates: []
      });

      continue;
    }

    const topScore =
      scored[0].score;

    const top =
      scored.filter(
        candidate =>
          candidate.score ===
          topScore
      );

    if (top.length !== 1) {
      ambiguous.push({
        ...item,
        candidates:
          top.map(
            c => c.rel
          )
      });

      continue;
    }

    resolutions.push({
      ...item,
      target:
        top[0].file,
      targetRel:
        top[0].rel,
      score:
        top[0].score,
      newSpecifier:
        relativeSpecifier(
          item.file,
          top[0].file
        )
    });
  }

  fs.writeFileSync(
    path.join(
      OUT,
      'pre-repair-resolution.json'
    ),
    JSON.stringify(
      {
        broken:
          broken.map(
            item => ({
              file:
                item.fileRel,
              specifier:
                item.specifier,
              stem:
                item.stem
            })
          ),

        resolutions:
          resolutions.map(
            item => ({
              file:
                item.fileRel,
              from:
                item.specifier,
              to:
                item.newSpecifier,
              target:
                item.targetRel,
              score:
                item.score
            })
          ),

        ambiguous:
          ambiguous.map(
            item => ({
              file:
                item.fileRel,
              specifier:
                item.specifier,
              candidates:
                item.candidates
            })
          ),

        unresolved:
          unresolved.map(
            item => ({
              file:
                item.fileRel,
              specifier:
                item.specifier
            })
          )
      },
      null,
      2
    ),
    'utf8'
  );

  console.log(
    `Unambiguous repairs available          : ${resolutions.length}`
  );

  console.log(
    `Ambiguous imports                      : ${ambiguous.length}`
  );

  console.log(
    `No-candidate imports                   : ${unresolved.length}`
  );

  console.log('');
  console.log(
    '[KNOWN STALE IMPORT CLASSIFICATION]'
  );

  for (const name of KNOWN_STALE) {
    const matches =
      broken.filter(
        item =>
          item.stem === name
      );

    const repaired =
      resolutions.filter(
        item =>
          item.stem === name
      );

    const amb =
      ambiguous.filter(
        item =>
          item.stem === name
      );

    const miss =
      unresolved.filter(
        item =>
          item.stem === name
      );

    console.log(
      `${name.padEnd(24)} broken=${matches.length} repairable=${repaired.length} ambiguous=${amb.length} unresolved=${miss.length}`
    );

    for (const item of repaired) {
      console.log(
        `  ${item.fileRel}`
      );

      console.log(
        `    ${item.specifier} -> ${item.newSpecifier}`
      );

      console.log(
        `    target: ${item.targetRel}`
      );
    }
  }

  /*
   * Do not guess.
   *
   * If any of the THREE known stale module identities are
   * ambiguous or have no canonical same-identity candidate,
   * stop before modifying application/test source.
   */
  const unsafeKnown =
    [
      ...ambiguous,
      ...unresolved
    ].filter(
      item =>
        KNOWN_STALE.has(
          item.stem
        )
    );

  if (
    unsafeKnown.length
  ) {
    console.log('');
    console.log(
      '============================================================'
    );

    console.log(
      ' SAFETY STOP - KNOWN STALE IMPORTS NEED MANUAL MAPPING'
    );

    console.log(
      '============================================================'
    );

    for (const item of unsafeKnown) {
      console.log(
        `${item.fileRel}`
      );

      console.log(
        `  broken: ${item.specifier}`
      );

      if (
        item.candidates &&
        item.candidates.length
      ) {
        console.log(
          `  candidates: ${item.candidates.join(', ')}`
        );
      }

      if (
        !item.candidates ||
        !item.candidates.length
      ) {
        console.log(
          '  canonical same-identity candidate: NONE'
        );
      }
    }

    console.log('');
    console.log(
      'APPLICATION SOURCE MODIFIED            : NO'
    );

    console.log(
      'TEST SOURCE MODIFIED                   : NO'
    );

    console.log(
      'BATCH 5 STALE TEST IMPORT REPAIR       : NOT YET ACCEPTED'
    );

    console.log(
      `Evidence                              : ${OUT}`
    );

    process.exitCode = 2;
    return;
  }

  if (
    resolutions.length === 0
  ) {
    console.log('');
    console.log(
      'No unambiguous stale relative imports require repair.'
    );

    console.log(
      'APPLICATION SOURCE MODIFIED            : NO'
    );

    process.exitCode = 0;
    return;
  }

  /*
   * Determine exact files that would be modified.
   */
  const targetFiles =
    [
      ...new Set(
        resolutions.map(
          item =>
            item.file
        )
      )
    ];

  const targetRel =
    targetFiles.map(rel);

  /*
   * Preserve previous accepted work.
   * Only test files selected here must be Git-clean.
   */
  const preStatus =
    git([
      'status',
      '--porcelain',
      '--',
      ...targetRel
    ]);

  if (
    preStatus.status !== 0
  ) {
    fail(
      preStatus.stderr ||
      'git status failed'
    );
  }

  if (
    preStatus.stdout.trim()
  ) {
    console.error(
      preStatus.stdout
    );

    fail(
      'Target stale-test files already contain user changes. Safety stop.'
    );
  }

  console.log(
    'Repair target test files Git-clean     : PASS'
  );

  const snapshots =
    new Map();

  for (const file of targetFiles) {
    snapshots.set(
      file,
      fs.readFileSync(file)
    );
  }

  let modified = false;

  try {
    /*
     * Group repairs per test file.
     */
    const perFile =
      new Map();

    for (const item of resolutions) {
      if (
        !perFile.has(
          item.file
        )
      ) {
        perFile.set(
          item.file,
          []
        );
      }

      perFile
        .get(item.file)
        .push(item);
    }

    let replacementCount = 0;

    for (
      const [
        file,
        items
      ] of perFile.entries()
    ) {
      let text =
        fs.readFileSync(
          file,
          'utf8'
        );

      for (const item of items) {
        const replaced =
          replaceSpecifier(
            text,
            item.specifier,
            item.newSpecifier
          );

        if (
          replaced.count < 1
        ) {
          fail(
            `Could not replace ${item.specifier} in ${item.fileRel}`
          );
        }

        text =
          replaced.text;

        replacementCount +=
          replaced.count;
      }

      fs.writeFileSync(
        file,
        text,
        'utf8'
      );
    }

    modified = true;

    console.log(
      `Import references rewritten            : ${replacementCount}`
    );

    /*
     * Authoritative post-repair resolution.
     */
    let remainingBroken = [];

    for (const file of targetFiles) {
      const text =
        fs.readFileSync(
          file,
          'utf8'
        );

      for (
        const item of
        parseRelativeImports(text)
      ) {
        if (
          !resolveRelative(
            file,
            item.specifier
          )
        ) {
          remainingBroken.push({
            file:
              rel(file),
            specifier:
              item.specifier
          });
        }
      }
    }

    if (
      remainingBroken.length
    ) {
      console.error(
        JSON.stringify(
          remainingBroken,
          null,
          2
        )
      );

      fail(
        'Broken relative imports remain in repaired test files.'
      );
    }

    console.log(
      'Repaired test-file local imports       : ALL RESOLVABLE'
    );

    /*
     * Syntax.
     */
    for (const file of targetFiles) {
      syntaxCheck(file);
    }

    console.log(
      `Syntax checks                         : PASS (${targetFiles.length} files)`
    );

    /*
     * ESLint.
     */
    const eslint =
      path.join(
        BACKEND,
        'node_modules',
        'eslint',
        'bin',
        'eslint.js'
      );

    if (
      fs.existsSync(eslint)
    ) {
      const lint =
        run(
          process.execPath,
          [
            eslint,
            ...targetFiles
          ],
          {
            cwd: ROOT,
            env: {
              NODE_OPTIONS:
                '--max-old-space-size=3072'
            }
          }
        );

      if (
        lint.status !== 0
      ) {
        console.error(
          lint.stdout || ''
        );

        console.error(
          lint.stderr || ''
        );

        fail(
          'Targeted stale-test ESLint failed.'
        );
      }

      console.log(
        'Targeted ESLint                       : PASS'
      );
    }

    if (
      !fs.existsSync(eslint)
    ) {
      console.log(
        'Targeted ESLint                       : SKIPPED - local binary unavailable'
      );
    }

    /*
     * Git diff quality.
     */
    const diffCheck =
      git([
        'diff',
        '--check',
        '--',
        ...targetRel
      ]);

    if (
      diffCheck.status !== 0
    ) {
      console.error(
        diffCheck.stdout || ''
      );

      console.error(
        diffCheck.stderr || ''
      );

      fail(
        'git diff --check failed.'
      );
    }

    console.log(
      'git diff --check                      : PASS'
    );

    /*
     * Exact target scope.
     */
    const finalStatus =
      git([
        'status',
        '--porcelain',
        '--',
        ...targetRel
      ]);

    if (
      finalStatus.status !== 0
    ) {
      fail(
        finalStatus.stderr ||
        'Final git status failed.'
      );
    }

    const changed =
      finalStatus.stdout
        .split(/\r?\n/)
        .filter(Boolean);

    if (
      changed.length !==
      targetFiles.length
    ) {
      fail(
        `Expected ${targetFiles.length} modified test files; Git reports ${changed.length}`
      );
    }

    console.log(
      `Exact test-file modification scope    : PASS (${changed.length} files)`
    );

    /*
     * Optional narrow backend test execution.
     *
     * Do not run the full 785-file suite blindly.
     * Use package test command only if it supports explicit
     * file arguments through npm -- ... .
     */
    const packageJson =
      path.join(
        BACKEND,
        'package.json'
      );

    let testCommandStatus =
      'NOT RUN';

    if (
      fs.existsSync(
        packageJson
      )
    ) {
      const pkg =
        JSON.parse(
          fs.readFileSync(
            packageJson,
            'utf8'
          )
        );

      if (
        pkg.scripts &&
        pkg.scripts.test
      ) {
        const relativeToBackend =
          targetFiles.map(
            file =>
              path
                .relative(
                  BACKEND,
                  file
                )
                .replace(
                  /\\/g,
                  '/'
                )
          );

        const quoted =
          relativeToBackend
            .map(
              file =>
                `"${file.replace(/"/g, '\\"')}"`
            )
            .join(' ');

        const test =
          run(
            'cmd.exe',
            [
              '/d',
              '/s',
              '/c',
              `npm test -- ${quoted}`
            ],
            {
              cwd: BACKEND,
              env: {
                NODE_OPTIONS:
                  '--max-old-space-size=3072'
              }
            }
          );

        fs.writeFileSync(
          path.join(
            OUT,
            'targeted-test.stdout.log'
          ),
          test.stdout || '',
          'utf8'
        );

        fs.writeFileSync(
          path.join(
            OUT,
            'targeted-test.stderr.log'
          ),
          test.stderr || '',
          'utf8'
        );

        if (
          test.status !== 0
        ) {
          console.error(
            test.stdout || ''
          );

          console.error(
            test.stderr || ''
          );

          fail(
            `Targeted backend test execution failed with code ${test.status}`
          );
        }

        testCommandStatus =
          'PASS';

        console.log(
          'Targeted backend tests                : PASS'
        );
      }
    }

    /*
     * Evidence.
     */
    const diff =
      git([
        'diff',
        '--',
        ...targetRel
      ]);

    fs.writeFileSync(
      path.join(
        OUT,
        'accepted-diff.patch'
      ),
      diff.stdout || '',
      'utf8'
    );

    fs.writeFileSync(
      path.join(
        OUT,
        'accepted-status.txt'
      ),
      finalStatus.stdout || '',
      'utf8'
    );

    fs.writeFileSync(
      path.join(
        OUT,
        'repair-summary.json'
      ),
      JSON.stringify(
        {
          brokenImportsInitially:
            broken.length,

          knownStaleImports:
            knownBroken.length,

          repairedMappings:
            resolutions.map(
              item => ({
                file:
                  item.fileRel,
                from:
                  item.specifier,
                to:
                  item.newSpecifier,
                target:
                  item.targetRel
              })
            ),

          ambiguousLeftUntouched:
            ambiguous.length,

          unresolvedLeftUntouched:
            unresolved.length,

          modifiedTestFiles:
            targetRel,

          targetedTests:
            testCommandStatus
        },
        null,
        2
      ),
      'utf8'
    );

    console.log('');
    console.log(
      '============================================================'
    );

    console.log(
      ' BATCH 5 STALE TEST IMPORT REPAIR ACCEPTED'
    );

    console.log(
      '============================================================'
    );

    console.log(
      `Broken imports discovered             : ${broken.length}`
    );

    console.log(
      `Unambiguous imports repaired          : ${resolutions.length}`
    );

    console.log(
      `Modified test files                   : ${targetFiles.length}`
    );

    console.log(
      'Repaired imports resolvable           : YES'
    );

    console.log(
      `Ambiguous unrelated imports untouched : ${ambiguous.length}`
    );

    console.log(
      `Unresolved unrelated imports untouched: ${unresolved.length}`
    );

    console.log(
      `Evidence                              : ${OUT}`
    );

    process.exitCode = 0;

  } catch (error) {
    console.error('');
    console.error(
      '============================================================'
    );

    console.error(
      ' BATCH 5 VALIDATION FAILED - ROLLBACK'
    );

    console.error(
      '============================================================'
    );

    console.error(
      error.stack ||
      error.message ||
      String(error)
    );

    if (modified) {
      for (
        const [
          file,
          bytes
        ] of snapshots.entries()
      ) {
        fs.writeFileSync(
          file,
          bytes
        );
      }
    }

    let rollbackPass = true;

    for (
      const [
        file,
        bytes
      ] of snapshots.entries()
    ) {
      const current =
        fs.readFileSync(file);

      if (
        !current.equals(bytes)
      ) {
        rollbackPass = false;

        console.error(
          `ROLLBACK MISMATCH: ${rel(file)}`
        );
      }
    }

    console.error(
      `Byte-for-byte rollback                : ${rollbackPass}`
    );

    console.error(
      'BATCH 5 STALE TEST IMPORT REPAIR     : NOT ACCEPTED'
    );

    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error('');
  console.error(
    '============================================================'
  );

  console.error(
    ' PRE-MODIFICATION SAFETY STOP'
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
    'BATCH 5 STALE TEST IMPORT REPAIR       : NOT ACCEPTED'
  );

  process.exitCode = 1;
}
