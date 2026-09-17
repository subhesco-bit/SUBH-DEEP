const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = process.cwd();
const BACKEND = path.join(ROOT, 'backend');
const SRC = path.join(BACKEND, 'src');
const OUT = path.join(
  ROOT,
  '.audit',
  'phase13s-8d-stale-test-final-repair'
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

const MARKET_ROUTE = path.join(
  SRC,
  'routes',
  'ecommerceMarketplaceDomainRoutes.js'
);

const MARKET_TEST = path.join(
  SRC,
  'tests',
  'ecommerceMarketplaceRoutes.test.js'
);

const SOURCE_EXTS = [
  '.js',
  '.cjs',
  '.mjs',
  '.ts'
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
      timeout:
        options.timeout || 120000,
      killSignal: 'SIGTERM',
      env: {
        ...process.env,
        ...(options.env || {})
      },
      maxBuffer:
        100 * 1024 * 1024
    }
  );
}

function git(args) {
  return run(
    'git',
    args,
    {
      cwd: ROOT,
      timeout: 60000
    }
  );
}

function rel(file) {
  return path
    .relative(ROOT, file)
    .replace(/\\/g, '/');
}

function read(file) {
  return fs.readFileSync(
    file,
    'utf8'
  );
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

function isTestFile(file) {
  const n =
    file.replace(/\\/g, '/');

  return (
    n.includes('/__tests__/') ||
    n.includes('/tests/') ||
    n.includes('/test/') ||
    n.includes('.test.') ||
    n.includes('.spec.')
  );
}

function isSource(file) {
  return SOURCE_EXTS.includes(
    path.extname(file).toLowerCase()
  );
}

function resolveRelative(
  fromFile,
  specifier
) {
  const base =
    path.resolve(
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

  if (!spec.startsWith('.')) {
    spec = './' + spec;
  }

  return spec;
}

function parseRelativeRequires(text) {
  const results = [];

  const re =
    /require\(\s*(['"])(\.[^'"]+)\1\s*\)/g;

  let m;

  while ((m = re.exec(text)) !== null) {
    results.push({
      specifier: m[2],
      index: m.index,
      full: m[0]
    });
  }

  return results;
}

function countLiteral(text, literal) {
  return text
    .split(literal)
    .length - 1;
}

function replaceExactOnce(
  text,
  oldLiteral,
  newLiteral,
  label
) {
  const count =
    countLiteral(
      text,
      oldLiteral
    );

  if (count !== 1) {
    fail(
      `${label}: expected exactly one occurrence of ${oldLiteral}; found ${count}`
    );
  }

  return text.replace(
    oldLiteral,
    newLiteral
  );
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
      ],
      {
        cwd: ROOT,
        timeout: 60000
      }
    );

  if (
    result.error ||
    result.status !== 0
  ) {
    console.error(
      result.stdout || ''
    );

    console.error(
      result.stderr || ''
    );

    fail(
      `Syntax check failed: ${rel(file)}`
    );
  }
}

function scanBrokenTestImports() {
  const files =
    walk(SRC)
      .filter(isSource)
      .filter(isTestFile);

  const broken = [];

  for (const file of files) {
    let text;

    try {
      text = read(file);
    } catch {
      continue;
    }

    for (
      const item of
      parseRelativeRequires(text)
    ) {
      if (
        !resolveRelative(
          file,
          item.specifier
        )
      ) {
        broken.push({
          file: rel(file),
          specifier:
            item.specifier
        });
      }
    }
  }

  return broken;
}

function extractAssignedRequires(text) {
  const results = [];

  /*
   * const service = require('../x')
   */
  let re =
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*require\(\s*(['"])(\.[^'"]+)\2\s*\)/g;

  let m;

  while ((m = re.exec(text)) !== null) {
    results.push({
      binding: m[1],
      specifier: m[3]
    });
  }

  return results;
}

function discoverCanonicalMarketplaceService() {
  if (!fs.existsSync(MARKET_TEST)) {
    fail(
      `Canonical marketplace test missing: ${rel(MARKET_TEST)}`
    );
  }

  if (!fs.existsSync(MARKET_ROUTE)) {
    fail(
      `Canonical marketplace route missing: ${rel(MARKET_ROUTE)}`
    );
  }

  const testText =
    read(MARKET_TEST);

  const routeText =
    read(MARKET_ROUTE);

  /*
   * Existing canonical test demonstrably uses
   * service.getMarketplaceListings(...).
   */
  if (
    !testText.includes(
      'service.getMarketplaceListings'
    )
  ) {
    fail(
      'Canonical marketplace test no longer uses service.getMarketplaceListings.'
    );
  }

  const assigned =
    extractAssignedRequires(
      testText
    );

  const serviceBindings =
    assigned.filter(
      item =>
        item.binding ===
        'service'
    );

  if (
    serviceBindings.length !== 1
  ) {
    console.error(
      JSON.stringify(
        serviceBindings,
        null,
        2
      )
    );

    fail(
      `Expected exactly one "service = require(...)" in canonical marketplace test; found ${serviceBindings.length}`
    );
  }

  const serviceSpec =
    serviceBindings[0].specifier;

  const serviceFile =
    resolveRelative(
      MARKET_TEST,
      serviceSpec
    );

  if (!serviceFile) {
    fail(
      `Canonical marketplace test service does not resolve: ${serviceSpec}`
    );
  }

  const serviceText =
    read(serviceFile);

  /*
   * The mocked/real service identity must include the
   * marketplace method exercised by canonical HTTP contract.
   */
  if (
    !serviceText.includes(
      'getMarketplaceListings'
    ) &&
    !testText.includes(
      `jest.mock('${serviceSpec}'`
    ) &&
    !testText.includes(
      `jest.mock("${serviceSpec}"`
    )
  ) {
    fail(
      `Marketplace service candidate ${rel(serviceFile)} has no getMarketplaceListings evidence.`
    );
  }

  /*
   * Strong route-side linkage.
   *
   * Accept:
   *  - direct require of the same service path, OR
   *  - route contains getMarketplaceListings and canonical
   *    test mocks this exact service dependency.
   */
  const routeRequires =
    parseRelativeRequires(
      routeText
    )
      .map(item => ({
        specifier:
          item.specifier,
        resolved:
          resolveRelative(
            MARKET_ROUTE,
            item.specifier
          )
      }))
      .filter(
        item =>
          item.resolved
      );

  const directRouteMatch =
    routeRequires.some(
      item =>
        path.resolve(
          item.resolved
        ) ===
        path.resolve(
          serviceFile
        )
    );

  const routeMethodEvidence =
    routeText.includes(
      'getMarketplaceListings'
    );

  if (
    !directRouteMatch &&
    !routeMethodEvidence
  ) {
    console.error(
      'Canonical test service:',
      rel(serviceFile)
    );

    console.error(
      'Route requires:',
      routeRequires.map(
        item => ({
          specifier:
            item.specifier,
          resolved:
            rel(item.resolved)
        })
      )
    );

    fail(
      'Marketplace service cannot be linked to canonical marketplace route.'
    );
  }

  return {
    serviceSpecFromCanonicalTest:
      serviceSpec,

    serviceFile,

    serviceRel:
      rel(serviceFile),

    directRouteMatch,

    routeMethodEvidence
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
    ' PHASE 13S-8D - STALE TEST IMPORT FINAL REPAIR'
  );
  console.log(
    '============================================================'
  );

  for (
    const required of
    [
      CRITICAL,
      LIBTEST,
      MARKET_ROUTE,
      MARKET_TEST
    ]
  ) {
    if (!fs.existsSync(required)) {
      fail(
        `Required file missing: ${rel(required)}`
      );
    }
  }

  /*
   * --------------------------------------------------------
   * 1. AUTHORITATIVE CURRENT DEFECT CENSUS
   * --------------------------------------------------------
   */

  const brokenBefore =
    scanBrokenTestImports();

  console.log(
    `Broken relative test imports before    : ${brokenBefore.length}`
  );

  for (const item of brokenBefore) {
    console.log(
      `  ${item.file} -> ${item.specifier}`
    );
  }

  if (
    brokenBefore.length !== 4
  ) {
    fail(
      `Expected exactly 4 current broken test imports; found ${brokenBefore.length}`
    );
  }

  const expectedBroken =
    new Set([
      'backend/src/__tests__/critical-phase1.test.js|../services/marketplaceService',
      'backend/src/__tests__/critical-phase1.test.js|../services/financeService',
      'backend/src/__tests__/critical-phase1.test.js|../routes/marketplaceRoutes',
      'backend/src/tests/libraryKnowledgeService.test.js|./modules/M645100_LIBRARYKNOWLEDGE/backend/service.js'
    ]);

  const actualBroken =
    new Set(
      brokenBefore.map(
        item =>
          `${item.file}|${item.specifier}`
      )
    );

  for (const key of expectedBroken) {
    if (!actualBroken.has(key)) {
      fail(
        `Expected defect missing or changed: ${key}`
      );
    }
  }

  for (const key of actualBroken) {
    if (!expectedBroken.has(key)) {
      fail(
        `Unexpected additional broken test import: ${key}`
      );
    }
  }

  console.log(
    'Exact four-defect population           : PASS'
  );

  /*
   * --------------------------------------------------------
   * 2. DISCOVER MARKETPLACE SERVICE FROM CANONICAL TEST
   * --------------------------------------------------------
   */

  const marketplace =
    discoverCanonicalMarketplaceService();

  console.log('');
  console.log(
    '[MARKETPLACE CANONICAL SERVICE]'
  );

  console.log(
    `Canonical service                      : ${marketplace.serviceRel}`
  );

  console.log(
    `Canonical test specifier               : ${marketplace.serviceSpecFromCanonicalTest}`
  );

  console.log(
    `Direct route require match             : ${marketplace.directRouteMatch}`
  );

  console.log(
    `Route getMarketplaceListings evidence  : ${marketplace.routeMethodEvidence}`
  );

  /*
   * --------------------------------------------------------
   * 3. VERIFY OTHER CANONICAL TARGETS
   * --------------------------------------------------------
   */

  const financeTarget =
    path.join(
      SRC,
      'services',
      'legacy',
      'recoveredFinanceService.js'
    );

  const marketRouteTarget =
    MARKET_ROUTE;

  const libraryTarget =
    path.join(
      SRC,
      'modules',
      'M645100_LIBRARYKNOWLEDGE',
      'backend',
      'service.js'
    );

  for (
    const target of
    [
      financeTarget,
      marketRouteTarget,
      libraryTarget,
      marketplace.serviceFile
    ]
  ) {
    if (!fs.existsSync(target)) {
      fail(
        `Canonical target missing: ${rel(target)}`
      );
    }
  }

  const financeText =
    read(financeTarget);

  if (
    !financeText.includes(
      'trialBalance'
    ) ||
    !financeText.includes(
      'verifyLedger'
    )
  ) {
    fail(
      'Recovered finance canonical target lacks expected live finance surface.'
    );
  }

  const libraryText =
    read(libraryTarget);

  if (
    !libraryText.includes(
      'createService'
    ) ||
    !libraryText.includes(
      'singleton'
    )
  ) {
    fail(
      'M645100 service lacks expected createService/singleton exports.'
    );
  }

  console.log(
    'Finance canonical target               : VERIFIED'
  );

  console.log(
    'Marketplace route target               : VERIFIED'
  );

  console.log(
    'M645100 canonical target               : VERIFIED'
  );

  /*
   * --------------------------------------------------------
   * 4. COMPUTE CORRECT RELATIVE SPECIFIERS
   * --------------------------------------------------------
   */

  const marketServiceSpec =
    relativeSpecifier(
      CRITICAL,
      marketplace.serviceFile
    );

  const financeSpec =
    relativeSpecifier(
      CRITICAL,
      financeTarget
    );

  const marketRouteSpec =
    relativeSpecifier(
      CRITICAL,
      marketRouteTarget
    );

  const librarySpec =
    relativeSpecifier(
      LIBTEST,
      libraryTarget
    );

  console.log('');
  console.log(
    '[REPAIR MAP]'
  );

  console.log(
    `marketplaceService -> ${marketServiceSpec}`
  );

  console.log(
    `financeService     -> ${financeSpec}`
  );

  console.log(
    `marketplaceRoutes  -> ${marketRouteSpec}`
  );

  console.log(
    `M645100 test path  -> ${librarySpec}`
  );

  /*
   * --------------------------------------------------------
   * 5. TARGETED GIT SAFETY
   * --------------------------------------------------------
   */

  const targetFiles = [
    CRITICAL,
    LIBTEST
  ];

  const targetRel =
    targetFiles.map(rel);

  const preStatus =
    git([
      'status',
      '--porcelain',
      '--',
      ...targetRel
    ]);

  if (
    preStatus.error ||
    preStatus.status !== 0
  ) {
    fail(
      preStatus.stderr ||
      preStatus.error?.message ||
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
      'Target test files already contain modifications. Source not touched.'
    );
  }

  console.log(
    'Repair target test files Git-clean     : PASS'
  );

  /*
   * --------------------------------------------------------
   * 6. SNAPSHOT
   * --------------------------------------------------------
   */

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
    let criticalText =
      read(CRITICAL);

    let libText =
      read(LIBTEST);

    /*
     * ------------------------------------------------------
     * 7. EXACT FOUR REPAIRS
     * ------------------------------------------------------
     */

    criticalText =
      replaceExactOnce(
        criticalText,
        "require('../services/marketplaceService')",
        `require('${marketServiceSpec}')`,
        'Marketplace service repair'
      );

    criticalText =
      replaceExactOnce(
        criticalText,
        "require('../services/financeService')",
        `require('${financeSpec}')`,
        'Finance service repair'
      );

    criticalText =
      replaceExactOnce(
        criticalText,
        "require('../routes/marketplaceRoutes')",
        `require('${marketRouteSpec}')`,
        'Marketplace route repair'
      );

    libText =
      replaceExactOnce(
        libText,
        "require('./modules/M645100_LIBRARYKNOWLEDGE/backend/service.js')",
        `require('${librarySpec}')`,
        'M645100 path repair'
      );

    fs.writeFileSync(
      CRITICAL,
      criticalText,
      'utf8'
    );

    fs.writeFileSync(
      LIBTEST,
      libText,
      'utf8'
    );

    modified = true;

    console.log(
      'Exact stale import rewrites            : 4'
    );

    /*
     * ------------------------------------------------------
     * 8. ALL-TEST AUTHORITATIVE RESCAN
     * ------------------------------------------------------
     */

    const brokenAfter =
      scanBrokenTestImports();

    if (
      brokenAfter.length !== 0
    ) {
      console.error(
        JSON.stringify(
          brokenAfter,
          null,
          2
        )
      );

      fail(
        `Broken test imports remain after repair: ${brokenAfter.length}`
      );
    }

    console.log(
      'Broken relative test imports after     : 0'
    );

    /*
     * ------------------------------------------------------
     * 9. RESOLUTION ASSERTIONS
     * ------------------------------------------------------
     */

    const resolutionChecks = [
      {
        file: CRITICAL,
        spec:
          marketServiceSpec,
        expected:
          marketplace.serviceFile
      },
      {
        file: CRITICAL,
        spec:
          financeSpec,
        expected:
          financeTarget
      },
      {
        file: CRITICAL,
        spec:
          marketRouteSpec,
        expected:
          marketRouteTarget
      },
      {
        file: LIBTEST,
        spec:
          librarySpec,
        expected:
          libraryTarget
      }
    ];

    for (const check of resolutionChecks) {
      const resolved =
        resolveRelative(
          check.file,
          check.spec
        );

      if (
        !resolved ||
        path.resolve(resolved) !==
        path.resolve(
          check.expected
        )
      ) {
        fail(
          `Post-repair resolution mismatch: ${rel(check.file)} -> ${check.spec}`
        );
      }
    }

    console.log(
      'Four repaired imports resolve exactly  : PASS 4/4'
    );

    /*
     * ------------------------------------------------------
     * 10. SYNTAX
     * ------------------------------------------------------
     */

    for (const file of targetFiles) {
      syntaxCheck(file);
    }

    console.log(
      'Target test syntax                     : PASS 2/2'
    );

    /*
     * ------------------------------------------------------
     * 11. ESLINT
     * ------------------------------------------------------
     */

    const eslint =
      path.join(
        BACKEND,
        'node_modules',
        'eslint',
        'bin',
        'eslint.js'
      );

    if (fs.existsSync(eslint)) {
      const lint =
        run(
          process.execPath,
          [
            eslint,
            ...targetFiles
          ],
          {
            cwd: ROOT,
            timeout: 120000,
            env: {
              NODE_OPTIONS:
                '--max-old-space-size=3072'
            }
          }
        );

      if (
        lint.error ||
        lint.status !== 0
      ) {
        console.error(
          lint.stdout || ''
        );

        console.error(
          lint.stderr || ''
        );

        fail(
          `Targeted ESLint failed: ${lint.error?.message || lint.status}`
        );
      }

      console.log(
        'Targeted ESLint                       : PASS'
      );
    } else {
      console.log(
        'Targeted ESLint                       : SKIPPED - binary unavailable'
      );
    }

    /*
     * ------------------------------------------------------
     * 12. GIT DIFF QUALITY
     * ------------------------------------------------------
     */

    const diffCheck =
      git([
        'diff',
        '--check',
        '--',
        ...targetRel
      ]);

    if (
      diffCheck.error ||
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
     * ------------------------------------------------------
     * 13. EXACT CHANGE SCOPE
     * ------------------------------------------------------
     */

    const finalStatus =
      git([
        'status',
        '--porcelain',
        '--',
        ...targetRel
      ]);

    if (
      finalStatus.error ||
      finalStatus.status !== 0
    ) {
      fail(
        finalStatus.stderr ||
        finalStatus.error?.message ||
        'Final git status failed.'
      );
    }

    const changed =
      finalStatus.stdout
        .split(/\r?\n/)
        .filter(Boolean);

    if (
      changed.length !== 2
    ) {
      fail(
        `Expected exactly 2 changed test files; Git reports ${changed.length}`
      );
    }

    console.log(
      'Exact test-file modification scope    : PASS (2 files)'
    );

    /*
     * ------------------------------------------------------
     * 14. TARGETED TEST EXECUTION
     * ------------------------------------------------------
     *
     * Windows npm execution intentionally goes through cmd.exe
     * because direct spawnSync("npm.cmd") is EINVAL on this host.
     */

    const packageJson =
      path.join(
        BACKEND,
        'package.json'
      );

    let testStatus =
      'NOT AVAILABLE';

    if (
      fs.existsSync(packageJson)
    ) {
      const pkg =
        JSON.parse(
          read(packageJson)
        );

      if (
        pkg.scripts &&
        pkg.scripts.test
      ) {
        const criticalArg =
          path
            .relative(
              BACKEND,
              CRITICAL
            )
            .replace(/\\/g, '/');

        const libArg =
          path
            .relative(
              BACKEND,
              LIBTEST
            )
            .replace(/\\/g, '/');

        console.log('');
        console.log(
          'Running two repaired backend tests...'
        );

        const test =
          run(
            'cmd.exe',
            [
              '/d',
              '/s',
              '/c',
              `npm test -- --runInBand "${criticalArg}" "${libArg}"`
            ],
            {
              cwd: BACKEND,
              timeout: 180000,
              env: {
                NODE_OPTIONS:
                  '--max-old-space-size=3072'
              }
            }
          );

        fs.writeFileSync(
          path.join(
            OUT,
            'targeted-tests.stdout.log'
          ),
          test.stdout || '',
          'utf8'
        );

        fs.writeFileSync(
          path.join(
            OUT,
            'targeted-tests.stderr.log'
          ),
          test.stderr || '',
          'utf8'
        );

        if (test.error) {
          fail(
            `Targeted test launcher failed: ${test.error.message}`
          );
        }

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
            `Targeted repaired tests failed with exit code ${test.status}`
          );
        }

        testStatus = 'PASS';

        console.log(
          'Targeted repaired tests                : PASS'
        );
      }
    }

    /*
     * ------------------------------------------------------
     * 15. SAVE ACCEPTANCE EVIDENCE
     * ------------------------------------------------------
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
          brokenBefore:
            brokenBefore,

          brokenAfter:
            [],

          marketplaceCanonicalService:
            marketplace,

          repairs: [
            {
              file:
                rel(CRITICAL),
              from:
                '../services/marketplaceService',
              to:
                marketServiceSpec
            },
            {
              file:
                rel(CRITICAL),
              from:
                '../services/financeService',
              to:
                financeSpec
            },
            {
              file:
                rel(CRITICAL),
              from:
                '../routes/marketplaceRoutes',
              to:
                marketRouteSpec
            },
            {
              file:
                rel(LIBTEST),
              from:
                './modules/M645100_LIBRARYKNOWLEDGE/backend/service.js',
              to:
                librarySpec
            }
          ],

          modifiedFiles:
            targetRel,

          targetedTests:
            testStatus
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
      'Original broken relative imports      : 4'
    );

    console.log(
      'Canonical mappings repaired           : 4'
    );

    console.log(
      'Broken relative imports remaining     : 0'
    );

    console.log(
      'Modified application production files : 0'
    );

    console.log(
      'Modified test files                   : 2'
    );

    console.log(
      `Targeted repaired tests               : ${testStatus}`
    );

    console.log(
      `Marketplace canonical service         : ${marketplace.serviceRel}`
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

    const restoredBroken =
      scanBrokenTestImports();

    if (
      restoredBroken.length !== 4
    ) {
      rollbackPass = false;
    }

    console.error(
      `Byte-for-byte rollback                : ${rollbackPass}`
    );

    console.error(
      `Restored broken import count          : ${restoredBroken.length}`
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
    'TEST SOURCE MODIFIED                   : NO'
  );

  console.error(
    'BATCH 5 STALE TEST IMPORT REPAIR       : NOT ACCEPTED'
  );

  process.exitCode = 1;
}
