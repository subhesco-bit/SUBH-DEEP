/**
 * Operational EBDESIGN Library routes.
 *
 * Exposes the M645100 library knowledge service through the backend API so the
 * frontend Library page, AI gateway, and future merge tools use one canonical
 * project knowledge index instead of disconnected placeholder routes.
 */

'use strict';

const express = require('express');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const libraryKnowledgeService = require('../services/libraryKnowledgeService');
const { logger } = require('../utils/logger');

const router = express.Router();
const projectRoot = path.resolve(__dirname, '../../..');
const discoveryIndexRoot = path.join(projectRoot, '_EBDESIGN_LIBRARY', '25_DISCOVERY_INDEX');
const enterpriseSummaryPath = path.join(discoveryIndexRoot, 'enterprise-project-library-summary.json');
const enterpriseFeatureMatrixPath = path.join(discoveryIndexRoot, 'enterprise-feature-source-matrix.json');
const enterpriseDuplicatePath = path.join(discoveryIndexRoot, 'enterprise-duplicate-name-groups.csv');
const enterpriseFilesPath = path.join(discoveryIndexRoot, 'enterprise-project-library-files.csv');
const enterpriseWorkflowPath = path.join(discoveryIndexRoot, 'enterprise-project-workflow-ai.md');
const libraryAIWorkflowPath = path.join(projectRoot, 'docs', 'codex-library-ai-workflow.md');
const enterpriseActivitySummaryPath = path.join(discoveryIndexRoot, 'enterprise-file-activity-summary.json');
const enterpriseActivityLatestPath = path.join(discoveryIndexRoot, 'enterprise-file-activity-latest.json');
const enterpriseActivityLedgerPath = path.join(discoveryIndexRoot, 'enterprise-file-activity-ledger.jsonl');

let authMiddleware = null;
try {
  ({ authMiddleware } = require('../middleware/auth'));
} catch (error) {
  logger.warn('Library auth middleware unavailable; protected library operations disabled', {
    error: error.message,
  });
}

function optionalAuth(req, res, next) {
  if (!authMiddleware) return next();

  const hasAuthHeader = Boolean(req.headers.authorization);
  const devBypass = process.env.SKIP_AUTH === 'true' &&
    (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test');

  if (!hasAuthHeader && !devBypass) return next();
  return authMiddleware(req, res, next);
}

function requireLibraryAdmin(req, res, next) {
  if (!authMiddleware) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'LIBRARY_AUTH_UNAVAILABLE',
        message: 'Library write operation requires authentication middleware.',
      },
    });
  }

  return authMiddleware(req, res, () => {
    const role = req.user?.role;
    const permissions = req.user?.permissions || [];
    const allowed = ['admin', 'super_admin', 'owner'].includes(role) ||
      permissions.includes('library:write') ||
      permissions.includes('admin:library');

    if (!allowed) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'LIBRARY_FORBIDDEN',
          message: 'Library write access is restricted to admin users.',
        },
      });
    }

    return next();
  });
}

function sendResult(res, result, options = {}) {
  const ok = result?.success !== false;
  const statusCode = ok ? (options.successStatus || 200) : (options.failureStatus || 500);

  return res.status(statusCode).json({
    success: ok,
    data: result?.data ?? result?.module ?? result ?? null,
    module: result?.module,
    error: ok ? undefined : result?.error,
    timestamp: new Date().toISOString(),
  });
}

async function execute(operation, parameters = {}, context = {}) {
  return libraryKnowledgeService.execute(operation, parameters, context);
}

function readJsonFile(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    logger.warn('Library JSON artifact unavailable', { filePath, error: error.message });
    return fallback;
  }
}

function normalizeFilePath(value) {
  return String(value || '').replace(/\\/g, '/').toLowerCase();
}

