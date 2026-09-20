/**
 * Dynamic Route Loader
 * Automatically discovers and registers routes with caching
 * Replaces 400+ manual route imports with 1 function call
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

class DynamicRouteLoader {
  constructor() {
    this.routeCache = new Map();
    this.loadedModules = new Set();
  }

  /**
   * Load all routes from a directory
   * @param {string} dir - Directory to scan
   * @returns {Array} Array of loaded route modules
   */
  loadAllRoutes(dir) {
    if (!fs.existsSync(dir)) {
      logger.warn(`Route directory not found: ${dir}`);
      return [];
    }

    const cacheKey = path.resolve(dir);
    if (this.routeCache.has(cacheKey)) {
      return this.routeCache.get(cacheKey);
    }

    const routes = [];
    const files = this.getRouteFiles(dir);

    for (const file of files) {
      try {
        const filePath = path.join(dir, file);
        const moduleKey = path.resolve(filePath);
        
        if (this.loadedModules.has(moduleKey)) {
          continue;
        }

        const module = require(filePath);
        this.loadedModules.add(moduleKey);
        
        routes.push({
          name: path.basename(file, '.js'),
          path: filePath,
          module: module
        });
      } catch (err) {
        logger.error(`Failed to load route ${file}:`, err.message);
      }
    }

    this.routeCache.set(cacheKey, routes);
    return routes;
  }

  /**
   * Get all JavaScript files from directory (recursive if needed)
   * @param {string} dir - Directory to scan
   * @returns {Array} Array of .js file names
   */
  getRouteFiles(dir) {
    try {
      return fs.readdirSync(dir)
        .filter(file => 
          file.endsWith('.js') && 
          !file.startsWith('.') && 
          file !== 'index.js'
        )
        .sort();
    } catch (err) {
      logger.error(`Error reading directory ${dir}:`, err.message);
      return [];
    }
  }

  /**
   * Register routes with Express app
   * @param {Express} app - Express app instance
   * @param {Array} routes - Array of route modules
   * @param {string} basePath - Base path for routes (e.g., '/api')
   */
  registerRoutes(app, routes, basePath = '/api') {
    let registered = 0;
    let errors = 0;

    for (const route of routes) {
      try {
        const module = route.module;
        
        // Support both default export and router property
        const router = module.default || module.router || module;
        
        if (router && typeof router.stack !== 'undefined') {
          app.use(basePath, router);
          registered++;
        } else if (typeof router === 'function') {
          app.use(basePath, router);
          registered++;
        }
      } catch (err) {
        logger.error(`Failed to register route ${route.name}:`, err.message);
        errors++;
      }
    }

    logger.info(`Registered ${registered} routes | ${errors} errors`);
    return { registered, errors };
  }

  /**
   * Get route statistics
   * @returns {Object} Stats object
   */
  getStats() {
    return {
      cachedDirectories: this.routeCache.size,
      loadedModules: this.loadedModules.size,
      cacheSize: this.routeCache.size
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.routeCache.clear();
    this.loadedModules.clear();
  }
}

module.exports = new DynamicRouteLoader();
