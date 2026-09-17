const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = process.cwd();
const FRONTEND = path.join(ROOT, 'frontend');
const SRC = path.join(FRONTEND, 'src');

const OUT = path.join(
  ROOT,
  '.audit',
  'phase13s-7c-template-css-final'
);

const EXACT_IMPORT =
  "import './${className}.css';";

const EXPECTED_COUNT = 314;

const SOURCE_EXTS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx'
]);

const STYLE_EXTS = new Set([
  '.css',
  '.scss',
  '.sass',
  '.less'
]);

function fail(message) {
  throw new Error(message);
}

function git(args) {
  return cp.spawnSync(
    'git',
    args,
    {
      cwd: ROOT,
      encoding: 'utf8',
      windowsHide: true
    }
  );
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
      maxBuffer: 50 * 1024 * 1024
    }
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
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === '.git' ||
        entry.name === 'dist' ||
        entry.name === 'build' ||
        entry.name === 'coverage'
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

function countLiteral(text, literal) {
  let count = 0;
  let index = 0;

  while (true) {
    index = text.indexOf(literal, index);

    if (index === -1) {
      break;
    }

    count++;
    index += literal.length;
  }

  return count;
}

function detectEol(text) {
  return text.includes('\r\n')
    ? '\r\n'
    : '\n';
}

function readPreserve(file) {
  const raw = fs.readFileSync(file);

  const bom =
    raw.length >= 3 &&
    raw[0] === 0xEF &&
    raw[1] === 0xBB &&
    raw[2] === 0xBF;

  const body = bom
    ? raw.slice(3)
    : raw;

  return {
    raw,
    bom,
    text: body.toString('utf8')
  };
}

function writePreserve(file, text, bom) {
  const body = Buffer.from(text, 'utf8');

  if (bom) {
    fs.writeFileSync(
      file,
      Buffer.concat([
        Buffer.from([0xEF,0xBB,0xBF]),
        body
      ])
    );

    return;
  }

  fs.writeFileSync(file, body);
}