function parseGitStatusLine(line) {
  const status = line.slice(0, 2);
  let filePath = line.slice(3).trim();
  if (filePath.includes(' -> ')) {
    filePath = filePath.split(' -> ').pop();
  }
  filePath = filePath.replace(/^"|"$/g, '').replace(/\\"/g, '"');
  return { status, filePath };
}

function readGitActivity(limit = 50) {
  try {
    const output = execFileSync('git', ['-C', projectRoot, 'status', '--short', '--untracked-files=all'], {
      encoding: 'utf8',
      maxBuffer: 12 * 1024 * 1024,
      timeout: 10000,
    });
    const lines = output.split(/\r?\n/).filter(Boolean);
    const byStatus = {};
    const files = [];
    const statusMap = new Map();

    for (const line of lines) {
      const item = parseGitStatusLine(line);
      const statusKey = item.status.trim() || 'changed';
      byStatus[statusKey] = (byStatus[statusKey] || 0) + 1;
      if (files.length < limit) files.push(item);

      const absolutePath = path.resolve(projectRoot, item.filePath);
      statusMap.set(normalizeFilePath(absolutePath), item.status);
    }

    return {
      available: true,
      totalChangedFiles: lines.length,
      byStatus,
      files,
      statusMap,
    };
  } catch (error) {
    logger.warn('Git activity unavailable for library tracking', { error: error.message });
    return {
      available: false,
      totalChangedFiles: 0,
      byStatus: {},
      files: [],
      statusMap: new Map(),
      error: error.message,
    };
  }
}

function attachFileActivity(row, gitStatusMap = new Map()) {
  const absolutePath = row.absolute_path || '';
  const indexedBytes = Number(row.bytes || 0);
  const indexedModified = Date.parse(row.modified || '');
  const gitStatus = gitStatusMap.get(normalizeFilePath(absolutePath)) || '';

  try {
    const stat = fs.statSync(absolutePath);
    const currentModified = stat.mtime.getTime();
    const changedByMetadata = stat.size !== indexedBytes ||
      (Number.isFinite(indexedModified) && Math.abs(currentModified - indexedModified) > 1000);

    return {
      ...row,
      current_bytes: stat.size,
      current_modified: stat.mtime.toISOString(),
      activity_status: gitStatus ? 'git_changed' : (changedByMetadata ? 'metadata_changed' : 'unchanged'),
      git_status: gitStatus,
      tracking_checked_at: new Date().toISOString(),
    };
  } catch {
    return {
      ...row,
      current_bytes: '',
      current_modified: '',
      activity_status: 'missing_from_disk',
      git_status: gitStatus,
      tracking_checked_at: new Date().toISOString(),
    };
  }
}

function parseCsvLine(line) {
  const values = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

async function searchEnterpriseFileRows(query, limit = 50, options = {}) {
  if (!fs.existsSync(enterpriseFilesPath)) return [];

  const normalizedQuery = String(query || '').trim().toLowerCase();
  const maxResults = Math.min(Math.max(Number(limit) || 50, 1), 250);
  const results = [];
  const gitActivity = options.includeActivity ? readGitActivity(250) : null;

  const stream = fs.createReadStream(enterpriseFilesPath);
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let headers = null;
  for await (const line of rl) {
    if (!headers) {
      headers = parseCsvLine(line);
      continue;
    }

    if (normalizedQuery && !line.toLowerCase().includes(normalizedQuery)) continue;

    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    const enrichedRow = options.includeActivity ? attachFileActivity(row, gitActivity?.statusMap) : row;
    if (options.changedOnly && enrichedRow.activity_status === 'unchanged') continue;
    results.push(enrichedRow);

    if (results.length >= maxResults) {
      rl.close();
      stream.destroy();
      break;
    }
  }

  return results;
}

async function readDuplicateGroups(limit = 100) {
  if (!fs.existsSync(enterpriseDuplicatePath)) return [];

  const maxResults = Math.min(Math.max(Number(limit) || 100, 1), 500);
  const rows = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(enterpriseDuplicatePath),
    crlfDelay: Infinity,
  });

  let headers = null;
  for await (const line of rl) {
    if (!headers) {
      headers = parseCsvLine(line);
      continue;
    }

    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    rows.push(row);

    if (rows.length >= maxResults) {
      rl.close();
      break;
    }
  }

  return rows;
}

async function readJsonLines(filePath, limit = 100, query = '') {
  if (!fs.existsSync(filePath)) return [];

  const maxResults = Math.min(Math.max(Number(limit) || 100, 1), 1000);
  const normalizedQuery = String(query || '').trim().toLowerCase();
  const rows = [];
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (!line.trim()) continue;
    if (normalizedQuery && !line.toLowerCase().includes(normalizedQuery)) continue;

    try {
      rows.push(JSON.parse(line));
    } catch (error) {
      logger.warn('Skipping invalid activity ledger row', { error: error.message });
    }

    if (rows.length >= maxResults) {
      rl.close();
      break;
    }
  }

  return rows;
}

