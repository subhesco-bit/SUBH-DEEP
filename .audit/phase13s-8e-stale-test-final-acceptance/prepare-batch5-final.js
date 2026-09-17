const fs = require('fs');
const path = require('path');

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

if (!fs.existsSync(OLD)) {
  fail(
    `Validated Batch 5 transaction script not found: ${OLD}`
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
 * 1. Replace ONLY the previously incorrect Jest selector.
 * ------------------------------------------------------------
 */

const oldCommand =
  '`npm test -- --runInBand "${criticalArg}" "${libArg}"`';

const newCommand =
  '`npm test -- --runInBand --runTestsByPath "${criticalArg}" "${libArg}"`';

const oldCount =
  original.split(
    oldCommand
  ).length - 1;

if (oldCount !== 1) {
  fail(
    `Expected exactly one old Jest command; found ${oldCount}`
  );
}

let patched =
  original.replace(
    oldCommand,
    newCommand
  );

/*
 * ------------------------------------------------------------
 * 2. Give this final acceptance pass its own evidence directory.
 * ------------------------------------------------------------
 */

const oldAuditPath =
  'phase13s-8d-stale-test-final-repair';

const auditCount =
  patched.split(
    oldAuditPath
  ).length - 1;

if (auditCount !== 1) {
  fail(
    `Expected exactly one old Batch 5 audit-path reference; found ${auditCount}`
  );
}

patched =
  patched.replace(
    oldAuditPath,
    'phase13s-8e-stale-test-final-acceptance'
  );

/*
 * ------------------------------------------------------------
 * 3. Strong transaction-preservation assertions.
 * ------------------------------------------------------------
 */

const requiredFragments = [
  "brokenBefore.length !== 4",
  "Exact four-defect population",
  "../services/marketplaceService",
  "../services/financeService",
  "../routes/marketplaceRoutes",
  "./modules/M645100_LIBRARYKNOWLEDGE/backend/service.js",
  "Four repaired imports resolve exactly",
  "Target test syntax",
  "Targeted ESLint",
  "git diff --check",
  "Exact test-file modification scope",
  "Byte-for-byte rollback",
  "Restored broken import count",
  "backend/src/services/legacy/ecommerceService.js"
];

for (const fragment of requiredFragments) {
  if (!patched.includes(fragment)) {
    fail(
      `Validated transaction guard disappeared: ${fragment}`
    );
  }
}

if (
  !patched.includes(
    '--runTestsByPath'
  )
) {
  fail(
    'Correct Jest --runTestsByPath selector was not installed.'
  );
}

if (
  patched.includes(
    'npm test -- --runInBand "${criticalArg}" "${libArg}"'
  )
) {
  fail(
    'Old pattern-based Jest invocation still remains.'
  );
}

/*
 * ------------------------------------------------------------
 * 4. Prove the generated transaction differs only in:
 *    - Jest selector
 *    - audit evidence directory
 * ------------------------------------------------------------
 */

const normalizedOriginal =
  original
    .replace(
      oldCommand,
      newCommand
    )
    .replace(
      oldAuditPath,
      'phase13s-8e-stale-test-final-acceptance'
    );

if (
  patched !== normalizedOriginal
) {
  fail(
    'Unexpected transaction-script change detected.'
  );
}

fs.writeFileSync(
  NEW,
  patched,
  'utf8'
);

console.log('');
console.log(
  '============================================================'
);

console.log(
  ' BATCH 5 FINAL ACCEPTANCE PREPARATION'
);

console.log(
  '============================================================'
);

console.log(
  'Previous validated transaction          : FOUND'
);

console.log(
  'Source repair logic                     : UNCHANGED'
);

console.log(
  'Canonical four mappings                 : UNCHANGED'
);

console.log(
  'Rollback protection                     : PRESERVED'
);

console.log(
  'Syntax / ESLint / diff gates             : PRESERVED'
);

console.log(
  'Exact modification-scope gate            : PRESERVED'
);

console.log(
  'Jest selector                            : --runTestsByPath'
);

console.log(
  `Final transaction                       : ${NEW}`
);

console.log(
  'APPLICATION SOURCE MODIFIED             : NO'
);

console.log(
  'TEST SOURCE MODIFIED                    : NO'
);
