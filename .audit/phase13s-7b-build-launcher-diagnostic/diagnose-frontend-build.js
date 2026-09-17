const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = process.cwd();
const FRONTEND = path.join(ROOT, 'frontend');
const OUT = path.join(
  ROOT,
  '.audit',
  'phase13s-7b-build-launcher-diagnostic'
);

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

function describe(label, result) {
  console.log('');
  console.log(`[${label}]`);
  console.log(`status  : ${result.status}`);
  console.log(`signal  : ${result.signal}`);
  console.log(
    `error   : ${
      result.error
        ? `${result.error.name}: ${result.error.message} code=${result.error.code || ''}`
        : 'NONE'
    }`
  );
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });

  console.log('');
  console.log('============================================================');
  console.log(' PHASE 13S-7B - FRONTEND BUILD LAUNCHER DIAGNOSTIC');
  console.log('============================================================');

  const packageJson = path.join(
    FRONTEND,
    'package.json'
  );

  if (!fs.existsSync(packageJson)) {
    throw new Error(
      'frontend/package.json missing'
    );
  }

  const pkg = JSON.parse(
    fs.readFileSync(
      packageJson,
      'utf8'
    )
  );

  console.log(
    `Frontend build script                : ${pkg.scripts?.build || 'MISSING'}`
  );

  /*
   * Confirm current rollback state.
   */
  const sourceFiles = [];

  function walk(dir) {
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
          entry.name === 'dist' ||
          entry.name === 'coverage'
        ) {
          continue;
        }

        walk(full);
        continue;
      }

      if (
        entry.isFile() &&
        /\.(js|jsx|ts|tsx)$/i.test(
          entry.name
        )
      ) {
        sourceFiles.push(full);
      }
    }
  }

  walk(
    path.join(
      FRONTEND,
      'src'
    )
  );

  const broken =
    "import './${className}.css';";

  let count = 0;

  for (const file of sourceFiles) {
    const text =
      fs.readFileSync(
        file,
        'utf8'
      );

    count +=
      text.split(broken).length - 1;
  }

  console.log(
    `Current malformed import count        : ${count}`
  );

  if (count !== 314) {
    throw new Error(
      `Expected rollback state of 314 malformed imports; found ${count}`
    );
  }

  /*
   * Node itself.
   */
  const nodeVersion =
    run(
      process.execPath,
      ['--version']
    );

  describe(
    'NODE',
    nodeVersion
  );

  console.log(
    (nodeVersion.stdout || '').trim()
  );

  /*
   * Test npm.cmd exactly as previous transaction did.
   * This is diagnostic only.
   */
  const directNpm =
    run(
      'npm.cmd',
      ['--version'],
      {
        cwd: FRONTEND
      }
    );

  describe(
    'DIRECT npm.cmd',
    directNpm
  );

  console.log(
    (directNpm.stdout || '').trim()
  );

  /*
   * Resolve npm through Windows command processor.
   */
  const whereNpm =
    run(
      'cmd.exe',
      [
        '/d',
        '/s',
        '/c',
        'where npm && npm --version'
      ],
      {
        cwd: FRONTEND
      }
    );

  describe(
    'CMD npm resolution',
    whereNpm
  );

  console.log(
    (whereNpm.stdout || '').trim()
  );

  if (whereNpm.stderr) {
    console.log(
      whereNpm.stderr.trim()
    );
  }

  /*
   * Run the EXISTING baseline frontend build.
   * No source modification occurs.
   *
   * This tells us whether:
   * A) the previous failure was only npm.cmd spawning, or
   * B) the baseline itself currently has a build failure.
   */
  console.log('');
  console.log(
    'Running rolled-back baseline frontend build via cmd.exe...'
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

  describe(
    'BASELINE BUILD VIA CMD',
    build
  );

  fs.writeFileSync(
    path.join(
      OUT,
      'baseline-build.stdout.log'
    ),
    build.stdout || '',
    'utf8'
  );

  fs.writeFileSync(
    path.join(
      OUT,
      'baseline-build.stderr.log'
    ),
    build.stderr || '',
    'utf8'
  );

  fs.writeFileSync(
    path.join(
      OUT,
      'diagnostic.json'
    ),
    JSON.stringify(
      {
        malformedImportCount: count,

        node: {
          status: nodeVersion.status,
          signal: nodeVersion.signal,
          error:
            nodeVersion.error
              ? {
                  name:
                    nodeVersion.error.name,
                  message:
                    nodeVersion.error.message,
                  code:
                    nodeVersion.error.code
                }
              : null
        },

        directNpm: {
          status: directNpm.status,
          signal: directNpm.signal,
          error:
            directNpm.error
              ? {
                  name:
                    directNpm.error.name,
                  message:
                    directNpm.error.message,
                  code:
                    directNpm.error.code
                }
              : null
        },

        cmdNpm: {
          status: whereNpm.status,
          signal: whereNpm.signal,
          error:
            whereNpm.error
              ? {
                  name:
                    whereNpm.error.name,
                  message:
                    whereNpm.error.message,
                  code:
                    whereNpm.error.code
                }
              : null
        },

        baselineBuild: {
          status: build.status,
          signal: build.signal,
          error:
            build.error
              ? {
                  name:
                    build.error.name,
                  message:
                    build.error.message,
                  code:
                    build.error.code
                }
              : null
        }
      },
      null,
      2
    ),
    'utf8'
  );

  console.log('');
  console.log('============================================================');

  if (build.status === 0) {
    console.log(
      ' BASELINE FRONTEND BUILD VIA CMD: PASS'
    );

    console.log(
      ' Previous Batch 4 failure was a launcher/execution defect.'
    );
  } else {
    console.log(
      ' BASELINE FRONTEND BUILD VIA CMD: FAIL'
    );

    console.log(
      ' Existing frontend build failure must be diagnosed before Batch 4.'
    );
  }

  console.log('============================================================');

  console.log(
    'APPLICATION SOURCE MODIFIED          : NO'
  );

  console.log(
    `Evidence                             : ${OUT}`
  );

  /*
   * Do not return failure merely because baseline build fails.
   * This command is diagnostic.
   */
  process.exitCode = 0;
}

try {
  main();
} catch (error) {
  console.error('');
  console.error(
    'DIAGNOSTIC FAILED'
  );

  console.error(
    error.stack ||
    error.message ||
    String(error)
  );

  console.error(
    'APPLICATION SOURCE MODIFIED          : NO'
  );

  process.exitCode = 1;
}
