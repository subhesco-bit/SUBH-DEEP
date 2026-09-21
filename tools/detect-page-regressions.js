#!/usr/bin/env node
/**
 * Regression detector: for every frontend page currently classified as
 * skeleton/partial in the working tree, re-classify the HEAD (pre-session)
 * version using the same heuristics. Flags true regressions where HEAD was
 * 'real' but working tree is now 'skeleton' or 'partial' (i.e. content was
 * degraded by the main-branch recovery merge), not just line-count deltas.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

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
  /useQuery\(/i,
  /useMutation\(/i,
  /fetch\(/i,
  /axios\./i,
  /API\./,
];

function classify(content) {
  const lines = content.split('\n').length;
  const markers = SKELETON_MARKERS.filter((re) => re.test(content));
  const hasRealSignal = REAL_SIGNALS.some((re) => re.test(content));
  let status;
  if (lines <= 6) status = 'skeleton';
  else if (!hasRealSignal && (markers.length > 0 || lines <= 25)) status = 'skeleton';
  else if (markers.length > 0) status = 'partial';
  else if (hasRealSignal) status = 'real';
  else status = 'partial';
  return { status, lines };
}

const scanResults = JSON.parse(fs.readFileSync(path.join(ROOT, '.ai', 'audit', 'ultra_scan_results.json'), 'utf8'));
const candidates = scanResults.filter((r) => r.area === 'frontend_page' && r.status !== 'real');

const regressions = [];
for (const c of candidates) {
  let headContent;
  try {
    headContent = execSync(`git show HEAD:"${c.path}"`, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  } catch (e) {
    continue; // file didn't exist at HEAD (genuinely new from main) - not a regression
  }
  const headClass = classify(headContent);
  if (headClass.status === 'real' && c.status !== 'real') {
    regressions.push({
      path: c.path,
      headStatus: headClass.status,
      headLines: headClass.lines,
      currentStatus: c.status,
      currentLines: c.lines,
    });
  }
}

fs.writeFileSync(path.join(ROOT, '.ai', 'audit', 'page_regressions.json'), JSON.stringify(regressions, null, 2));
console.log('True regressions (HEAD=real, now degraded):', regressions.length);
console.log(regressions.slice(0, 50).map((r) => `${r.path}  HEAD:${r.headLines}L -> now:${r.currentLines}L (${r.currentStatus})`).join('\n'));
