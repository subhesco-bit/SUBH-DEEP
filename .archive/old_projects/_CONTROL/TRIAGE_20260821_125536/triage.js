// EBDESIGN Library — REVIEW_REQUIRED / UNKNOWN triage pass
// Read-only against the reconciliation matrix; writes only into a new dated
// _CONTROL run folder. No project file is moved/deleted by this script.
const fs = require('fs');
const path = require('path');

function parseCsv(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = []; let row = []; let field = ''; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\r') { /* skip */ }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const header = rows[0];
  return { header, records: rows.slice(1).filter(r => r.length === header.length).map(r => Object.fromEntries(header.map((h, i) => [h, r[i]]))) };
}
function csvField(v) { return `"${String(v ?? '').replace(/"/g, '""')}"`; }
function writeCsv(filePath, header, records) {
  const lines = [header.map(csvField).join(',')];
  for (const r of records) lines.push(header.map(h => csvField(r[h])).join(','));
  fs.writeFileSync(filePath, lines.join('\r\n') + '\r\n');
}

const SRC = 'C:/Users/DIYA GOEL/Downloads/EBDESIGN/_EBDESIGN_LIBRARY/_CONTROL/LIBRARY_COMPLETION_RECONCILIATION_20260820_213149/MASTER_RECONCILIATION_MATRIX.csv';
const { header, records } = parseCsv(fs.readFileSync(SRC, 'utf8'));

const worktreeRe = /(^|[\\/])\.claude[\\/]worktrees[\\/]/i;
const dotClaudeOtherRe = /^\.claude[\\/]/i; // non-worktree .claude/ content (e.g. .claude/agents, .claude/audits) — different rule, not a worktree snapshot

function classify(r) {
  if (worktreeRe.test(r.PhysicalPath)) return { bucket: 'OUT_OF_SCOPE_WORKTREE_SNAPSHOT', reason: 'Inside .claude/worktrees/ — ephemeral Claude Code agent session snapshot, protected by SAFETY_CONTRACT.md rule 4 (No Claude worktree modification). Not a distinct project artifact; excluded from library accession scope entirely.' };
  if (/^[A-Z][a-zA-Z0-9]*(\.[A-Z][a-zA-Z0-9]*){2,}$/.test(r.FileName) && !/[\\/]/.test(r.PhysicalPath)) {
    return { bucket: 'SCAN_ARTIFACT_NOT_A_FILE', reason: 'FileName matches a .NET type/namespace pattern with no path separator — a stringified object leaked into the scan output by a prior PowerShell forensic pass. Not a real file; known bug in _SUBH_FORENSIC_REBUILD/90_LOGS scan tooling.' };
  }
  if (r.Status === 'REVIEW_REQUIRED' && r.IdentitySource === 'AUTHORITY_PATH' && Number(r.Confidence) >= 85) {
    return { bucket: 'SAFE_TO_ACCESSION_PATH_CONFIRMED', reason: 'Path-based Authority identity already established (PhysicalItemID assigned); missing hash corroboration is an Authority-registry completeness gap, not file ambiguity — global CONFLICT and DUPLICATE counts for this run were both 0. Safe to backfill SHA256 onto the existing PhysicalItemID.' };
  }
  if (r.Status === 'UNKNOWN') {
    return { bucket: 'NEW_UNREGISTERED_SAFE_TO_CREATE_IDENTITY', reason: 'No Authority path or hash match, but global CONFLICT and DUPLICATE counts for this run were both 0 — nothing in the library contradicts this file. Eligible for a fresh PhysicalItemID using the project\'s existing ID-minting sequence (do not invent a new ID scheme).' };
  }
  return { bucket: 'NEEDS_HUMAN_REVIEW', reason: 'Did not match any established rule; genuinely ambiguous.' };
}

const buckets = {};
const out = [];
for (const r of records) {
  const { bucket, reason } = classify(r);
  buckets[bucket] = (buckets[bucket] || 0) + 1;
  out.push({ ...r, TriageBucket: bucket, TriageReason: reason });
}

const RUN_ID = process.argv[2] || 'UNSET_RUNID';
const outDir = path.join('C:/Users/DIYA GOEL/Downloads/EBDESIGN/_EBDESIGN_LIBRARY/_CONTROL', `TRIAGE_${RUN_ID}`);
fs.mkdirSync(outDir, { recursive: true });

const outHeader = [...header, 'TriageBucket', 'TriageReason'];
writeCsv(path.join(outDir, 'TRIAGE_CLASSIFICATION.csv'), outHeader, out);

for (const bucket of Object.keys(buckets)) {
  writeCsv(path.join(outDir, `${bucket}.csv`), outHeader, out.filter(r => r.TriageBucket === bucket));
}

const summary = {
  runId: RUN_ID,
  sourceMatrix: SRC,
  totalRows: records.length,
  buckets,
  note: 'Read-only classification pass. No project files moved, renamed, or deleted. No Authority IDs minted by this script.',
};
fs.writeFileSync(path.join(outDir, 'TRIAGE_SUMMARY.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
