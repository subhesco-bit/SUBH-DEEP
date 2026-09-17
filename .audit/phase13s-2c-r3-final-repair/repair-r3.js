const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = String.raw`C:\Users\DIYA GOEL\Downloads\EBDESIGN`;
const BACKEND = path.join(ROOT, 'backend');
const OUT = path.join(ROOT, '.audit', 'phase13s-2c-r3-final-repair');
const BACKUP = path.join(OUT, 'backup');

const PLAN = [
  {
    file: 'src/services/commerce/valueCommerceService.js',
    names: [
      'getValueFactors',
      'calculateProductValueScore',
      'getProductValueScore',
      'calculateValueBasedPrice',
      'setConsumerValuePreferences',
      'getConsumerValuePreferences',
      'generateValueRecommendations',
      'getValueTiers'
    ]
  },
  {
    file: 'src/services/food/nutritionIntelligenceService.js',
    names: [
      'getNutrients',
      'createFoodNutritionProfile',
      'searchFoodProfiles',
      'addProductNutrition',
      'getProductNutrition',
      'calculateProductNutritionScore',
      'getProductNutritionScore',
      'calculateNutritionPricing',
      'compareProductsNutrition',
      'getDietaryProfiles'
    ]
  },
  {
    file: 'src/services/logistics/iotIntegrationService.js',
    names: [
      'registerIoTDevice',
      'getIoTDevices',
      'updateDeviceStatus',
      'recordSensorData',
      'getSensorData',
      'sendDeviceCommand',
      'getDeviceCommands',
      'createDeviceAlert',
      'getUnacknowledgedAlerts',
      'checkDeviceHealth',
      'recordIoTAnalytics'
    ]
  },
  {
    file: 'src/services/platform/multilingualService.js',
    names: [
      'detectLanguage',
      'translateText',
      'getAvailableLanguages',
      'getContentTranslation',
      'saveContentTranslation',
      'getUserLanguagePreferences',
      'updateUserLanguagePreferences',
      'getTranslationMemoryStats'
    ]
  }
];

const targets = PLAN.map(x => x.file);

function run(cmd, args, cwd = BACKEND) {
  const r = spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    windowsHide: true
  });

  return {
    code: r.status === null ? 999 : r.status,
    stdout: r.stdout || '',
    stderr: r.stderr || '',
    error: r.error || null
  };
}

function esc(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findStatementEnd(source, start) {
  let paren = 0;
  let brace = 0;
  let bracket = 0;

  let single = false;
  let double = false;
  let template = false;
  let lineComment = false;
  let blockComment = false;
  let escaped = false;

  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    const next = source[i + 1];

    if (lineComment) {
      if (ch === '\n') lineComment = false;
      continue;
    }

    if (blockComment) {
      if (ch === '*' && next === '/') {
        blockComment = false;
        i++;
      }
      continue;
    }

    if (escaped) {
      escaped = false;
      continue;
    }

    if ((single || double || template) && ch === '\\') {
      escaped = true;
      continue;
    }

    if (!single && !double && !template) {
      if (ch === '/' && next === '/') {
        lineComment = true;
        i++;
        continue;
      }

      if (ch === '/' && next === '*') {
        blockComment = true;
        i++;
        continue;
      }
    }

    if (!double && !template && ch === "'") {
      single = !single;
      continue;
    }

    if (!single && !template && ch === '"') {
      double = !double;
      continue;
    }

    if (!single && !double && ch === '`') {
      template = !template;
      continue;
    }

    if (single || double || template) continue;

    if (ch === '(') paren++;
    if (ch === ')') paren--;

    if (ch === '{') brace++;
    if (ch === '}') brace--;

    if (ch === '[') bracket++;
    if (ch === ']') bracket--;

    if (
      ch === ';' &&
      paren === 0 &&
      brace === 0 &&
      bracket === 0
    ) {
      return i + 1;
    }

    if (paren < 0 || brace < 0 || bracket < 0) {
      throw new Error('Unsafe delimiter state while finding statement end');
    }
  }

  throw new Error('Unable to locate safe statement terminator');
}