router.get('/health', async (_req, res) => {
  try {
    const health = await libraryKnowledgeService.healthCheck();
    res.json({
      success: true,
      data: health,
      status: health.status,
      module: 'libraryRoutes',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Library health check failed', { error: error.message });
    res.status(500).json({
      success: false,
      error: {
        code: 'LIBRARY_HEALTH_FAILED',
        message: error.message,
      },
    });
  }
});

router.get('/', optionalAuth, async (_req, res) => {
  const result = await execute('statistics');
  return sendResult(res, result);
});

router.post('/initialize', optionalAuth, async (req, res) => {
  if (req.body?.syncDatabase === true) {
    return requireLibraryAdmin(req, res, async () => {
      const result = await execute('initialize', { syncDatabase: true });
      return sendResult(res, result);
    });
  }

  const result = await execute('initialize', {
    syncDatabase: false,
  });
  return sendResult(res, result);
});

router.get('/statistics', optionalAuth, async (_req, res) => {
  const result = await execute('statistics');
  return sendResult(res, result);
});

router.get('/verify', optionalAuth, async (_req, res) => {
  const result = await execute('verify');
  return sendResult(res, result);
});

router.get('/search', optionalAuth, async (req, res) => {
  const result = await execute('search', {
    query: req.query.query || req.query.q || '',
    type: req.query.type,
    limit: req.query.limit,
  });
  return sendResult(res, result);
});

router.post('/search', optionalAuth, async (req, res) => {
  const payload = req.body || {};
  const result = await execute('search', {
    query: payload.query || payload.q || '',
    type: payload.type,
    limit: payload.limit,
  });
  return sendResult(res, result);
});

router.post('/advanced-search', optionalAuth, async (req, res) => {
  const payload = req.body || {};
  const result = await execute('search', {
    query: payload.query || payload.q || '',
    type: payload.type,
    limit: payload.limit || 25,
  });
  return sendResult(res, result);
});

router.post('/recommendations', optionalAuth, async (req, res) => {
  const payload = req.body || {};
  const result = await execute(
    'aiContext',
    { query: payload.query || payload.intent || '', limit: payload.limit || 12 },
    payload.context || payload,
  );
  return sendResult(res, result);
});

router.get('/modules', optionalAuth, async (req, res) => {
  const result = await execute('modules', req.query || {});
  return sendResult(res, result);
});

router.get('/modules/:moduleId', optionalAuth, async (req, res) => {
  const result = await execute('getModule', { moduleId: req.params.moduleId });
  return sendResult(res, result, { failureStatus: 404 });
});

// Merged in from routes/claude/libraryRoutes.js (retired 2026-09-13), which
// shared this filename and so was never mounted — dynamicRouteLoader.js keys its
// registry by basename and drops repeats. These two endpoints existed only there.
//
// They read libraryKnowledgeService.index directly because the service's
// execute() contract has no 'components' or 'item' operation
// (modules/M645100_LIBRARYKNOWLEDGE/backend/service.js:618 lists the cases:
// initialize, search/discover, modules/list, getModule/read, aiContext/analyze,
// verify, statistics, syncDatabase). The index is the same singleton this file
// already imports, so no new dependency is introduced.
router.get('/components', optionalAuth, async (_req, res) => {
  const components = [];
  for (const [filename, item] of libraryKnowledgeService.index) {
    if (item.type === 'component') {
      components.push({ filename, data: item.data, lastModified: item.lastModified });
    }
  }
  return sendResult(res, { success: true, data: { components, count: components.length } });
});

router.get('/item/:filename', optionalAuth, async (req, res) => {
  const item = libraryKnowledgeService.index.get(req.params.filename);
  if (!item) {
    return sendResult(res, { success: false, error: 'Library item not found' }, { failureStatus: 404 });
  }
  return sendResult(res, { success: true, data: item });
});

router.get('/enterprise-index/summary', optionalAuth, (_req, res) => {
  const summary = readJsonFile(enterpriseSummaryPath, {
    generatedAt: null,
    unavailable: true,
    message: 'Enterprise library index has not been generated yet.',
  });
  const duplicateBasenameGroups = Object.keys(summary.duplicateBasenames || {}).length;
  const compactSummary = {
    ...summary,
    duplicateBasenameGroups,
  };

  if (_req.query.includeDuplicates !== 'true') {
    delete compactSummary.duplicateBasenames;
  }

  res.json({
    success: true,
    data: compactSummary,
    timestamp: new Date().toISOString(),
  });
});

router.get('/enterprise-index/features', optionalAuth, (req, res) => {
  const matrix = readJsonFile(enterpriseFeatureMatrixPath, {
    generatedAt: null,
    featureTracks: 0,
    features: [],
  });
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 1000);

  res.json({
    success: true,
    data: {
      ...matrix,
      features: (matrix.features || []).slice(0, limit),
      returned: Math.min((matrix.features || []).length, limit),
    },
    timestamp: new Date().toISOString(),
  });
});

router.get('/enterprise-index/duplicates', optionalAuth, async (req, res) => {
  const rows = await readDuplicateGroups(req.query.limit);

  res.json({
    success: true,
    data: {
      rows,
      returned: rows.length,
    },
    timestamp: new Date().toISOString(),
  });
});

router.get('/enterprise-index/files/search', optionalAuth, async (req, res) => {
  const rows = await searchEnterpriseFileRows(req.query.query || req.query.q || '', req.query.limit);

  res.json({
    success: true,
    data: {
      rows,
      returned: rows.length,
      query: req.query.query || req.query.q || '',
    },
    timestamp: new Date().toISOString(),
  });
});

router.get('/enterprise-index/activity/summary', optionalAuth, (_req, res) => {
  const summary = readJsonFile(enterpriseSummaryPath, {
    generatedAt: null,
    totals: { files: 0 },
    roots: [],
    unavailable: true,
  });
  const gitActivity = readGitActivity(Number(_req.query.limit) || 50);

  res.json({
    success: true,
    data: {
      libraryMode: 'active-intelligence-module',
      indexedAt: summary.generatedAt,
      indexedFiles: Number(summary.totals?.files || 0),
      indexedRoots: (summary.roots || []).map((root) => ({
        label: root.label,
        role: root.role,
        files: root.files || 0,
        bytes: root.bytes || 0,
        path: root.root,
      })),
      trackedSignals: [
        'indexed file identity',
        'name and extension',
        'size and modified time',
        'content summary and safe preview',
        'workflow role',
        'feature key',
        'content hash where bounded',
        'current disk existence',
        'current metadata drift',
        'git working-tree change status',
      ],
      gitActivity: {
        available: gitActivity.available,
        totalChangedFiles: gitActivity.totalChangedFiles,
        byStatus: gitActivity.byStatus,
        files: gitActivity.files,
        error: gitActivity.error,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

router.get('/enterprise-index/activity/files/search', optionalAuth, async (req, res) => {
  const rows = await searchEnterpriseFileRows(req.query.query || req.query.q || '', req.query.limit, {
    includeActivity: true,
    changedOnly: req.query.changedOnly === 'true',
  });

  res.json({
    success: true,
    data: {
      rows,
      returned: rows.length,
      query: req.query.query || req.query.q || '',
      changedOnly: req.query.changedOnly === 'true',
    },
    timestamp: new Date().toISOString(),
  });
});

router.get('/enterprise-index/activity/ledger/summary', optionalAuth, (_req, res) => {
  const summary = readJsonFile(enterpriseActivitySummaryPath, {
    generatedAt: null,
    libraryMode: 'active-file-ledger',
    baselineCreated: false,
    filesInPreviousSnapshot: 0,
    filesInCurrentSnapshot: 0,
    eventsRecordedThisRun: 0,
    eventCounts: {},
    unavailable: true,
    message: 'Run `node tools/codex-library-activity-track.js` to create the activity baseline.',
  });

  res.json({
    success: true,
    data: {
      ...summary,
      ledgerExists: fs.existsSync(enterpriseActivityLedgerPath),
      latestExists: fs.existsSync(enterpriseActivityLatestPath),
    },
    timestamp: new Date().toISOString(),
  });
});

router.get('/enterprise-index/activity/ledger/latest', optionalAuth, (_req, res) => {
  const latest = readJsonFile(enterpriseActivityLatestPath, {
    generatedAt: null,
    returned: 0,
    events: [],
    unavailable: true,
  });

  res.json({
    success: true,
    data: latest,
    timestamp: new Date().toISOString(),
  });
});

router.get('/enterprise-index/activity/ledger/search', optionalAuth, async (req, res) => {
  const rows = await readJsonLines(
    enterpriseActivityLedgerPath,
    req.query.limit,
    req.query.query || req.query.q || '',
  );

  res.json({
    success: true,
    data: {
      rows,
      returned: rows.length,
      query: req.query.query || req.query.q || '',
    },
    timestamp: new Date().toISOString(),
  });
});

router.get('/enterprise-index/workflow', optionalAuth, (_req, res) => {
  const workflow = fs.existsSync(enterpriseWorkflowPath) ?
    fs.readFileSync(enterpriseWorkflowPath, 'utf8') :
    '# Enterprise Project Library Workflow\n\nRun `node tools/codex-enterprise-library-index.js` to generate this workflow.';

  res.type('text/markdown').send(workflow);
});

router.get('/enterprise-index/ai-workflow', optionalAuth, (_req, res) => {
  const workflow = fs.existsSync(libraryAIWorkflowPath) ?
    fs.readFileSync(libraryAIWorkflowPath, 'utf8') :
    '# EBDESIGN Library AI Workflow\n\nLibrary AI workflow documentation has not been generated yet.';

  res.type('text/markdown').send(workflow);
});

router.get('/cards/:id', optionalAuth, async (req, res) => {
  const result = await execute('getModule', { moduleId: req.params.id });
  return sendResult(res, result, { failureStatus: 404 });
});

router.post('/ai-context', optionalAuth, async (req, res) => {
  const payload = req.body || {};
  const result = await execute(
    'aiContext',
    { query: payload.query || '', limit: payload.limit },
    payload.context || {},
  );
  return sendResult(res, result);
});

router.post('/sync-database', requireLibraryAdmin, async (_req, res) => {
  const result = await execute('syncDatabase');
  return sendResult(res, result);
});

module.exports = router;
