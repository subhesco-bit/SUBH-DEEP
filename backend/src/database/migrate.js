#!/usr/bin/env node
/**
 * Database Migration Runner
 * Runs all SQL migration files in sequential order
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { Pool } = require('pg');

// Load the same env files, in the same order, as src/index.js.
//
// dotenv does not overwrite a variable that is already set, so the FIRST file
// to define a key wins — .env.local overrides .env. This runner previously
// called a bare `dotenv.config()`, which loads only `.env` relative to the
// working directory. That alone was enough to point migrations at a different
// database than the server, because the two files disagree.
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * --continue keeps going after a failed migration instead of halting.
 *
 * Each migration runs in its own transaction and a failure is rolled back and
 * not recorded, so continuing cannot leave the database half-applied. Halting
 * on the first failure means one blocker hides all the others, which with
 * hundreds of pending migrations is a single diagnostic per run. Use this to
 * see every failure at once; leave it off for a real deployment, where the
 * first failure should stop the release.
 */
const CONTINUE_ON_ERROR = process.argv.includes('--continue');

const { resolvePoolConfig, describePostgresTarget } = require('../config/database');
const { compareMigrationNames } = require('./migrationOrder');

const migrationsDir = path.join(__dirname, 'migrations');

function getMigrationFiles() {
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(compareMigrationNames);
}

/**
 * Remove a migration's own transaction markers, since the runner wraps each
 * file in one transaction of its own.
 *
 * This must only touch markers at the top level. The previous implementation
 * was a pair of line-anchored regexes over the whole file, and `END;` is not
 * only a transaction marker — it also closes a PL/pgSQL block:
 *
 *     CREATE FUNCTION ... RETURNS TRIGGER AS $$
 *     BEGIN
 *       ...
 *     END;              <-- stripped, leaving $$ ... $$ unterminated
 *     $$ LANGUAGE plpgsql;
 *
 * Postgres then reported "syntax error at end of input". That single defect
 * failed 311 of 337 pending migrations — 92% of them — and because the runner
 * halted on the first failure it looked like an unrelated schema problem.
 *
 * So: walk the file tracking dollar-quoted bodies ($$ ... $$ and $tag$ ... $tag$)
 * plus ordinary string literals and comments, and only drop a marker found
 * outside all of them.
 */
function stripTransactionMarkers(sql) {
  const lines = sql.split('\n');
  const out = [];
  let dollarTag = null;      // active $tag$ body, if any
  let inBlockComment = false;

  const MARKER = /^\s*(BEGIN|START\s+TRANSACTION|COMMIT|END|ROLLBACK)\s*(WORK|TRANSACTION)?\s*;\s*$/i;

  for (const line of lines) {
    const wasInside = dollarTag !== null;

    // Track dollar-quote and block-comment state across this line.
    let i = 0;
    while (i < line.length) {
      if (inBlockComment) {
        const end = line.indexOf('*/', i);
        if (end === -1) { i = line.length; break; }
        inBlockComment = false;
        i = end + 2;
        continue;
      }
      if (dollarTag === null) {
        if (line.startsWith('--', i)) break;            // rest of line is a comment
        if (line.startsWith('/*', i)) { inBlockComment = true; i += 2; continue; }
        if (line[i] === "'") {                           // skip a string literal
          i += 1;
          while (i < line.length) {
            if (line[i] === "'" && line[i + 1] === "'") { i += 2; continue; }
            if (line[i] === "'") { i += 1; break; }
            i += 1;
          }
          continue;
        }
        const open = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(line.slice(i));
        if (open) { dollarTag = open[0]; i += open[0].length; continue; }
        i += 1;
      } else {
        const close = line.indexOf(dollarTag, i);
        if (close === -1) { i = line.length; break; }
        i = close + dollarTag.length;
        dollarTag = null;
      }
    }

    // Only a marker that began and ended outside any dollar-quoted body is a
    // transaction marker. Anything inside one belongs to the routine.
    if (!wasInside && dollarTag === null && MARKER.test(line)) continue;
    out.push(line);
  }

  return out.join('\n');
}

