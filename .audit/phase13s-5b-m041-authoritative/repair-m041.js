const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = process.cwd();
const OUT = path.join(ROOT, '.audit', 'phase13s-5b-m041-authoritative');

const ROUTE_REL = 'backend/src/routes/M041VillageERP.js';
const SERVICE_REL = 'backend/src/modules/M041/service.js';

const ROUTE = path.join(ROOT, ROUTE_REL);
const SERVICE = path.join(ROOT, SERVICE_REL);

function die(message) {
  throw new Error(message);
}

function git(args) {
  return cp.spawnSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8'
  });
}

function unique(items) {
  return [...new Set(items)].sort();
}

function extractRouteMethods(source) {
  return unique(
    [...source.matchAll(/\bservice\.([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g)]
      .map(m => m[1])
  );
}

function extractExports(source) {
  const match = source.match(
    /module\.exports\s*=\s*\{([\s\S]*?)\}\s*;/
  );

  if (!match) {
    die('Could not locate canonical M041 module.exports object.');
  }

  const body = match[1];

  return unique(
    body
      .split(',')
      .map(v => v.trim())
      .map(v => v.match(/^([A-Za-z_$][A-Za-z0-9_$]*)/)?.[1])
      .filter(Boolean)
  );
}

function countLiteral(source, value) {
  return source.split(value).length - 1;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });

  console.log('');
  console.log('============================================================');
  console.log(' PHASE 13S-5B - AUTHORITATIVE M041 CONTRACT REPAIR');
  console.log('============================================================');

  if (!fs.existsSync(ROUTE)) die(`Missing route: ${ROUTE_REL}`);
  if (!fs.existsSync(SERVICE)) die(`Missing service: ${SERVICE_REL}`);

  /*
   * Correct Git invocation: each path is a separate argv entry.
   */
  const preStatus = git([
    'status',
    '--porcelain',
    '--',
    ROUTE_REL,
    SERVICE_REL
  ]);

  if (preStatus.status !== 0) {
    die(`git status failed:\n${preStatus.stderr}`);
  }

  if (preStatus.stdout.trim()) {
    console.error(preStatus.stdout);
    die(
      'PRE-MODIFICATION SAFETY STOP: M041 route/service already modified.'
    );
  }

  console.log('Git-clean M041 targets              : PASS');

  const routeOriginal = fs.readFileSync(ROUTE, 'utf8');
  const serviceSource = fs.readFileSync(SERVICE, 'utf8');

  fs.writeFileSync(
    path.join(OUT, 'M041VillageERP.before.js'),
    routeOriginal
  );

  fs.writeFileSync(
    path.join(OUT, 'service.before.js'),
    serviceSource
  );

  /*
   * Static inspection only.
   * We deliberately DO NOT require(service.js), because that starts
   * database initialization and contaminates stdout.
   */
  const routeMethods = extractRouteMethods(routeOriginal);
  const serviceExports = extractExports(serviceSource);

  fs.writeFileSync(
    path.join(OUT, 'route-methods.txt'),
    routeMethods.join('\n') + '\n'
  );

  fs.writeFileSync(
    path.join(OUT, 'canonical-service-methods.txt'),
    serviceExports.join('\n') + '\n'
  );

  console.log(`Route service methods               : ${routeMethods.length}`);
  console.log(`Canonical exported methods          : ${serviceExports.length}`);

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

  const resolved = [];
  const unresolved = [];

  for (const method of routeMethods) {
    if (serviceExports.includes(method)) {
      resolved.push({
        routeMethod: method,
        serviceMethod: method,
        type: 'direct'
      });
      continue;
    }

    const mapped = aliases[method];

    if (mapped && serviceExports.includes(mapped)) {
      resolved.push({
        routeMethod: method,
        serviceMethod: mapped,
        type: 'alias'
      });
      continue;
    }

    unresolved.push(method);
  }

  console.log('');
  console.log('[CONTRACT RESOLUTION]');
  console.log(`Resolved                             : ${resolved.length}`);
  console.log(`Unresolved                           : ${unresolved.length}`);

  for (const item of resolved) {
    if (item.type === 'alias') {
      console.log(
        `ALIAS  ${item.routeMethod} -> ${item.serviceMethod}`
      );
    }
  }

  if (unresolved.length) {
    console.log('');
    console.error(
      '============================================================'
    );
    console.error(
      ' AUTHORITATIVE SAFETY STOP - M041 CONTRACT INCOMPLETE'
    );
    console.error(
      '============================================================'
    );

    for (const name of unresolved) {
      console.error(`UNRESOLVED: service.${name}`);
    }

    fs.writeFileSync(
      path.join(OUT, 'unresolved-route-methods.txt'),
      unresolved.join('\n') + '\n'
    );

    fs.writeFileSync(
      path.join(OUT, 'resolution.json'),
      JSON.stringify(
        {
          routeMethods,
          serviceExports,
          resolved,
          unresolved
        },
        null,
        2
      )
    );

    console.error('');
    console.error('APPLICATION SOURCE MODIFIED          : NO');
    console.error('M041 REPAIR ACCEPTED                 : NO');

    process.exitCode = 2;
    return;
  }

  /*
   * We only reach modification when every route method is accounted for.
   */
  const oldPath =
    "M041Service = require('../modules/M041/M041Service');";

  if (countLiteral(routeOriginal, oldPath) !== 1) {
    die(
      'Expected nonexistent M041Service require exactly once.'
    );
  }

  if (!routeOriginal.includes('new M041Service(pool, logger)')) {
    die(
      'Expected invalid M041 constructor bootstrap was not found.'
    );
  }

  const startMarker =
    '// Lazy-load M041Service to avoid circular dependencies';

  const endMarker =
    '// ==================== VILLAGE MANAGEMENT';

  const start = routeOriginal.indexOf(startMarker);
  const end = routeOriginal.indexOf(endMarker);

  if (start < 0 || end < 0 || end <= start) {
    die('Could not isolate M041 bootstrap section safely.');
  }

  const adapterLines = [
    '// Canonical M041 functional service adapter.',
    '// Preserves the existing route API while delegating only to',
    '// verified exports from backend/src/modules/M041/service.js.',
    "const M041Service = require('../modules/M041/service');",
    '',
    'const getService = () => ({',
    '  ...M041Service,',
    '',
    '  getVillage: M041Service.getVillageProfile,',
    '  districtSummary: M041Service.getDistrictEconomicSummary,',
    '  initializeFinance: M041Service.ensureVillageFinance,',
    '  getDashboard: M041Service.getVillageDashboard,',
    '  createTask: M041Service.createVillageTask,',
    '  updateTask: M041Service.updateVillageTask,',
    '  upsertKPI: M041Service.upsertVillageKPI,',
    '  generateAI: M041Service.generateVillageAIInsights,',
    '',
    '  getVillages: (limit = 10, offset = 0) => {',
    '    const safeLimit = Math.max(parseInt(limit, 10) || 10, 1);',
    '    const safeOffset = Math.max(parseInt(offset, 10) || 0, 0);',
    '',
    '    return M041Service.getVillages({',
    '      limit: safeLimit,',
    '      page: Math.floor(safeOffset / safeLimit) + 1,',
    '    });',
    '  },',
    '});',
    '',
    ''
  ];

  const adapter = adapterLines.join('\n');

  const routeNew =
    routeOriginal.slice(0, start) +
    adapter +
    routeOriginal.slice(end);

  /*
   * Backup immediately before write.
   */
  const backup = path.join(
    OUT,
    'M041VillageERP.prewrite-backup.js'
  );

  fs.writeFileSync(backup, routeOriginal);

  let modified = false;

  try {
    fs.writeFileSync(ROUTE, routeNew, 'utf8');
    modified = true;

    const syntax = cp.spawnSync(
      process.execPath,
      ['--check', ROUTE],
      {
        cwd: ROOT,
        encoding: 'utf8'
      }
    );

    if (syntax.status !== 0) {
      die(`Node syntax failed:\n${syntax.stderr}`);
    }

    console.log('Node syntax                         : PASS');

    const eslintPath = path.join(
      ROOT,
      'backend',
      'node_modules',
      'eslint',
      'bin',
      'eslint.js'
    );

    if (fs.existsSync(eslintPath)) {
      const lint = cp.spawnSync(
        process.execPath,
        [
          eslintPath,
          path.join(ROOT, ROUTE_REL)
        ],
        {
          cwd: ROOT,
          encoding: 'utf8'
        }
      );

      if (lint.status !== 0) {
        console.error(lint.stdout);
        console.error(lint.stderr);
        die('Targeted ESLint failed.');
      }

      console.log('Targeted ESLint                     : PASS');
    } else {
      console.log('Targeted ESLint                     : SKIPPED');
    }

    const after = fs.readFileSync(ROUTE, 'utf8');

    if (after.includes('../modules/M041/M041Service')) {
      die('Old nonexistent M041 path still present.');
    }

    if (after.includes('new M041Service(')) {
      die('Invalid M041 constructor still present.');
    }

    if (!after.includes("../modules/M041/service")) {
      die('Canonical M041 service path missing.');
    }

    const diffCheck = git([
      'diff',
      '--check',
      '--',
      ROUTE_REL
    ]);

    if (diffCheck.status !== 0) {
      die(`git diff --check failed:\n${diffCheck.stderr}`);
    }

    console.log('git diff --check                    : PASS');

    /*
     * Correct Git scope check: separate argv pathspecs.
     */
    const finalStatus = git([
      'status',
      '--porcelain',
      '--',
      ROUTE_REL,
      SERVICE_REL
    ]);

    if (finalStatus.status !== 0) {
      die(`Final git status failed:\n${finalStatus.stderr}`);
    }

    const changed = finalStatus.stdout
      .split(/\r?\n/)
      .filter(Boolean);

    if (
      changed.length !== 1 ||
      !changed[0].includes(ROUTE_REL)
    ) {
      die(
        `Expected only ${ROUTE_REL} modified; got:\n` +
        finalStatus.stdout
      );
    }

    console.log('Exact M041 change scope             : PASS');

    const diff = git([
      'diff',
      '--',
      ROUTE_REL
    ]);

    fs.writeFileSync(
      path.join(OUT, 'accepted-diff.patch'),
      diff.stdout || ''
    );

    fs.writeFileSync(
      path.join(OUT, 'accepted-status.txt'),
      finalStatus.stdout
    );

    fs.writeFileSync(
      path.join(OUT, 'resolution.json'),
      JSON.stringify(
        {
          routeMethods,
          serviceExports,
          resolved,
          unresolved
        },
        null,
        2
      )
    );

    console.log('');
    console.log(
      '============================================================'
    );
    console.log(' M041 BATCH 2B REPAIR ACCEPTED');
    console.log(
      '============================================================'
    );
    console.log('Canonical service path              : FIXED');
    console.log('Invalid constructor                 : REMOVED');
    console.log('All 24 route contracts              : RESOLVED');
    console.log('Canonical service source            : UNMODIFIED');
    console.log('Modified application files          : 1');
    console.log(`Evidence                            : ${OUT}`);

  } catch (err) {
    if (modified) {
      fs.copyFileSync(backup, ROUTE);

      const restored = fs.readFileSync(ROUTE);
      const original = fs.readFileSync(backup);

      console.error('');
      console.error(
        '============================================================'
      );
      console.error(' VALIDATION FAILED - ROLLBACK');
      console.error(
        '============================================================'
      );
      console.error(err.stack || err.message);
      console.error(
        `Byte-for-byte rollback              : ${restored.equals(original)}`
      );
    }

    console.error('M041 REPAIR ACCEPTED                 : NO');
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
  console.error(' PRE-MODIFICATION SAFETY STOP');
  console.error(
    '============================================================'
  );
  console.error(err.stack || err.message);
  console.error('APPLICATION SOURCE MODIFIED          : NO');
  console.error('M041 REPAIR ACCEPTED                 : NO');
  process.exitCode = 1;
}
