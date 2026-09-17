const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = process.cwd();

const OLD = path.join(
  ROOT,
  '.audit',
  'phase13s-8e-stale-test-final-acceptance',
  'repair-stale-test-imports-final-acceptance.js'
);

const OUT = path.join(
  ROOT,
  '.audit',
  'phase13s-8f-stale-test-final-direct-jest'
);

const NEW = path.join(
  OUT,
  'repair-stale-test-imports-direct-jest.js'
);

function fail(message) {
  throw new Error(message);
}

function count(text, needle) {
  return text.split(needle).length - 1;
}

console.log('');
console.log(
  '============================================================'
);
console.log(
  ' BATCH 5 FINAL - DIRECT JEST PREPARATION'
);
console.log(
  '============================================================'
);

if (!fs.existsSync(OLD)) {
  fail(
    `Previous validated transaction missing: ${OLD}`
  );
}

fs.mkdirSync(
  OUT,
  { recursive: true }
);

const original =
  fs.readFileSync(
    OLD,
    'utf8'
  );

/*
 * ------------------------------------------------------------
 * 1. Verify the prior direct-path attempt is exactly present.
 * ------------------------------------------------------------
 */

const oldLauncherBlock = `
        const test =
          run(
            'cmd.exe',
            [
              '/d',
              '/s',
              '/c',
              \`npm test -- --runInBand --runTestsByPath "\${criticalArg}" "\${libArg}"\`
            ],
            {
              cwd: BACKEND,
              timeout: 180000,
              env: {
                NODE_OPTIONS:
                  '--max-old-space-size=3072'
              }
            }
          );`;

const launcherCount =
  count(
    original,
    oldLauncherBlock
  );

if (launcherCount !== 1) {
  fail(
    `Expected exactly one previous targeted-test launcher block; found ${launcherCount}`
  );
}

/*
 * ------------------------------------------------------------
 * 2. New launcher:
 *    Node -> local Jest binary
 *    Absolute test paths
 *    No cmd.exe
 *    No npm
 *    No shell quoting
 * ------------------------------------------------------------
 */

const newLauncherBlock = `
        const jestBin =
          path.join(
            BACKEND,
            'node_modules',
            'jest',
            'bin',
            'jest.js'
          );

        if (
          !fs.existsSync(
            jestBin
          )
        ) {
          fail(
            \`Local Jest binary missing: \${jestBin}\`
          );
        }

        const test =
          run(
            process.execPath,
            [
              jestBin,
              '--coverage',
              '--runInBand',
              '--runTestsByPath',
              CRITICAL,
              LIBTEST
            ],
            {
              cwd: BACKEND,
              timeout: 180000,
              env: {
                NODE_OPTIONS:
                  '--max-old-space-size=3072'
              }
            }
          );`;

/*
 * ------------------------------------------------------------
 * 3. Replace only launcher + audit directory.
 * ------------------------------------------------------------
 */

const oldAudit =
  'phase13s-8e-stale-test-final-acceptance';

const newAudit =
  'phase13s-8f-stale-test-final-direct-jest';

const auditCount =
  count(
    original,
    oldAudit
  );

if (auditCount !== 1) {
  fail(
    `Expected exactly one old audit-path occurrence; found ${auditCount}`
  );
}

let patched =
  original.replace(
    oldLauncherBlock,
    newLauncherBlock
  );

patched =
  patched.replace(
    oldAudit,
    newAudit
  );

/*
 * ------------------------------------------------------------
 * 4. Preserve every validated repair guard.
 * ------------------------------------------------------------
 */

const required = [
  "Broken relative test imports before",
  "Exact four-defect population",
  "../services/marketplaceService",
  "../services/financeService",
  "../routes/marketplaceRoutes",
  "./modules/M645100_LIBRARYKNOWLEDGE/backend/service.js",
  "discoverCanonicalMarketplaceService",
  "getMarketplaceListings",
  "recoveredFinanceService.js",
  "Exact stale import rewrites",
  "Broken relative test imports after",
  "Four repaired imports resolve exactly",
  "Target test syntax",
  "Targeted ESLint",
  "git diff --check",
  "Exact test-file modification scope",
  "Byte-for-byte rollback",
  "Restored broken import count"
];

