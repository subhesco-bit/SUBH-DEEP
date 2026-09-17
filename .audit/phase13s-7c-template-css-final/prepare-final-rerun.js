const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const OLD = path.join(
  ROOT,
  '.audit',
  'phase13s-7-template-css-repair',
  'repair-template-css-imports.js'
);

const NEW_OUT = path.join(
  ROOT,
  '.audit',
  'phase13s-7c-template-css-final'
);

const NEW = path.join(
  NEW_OUT,
  'repair-template-css-imports-final.js'
);

function fail(message) {
  throw new Error(message);
}

if (!fs.existsSync(OLD)) {
  fail(`Previous Batch 4 transaction script missing: ${OLD}`);
}

fs.mkdirSync(
  NEW_OUT,
  { recursive: true }
);

const original =
  fs.readFileSync(
    OLD,
    'utf8'
  );

if (
  !original.includes(
    "phase13s-7-template-css-repair"
  )
) {
  fail(
    'Expected previous Batch 4 audit path not found.'
  );
}

/*
 * Match only the previously proven-broken Windows build
 * invocation. Nothing else in the transaction is changed.
 */
const buildPattern =
  /const build\s*=\s*run\(\s*process\.platform\s*===\s*'win32'\s*\?\s*'npm\.cmd'\s*:\s*'npm',\s*\[\s*'run',\s*'build'\s*\],\s*\{\s*cwd:\s*FRONTEND,\s*env:\s*\{\s*NODE_OPTIONS:\s*'--max-old-space-size=3072'\s*\}\s*\}\s*\);/m;

const matches =
  [...original.matchAll(
    new RegExp(
      buildPattern.source,
      'gm'
    )
  )];

if (matches.length !== 1) {
  fail(
    `Expected exactly one npm.cmd production-build launcher; found ${matches.length}`
  );
}

const replacement = `const build =
      run(
        'cmd.exe',
        [
          '/d',
          '/s',
          '/c',
          'npm run build'
        ],
        {
          cwd: FRONTEND,
          env: {
            NODE_OPTIONS:
              '--max-old-space-size=3072'
          }
        }
      );`;

let patched =
  original.replace(
    buildPattern,
    replacement
  );

/*
 * Give the rerun its own evidence directory.
 */
const oldAuditOccurrences =
  (
    patched.match(
      /phase13s-7-template-css-repair/g
    ) || []
  ).length;

if (oldAuditOccurrences !== 1) {
  fail(
    `Expected exactly one old audit-path occurrence; found ${oldAuditOccurrences}`
  );
}

patched =
  patched.replace(
    'phase13s-7-template-css-repair',
    'phase13s-7c-template-css-final'
  );

/*
 * Strong post-patch assertions.
 */
if (
  patched.includes(
    "? 'npm.cmd'"
  )
) {
  fail(
    'Direct npm.cmd launcher still remains.'
  );
}

if (
  !patched.includes(
    "'cmd.exe'"
  ) ||
  !patched.includes(
    "'npm run build'"
  )
) {
  fail(
    'cmd.exe production-build launcher was not installed correctly.'
  );
}

if (
  !patched.includes(
    "const EXPECTED_COUNT = 314;"
  )
) {
  fail(
    '314-defect population guard disappeared.'
  );
}

if (
  !patched.includes(
    "Byte-for-byte rollback"
  )
) {
  fail(
    'Rollback protection disappeared.'
  );
}

if (
  !patched.includes(
    "Exact one-line-only repair shape"
  )
) {
  fail(
    'Exact-change-shape validation disappeared.'
  );
}

if (
  !patched.includes(
    "Targeted ESLint"
  )
) {
  fail(
    'ESLint validation disappeared.'
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
  ' BATCH 4 FINAL TRANSACTION PREPARATION'
);
console.log(
  '============================================================'
);

console.log(
  'Original transaction script            : FOUND'
);

console.log(
  'Direct npm.cmd launchers replaced       : 1'
);

console.log(
  'Windows build launcher                  : cmd.exe'
);

console.log(
  'Build command                           : npm run build'
);

console.log(
  '314 population guard                    : PRESERVED'
);

console.log(
  'Exact one-line-only validation          : PRESERVED'
);

console.log(
  'Targeted ESLint                         : PRESERVED'
);

console.log(
  'Byte-for-byte rollback                  : PRESERVED'
);

console.log(
  `Final transaction                       : ${NEW}`
);

console.log(
  'APPLICATION SOURCE MODIFIED             : NO'
);
