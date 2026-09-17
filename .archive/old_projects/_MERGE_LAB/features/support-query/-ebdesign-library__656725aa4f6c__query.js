#!/usr/bin/env node
// EBDESIGN Master Library — AI Retrieval CLI
// Fast, indexed lookups against knowledge_graph.db so an AI agent (or a human)
// can answer "what depends on this file / what does this route touch / which
// module owns this" in milliseconds instead of scanning the repo.
//
// Usage:
//   node query.js module M001                  -> module detail + its routes/security
//   node query.js route /api/v1/auth            -> routes matching a path fragment
//   node query.js file <path-fragment>           -> file node + its import edges (both directions)
//   node query.js imports <path-fragment>         -> what this file imports
//   node query.js importers <path-fragment>       -> what imports this file (reverse dependency lookup)
//   node query.js trace <component-or-route>      -> UI -> API -> DB trace rows
//   node query.js stats                           -> node/edge counts by type
//   node query.js search <text>                   -> free-text match across node name/path

const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const db = new DatabaseSync(path.join(__dirname, 'knowledge_graph.db'), { readOnly: true });

function printRows(rows) {
  if (!rows.length) { console.log('(no results)'); return; }
  console.log(JSON.stringify(rows, null, 2));
}

const [, , cmd, ...rest] = process.argv;
const arg = rest.join(' ');

switch (cmd) {
  case 'stats': {
    console.log('Nodes by type:');
    printRows(db.prepare('SELECT type, COUNT(*) count FROM nodes GROUP BY type ORDER BY count DESC').all());
    console.log('Edges by type:');
    printRows(db.prepare('SELECT rel_type, COUNT(*) count FROM edges GROUP BY rel_type ORDER BY count DESC').all());
    break;
  }
  case 'module': {
    const mod = db.prepare("SELECT * FROM nodes WHERE type='MODULE' AND id=?").get(`EBD-MOD-${arg}`)
      || db.prepare("SELECT * FROM nodes WHERE type='MODULE' AND name=?").get(arg);
    if (!mod) { console.log('module not found:', arg); break; }
    console.log('MODULE:', mod);
    console.log('ROUTES:');
    printRows(db.prepare("SELECT n.* FROM nodes n JOIN edges e ON e.target_id=n.id WHERE e.source_id=? AND e.rel_type='CONTAINS' AND n.type='ROUTE'").all(mod.id));
    console.log('SECURITY:');
    printRows(db.prepare("SELECT n.* FROM nodes n JOIN edges e ON e.target_id=n.id WHERE e.source_id=? AND e.rel_type='CONTROLLED_BY'").all(mod.id));
    break;
  }
  case 'route': {
    printRows(db.prepare("SELECT * FROM nodes WHERE type IN ('ROUTE','ROUTE_TRACE') AND (name LIKE ? OR path LIKE ?) LIMIT 50")
      .all(`%${arg}%`, `%${arg}%`));
    break;
  }
  case 'file': {
    const f = db.prepare("SELECT * FROM nodes WHERE type='FILE' AND path LIKE ? LIMIT 1").get(`%${arg}%`);
    if (!f) { console.log('file not found:', arg); break; }
    console.log('FILE:', f);
    console.log('IMPORTS (outgoing):');
    printRows(db.prepare("SELECT n.path, n.type, e.evidence FROM edges e JOIN nodes n ON n.id=e.target_id WHERE e.source_id=? AND e.rel_type='IMPORTS'").all(f.id));
    console.log('IMPORTED BY (incoming):');
    printRows(db.prepare("SELECT n.path, e.evidence FROM edges e JOIN nodes n ON n.id=e.source_id WHERE e.target_id=? AND e.rel_type='IMPORTS'").all(f.id));
    break;
  }
  case 'imports': {
    const f = db.prepare("SELECT * FROM nodes WHERE type='FILE' AND path LIKE ? LIMIT 1").get(`%${arg}%`);
    if (!f) { console.log('file not found:', arg); break; }
    printRows(db.prepare("SELECT n.path, n.type FROM edges e JOIN nodes n ON n.id=e.target_id WHERE e.source_id=? AND e.rel_type='IMPORTS'").all(f.id));
    break;
  }
  case 'importers': {
    const f = db.prepare("SELECT * FROM nodes WHERE type='FILE' AND path LIKE ? LIMIT 1").get(`%${arg}%`);
    if (!f) { console.log('file not found:', arg); break; }
    printRows(db.prepare("SELECT n.path FROM edges e JOIN nodes n ON n.id=e.source_id WHERE e.target_id=? AND e.rel_type='IMPORTS'").all(f.id));
    break;
  }
  case 'trace': {
    printRows(db.prepare("SELECT * FROM nodes WHERE type IN ('COMPONENT','ROUTE_TRACE','DB_TABLE') AND (name LIKE ? OR path LIKE ?) LIMIT 50")
      .all(`%${arg}%`, `%${arg}%`));
    break;
  }
  case 'search': {
    printRows(db.prepare("SELECT id, type, name, path, status FROM nodes WHERE name LIKE ? OR path LIKE ? LIMIT 50")
      .all(`%${arg}%`, `%${arg}%`));
    break;
  }
  default:
    console.log(`Unknown command: ${cmd}\nUsage: node query.js <module|route|file|imports|importers|trace|search|stats> [arg]`);
}
db.close();
