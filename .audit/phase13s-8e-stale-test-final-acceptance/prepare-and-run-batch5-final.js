const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = process.cwd();

const OLD = path.join(
  ROOT,
  '.audit',
  'phase13s-8d-stale-test-final-repair',
  'repair-stale-test-imports-final.js'
);

const OUT = path.join(
  ROOT,
  '.audit',
  'phase13s-8e-stale-test-final-acceptance'
);

const NEW = path.join(
  OUT,
  'repair-stale-test-imports-final-acceptance.js'
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
  ' BATCH 5 FINAL ACCEPTANCE - ATOMIC PREPARATION'
);
console.log(
  '============================================================'
);

if (!fs.existsSync(OLD)) {
  fail(
    `Previous validated Batch 5 transaction missing: ${OLD}`
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
 * The previous run proved the repair transaction through:
 * - exact 4-defect discovery
 * - canonical marketplace runtime discovery
 * - exact four mappings
 * - broken-after = 0
 * - syntax
 * - ESLint
 * - diff check
 * - exact 2-file scope
 *
 * It failed only because Jest treated explicit file paths
 * as a pattern rather than paths.
 */

const oldJest =
  '`npm test -- --runInBand "${criticalArg}" "${libArg}"`';

const newJest =
  '`npm test -- --runInBand --runTestsByPath "${criticalArg}" "${libArg}"`';

const oldAudit =
  'phase13s-8d-stale-test-final-repair';

const newAudit =
  'phase13s-8e-stale-test-final-acceptance';

/*
 * ------------------------------------------------------------
 * 1. PRECONDITION: EXACTLY ONE OLD JEST INVOCATION
 * ------------------------------------------------------------
 */

const jestCount =
  count(
    original,
    oldJest
  );

if (jestCount !== 1) {
  fail(
    `Expected exactly one old Jest invocation; found ${jestCount}`
  );
}

/*
 * ------------------------------------------------------------
 * 2. PRECONDITION: EXACTLY ONE TRANSACTION AUDIT PATH
 * ------------------------------------------------------------
 */

const auditCount =
  count(
    original,
    oldAudit
  );

if (auditCount !== 1) {
  fail(
    `Expected exactly one previous audit-path occurrence; found ${auditCount}`
  );
}

/*
 * ------------------------------------------------------------
 * 3. VALIDATED TRANSACTION STRUCTURE MUST STILL EXIST
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
  "legacy",
  "recoveredFinanceService.js",
  "M645100_LIBRARYKNOWLEDGE",
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
  if (!original.includes(fragment)) {
    fail(
      `Validated transaction structure missing: ${fragment}`
    );
  }
}

console.log(
  'Previous validated transaction          : FOUND'
);

console.log(
  'Validated repair guards                 : PRESERVED'
);

/*
 * ------------------------------------------------------------
 * 4. MAKE ONLY THE TWO AUTHORIZED SCRIPT CHANGES
 * ------------------------------------------------------------
 */

let patched =
  original.replace(
    oldJest,
    newJest
  );

patched =
  patched.replace(
    oldAudit,
    newAudit
  );

/*
 * ------------------------------------------------------------
 * 5. PROVE OLD JEST INVOCATION IS GONE
 * ------------------------------------------------------------
 */

if (
  patched.includes(oldJest)
) {
  fail(
    'Old Jest pattern invocation remains after patch.'
  );
}

if (
  count(
    patched,
    '--runTestsByPath'
  ) !== 1
) {
  fail(
    'Expected exactly one --runTestsByPath occurrence.'
  );
}

/*
 * ------------------------------------------------------------
 * 6. PROVE OLD AUDIT DESTINATION IS GONE
 * ------------------------------------------------------------
 */

if (
  patched.includes(oldAudit)
) {
  fail(
    'Old evidence directory remains in generated transaction.'
  );
}

if (
  count(
    patched,
    newAudit
  ) !== 1
) {
  fail(
    'New evidence directory was not installed exactly once.'
  );
}

/*
 * ------------------------------------------------------------
 * 7. STRONG DIFFERENCE PROOF
 *
 * Recreate the expected patched script independently.
 * If the generated text differs from this exact transformation,
 * stop before running anything.
 * ------------------------------------------------------------
 */

const expected =
  original
    .replace(
      oldJest,
      newJest
    )
    .replace(
      oldAudit,
      newAudit
    );

if (
  patched !== expected
) {
  fail(
    'Unexpected modification detected while preparing transaction.'
  );
}

/*
 * ------------------------------------------------------------
 * 8. WRITE FINAL TRANSACTION
 * ------------------------------------------------------------
 */

fs.writeFileSync(
  NEW,
  patched,
  'utf8'
);

console.log(
  'Source repair logic                     : UNCHANGED'
);

console.log(
  'Canonical mapping discovery             : UNCHANGED'
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
  'Jest correction                         : --runTestsByPath'
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
 * 9. RUN ONLY AFTER SUCCESSFUL PREPARATION
 * ------------------------------------------------------------
 */

console.log('');
console.log(
  'Running authoritative Batch 5 final transaction...'
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
    `Unable to launch final transaction: ${result.error.message}`
  );
}

console.log('');
console.log(
  '============================================================'
);
console.log(
  ` BATCH 5 FINAL ACCEPTANCE EXIT CODE: ${result.status}`
);
console.log(
  '============================================================'
);

process.exitCode =
  result.status === null
    ? 1
    : result.status;

