const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = process.cwd();
const OUT = path.join(ROOT, '.audit', 'phase13s-5d-m041-final-composition');

const ROUTE_REL =
  'backend/src/routes/M041VillageERP.js';

const CORE_REL =
  'backend/src/modules/M041/service.js';

const PROJECT_REL =
  'backend/src/modules/M041/villageProjectIntelligenceService.js';

const ROUTE = path.join(ROOT, ROUTE_REL);
const CORE = path.join(ROOT, CORE_REL);
const PROJECT = path.join(ROOT, PROJECT_REL);

function fail(message) {
  throw new Error(message);
}

function git(args) {
  return cp.spawnSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    windowsHide: true
  });
}

function unique(values) {
  return [...new Set(values)].sort();
}

function routeMethods(source) {
  return unique(
    [...source.matchAll(
      /\bservice\.([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g
    )].map(m => m[1])
  );
}

function staticExports(source) {
  const matches =
    [...source.matchAll(
      /module\.exports\s*=\s*\{([\s\S]*?)\}\s*;/g
    )];

  if (!matches.length) {
    fail('module.exports object not found');
  }

  const body = matches[matches.length - 1][1];

  return unique(
    body
      .split(',')
      .map(x => x.trim())
      .map(x =>
        x.match(/^([A-Za-z_$][A-Za-z0-9_$]*)/)?.[1]
      )
      .filter(Boolean)
  );
}

function count(source, literal) {
  return source.split(literal).length - 1;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });

  console.log('');
  console.log(
    '============================================================'
  );
  console.log(
    ' PHASE 13S-5D - FINAL M041 SERVICE COMPOSITION'
  );
  console.log(
    '============================================================'
  );

  for (const file of [ROUTE, CORE, PROJECT]) {
    if (!fs.existsSync(file)) {
      fail(`Missing required file: ${file}`);
    }
  }

  /*
   * Only the route may be changed by this transaction.
   * Core/project service sources must remain untouched.
   */
  const pre = git([
    'status',
    '--porcelain',
    '--',
    ROUTE_REL,
    CORE_REL,
    PROJECT_REL
  ]);

  if (pre.status !== 0) {
    fail(pre.stderr || 'git status failed');
  }

  if (pre.stdout.trim()) {
    console.error(pre.stdout);
    fail(
      'PRE-MODIFICATION SAFETY STOP: M041 repair targets are not Git-clean'
    );
  }

  console.log(
    'M041 repair targets Git-clean       : PASS'
  );

  const original =
    fs.readFileSync(ROUTE, 'utf8');

  const coreSource =
    fs.readFileSync(CORE, 'utf8');

  const projectSource =
    fs.readFileSync(PROJECT, 'utf8');

  fs.writeFileSync(
    path.join(OUT, 'M041VillageERP.before.js'),
    original
  );

  const used = routeMethods(original);
  const coreExports = staticExports(coreSource);
  const projectExports = staticExports(projectSource);

  console.log(
    `Route service methods               : ${used.length}`
  );

  console.log(
    `Core service exports                : ${coreExports.length}`
  );

  console.log(
    `Project service exports             : ${projectExports.length}`
  );

  if (used.length !== 24) {
    fail(
      `Expected 24 M041 route service methods; found ${used.length}`
    );
  }

  /*
   * Eight core route-name compatibility mappings.
   */
  const aliases = {
    getVillage: 'getVillageProfile',
    districtSummary: 'getDistrictEconomicSummary',
    initializeFinance: 'ensureVillageFinance',
    getDashboard: 'getVillageDashboard',
    createTask: 'createVillageTask',
    updateTask: 'updateVillageTask',
    upsertKPI: 'upsertVillageKPI',
    generateAI: 'generateVillageAIInsights'
  };

  const projectMethods = [
    'addFundingSource',
    'buildSubsidyAIContext',
    'createEstimate',
    'createProject',
    'getProject',
    'listProjects',
    'matchSubsidies',
    'upsertScheme'
  ];

  /*
   * Verify the eight project/subsidy implementations actually
   * belong to the M041 project-intelligence service.
   */
  for (const name of projectMethods) {
    if (!projectExports.includes(name)) {
      fail(
        `Project-intelligence export missing: ${name}`
      );
    }
  }

  /*
   * Resolve all 24 route contracts before writing anything.
   */
  const resolution = [];

  for (const name of used) {
    if (projectMethods.includes(name)) {
      resolution.push({
        route: name,
        source: 'project',
        target: name
      });
      continue;
    }

    if (coreExports.includes(name)) {
      resolution.push({
        route: name,
        source: 'core',
        target: name
      });
      continue;
    }

    const mapped = aliases[name];

    if (
      mapped &&
      coreExports.includes(mapped)
    ) {
      resolution.push({
        route: name,
        source: 'core-alias',
        target: mapped
      });
      continue;
    }

    fail(
      `UNRESOLVED M041 ROUTE CONTRACT: service.${name}`
    );
  }

  if (resolution.length !== 24) {
    fail(
      `Expected 24 resolved contracts; got ${resolution.length}`
    );
  }

  console.log(
    'All route contracts resolvable      : PASS 24/24'
  );

  /*
   * Verify the current broken bootstrap is still exactly the
   * architecture we audited.
   */
  const oldRequire =
    "M041Service = require('../modules/M041/M041Service');";

  if (count(original, oldRequire) !== 1) {
    fail(
      `Expected old M041Service require once; found ${count(original, oldRequire)}`
    );
  }

  if (
    count(
      original,
      'new M041Service(pool, logger)'
    ) !== 1
  ) {
    fail(
      'Expected invalid M041 constructor exactly once'
    );
  }

  const startMarker =
    '// Lazy-load M041Service to avoid circular dependencies';

  const endMarker =
    '// ==================== VILLAGE MANAGEMENT';

  const start = original.indexOf(startMarker);
  const end = original.indexOf(endMarker);

  if (
    start < 0 ||
    end < 0 ||
    end <= start
  ) {
    fail(
      'Unable to isolate legacy M041 bootstrap safely'
    );
  }

  /*
   * Request-aware composition.
   *
   * Important:
   * - listProjects forwards req.query
   * - createProject forwards authenticated user id
   * - createEstimate forwards authenticated user id
   * - getVillages converts legacy offset pagination into the
   *   canonical {limit,page} service contract.
   */
  const adapter = [
    '// Canonical M041 service composition.',
    '// Core village/ERP operations and project/subsidy intelligence',
    '// remain separate domain services and are composed here for this',
    '// legacy route surface.',
    "const M041CoreService = require('../modules/M041/service');",
    "const M041ProjectService = require('../modules/M041/villageProjectIntelligenceService');",
    '',
    'const getService = (req) => ({',
    '  ...M041CoreService,',
    '  ...M041ProjectService,',
    '',
    '  // Legacy route aliases -> canonical core contracts.',
    '  getVillage: M041CoreService.getVillageProfile,',
    '  districtSummary: M041CoreService.getDistrictEconomicSummary,',
    '  initializeFinance: M041CoreService.ensureVillageFinance,',
    '  getDashboard: M041CoreService.getVillageDashboard,',
    '  createTask: M041CoreService.createVillageTask,',
    '  updateTask: M041CoreService.updateVillageTask,',
    '  upsertKPI: M041CoreService.upsertVillageKPI,',
    '  generateAI: M041CoreService.generateVillageAIInsights,',
    '',
    '  // Legacy offset pagination -> canonical filter/page contract.',
    '  getVillages: (limit = 10, offset = 0) => {',
    '    const safeLimit = Math.max(parseInt(limit, 10) || 10, 1);',
    '    const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);',
    '',
    '    return M041CoreService.getVillages({',
    '      limit: safeLimit,',
    '      page: Math.floor(safeOffset / safeLimit) + 1,',
    '    });',
    '  },',
    '',
    '  // Preserve canonical project filtering from the request query.',
    '  listProjects: (villageId) =>',
    '    M041ProjectService.listProjects(villageId, req.query || {}),',
    '',
    '  // Preserve authenticated audit attribution.',
    '  createProject: (villageId, data) =>',
    '    M041ProjectService.createProject(',
    '      villageId,',
    '      data,',
    '      req.user?.id',
    '    ),',
    '',
    '  createEstimate: (projectId, data) =>',
    '    M041ProjectService.createEstimate(',
    '      projectId,',
    '      data,',
    '      req.user?.id',
    '    ),',
    '});',
    '',
    ''
  ].join('\n');

  const repaired =
    original.slice(0, start) +
    adapter +
    original.slice(end);

  /*
   * Structural assertions before write.
   */
  if (
    repaired.includes(
      '../modules/M041/M041Service'
    )
  ) {
    fail(
      'Legacy nonexistent M041Service path remains in candidate'
    );
  }

  if (
    repaired.includes(
      'new M041Service('
    )
  ) {
    fail(
      'Legacy M041 constructor remains in candidate'
    );
  }

  if (
    !repaired.includes(
      '../modules/M041/service'
    )
  ) {
    fail(
      'Canonical core M041 service missing from candidate'
    );
  }

  if (
    !repaired.includes(
      '../modules/M041/villageProjectIntelligenceService'
    )
  ) {
    fail(
      'Project intelligence service missing from candidate'
    );
  }

  if (
    !repaired.includes(
      'req.user?.id'
    )
  ) {
    fail(
      'Authenticated project attribution missing'
    );
  }

  if (
    !repaired.includes(
      'req.query || {}'
    )
  ) {
    fail(
      'Project query-filter forwarding missing'
    );
  }

  const backup =
    path.join(
      OUT,
      'M041VillageERP.prewrite-backup.js'
    );

  fs.writeFileSync(
    backup,
    original
  );

  let modified = false;

  try {
    fs.writeFileSync(
      ROUTE,
      repaired,
      'utf8'
    );

    modified = true;

    /*
     * Syntax validation.
     */
    const syntax = cp.spawnSync(
      process.execPath,
      ['--check', ROUTE],
      {
        cwd: ROOT,
        encoding: 'utf8',
        windowsHide: true
      }
    );

    if (syntax.status !== 0) {
      console.error(syntax.stderr);
      fail('Node syntax validation failed');
    }

    console.log(
      'Node syntax                         : PASS'
    );

    /*
     * Targeted ESLint.
     */
    const eslint = path.join(
      ROOT,
      'backend',
      'node_modules',
      'eslint',
      'bin',
      'eslint.js'
    );

    if (!fs.existsSync(eslint)) {
      fail(
        `Local ESLint missing: ${eslint}`
      );
    }

    const lint = cp.spawnSync(
      process.execPath,
      [eslint, ROUTE],
      {
        cwd: ROOT,
        encoding: 'utf8',
        windowsHide: true
      }
    );

    if (lint.status !== 0) {
      console.error(lint.stdout);
      console.error(lint.stderr);
      fail('Targeted ESLint failed');
    }

    console.log(
      'Targeted ESLint                     : PASS'
    );

    /*
     * Post-write structural verification.
     */
    const after =
      fs.readFileSync(ROUTE, 'utf8');

    if (
      after.includes(
        '../modules/M041/M041Service'
      )
    ) {
      fail(
        'Post-write: old M041 path remains'
      );
    }

    if (
      after.includes(
        'new M041Service('
      )
    ) {
      fail(
        'Post-write: invalid constructor remains'
      );
    }

    const afterMethods =
      routeMethods(after);

    if (
      afterMethods.length !== 24 ||
      JSON.stringify(afterMethods) !==
      JSON.stringify(used)
    ) {
      fail(
        'Route service-call surface changed unexpectedly'
      );
    }

    console.log(
      'Route API/service surface preserved : PASS 24/24'
    );

    /*
     * Verify both source services remain unchanged.
     */
    const coreAfter =
      fs.readFileSync(CORE, 'utf8');

    const projectAfter =
      fs.readFileSync(PROJECT, 'utf8');

    if (coreAfter !== coreSource) {
      fail(
        'Canonical M041 core service changed unexpectedly'
      );
    }

    if (projectAfter !== projectSource) {
      fail(
        'M041 project service changed unexpectedly'
      );
    }

    console.log(
      'Canonical service sources unchanged : PASS'
    );

    /*
     * Diff quality.
     */
    const diffCheck = git([
      'diff',
      '--check',
      '--',
      ROUTE_REL
    ]);

    if (diffCheck.status !== 0) {
      console.error(diffCheck.stderr);
      fail('git diff --check failed');
    }

    console.log(
      'git diff --check                    : PASS'
    );

    /*
     * Exact scope: one application source file only.
     */
    const status = git([
      'status',
      '--porcelain',
      '--',
      ROUTE_REL,
      CORE_REL,
      PROJECT_REL
    ]);

    if (status.status !== 0) {
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
      changed.length !== 1 ||
      !changed[0].includes(ROUTE_REL)
    ) {
      fail(
        'Unexpected M041 modification scope:\n' +
        status.stdout
      );
    }

    console.log(
      'Exact application change scope      : PASS (1 file)'
    );

    /*
     * Save evidence.
     */
    const diff = git([
      'diff',
      '--',
      ROUTE_REL
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
      status.stdout,
      'utf8'
    );

    fs.writeFileSync(
      path.join(
        OUT,
        'contract-resolution.json'
      ),
      JSON.stringify(
        {
          routeMethods: used,
          coreExports,
          projectExports,
          resolution
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
      ' M041 BATCH 2 FINAL REPAIR ACCEPTED'
    );
    console.log(
      '============================================================'
    );
    console.log(
      'Nonexistent M041Service class        : REMOVED'
    );
    console.log(
      'Core village/ERP service             : CONNECTED'
    );
    console.log(
      'Project/subsidy intelligence service : CONNECTED'
    );
    console.log(
      'Route service contracts              : 24/24 RESOLVED'
    );
    console.log(
      'Project query filters                : PRESERVED'
    );
    console.log(
      'Project creator attribution          : PRESERVED'
    );
    console.log(
      'Estimate preparer attribution        : PRESERVED'
    );
    console.log(
      'Canonical service files              : UNMODIFIED'
    );
    console.log(
      'Modified application files           : 1'
    );
    console.log(
      `Evidence                             : ${OUT}`
    );

  } catch (err) {
    if (modified) {
      fs.copyFileSync(
        backup,
        ROUTE
      );

      const restored =
        fs.readFileSync(ROUTE);

      const expected =
        fs.readFileSync(backup);

      console.error('');
      console.error(
        '============================================================'
      );
      console.error(
        ' M041 VALIDATION FAILED - ROLLBACK'
      );
      console.error(
        '============================================================'
      );
      console.error(
        err.stack ||
        err.message ||
        String(err)
      );
      console.error(
        `Byte-for-byte rollback              : ${restored.equals(expected)}`
      );
    }

    console.error(
      'M041 FINAL REPAIR ACCEPTED          : NO'
    );

    process.exitCode = 1;
  }
}

try {
  main();
} catch (err) {
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
    err.stack ||
    err.message ||
    String(err)
  );
  console.error(
    'APPLICATION SOURCE MODIFIED          : NO'
  );
  console.error(
    'M041 FINAL REPAIR ACCEPTED          : NO'
  );
  process.exitCode = 1;
}