function locate(source, name) {
  const e = esc(name);

  const declarationRe = new RegExp(
    `^[ \\t]*(?:async[ \\t]+)?function[ \\t]+${e}[ \\t]*\\(`,
    'm'
  );

  const declaration = declarationRe.exec(source);

  if (!declaration) {
    throw new Error(`Missing real function declaration: ${name}`);
  }

  const prefix = source.slice(0, declaration.index);

  const assignmentRe = new RegExp(
    `^[ \\t]*${e}[ \\t]*=[ \\t]*async\\b`,
    'gm'
  );

  const assignments = [...prefix.matchAll(assignmentRe)];

  if (assignments.length !== 1) {
    throw new Error(
      `${name}: expected exactly one early async assignment; found ${assignments.length}`
    );
  }

  return {
    start: assignments[0].index,
    declaration: declaration.index
  };
}

function repairOne(item) {
  const abs = path.join(BACKEND, item.file);

  let source = fs.readFileSync(abs, 'utf8');

  const ranges = item.names.map(name => {
    const found = locate(source, name);
    const end = findStatementEnd(source, found.start);

    if (end >= found.declaration) {
      throw new Error(`Unsafe range crosses real declaration: ${name}`);
    }

    return {
      name,
      start: found.start,
      end
    };
  });

  ranges.sort((a, b) => a.start - b.start);

  for (let i = 1; i < ranges.length; i++) {
    if (ranges[i].start < ranges[i - 1].end) {
      throw new Error(
        `Overlapping repair ranges: ${ranges[i - 1].name} / ${ranges[i].name}`
      );
    }
  }

  for (const r of [...ranges].sort((a, b) => b.start - a.start)) {
    source =
      source.slice(0, r.start) +
      source.slice(r.end);
  }

  fs.writeFileSync(abs, source, 'utf8');

  return ranges.length;
}

function countRemainingAssignments() {
  let remaining = 0;

  for (const item of PLAN) {
    const source = fs.readFileSync(
      path.join(BACKEND, item.file),
      'utf8'
    );

    for (const name of item.names) {
      const e = esc(name);

      const assignmentRe = new RegExp(
        `^[ \\t]*${e}[ \\t]*=[ \\t]*async\\b`,
        'm'
      );

      const declarationRe = new RegExp(
        `^[ \\t]*(?:async[ \\t]+)?function[ \\t]+${e}[ \\t]*\\(`,
        'm'
      );

      if (assignmentRe.test(source)) {
        console.error(`DUPLICATE REMAINS: ${item.file} :: ${name}`);
        remaining++;
      }

      if (!declarationRe.test(source)) {
        throw new Error(
          `Real implementation missing after repair: ${item.file} :: ${name}`
        );
      }
    }
  }

  return remaining;
}

function repairEmptyCatchCreatedByRemoval() {
  const file =
    path.join(
      BACKEND,
      'src/services/logistics/iotIntegrationService.js'
    );

  let source = fs.readFileSync(file, 'utf8');

  /*
   * We do NOT remove a catch construct.
   *
   * Only a syntactically empty catch block is changed from:
   *
   *     catch (...) {
   *     }
   *
   * to:
   *
   *     catch (...) {
   *       // Intentional: production implementations below remain active.
   *     }
   *
   * This has zero runtime effect.
   */

  const emptyCatch =
    /catch\s*(\([^)]*\))?\s*\{\s*\}/g;

  const matches = [...source.matchAll(emptyCatch)];

  if (matches.length === 0) {
    console.log('Empty catch blocks requiring comment    : 0');
    return 0;
  }

  /*
   * R2 produced exactly one no-empty diagnostic.
   * Refuse mass editing if more than one empty catch appears.
   */
  if (matches.length > 1) {
    throw new Error(
      `Safety stop: expected at most 1 empty catch after repair; found ${matches.length}`
    );
  }

  source = source.replace(
    emptyCatch,
    match => {
      const openBrace = match.lastIndexOf('{');
      const closeBrace = match.lastIndexOf('}');

      return (
        match.slice(0, openBrace + 1) +
        '\n  // Intentional: fallback stubs removed; production implementations below remain active.\n' +
        match.slice(closeBrace)
      );
    }
  );

  fs.writeFileSync(file, source, 'utf8');

  console.log('Empty catch blocks documented          : 1');

  return 1;
}

