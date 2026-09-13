#!/usr/bin/env node
/**
 * classify-modules-by-ai-class.js — which AI class does each module belong to?
 *
 * The capability classes are only useful if every module knows which one
 * governs it. Otherwise "AI Security & Trust has reflex autonomy" is a
 * statement about nothing in particular.
 *
 * This reads the server's own mounted route table — 648 entries, the only
 * authoritative source, since index.js does not do the mounting — and assigns
 * each to a class, or to `none` where the module carries no AI at all.
 *
 * TWO THINGS IT DELIBERATELY DOES NOT DO
 *
 *   It does not force a class onto every module. Most of this platform is
 *   ordinary CRUD, and labelling a warehouse table as "Agentic AI" would make
 *   the whole classification worthless.
 *
 *   It does not treat a keyword as proof. A route named `aiSomething` is
 *   evidence, not a verdict; the report separates matches that are backed by a
 *   substantive service file from matches that are only a name.
 *
 * Usage:
 *   AUDIT_EMAIL=... AUDIT_PASSWORD=... node tools/classify-modules-by-ai-class.js
 *   node tools/classify-modules-by-ai-class.js --json .audit/ai-class-map.json
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'backend', 'src');
const PORT = Number(process.env.PORT_AUDIT || 5000);
const EMAIL = process.env.AUDIT_EMAIL || 'audit3@ebdesign.local';
const PASSWORD = process.env.AUDIT_PASSWORD || 'AuditPass123!';
const JSON_OUT = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;

/**
 * Ordered: the first class whose pattern matches wins, so put the specific
 * before the general. Security before agentic, because a fraud route is a
 * security concern first even though it also drives action.
 */
const CLASSIFIERS = [
  ['security_trust', /fraud|security|threat|breach|consent|gdpr|privacy|compliance|audit|kyc|verification|authoriz|permission|mfa|two.?factor/i],
  ['generative_media', /image|photo|cartoon|avatar|vision|render|3d|media|illustrat/i],
  // 'nutri' not 'nutrit': the first version missed nutrient-value-sales (28 KB)
  // and soil-nutrient-land (15 KB) entirely, because "nutrient" does not
  // contain "nutrit". 'engineer' was simply absent, so engineering-project
  // (11 KB) fell through to none. Both are exactly the calculator/engineering
  // work this class is for.
  ['frontier_models', /dpr|subsid|scheme|weather|agromet|climate|forecast|advisory|train|tutorial|educat|loan|credit|nutri|dietit|therap|wellness|clinical|engineer|research|knowledge|librar|translat|language|chat|copilot|assistant/i],
  ['quantum_optimisation', /optimi[sz]|allocat|routing|scheduling|capacity|logistics|corridor|freight|fleet|warehouse|cold.?stor|cold.?chain/i],
  ['agentic', /\bai\b|agent|decision|orchestrat|workflow|automat|predict|recommend|intelligence|nervous|brain|reflex|signal|erp/i],
  ['artificial_scientists', /trial|experiment|hypothes|study|variety.?performance|benchmark|mrv/i],
  ['embodied', /robot|actuator|drone|iot|sensor|telemetr|device|machinery|equipment/i],
];

function request(opts, body) {
  return new Promise((resolve) => {
    const req = http.request(opts, (res) => {
      let out = '';
      res.on('data', (c) => { out += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: out }));
    });
    req.on('error', (e) => resolve({ status: -1, body: e.message }));
    req.setTimeout(25000, () => { req.destroy(); resolve({ status: 0, body: 'timeout' }); });
    if (body) req.write(body);
    req.end();
  });
}

/** Is there a substantive service behind this route, or only a name? */
function backingWeight(routeName) {
  const stem = routeName.replace(/Routes?$/i, '');
  const candidates = [
    path.join(SRC, 'services', `${stem}Service.js`),
    path.join(SRC, 'services', `${stem}.js`),
    path.join(SRC, 'services', 'legacy', `${stem}Service.js`),
    path.join(SRC, 'routes', `${routeName}.js`),
  ];
  let biggest = 0;
  for (const c of candidates) {
    try { biggest = Math.max(biggest, fs.statSync(c).size); } catch { /* not there */ }
  }
  return biggest;
}

(async () => {
  const creds = JSON.stringify({ email: EMAIL, password: PASSWORD });
  const login = await request({
    host: '127.0.0.1', port: PORT, path: '/api/v1/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(creds) },
  }, creds);
  if (login.status === 429) {
    console.error('\n  Login rate-limited (5 req/60s). Wait a minute and retry.\n');
    process.exit(1);
  }
  let token = '';
  try { const d = JSON.parse(login.body).data || {}; token = d.access_token || d.token || ''; } catch { /* below */ }
  if (!token) { console.error(`\n  Login failed (${login.status}).\n`); process.exit(1); }

  const table = await request({
    host: '127.0.0.1', port: PORT, path: '/api/v1/system/routes?limit=1000', method: 'GET',
    headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
  });
  const routes = (JSON.parse(table.body).data || {}).routes || [];

  const byClass = new Map(CLASSIFIERS.map(([c]) => [c, []]));
  byClass.set('none', []);

  for (const r of routes) {
    const subject = `${r.name} ${r.path}`;
    const hit = CLASSIFIERS.find(([, re]) => re.test(subject));
    const cls = hit ? hit[0] : 'none';
    byClass.get(cls).push({ name: r.name, path: r.path, bytes: backingWeight(r.name) });
  }

  const SUBSTANTIVE = 6000;
  console.log('\n══════════ MODULES BY AI CAPABILITY CLASS ══════════\n');
  console.log(`  mounted routes classified: ${routes.length}\n`);
  console.log(`  ${'class'.padEnd(24)}${'routes'.padStart(7)}${'substantive'.padStart(13)}`);
  console.log('  ' + '─'.repeat(46));

  const order = [...CLASSIFIERS.map(([c]) => c), 'none'];
  for (const c of order) {
    const list = byClass.get(c) || [];
    const real = list.filter((x) => x.bytes >= SUBSTANTIVE).length;
    console.log(`  ${c.padEnd(24)}${String(list.length).padStart(7)}${String(real).padStart(13)}`);
  }

  console.log('\n\n  DETAIL — substantive modules only (backing service > 6 KB)\n');
  for (const c of order) {
    if (c === 'none') continue;
    const list = (byClass.get(c) || [])
      .filter((x) => x.bytes >= SUBSTANTIVE)
      .sort((a, b) => b.bytes - a.bytes);
    if (!list.length) continue;
    console.log(`  ${c}  (${list.length})`);
    for (const m of list.slice(0, 12)) {
      console.log(`      ${String(Math.round(m.bytes / 1024)).padStart(4)} KB  ${m.path}`);
    }
    if (list.length > 12) console.log(`      … ${list.length - 12} more`);
    console.log('');
  }

  const none = byClass.get('none') || [];
  console.log(`  NOT AI-BEARING: ${none.length} routes — ordinary CRUD and platform plumbing.`);
  console.log('  Left unclassified on purpose: forcing a class onto every module would');
  console.log('  make the classification meaningless.\n');

  if (JSON_OUT) {
    fs.mkdirSync(path.dirname(path.resolve(ROOT, JSON_OUT)), { recursive: true });
    fs.writeFileSync(path.resolve(ROOT, JSON_OUT),
      JSON.stringify(Object.fromEntries(byClass), null, 2));
    console.log(`  json -> ${JSON_OUT}\n`);
  }
})();