for (const fragment of required) {
  if (!patched.includes(fragment)) {
    fail(
      `Validated transaction guard disappeared: ${fragment}`
    );
  }
}

/*
 * ------------------------------------------------------------
 * 5. Strong launcher assertions.
 * ------------------------------------------------------------
 */

if (
  patched.includes(
    "npm test -- --runInBand --runTestsByPath"
  )
) {
  fail(
    'Old npm targeted-test launcher still remains.'
  );
}

if (
  patched.includes(
    "'cmd.exe'"
  )
) {
  /*
   * This transaction should have no cmd.exe left in the
   * targeted-test execution path. If some unrelated cmd.exe
   * existed in the source, stop rather than assume.
   */
  const cmdCount =
    count(
      patched,
      "'cmd.exe'"
    );

  if (cmdCount > 0) {
    fail(
      `cmd.exe occurrence remains in transaction: ${cmdCount}`
    );
  }
}

if (
  !patched.includes(
    "'--runTestsByPath'"
  )
) {
  fail(
    'Direct Jest --runTestsByPath flag missing.'
  );
}

if (
  !patched.includes(
    "process.execPath"
  ) ||
  !patched.includes(
    "'jest.js'"
  )
) {
  fail(
    'Direct Node/Jest launcher was not installed.'
  );
}

/*
 * ------------------------------------------------------------
 * 6. Exact-difference proof.
 * ------------------------------------------------------------
 */

const expected =
  original
    .replace(
      oldLauncherBlock,
      newLauncherBlock
    )
    .replace(
      oldAudit,
      newAudit
    );

if (
  patched !== expected
) {
  fail(
    'Unexpected transaction modification detected.'
  );
}

/*
 * ------------------------------------------------------------
 * 7. Write final transaction.
 * ------------------------------------------------------------
 */

fs.writeFileSync(
  NEW,
  patched,
  'utf8'
);

console.log(
  'Previous validated transaction          : FOUND'
);

console.log(
  'Source repair logic                     : UNCHANGED'
);

console.log(
  'Canonical mapping logic                 : UNCHANGED'
);

console.log(
  'Four-defect population guard            : PRESERVED'
);

console.log(
  'Syntax / ESLint / diff gates            : PRESERVED'
);

console.log(
  'Exact 2-file scope gate                 : PRESERVED'
);

console.log(
  'Byte-for-byte rollback                  : PRESERVED'
);

console.log(
  'Targeted test launcher                  : DIRECT NODE -> JEST'
);

console.log(
  'Targeted test paths                     : ABSOLUTE'
);

console.log(
  'cmd.exe / npm quoting layer             : REMOVED'
);

console.log(
  `Generated transaction                   : ${NEW}`
);

console.log(
  'APPLICATION SOURCE MODIFIED             : NO'
);

console.log(
  'TEST SOURCE MODIFIED                    : NO'
);

/*
 * ------------------------------------------------------------
 * 8. Execute only after successful preparation.
 * ------------------------------------------------------------
 */

console.log('');
console.log(
  'Running authoritative Batch 5 direct-Jest transaction...'
);

const result =
  cp.spawnSync(
    process.execPath,
    [NEW],
    {
      cwd: ROOT,
      encoding: 'utf8',
      windowsHide: true,
      stdio: 'inherit',
      env: {
        ...process.env
      }
    }
  );

if (result.error) {
  fail(
    `Unable to launch transaction: ${result.error.message}`
  );
}

console.log('');
console.log(
  '============================================================'
);

console.log(
  ` BATCH 5 DIRECT-JEST EXIT CODE: ${result.status}`
);

console.log(
  '============================================================'
);

process.exitCode =
  result.status === null
    ? 1
    : result.status;