function discover() {
  const files = walk(SRC)
    .filter(file =>
      SOURCE_EXTS.has(
        path.extname(file).toLowerCase()
      )
    );

  const findings = [];

  for (const file of files) {
    let text;

    try {
      text = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    const count =
      countLiteral(
        text,
        EXACT_IMPORT
      );

    if (!count) {
      continue;
    }

    const dir = path.dirname(file);
    const base =
      path.basename(
        file,
        path.extname(file)
      );

    const adjacentStyles = [];

    for (
      const item of fs.readdirSync(
        dir,
        { withFileTypes: true }
      )
    ) {
      if (!item.isFile()) {
        continue;
      }

      const ext =
        path.extname(
          item.name
        ).toLowerCase();

      if (!STYLE_EXTS.has(ext)) {
        continue;
      }

      adjacentStyles.push(
        item.name
      );
    }

    const exactBaseStyles =
      adjacentStyles.filter(name => {
        const styleBase =
          path.basename(
            name,
            path.extname(name)
          );

        return (
          styleBase.toLowerCase() ===
          base.toLowerCase()
        );
      });

    const literalTarget =
      path.join(
        dir,
        '${className}.css'
      );

    findings.push({
      file: rel(file),
      absoluteFile: file,
      occurrenceCount: count,
      base,
      adjacentStyles,
      exactBaseStyles,
      literalTargetExists:
        fs.existsSync(literalTarget)
    });
  }

  return findings;
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
    ' PHASE 13S-7 - TEMPLATE CSS IMPORT REPAIR'
  );
  console.log(
    '============================================================'
  );

  if (!fs.existsSync(SRC)) {
    fail(
      'frontend/src does not exist'
    );
  }

  /*
   * --------------------------------------------------------
   * 1. AUTHORITATIVE DISCOVERY
   * --------------------------------------------------------
   */

  const findings = discover();

  const affectedFiles =
    findings.length;

  const totalOccurrences =
    findings.reduce(
      (sum, item) =>
        sum + item.occurrenceCount,
      0
    );

  console.log(
    `Affected source files                 : ${affectedFiles}`
  );

  console.log(
    `Broken import occurrences             : ${totalOccurrences}`
  );

  fs.writeFileSync(
    path.join(
      OUT,
      'pre-repair-discovery.json'
    ),
    JSON.stringify(
      findings.map(item => ({
        file: item.file,
        occurrenceCount:
          item.occurrenceCount,
        adjacentStyles:
          item.adjacentStyles,
        exactBaseStyles:
          item.exactBaseStyles,
        literalTargetExists:
          item.literalTargetExists
      })),
      null,
      2
    ),
    'utf8'
  );

  /*
   * We already established 314 in the earlier audit.
   * Do not silently repair a changed population.
   */
  if (
    totalOccurrences !== EXPECTED_COUNT
  ) {
    console.error('');
    console.error(
      'EXPECTED DEFECT POPULATION CHANGED'
    );

    console.error(
      `Expected ${EXPECTED_COUNT}; found ${totalOccurrences}`
    );

    fail(
      'Batch 4 stopped before modification.'
    );
  }

  console.log(
    `Expected population                   : PASS ${EXPECTED_COUNT}/${EXPECTED_COUNT}`
  );

  /*
   * Each file should contain the malformed import once.
   * Multiple occurrences may mean a different generator defect.
   */
  const duplicates =
    findings.filter(
      item =>
        item.occurrenceCount !== 1
    );

  if (duplicates.length) {
    console.error('');
    console.error(
      'FILES WITH NON-SINGLE DEFECT COUNT:'
    );

    for (const item of duplicates) {
      console.error(
        `${item.file} -> ${item.occurrenceCount}`
      );
    }

    fail(
      'Non-homogeneous generator population.'
    );
  }

  console.log(
    'One malformed import per file         : PASS'
  );

  /*
   * --------------------------------------------------------
   * 2. STYLESHEET SAFETY CLASSIFICATION
   * --------------------------------------------------------
   *
   * A literal file called ${className}.css would change the
   * interpretation completely. Stop if one exists.
   */

  const literalFiles =
    findings.filter(
      item =>
        item.literalTargetExists
    );

  if (literalFiles.length) {
    console.error('');
    console.error(
      'LITERAL ${className}.css FILES FOUND:'
    );

    for (const item of literalFiles) {
      console.error(
        item.file
      );
    }

    fail(
      'Cannot classify these imports as broken literals safely.'
    );
  }

  console.log(
    'Literal ${className}.css targets      : NONE'
  );

  /*
   * If a component has a same-basename stylesheet, deletion
   * could remove intended component styling. Stop and inspect
   * rather than guessing whether the import should be rewritten.
   */

  const sameBaseCandidates =
    findings.filter(
      item =>
        item.exactBaseStyles.length > 0
    );

  if (sameBaseCandidates.length) {
    console.error('');
    console.error(
      '============================================================'
    );

    console.error(
      ' SAFETY STOP - POSSIBLE REAL STYLESHEETS'
    );

    console.error(
      '============================================================'
    );

    for (
      const item of
      sameBaseCandidates.slice(0, 100)
    ) {
      console.error(
        `${item.file} -> ${item.exactBaseStyles.join(', ')}`
      );
    }

    fs.writeFileSync(
      path.join(
        OUT,
        'same-basename-css-candidates.json'
      ),
      JSON.stringify(
        sameBaseCandidates.map(
          item => ({
            file: item.file,
            candidates:
              item.exactBaseStyles
          })
        ),
        null,
        2
      ),
      'utf8'
    );

    console.error('');
    console.error(
      'APPLICATION SOURCE MODIFIED          : NO'
    );

    console.error(
      'BATCH 4 REPAIR ACCEPTED              : NO'
    );

    process.exitCode = 2;
    return;
  }

  console.log(
    'Same-basename stylesheet conflicts    : NONE'
  );

  /*
   * Adjacent CSS may still be shared/global styling.
   * Record it, but do not stop solely because shared CSS exists.
   */

  const adjacentStyleFiles =
    findings.filter(
      item =>
        item.adjacentStyles.length > 0
    );

  console.log(
    `Affected files with adjacent styles   : ${adjacentStyleFiles.length}`
  );

  /*
   * --------------------------------------------------------
   * 3. TARGETED GIT SAFETY
   * --------------------------------------------------------
   *
   * Check only the 314 files. Previously accepted Batch 1-3
   * modifications elsewhere in the worktree are preserved.
   */

  const targetRel =
    findings.map(
      item => item.file
    );

  const preStatus = git([
    'status',
    '--porcelain',
    '--',
    ...targetRel
  ]);

  if (preStatus.status !== 0) {
    fail(
      preStatus.stderr ||
      'git status failed'
    );
  }

  if (
    preStatus.stdout.trim()
  ) {
    console.error('');
    console.error(
      preStatus.stdout
    );

    fail(
      'Batch 4 target files are already modified. ' +
      'No source changes were made.'
    );
  }

  console.log(
    'All Batch 4 target files Git-clean    : PASS'
  );

  /*
   * --------------------------------------------------------
   * 4. SNAPSHOT ALL TARGETS
   * --------------------------------------------------------
   */

  const snapshots =
    new Map();

  for (const item of findings) {
    snapshots.set(
      item.absoluteFile,
      readPreserve(
        item.absoluteFile
      )
    );
  }

  fs.writeFileSync(
    path.join(
      OUT,
      'target-files.txt'
    ),
    targetRel.join('\n') + '\n',
    'utf8'
  );

  /*
   * --------------------------------------------------------
   * 5. TRANSACTIONAL REPAIR
   * --------------------------------------------------------
   */

  let modified = false;

  try {
    let repairedCount = 0;

    for (const item of findings) {
      const source =
        snapshots.get(
          item.absoluteFile
        );

      const before =
        source.text;

      const eol =
        detectEol(before);

      /*
       * Remove exactly the malformed import line.
       * Supports indentation but does not alter any other line.
       */
      const lines =
        before.split(
          /\r?\n/
        );

      let removed = 0;

      const repairedLines =
        lines.filter(line => {
          if (
            line.trim() ===
            EXACT_IMPORT
          ) {
            removed++;
            return false;
          }

          return true;
        });

      if (removed !== 1) {
        fail(
          `Expected one exact import in ${item.file}; removed ${removed}`
        );
      }

      const after =
        repairedLines.join(eol);

      writePreserve(
        item.absoluteFile,
        after,
        source.bom
      );

      repairedCount += removed;
    }

    modified = true;

    console.log(
      `Malformed imports removed             : ${repairedCount}`
    );

    if (
      repairedCount !==
      EXPECTED_COUNT
    ) {
      fail(
        `Repair count mismatch: ${repairedCount}`
      );
    }

    /*
     * ------------------------------------------------------
     * 6. AUTHORITATIVE RESCAN
     * ------------------------------------------------------
     */

    const afterFindings =
      discover();

    const remaining =
      afterFindings.reduce(
        (sum, item) =>
          sum + item.occurrenceCount,
        0
      );

    if (remaining !== 0) {
      fail(
        `Broken template CSS imports remain: ${remaining}`
      );
    }

    console.log(
      'Remaining malformed CSS imports       : 0'
    );

    /*
     * ------------------------------------------------------
     * 7. CHECK NO TARGET FILE DISAPPEARED
     * ------------------------------------------------------
     */

    for (const item of findings) {
      if (
        !fs.existsSync(
          item.absoluteFile
        )
      ) {
        fail(
          `Target file disappeared: ${item.file}`
        );
      }
    }

    console.log(
      'Target source files preserved         : PASS 314/314'
    );

    /*
     * ------------------------------------------------------
     * 8. VERIFY CHANGE SHAPE
     * ------------------------------------------------------
     *
     * Each target should lose exactly one physical line.
     */

    for (const item of findings) {
      const original =
        snapshots.get(
          item.absoluteFile
        ).text;

      const current =
        readPreserve(
          item.absoluteFile
        ).text;

      const originalLines =
        original.split(/\r?\n/);

      const currentLines =
        current.split(/\r?\n/);

      if (
        currentLines.length !==
        originalLines.length - 1
      ) {
        fail(
          `Unexpected line-count change: ${item.file}`
        );
      }

      const reconstructed =
        originalLines
          .filter(
            line =>
              line.trim() !==
              EXACT_IMPORT
          )
          .join(
            detectEol(original)
          );

      if (
        current !==
        reconstructed
      ) {
        fail(
          `Unexpected non-import content change: ${item.file}`
        );
      }
    }

    console.log(
      'Exact one-line-only repair shape      : PASS 314/314'
    );

    /*
     * ------------------------------------------------------
     * 9. GIT DIFF QUALITY
     * ------------------------------------------------------
     */

    const diffCheck = git([
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
        'git diff --check failed'
      );
    }

    console.log(
      'git diff --check                    : PASS'
    );

    /*
     * ------------------------------------------------------
     * 10. EXACT GIT SCOPE
     * ------------------------------------------------------
     */

    const status = git([
      'status',
      '--porcelain',
      '--',
      ...targetRel
    ]);

    if (
      status.status !== 0
    ) {
      fail(
        status.stderr ||
        'Final git status failed'
      );
    }

    const changed =
      status.stdout
        .split(/\r?\n/)
        .filter(Boolean);

    if (
      changed.length !==
      affectedFiles
    ) {
      fail(
        `Expected ${affectedFiles} modified target files; Git reports ${changed.length}`
      );
    }

    const expectedSet =
      new Set(targetRel);

    for (const line of changed) {
      const changedPath =
        line
          .slice(3)
          .trim()
          .replace(/\\/g, '/');

      if (
        !expectedSet.has(
          changedPath
        )
      ) {
        fail(
          `Unexpected modified Batch 4 file: ${changedPath}`
        );
      }
    }

    console.log(
      `Exact Batch 4 modification scope     : PASS (${changed.length} files)`
    );

    /*
     * ------------------------------------------------------
     * 11. TARGETED ESLINT
     * ------------------------------------------------------
     *
     * Invoke local ESLint directly. This may take some time
     * for 314 files but does not alter source.
     */

    const eslint =
      path.join(
        FRONTEND,
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
            ...targetRel.map(file =>
              path.join(
                ROOT,
                file
              )
            )
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
          'Targeted Batch 4 ESLint failed.'
        );
      }

      console.log(
        'Targeted ESLint                     : PASS'
      );
    } else {
      console.log(
        'Targeted ESLint                     : SKIPPED - local binary unavailable'
      );
    }

    /*
     * ------------------------------------------------------
     * 12. FRONTEND PRODUCTION BUILD
     * ------------------------------------------------------
     */

    const packageJson =
      path.join(
        FRONTEND,
        'package.json'
      );

    if (
      !fs.existsSync(
        packageJson
      )
    ) {
      fail(
        'frontend/package.json missing'
      );
    }

    const pkg =
      JSON.parse(
        fs.readFileSync(
          packageJson,
          'utf8'
        )
      );

    if (
      !pkg.scripts ||
      !pkg.scripts.build
    ) {
      fail(
        'frontend build script missing'
      );
    }

    console.log('');
    console.log(
      'Running frontend production build...'
    );

    const build =
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
      );

    fs.writeFileSync(
      path.join(
        OUT,
        'frontend-build.stdout.log'
      ),
      build.stdout || '',
      'utf8'
    );

    fs.writeFileSync(
      path.join(
        OUT,
        'frontend-build.stderr.log'
      ),
      build.stderr || '',
      'utf8'
    );

    if (
      build.status !== 0
    ) {
      console.error(
        build.stdout || ''
      );

      console.error(
        build.stderr || ''
      );

      fail(
        `Frontend production build failed with exit code ${build.status}`
      );
    }

    console.log(
      'Frontend production build           : PASS'
    );

    /*
     * ------------------------------------------------------
     * 13. POST-BUILD RECHECK
     * ------------------------------------------------------
     */

    const finalFindings =
      discover();

    if (
      finalFindings.length !== 0
    ) {
      fail(
        'Malformed CSS import reappeared after build.'
      );
    }

    console.log(
      'Post-build malformed import count    : 0'
    );

    /*
     * ------------------------------------------------------
     * 14. SAVE EVIDENCE
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
      status.stdout || '',
      'utf8'
    );

    fs.writeFileSync(
      path.join(
        OUT,
        'repair-summary.json'
      ),
      JSON.stringify(
        {
          defect:
            EXACT_IMPORT,
          expectedOccurrences:
            EXPECTED_COUNT,
          repairedOccurrences:
            EXPECTED_COUNT,
          affectedFiles,
          remainingOccurrences:
            0,
          literalTargetConflicts:
            0,
          sameBasenameStyleConflicts:
            0,
          adjacentStyleDirectories:
            adjacentStyleFiles.length,
          sourceFilesDeleted:
            0,
          repairType:
            'exact malformed import removal',
          frontendBuild:
            'PASS'
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
      ' BATCH 4 TEMPLATE CSS REPAIR ACCEPTED'
    );

    console.log(
      '============================================================'
    );

    console.log(
      `Original malformed imports           : ${EXPECTED_COUNT}`
    );

    console.log(
      `Affected frontend files              : ${affectedFiles}`
    );

    console.log(
      `Malformed imports removed            : ${EXPECTED_COUNT}`
    );

    console.log(
      'Malformed imports remaining          : 0'
    );

    console.log(
      'Real same-basename styles overwritten: 0'
    );

    console.log(
      'Source files removed                 : 0'
    );

    console.log(
      'Non-import content modified          : 0'
    );

    console.log(
      'Frontend production build            : PASS'
    );

    console.log(
      `Evidence                             : ${OUT}`
    );

    process.exitCode = 0;

  } catch (error) {
    /*
     * ------------------------------------------------------
     * 15. BYTE-FOR-BYTE ROLLBACK
     * ------------------------------------------------------
     */

    console.error('');
    console.error(
      '============================================================'
    );

    console.error(
      ' BATCH 4 VALIDATION FAILED - ROLLBACK'
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
          snapshot
        ] of snapshots.entries()
      ) {
        fs.writeFileSync(
          file,
          snapshot.raw
        );
      }
    }

    let rollbackPass = true;

    for (
      const [
        file,
        snapshot
      ] of snapshots.entries()
    ) {
      const restored =
        fs.readFileSync(file);

      if (
        !restored.equals(
          snapshot.raw
        )
      ) {
        rollbackPass = false;

        console.error(
          `ROLLBACK MISMATCH: ${rel(file)}`
        );
      }
    }

    const rollbackFindings =
      discover();

    const rollbackCount =
      rollbackFindings.reduce(
        (sum, item) =>
          sum + item.occurrenceCount,
        0
      );

    if (
      rollbackCount !==
      EXPECTED_COUNT
    ) {
      rollbackPass = false;
    }

    console.error(
      `Byte-for-byte rollback              : ${rollbackPass}`
    );

    console.error(
      `Restored malformed import count     : ${rollbackCount}`
    );

    console.error(
      'BATCH 4 REPAIR ACCEPTED            : NO'
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
    'APPLICATION SOURCE MODIFIED          : NO'
  );

  console.error(
    'BATCH 4 REPAIR ACCEPTED              : NO'
  );

  process.exitCode = 1;
}