function runPreflight() {
  const output = execFileSync(process.execPath, [path.join(__dirname, 'migration_preflight.js'), '--json'], {
    encoding: 'utf8',
  });
  const report = JSON.parse(output);
  if (report.blockers > 0) {
    throw new Error(`Migration preflight found ${report.blockers} blocking issue(s)`);
  }
  return report;
}

async function runMigrations() {
  // Resolved through the shared config, not read from DB_* directly.
  //
  // This runner used to ignore DATABASE_URL and read only DB_*. The application
  // does the opposite. With `backend/.env` setting both to different values,
  // migrations were applied to one database while the app read another — the
  // tables existed, just not where anything looked for them.
  //
  // A migration run needs one connection, not a serving pool.
  const pool = new Pool(resolvePoolConfig({ max: 2 }));

  try {
    console.log(`✅ Migration target: ${describePostgresTarget()}`);
    const preflight = runPreflight();
    console.log(`✅ Migration preflight passed: ${preflight.migrationCount} files, ${preflight.blockers} blockers`);

    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Migrations table ready');

    // Get list of migration files
    const migrationFiles = getMigrationFiles();

    console.log(`\n📋 Found ${migrationFiles.length} migration files\n`);

    const failures = [];
    let applied = 0;

    for (const file of migrationFiles) {
      // Check if already executed
      const result = await pool.query(
        'SELECT * FROM migrations WHERE name = $1',
        [file],
      );

      if (result.rows.length > 0) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      // Read and execute migration
      const filePath = path.join(migrationsDir, file);
      const sql = stripTransactionMarkers(fs.readFileSync(filePath, 'utf8'));

      // The transaction must run on ONE connection.
      //
      // This previously issued BEGIN, the migration body, the bookkeeping
      // INSERT and COMMIT as four separate `pool.query()` calls. A pool hands
      // each call whatever connection is free and releases it again, so BEGIN
      // could open a transaction on one connection while the migration ran on
      // another with autocommit on. The net effect was that migrations were
      // NOT transactional and the ROLLBACK on failure did nothing — a
      // half-applied migration would be left behind and simply not recorded,
      // so the next run would try it again from a dirty state.
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [file],
        );
        await client.query('COMMIT');
        console.log(`✅ Executed ${file}`);
        applied += 1;
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.error(`❌ Failed to execute ${file}:`, err.message);
        failures.push({ file, message: err.message, code: err.code });
        // Halting on the first failure means one blocker hides every other
        // one, and with hundreds of pending migrations that is one diagnostic
        // per run. --continue keeps going so a single pass reports them all.
        // The migration is rolled back and NOT recorded either way, so the
        // database is never left half-applied.
        if (!CONTINUE_ON_ERROR) throw err;
      } finally {
        client.release();
      }
    }

    if (failures.length) {
      console.log(`\n⚠️  ${failures.length} migration(s) failed, ${applied} applied.\n`);
      const byMessage = new Map();
      for (const f of failures) {
        // Collapse identifiers so the same defect in many files groups together.
        const key = f.message
          .replace(/"[^"]+"/g, '"X"')
          .replace(/\b\d+\b/g, 'N');
        if (!byMessage.has(key)) byMessage.set(key, []);
        byMessage.get(key).push(f.file);
      }
      console.log('FAILURES BY CAUSE\n');
      for (const [msg, files] of [...byMessage].sort((a, b) => b[1].length - a[1].length)) {
        console.log(`  ${String(files.length).padStart(3)}x  ${msg.slice(0, 100)}`);
        for (const f of files.slice(0, 4)) console.log(`         ${f}`);
        if (files.length > 4) console.log(`         … ${files.length - 4} more`);
      }
      console.log('');
      process.exitCode = 1;
      return;
    }

    console.log(`\n✅ All migrations completed successfully! (${applied} applied)`);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