function restore(backups) {
  let ok = true;

  for (const b of backups) {
    try {
      fs.copyFileSync(b.backup, b.original);

      const a = fs.readFileSync(b.original);
      const z = fs.readFileSync(b.backup);

      if (!a.equals(z)) {
        console.error(`RESTORE BYTE MISMATCH: ${b.file}`);
        ok = false;
      }
    } catch (err) {
      console.error(`RESTORE FAILURE: ${b.file}`);
      console.error(err.message);
      ok = false;
    }
  }

  return ok;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(BACKUP, { recursive: true });

  console.log('');
  console.log('============================================================');
  console.log(' PHASE 13S-2C-R3 - FINAL 37-DEFECT REPAIR');
  console.log('============================================================');

  if (PLAN.reduce((a, b) => a + b.names.length, 0) !== 37) {
    throw new Error('Repair plan count is not 37');
  }

  for (const file of targets) {
    if (!fs.existsSync(path.join(BACKEND, file))) {
      throw new Error(`Missing target: ${file}`);
    }
  }

  const status = run(
    'git',
    ['status', '--porcelain', '--', ...targets]
  );

  if (status.code !== 0) {
    throw new Error(status.stderr || 'git status failed');
  }

  if (status.stdout.trim()) {
    console.error(status.stdout);
    throw new Error(
      'Safety stop: one or more target files are already modified'
    );
  }

  console.log('Target files Git-clean                 : PASS');

  const eslintJs = path.join(
    BACKEND,
    'node_modules',
    'eslint',
    'bin',
    'eslint.js'
  );

  if (!fs.existsSync(eslintJs)) {
    throw new Error(`Missing local ESLint: ${eslintJs}`);
  }

  console.log('Local ESLint                           : FOUND');

  /*
   * Pre-validate all 37 duplicate structures before any write.
   */
  let preverified = 0;

  for (const item of PLAN) {
    const source = fs.readFileSync(
      path.join(BACKEND, item.file),
      'utf8'
    );

    for (const name of item.names) {
      locate(source, name);
      preverified++;
    }
  }

  if (preverified !== 37) {
    throw new Error(
      `Precondition mismatch: ${preverified}/37`
    );
  }

  console.log(`Duplicate structures preverified       : ${preverified}/37`);

  const backups = [];

  for (const item of PLAN) {
    const original = path.join(BACKEND, item.file);
    const backup = path.join(
      BACKUP,
      item.file.replace(/[\\/:*?"<>|]/g, '_')
    );

    fs.copyFileSync(original, backup);

    backups.push({
      file: item.file,
      original,
      backup
    });
  }

  console.log('Byte-for-byte backups                  : CREATED');

  try {
    let removed = 0;

    for (const item of PLAN) {
      const n = repairOne(item);

      removed += n;

      console.log(
        `Removed ${String(n).padStart(2)} : ${item.file}`
      );
    }

    if (removed !== 37) {
      throw new Error(
        `Expected 37 removals; got ${removed}`
      );
    }

    console.log(`Total duplicate assignments removed    : ${removed}/37`);

    /*
     * R2 proved one IoT catch becomes empty.
     * Add a comment only if that exact condition exists.
     */
    repairEmptyCatchCreatedByRemoval();

    console.log('');
    console.log('[1/6] NODE SYNTAX');

    for (const item of PLAN) {
      const r = run(
        process.execPath,
        ['--check', path.join(BACKEND, item.file)]
      );

      if (r.stdout) process.stdout.write(r.stdout);
      if (r.stderr) process.stderr.write(r.stderr);

      if (r.code !== 0) {
        throw new Error(
          `Node syntax failed: ${item.file}`
        );
      }

      console.log(`PASS : ${item.file}`);
    }

    console.log('');
    console.log('[2/6] TARGETED ESLINT');

    const lint = run(
      process.execPath,
      [eslintJs, ...targets]
    );

    fs.writeFileSync(
      path.join(OUT, 'eslint-after.txt'),
      lint.stdout + lint.stderr,
      'utf8'
    );

    if (lint.stdout) process.stdout.write(lint.stdout);
    if (lint.stderr) process.stderr.write(lint.stderr);

    console.log(`ESLint exit code                      : ${lint.code}`);

    if (lint.code !== 0) {
      throw new Error(
        `Targeted ESLint failed with exit code ${lint.code}`
      );
    }

    console.log('Targeted ESLint                       : PASS');

    console.log('');
    console.log('[3/6] DUPLICATE RECHECK');

    const remaining = countRemainingAssignments();

    console.log(
      `Remaining early async assignments      : ${remaining}`
    );

    if (remaining !== 0) {
      throw new Error(
        `${remaining} duplicate assignments remain`
      );
    }

    console.log('');
    console.log('[4/6] DIFF CHECK');

    const diffCheck = run(
      'git',
      ['diff', '--check', '--', ...targets]
    );

    if (diffCheck.stdout) process.stdout.write(diffCheck.stdout);
    if (diffCheck.stderr) process.stderr.write(diffCheck.stderr);

    if (diffCheck.code !== 0) {
      throw new Error('git diff --check failed');
    }

    console.log('git diff --check                      : PASS');

    console.log('');
    console.log('[5/6] FILE SCOPE');

    const finalStatus = run(
      'git',
      ['status', '--short', '--', ...targets]
    );

    if (finalStatus.code !== 0) {
      throw new Error('git status failed');
    }

    const rows = finalStatus.stdout
      .trim()
      .split(/\r?\n/)
      .filter(Boolean);

    console.log(finalStatus.stdout.trim());

    if (rows.length !== 4) {
      throw new Error(
        `Expected exactly 4 modified target files; found ${rows.length}`
      );
    }

    console.log('Modified target count                  : 4');

    console.log('');
    console.log('[6/6] SAVE FINAL DIFF');

    const diff = run(
      'git',
      ['diff', '--', ...targets]
    );

    if (diff.code !== 0) {
      throw new Error('git diff failed');
    }

    fs.writeFileSync(
      path.join(OUT, 'accepted-diff.patch'),
      diff.stdout,
      'utf8'
    );

    /*
     * Explicitly prohibit new function assignments from being added.
     */
    if (
      diff.stdout.includes('+= async') ||
      diff.stdout.includes('+ = async')
    ) {
      throw new Error(
        'Unexpected async assignment addition detected'
      );
    }

    console.log('Final diff captured                    : PASS');

    console.log('');
    console.log('============================================================');
    console.log(' PHASE 13S-2C-R3 REPAIR ACCEPTED');
    console.log('============================================================');
    console.log('Original ESLint defects              : 37');
    console.log('Duplicate fallback assignments       : REMOVED 37/37');
    console.log('Residual no-empty condition          : DOCUMENTED, NO RUNTIME CHANGE');
    console.log('Node syntax                          : PASS x4');
    console.log('Targeted ESLint                      : PASS');
    console.log('Duplicate assignments remaining      : 0');
    console.log('git diff --check                     : PASS');
    console.log('Modified target files                : 4');
    console.log('Rollback                             : NOT REQUIRED');
    console.log('');
    console.log(`Evidence: ${OUT}`);

    process.exitCode = 0;

  } catch (err) {
    console.error('');
    console.error('============================================================');
    console.error(' VALIDATION FAILED - RESTORING ORIGINALS');
    console.error('============================================================');

    console.error(err.stack || err.message || String(err));

    const ok = restore(backups);

    if (ok) {
      console.log('Byte-for-byte rollback                : PASS');
    }

    if (!ok) {
      console.error('Byte-for-byte rollback                : FAIL');
    }

    console.error('REPAIR ACCEPTED                       : NO');

    process.exitCode = 1;
  }
}

try {
  main();
} catch (err) {
  console.error('');
  console.error('============================================================');
  console.error(' PRE-MODIFICATION SAFETY STOP');
  console.error('============================================================');

  console.error(err.stack || err.message || String(err));
  console.error('APPLICATION SOURCE MODIFIED           : NO');

  process.exitCode = 1;
}
