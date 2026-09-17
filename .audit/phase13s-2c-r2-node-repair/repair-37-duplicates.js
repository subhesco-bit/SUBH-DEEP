const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = String.raw`C:\Users\DIYA GOEL\Downloads\EBDESIGN`;
const BACKEND = path.join(ROOT, 'backend');
const OUT = path.join(ROOT, '.audit', 'phase13s-2c-r2-node-repair');
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

const targetFiles = PLAN.map(x => x.file);
const absoluteFiles = targetFiles.map(f => path.join(BACKEND, f));

function run(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    cwd: options.cwd || BACKEND,
    encoding: 'utf8',
    windowsHide: true
  });

  return {
    code: result.status === null ? 999 : result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    error: result.error || null
  };
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ensureDirectory(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function backupName(file) {
  return file.replace(/[\\/:*?"<>|]/g, '_');
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
      if (ch === '\n') {
        lineComment = false;
      }
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

    if (single || double || template) {
      continue;
    }

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
      throw new Error(`Delimiter underflow while scanning statement at offset ${start}`);
    }
  }

  throw new Error(`Could not locate safe statement terminator from offset ${start}`);
}

function getAssignmentMatchesBeforeDeclaration(source, name) {
  const escaped = escapeRegex(name);

  const declRegex = new RegExp(
    `^[ \\t]*(?:async[ \\t]+)?function[ \\t]+${escaped}[ \\t]*\\(`,
    'm'
  );

  const declaration = declRegex.exec(source);

  if (!declaration) {
    throw new Error(`Missing real function declaration: ${name}`);
  }

  const prefix = source.slice(0, declaration.index);

  const assignRegex = new RegExp(
    `^[ \\t]*${escaped}[ \\t]*=[ \\t]*async\\b`,
    'gm'
  );

  const matches = [...prefix.matchAll(assignRegex)];

  return {
    declarationIndex: declaration.index,
    assignments: matches
  };
}

function validatePlanBeforeWrite() {
  let count = 0;
  const validation = [];

  for (const item of PLAN) {
    const abs = path.join(BACKEND, item.file);

    if (!fs.existsSync(abs)) {
      throw new Error(`Missing target file: ${item.file}`);
    }

    const source = fs.readFileSync(abs, 'utf8');

    for (const name of item.names) {
      const result = getAssignmentMatchesBeforeDeclaration(source, name);

      if (result.assignments.length !== 1) {
        throw new Error(
          `${item.file}: ${name} expected exactly 1 early async assignment; found ${result.assignments.length}`
        );
      }

      count++;

      validation.push({
        file: item.file,
        function: name,
        assignmentIndex: result.assignments[0].index,
        declarationIndex: result.declarationIndex
      });
    }
  }

  if (count !== 37) {
    throw new Error(`Expected 37 validated duplicate structures; found ${count}`);
  }

  fs.writeFileSync(
    path.join(OUT, 'precondition-validation.json'),
    JSON.stringify(validation, null, 2),
    'utf8'
  );

  return count;
}

function buildRepair(source, item) {
  const ranges = [];

  for (const name of item.names) {
    const result = getAssignmentMatchesBeforeDeclaration(source, name);

    if (result.assignments.length !== 1) {
      throw new Error(
        `${item.file}: ${name} changed during transaction; assignment count = ${result.assignments.length}`
      );
    }

    const start = result.assignments[0].index;
    const end = findStatementEnd(source, start);

    if (end >= result.declarationIndex) {
      throw new Error(
        `${item.file}: refusing unsafe removal for ${name}; range reaches real declaration`
      );
    }

    ranges.push({
      name,
      start,
      end
    });
  }

  ranges.sort((a, b) => a.start - b.start);

  for (let i = 1; i < ranges.length; i++) {
    if (ranges[i].start < ranges[i - 1].end) {
      throw new Error(
        `${item.file}: overlapping repair ranges: ${ranges[i - 1].name} / ${ranges[i].name}`
      );
    }
  }

  let repaired = source;

  for (const range of [...ranges].sort((a, b) => b.start - a.start)) {
    repaired =
      repaired.slice(0, range.start) +
      repaired.slice(range.end);
  }

  return {
    repaired,
    ranges
  };
}

function restoreAll(backups) {
  let restoreFailure = false;

  for (const entry of backups) {
    try {
      fs.copyFileSync(entry.backup, entry.original);

      const restored = fs.readFileSync(entry.original);
      const before = fs.readFileSync(entry.backup);

      if (!restored.equals(before)) {
        restoreFailure = true;
        console.error(`RESTORE BYTE MISMATCH: ${entry.file}`);
      }
    } catch (err) {
      restoreFailure = true;
      console.error(`RESTORE FAILURE: ${entry.file}: ${err.message}`);
    }
  }

  return !restoreFailure;
}

function validateNoAssignmentsRemain() {
  let remaining = 0;

  for (const item of PLAN) {
    const source = fs.readFileSync(
      path.join(BACKEND, item.file),
      'utf8'
    );

    for (const name of item.names) {
      const escaped = escapeRegex(name);

      const regex = new RegExp(
        `^[ \\t]*${escaped}[ \\t]*=[ \\t]*async\\b`,
        'm'
      );

      if (regex.test(source)) {
        remaining++;
        console.error(`REMAINS: ${item.file} :: ${name}`);
      }

      const declRegex = new RegExp(
        `^[ \\t]*(?:async[ \\t]+)?function[ \\t]+${escaped}[ \\t]*\\(`,
        'm'
      );

      if (!declRegex.test(source)) {
        throw new Error(
          `Real function declaration disappeared: ${item.file} :: ${name}`
        );
      }
    }
  }

  if (remaining !== 0) {
    throw new Error(`${remaining} duplicate assignments remain`);
  }

  return remaining;
}

function main() {
  ensureDirectory(OUT);
  ensureDirectory(BACKUP);

  console.log('');
  console.log('============================================================');
  console.log(' PHASE 13S-2C-R2 - NODE TRANSACTIONAL REPAIR');
  console.log('============================================================');

  if (PLAN.reduce((n, x) => n + x.names.length, 0) !== 37) {
    throw new Error('Repair plan no longer contains exactly 37 functions');
  }

  for (const file of absoluteFiles) {
    if (!fs.existsSync(file)) {
      throw new Error(`Target file missing: ${file}`);
    }
  }

  const status = run('git', ['status', '--porcelain', '--', ...targetFiles]);

  if (status.code !== 0) {
    throw new Error(`git status failed:\n${status.stderr}`);
  }

  if (status.stdout.trim()) {
    console.error(status.stdout);
    throw new Error(
      'SAFETY STOP: one or more of the four target files are already modified'
    );
  }

  console.log('Target Git-clean check                : PASS');

  const eslintJs = path.join(
    BACKEND,
    'node_modules',
    'eslint',
    'bin',
    'eslint.js'
  );

  if (!fs.existsSync(eslintJs)) {
    throw new Error(
      `Local ESLint JS executable missing: ${eslintJs}`
    );
  }

  console.log('Local ESLint executable               : PASS');

  const verified = validatePlanBeforeWrite();

  console.log(`Structural duplicates verified        : ${verified} / 37`);

  const backups = [];

  for (const item of PLAN) {
    const original = path.join(BACKEND, item.file);
    const backup = path.join(BACKUP, backupName(item.file));

    fs.copyFileSync(original, backup);

    backups.push({
      file: item.file,
      original,
      backup
    });
  }

  console.log('Byte-for-byte backups                 : CREATED');

  const repairLog = [];

  try {
    let removed = 0;

    for (const item of PLAN) {
      const abs = path.join(BACKEND, item.file);
      const source = fs.readFileSync(abs, 'utf8');

      const result = buildRepair(source, item);

      if (result.ranges.length !== item.names.length) {
        throw new Error(
          `${item.file}: expected ${item.names.length} removals, built ${result.ranges.length}`
        );
      }

      fs.writeFileSync(abs, result.repaired, 'utf8');

      removed += result.ranges.length;

      for (const range of result.ranges) {
        repairLog.push({
          file: item.file,
          function: range.name,
          removedStart: range.start,
          removedEnd: range.end
        });
      }

      console.log(
        `Removed ${result.ranges.length.toString().padStart(2)} : ${item.file}`
      );
    }

    if (removed !== 37) {
      throw new Error(`Repair count mismatch: removed ${removed}, expected 37`);
    }

    fs.writeFileSync(
      path.join(OUT, 'repair-log.json'),
      JSON.stringify(repairLog, null, 2),
      'utf8'
    );

    console.log(`Total duplicate assignments removed   : ${removed} / 37`);

    console.log('');
    console.log('[1/5] NODE SYNTAX');

    for (const item of PLAN) {
      const result = run(
        process.execPath,
        ['--check', path.join(BACKEND, item.file)]
      );

      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);

      if (result.code !== 0) {
        throw new Error(`node --check failed: ${item.file}`);
      }

      console.log(`PASS : ${item.file}`);
    }

    console.log('');
    console.log('[2/5] TARGETED ESLINT');

    const eslint = run(
      process.execPath,
      [eslintJs, ...targetFiles]
    );

    fs.writeFileSync(
      path.join(OUT, 'eslint-after.txt'),
      eslint.stdout + eslint.stderr,
      'utf8'
    );

    if (eslint.stdout) process.stdout.write(eslint.stdout);
    if (eslint.stderr) process.stderr.write(eslint.stderr);

    console.log(`ESLint exit code                     : ${eslint.code}`);

    if (eslint.code !== 0) {
      throw new Error(`ESLint failed with exit code ${eslint.code}`);
    }

    console.log('ESLint                               : PASS');

    console.log('');
    console.log('[3/5] DUPLICATE ASSIGNMENT RECHECK');

    const remaining = validateNoAssignmentsRemain();

    console.log(`Remaining duplicate assignments      : ${remaining}`);

    console.log('');
    console.log('[4/5] GIT DIFF CHECK');

    const diffCheck = run(
      'git',
      ['diff', '--check', '--', ...targetFiles]
    );

    if (diffCheck.stdout) process.stdout.write(diffCheck.stdout);
    if (diffCheck.stderr) process.stderr.write(diffCheck.stderr);

    if (diffCheck.code !== 0) {
      throw new Error('git diff --check failed');
    }

    console.log('git diff --check                     : PASS');

    const diff = run(
      'git',
      ['diff', '--', ...targetFiles]
    );

    fs.writeFileSync(
      path.join(OUT, 'accepted-diff.patch'),
      diff.stdout,
      'utf8'
    );

    console.log('');
    console.log('[5/5] CHANGE-SCOPE VALIDATION');

    const numstat = run(
      'git',
      ['diff', '--numstat', '--', ...targetFiles]
    );

    if (numstat.code !== 0) {
      throw new Error(`git diff --numstat failed: ${numstat.stderr}`);
    }

    fs.writeFileSync(
      path.join(OUT, 'numstat.txt'),
      numstat.stdout,
      'utf8'
    );

    console.log(numstat.stdout.trim());

    const changedLines = numstat.stdout
      .trim()
      .split(/\r?\n/)
      .filter(Boolean);

    if (changedLines.length !== 4) {
      throw new Error(
        `Expected exactly four changed target files; observed ${changedLines.length}`
      );
    }

    for (const line of changedLines) {
      const fields = line.split('\t');

      if (fields.length < 3) {
        throw new Error(`Unexpected numstat row: ${line}`);
      }

      const added = fields[0];

      if (added !== '0') {
        throw new Error(
          `Unexpected added lines detected. Repair should only remove fallback assignments: ${line}`
        );
      }
    }

    const finalStatus = run(
      'git',
      ['status', '--short', '--', ...targetFiles]
    );

    if (finalStatus.code !== 0) {
      throw new Error(`final git status failed: ${finalStatus.stderr}`);
    }

    const statusRows = finalStatus.stdout
      .trim()
      .split(/\r?\n/)
      .filter(Boolean);

    if (statusRows.length !== 4) {
      throw new Error(
        `Expected exactly 4 modified targets; observed ${statusRows.length}`
      );
    }

    fs.writeFileSync(
      path.join(OUT, 'target-status.txt'),
      finalStatus.stdout,
      'utf8'
    );

    console.log('');
    console.log(finalStatus.stdout.trim());

    console.log('');
    console.log('============================================================');
    console.log(' PHASE 13S-2C-R2 REPAIR ACCEPTED');
    console.log('============================================================');
    console.log('37 duplicate fallback assignments : REMOVED');
    console.log('Node syntax                       : PASS x4');
    console.log('ESLint                            : PASS');
    console.log('Remaining duplicates              : 0');
    console.log('git diff --check                  : PASS');
    console.log('Changed source files              : 4');
    console.log('Repair type                       : DELETION ONLY');
    console.log('Rollback                          : NOT REQUIRED');
    console.log('');
    console.log(`Evidence directory: ${OUT}`);

    process.exitCode = 0;
  } catch (err) {
    console.error('');
    console.error('============================================================');
    console.error(' VALIDATION FAILURE - AUTOMATIC ROLLBACK');
    console.error('============================================================');
    console.error(err.stack || err.message || String(err));

    const restored = restoreAll(backups);

    if (restored) {
      console.log('Byte-for-byte rollback verification : PASS');
    } else {
      console.error('Byte-for-byte rollback verification : FAIL');
    }

    console.error('');
    console.error('REPAIR ACCEPTED : NO');
    console.error(`Evidence directory: ${OUT}`);

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
  console.error('');
  console.error('APPLICATION SOURCE MODIFIED : NO');

  process.exitCode = 1;
}
