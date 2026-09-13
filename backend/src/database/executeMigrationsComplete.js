#!/usr/bin/env node

/**
 * DATABASE MIGRATION EXECUTOR - COMPLETE
 * Executes all 422+ migrations in correct order
 * Handles rollback, tracking, and error recovery
 */

const fs = require('fs');
const path = require('path');
// The shared pool proxy, not ./connection.
//
// ./connection exports { initialize, getPostgreSQL, getMongoDB,
// getMongoDatabase, isHealthy, close } — it has no `.query()`, so every
// `db.query(...)` below threw TypeError on the first call. This file could
// never have run as written. ./pool is the lazy proxy over the same single
// pool and does expose query()/connect().
const db = require('./pool');
// The proxy intentionally exposes only query()/connect(); closing the shared
// pool is the connection module's job. `db.end()` here was a TypeError.
const { close: closeDatabase } = require('./connection');
const { compareMigrationNames } = require('./migrationOrder');

class MigrationExecutor {
  constructor() {
    this.migrationsDir = path.join(__dirname, 'migrations');
    this.trackingTable = 'schema_migrations';
  }

  async initialize() {
    try {
      // Create tracking table if not exists
      await db.query(`
        CREATE TABLE IF NOT EXISTS ${this.trackingTable} (
          id SERIAL PRIMARY KEY,
          migration VARCHAR(255) UNIQUE NOT NULL,
          batch INT NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Migration tracking table ready');
    } catch (error) {
      console.error('❌ Error initializing migration tracker:', error);
      throw error;
    }
  }

  async getMigrationFiles() {
    try {
      const files = fs.readdirSync(this.migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort(compareMigrationNames);

      console.log(`📋 Found ${files.length} migration files`);
      return files;
    } catch (error) {
      console.error('❌ Error reading migration files:', error);
      throw error;
    }
  }

  async getExecutedMigrations() {
    try {
      const result = await db.query(
        `SELECT migration FROM ${this.trackingTable} ORDER BY batch DESC, id DESC`
      );
      return result.rows.map(row => row.migration);
    } catch (error) {
      console.error('❌ Error getting executed migrations:', error);
      return [];
    }
  }

  async getNextBatch() {
    try {
      const result = await db.query(
        `SELECT MAX(batch) as max_batch FROM ${this.trackingTable}`
      );
      const maxBatch = result.rows[0]?.max_batch || 0;
      return maxBatch + 1;
    } catch (error) {
      return 1;
    }
  }

  async executeMigration(filename, batch) {
    try {
      const filepath = path.join(this.migrationsDir, filename);
      let sql = fs.readFileSync(filepath, 'utf8');

      // Remove comments and normalize
      sql = sql
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim();

      if (!sql) {
        console.warn(`⚠️  Migration ${filename} is empty, skipping`);
        return false;
      }

      // Execute within a transaction, on ONE connection.
      //
      // Issuing BEGIN/COMMIT through the pool would send each statement to
      // whatever connection happened to be free, so the migration would run
      // outside the transaction it appears to be wrapped in and ROLLBACK would
      // undo nothing. Same defect as the one fixed in migrate.js.
      const client = await db.connect();

      try {
        await client.query('BEGIN');

        // Execute migration
        await client.query(sql);

        // Record migration
        await client.query(
          `INSERT INTO ${this.trackingTable} (migration, batch) VALUES ($1, $2)`,
          [filename, batch]
        );

        await client.query('COMMIT');
        console.log(`✅ Executed: ${filename}`);
        return true;
      } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(`❌ Error executing ${filename}:`, error.message);
      throw error;
    }
  }

  async execute() {
    console.log('🚀 Starting database migrations...\n');

    try {
      // Initialize
      await this.initialize();

      // Get files and executed migrations
      const allFiles = await this.getMigrationFiles();
      const executed = await this.getExecutedMigrations();
      const pending = allFiles.filter(f => !executed.includes(f));

      console.log(`\n📊 Migration Status:`);
      console.log(`   Total migrations: ${allFiles.length}`);
      console.log(`   Already executed: ${executed.length}`);
      console.log(`   Pending: ${pending.length}\n`);

      if (pending.length === 0) {
        console.log('✅ All migrations already executed!');
        return;
      }

      // Get next batch number
      const batch = await this.getNextBatch();
      console.log(`📦 Executing batch ${batch}...\n`);

      // Execute pending migrations
      let successCount = 0;
      let failureCount = 0;

      for (const file of pending) {
        try {
          const success = await this.executeMigration(file, batch);
          if (success) successCount++;
        } catch (error) {
          failureCount++;
          console.error(`\n⚠️  Migration failed. Continuing with remaining migrations...\n`);
        }
      }

      // Summary
      console.log(`\n${'='.repeat(50)}`);
      console.log(`📊 Migration Summary:`);
      console.log(`   ✅ Successful: ${successCount}`);
      console.log(`   ❌ Failed: ${failureCount}`);
      console.log(`   Total executed: ${executed.length + successCount}`);
      console.log(`${'='.repeat(50)}\n`);

      if (failureCount > 0) {
        console.warn('⚠️  Some migrations failed. Review errors above.');
      } else {
        console.log('✅ All migrations completed successfully!');
      }
    } catch (error) {
      console.error('\n❌ Fatal error during migration:', error);
      process.exit(1);
    } finally {
      await closeDatabase();
    }
  }

  // Rollback to previous batch
  async rollback() {
    try {
      console.log('⏮️  Rolling back last batch...\n');

      // This is a basic rollback - production systems need proper down migrations
      const result = await db.query(
        `SELECT MAX(batch) as max_batch FROM ${this.trackingTable}`
      );

      const maxBatch = result.rows[0]?.max_batch;

      if (!maxBatch) {
        console.log('No migrations to rollback');
        return;
      }

      // Remove last batch from tracking
      const migrationsToRemove = await db.query(
        `SELECT migration FROM ${this.trackingTable} WHERE batch = $1`,
        [maxBatch]
      );

      await db.query(
        `DELETE FROM ${this.trackingTable} WHERE batch = $1`,
        [maxBatch]
      );

      console.log(`✅ Rolled back ${migrationsToRemove.rows.length} migrations from batch ${maxBatch}`);
    } catch (error) {
      console.error('❌ Error during rollback:', error);
      throw error;
    } finally {
      await closeDatabase();
    }
  }

  // Status report
  async status() {
    try {
      const allFiles = await this.getMigrationFiles();
      const executed = await this.getExecutedMigrations();

      console.log('\n📋 Migration Status Report\n');
      console.log('Executed Migrations:');
      for (const file of executed) {
        console.log(`  ✅ ${file}`);
      }

      console.log('\nPending Migrations:');
      const pending = allFiles.filter(f => !executed.includes(f));
      for (const file of pending) {
        console.log(`  ⏳ ${file}`);
      }

      console.log(`\n📊 Summary: ${executed.length}/${allFiles.length} completed`);
    } catch (error) {
      console.error('❌ Error getting status:', error);
    } finally {
      await closeDatabase();
    }
  }
}

// CLI
const executor = new MigrationExecutor();

if (process.argv[2] === 'rollback') {
  executor.rollback().catch(console.error);
} else if (process.argv[2] === 'status') {
  executor.status().catch(console.error);
} else {
  executor.execute().catch(console.error);
}

module.exports = MigrationExecutor;
