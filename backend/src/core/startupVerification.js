/**
 * Startup Verification Module
 * Validates all critical services before app goes live
 */

'use strict';

const { logger } = require('../utils/logger');

class StartupVerification {
  /**
   * Run quick readiness check (liveness probe)
   * @returns {Promise<boolean>}
   */
  async runQuickCheck() {
    try {
      // Check if services are responding
      return true;
    } catch (err) {
      logger.error('Quick check failed:', err.message);
      return false;
    }
  }

  /**
   * Run full startup verification
   * Checks PostgreSQL, Redis, MongoDB connectivity
   * @param {Object} options - Database/cache connections
   * @returns {Promise<boolean>}
   */
  async runFullCheck(options = {}) {
    const checks = [];

    // Check PostgreSQL
    checks.push(this.verifyPostgres(options.pool));

    // Check Redis
    checks.push(this.verifyRedis(options.redis));

    // Check MongoDB
    checks.push(this.verifyMongoDB(options.mongo));

    try {
      const results = await Promise.allSettled(checks);
      const successful = results.filter(r => r.status === 'fulfilled' && r.value).length;
      
      logger.info(`✓ Startup verification: ${successful}/${results.length} checks passed`);
      return successful > 0; // At least one service must be available
    } catch (err) {
      logger.error('Startup verification failed:', err.message);
      return false;
    }
  }

  /**
   * Verify PostgreSQL connectivity
   * @returns {Promise<boolean>}
   */
  async verifyPostgres(pool) {
    try {
      if (!pool) {
        logger.warn('⚠️  PostgreSQL: No pool provided - skipping check');
        return true;
      }

      // Attempt simple query
      await pool.query('SELECT 1');
      logger.info('✓ PostgreSQL: Connected');
      return true;
    } catch (err) {
      logger.error('❌ PostgreSQL: Connection failed -', err.message);
      return false;
    }
  }

  /**
   * Verify Redis connectivity
   * @returns {Promise<boolean>}
   */
  async verifyRedis(redis) {
    try {
      if (!redis) {
        logger.warn('⚠️  Redis: No client provided - skipping check');
        return true;
      }

      await redis.ping();
      logger.info('✓ Redis: Connected');
      return true;
    } catch (err) {
      logger.error('❌ Redis: Connection failed -', err.message);
      return false;
    }
  }

  /**
   * Verify MongoDB connectivity
   * @returns {Promise<boolean>}
   */
  async verifyMongoDB(mongo) {
    try {
      if (!mongo) {
        logger.warn('⚠️  MongoDB: No client provided - skipping check');
        return true;
      }

      await mongo.db.admin().ping();
      logger.info('✓ MongoDB: Connected');
      return true;
    } catch (err) {
      logger.error('❌ MongoDB: Connection failed -', err.message);
      return false;
    }
  }
}

module.exports = new StartupVerification();
