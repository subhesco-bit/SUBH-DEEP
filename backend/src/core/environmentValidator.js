/**
 * Environment Validator
 * Validates environment variables before app startup
 */

'use strict';

const { logger } = require('../utils/logger');

class EnvironmentValidator {
  /**
   * Validate required environment variables
   * @param {Array<string>} required - Required env var names
   * @throws {Error} If validation fails
   */
  validate(required = []) {
    const errors = [];
    const warnings = [];

    // Check required variables
    for (const key of required) {
      if (!process.env[key]) {
        errors.push(`Missing required env var: ${key}`);
      }
    }

    // Validate formats
    this.validateFormats();

    // Check for common misconfigurations
    if (process.env.NODE_ENV === 'production') {
      if (process.env.DEBUG) {
        warnings.push('DEBUG mode enabled in production');
      }
    }

    // Report results
    if (warnings.length > 0) {
      warnings.forEach(w => logger.warn(`⚠️  ${w}`));
    }

    if (errors.length > 0) {
      const message = errors.join('\n');
      throw new Error(`Environment validation failed:\n${message}`);
    }

    logger.info('✓ Environment validation passed');
    return true;
  }

  /**
   * Validate environment variable formats
   */
  validateFormats() {
    // Validate URLs
    if (process.env.DATABASE_URL) {
      this.validateURL('DATABASE_URL', process.env.DATABASE_URL);
    }

    if (process.env.REDIS_URL) {
      this.validateURL('REDIS_URL', process.env.REDIS_URL);
    }

    if (process.env.FRONTEND_URL) {
      // Can be comma-separated list
      const urls = process.env.FRONTEND_URL.split(',');
      urls.forEach(url => {
        this.validateURL('FRONTEND_URL', url.trim());
      });
    }

    // Validate port
    if (process.env.PORT) {
      const port = parseInt(process.env.PORT, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error(`Invalid PORT: ${process.env.PORT}`);
      }
    }
  }

  /**
   * Validate URL format
   * @param {string} name - Variable name
   * @param {string} url - URL to validate
   */
  validateURL(name, url) {
    try {
      new URL(url);
    } catch (err) {
      throw new Error(`Invalid ${name}: ${url}`);
    }
  }
}

module.exports = new EnvironmentValidator();
