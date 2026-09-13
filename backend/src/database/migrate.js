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

const { resolvePoolConfig, describePostgresTarget } = require('../config/database');
const { compareMigrationNames } = require('./migrationOrder');

const migrationsDir = path.join(__dirname, 'migrations');

function getMigrationFiles() {
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(compareMigrationNames);
}

function stripTransactionMarkers(sql) {
  return sql
    .replace(/^\s*(BEGIN|START\s+TRANSACTION)\s*;\s*$/gim, '')
    .replace(/^\s*(COMMIT|END|ROLLBACK)\s*;\s*$/gim, '');
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
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.error(`❌ Failed to execute ${file}:`, err.message);
        throw err;
      } finally {
        client.release();
      }
    }

    console.log('\n✅ All migrations completed successfully!');
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
