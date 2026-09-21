#!/usr/bin/env node
/**
 * Ultra-comprehensive project scanner.
 * Produces machine-readable JSON (not another narrative markdown report) classifying
 * every backend route file, backend service file, and frontend page as:
 *   - real        : substantial logic, DB/service calls, no stub/mock markers
 *   - partial     : some real logic but contains TODO/stub/mock/placeholder markers
 *   - skeleton    : trivial file (very few lines) or pure placeholder/mock response
 *
 * Heuristics are conservative and evidence-based (line count, keyword markers,
 * presence of DB/service calls, presence of static/mock JSON returns).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKEND_ROUTES = path.join(ROOT, 'backend', 'src', 'routes');
const BACKEND_SERVICES = path.join(ROOT, 'backend', 'src', 'services');
const FRONTEND_PAGES = path.join(ROOT, 'frontend', 'src', 'pages');

const SKELETON_MARKERS = [
  /TODO/i, /FIXME/i, /not[\s_-]?implemented/i, /coming soon/i,
  /placeholder/i, /stub/i, /\bmock(ed)?\b/i, /dummy/i, /fake data/i,
  /Math\.random\(\)/i, /hardcoded/i, /skeleton/i,
];

const REAL_SIGNALS = [
  /await\s+\w+\.(query|find|findOne|findAll|create|update|destroy|save|exec)\(/i,
  /require\(['"]\.\.?\/.*service/i,
  /from ['"]\.\.\/services/i,
  /pool\.query/i,
  /knex\(/i,
  /Model\./i,
];

function walk(dir, exts) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, exts));
    } else if (exts.includes(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function classify(filePath) {
  let content = '';
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return { status: 'error', lines: 0, markers: [], error: e.message };
  }
  const lines = content.split('\n').length;
  const markers = [];
  for (const re of SKELETON_MARKERS) {
    if (re.test(content)) markers.push(re.source);
  }
  const hasRealSignal = REAL_SIGNALS.some((re) => re.test(content));

  let status;
  if (lines <= 6) {
    status = 'skeleton';
  } else if (!hasRealSignal && (markers.length > 0 || lines <= 25)) {
    status = 'skeleton';
  } else if (markers.length > 0) {
    status = 'partial';
  } else if (hasRealSignal) {
    status = 'real';
  } else {
    status = 'partial';
  }

  // Route-specific: count route method declarations
  const routeMatches = content.match(/router\.(get|post|put|patch|delete)\s*\(/gi) || [];

  return { status, lines, markers, routeCount: routeMatches.length };
}

function scanSet(dir, exts, label) {
  const files = walk(dir, exts);
  const results = files.map((f) => {
    const rel = path.relative(ROOT, f).replace(/\\/g, '/');
    const c = classify(f);
    return { area: label, path: rel, ...c };
  });
  return results;
}

const results = [
  ...scanSet(BACKEND_ROUTES, ['.js'], 'backend_route'),
  ...scanSet(BACKEND_SERVICES, ['.js'], 'backend_service'),
  ...scanSet(FRONTEND_PAGES, ['.jsx', '.js'], 'frontend_page'),
];

const outPath = path.join(ROOT, '.ai', 'audit', 'ultra_scan_results.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

const summary = {};
for (const r of results) {
  summary[r.area] = summary[r.area] || { real: 0, partial: 0, skeleton: 0, error: 0, total: 0 };
  summary[r.area][r.status] = (summary[r.area][r.status] || 0) + 1;
  summary[r.area].total += 1;
}
console.log(JSON.stringify(summary, null, 2));
console.log('Full results written to', outPath);
