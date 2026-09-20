/**
 * EBDESIGN Platform Backend - Main Entry Point
 * Ultra-optimized, production-grade entry point
 * 
 * Features:
 * - Auto-discovery architecture: 0 manual imports
 * - Startup verification: Full DB/cache validation
 * - Security hardened: CORS, helmet, rate limiting
 * - Performance optimized: Minimal overhead
 * - Monitoring ready: Health checks + metrics
 */

'use strict';

// ============================================================================
// PHASE 1: ENVIRONMENT SETUP (MUST BE FIRST)
// ============================================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env.local') });

// ============================================================================
// PHASE 2: VALIDATION (BEFORE ANY OTHER REQUIRES)
// ============================================================================

const EnvironmentValidator = require('./core/environmentValidator');
const logger = require('./utils/logger').logger;

try {
  EnvironmentValidator.validate(['DATABASE_URL', 'REDIS_URL', 'FRONTEND_URL']);
} catch (err) {
  logger.error('❌ Environment validation failed:', err.message);
  process.exit(1);
}

// ============================================================================
// PHASE 3: CORE DEPENDENCIES (MINIMAL SET)
// ============================================================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Security & Middleware
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

// Core Infrastructure
const DynamicRouteLoader = require('./core/dynamicRouteLoader');
const StartupVerification = require('./core/startupVerification');

// ============================================================================
// PHASE 4: APP INITIALIZATION
// ============================================================================

const app = express();
const server = http.createServer(app);

// Socket.IO with secure CORS
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(o => o.trim());
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

// ============================================================================
// PHASE 5: SECURITY & COMPRESSION
// ============================================================================

app.use(helmet());
app.use(compression());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// ============================================================================
// PHASE 6: REQUEST LOGGING & PARSING
// ============================================================================

app.use(morgan('combined', { stream: { write: msg => logger.info(msg) } }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================================================
// PHASE 7: MIDDLEWARE SETUP
// ============================================================================

const { requestId } = require('./middleware/requestId');
const { responseFormatter } = require('./middleware/responseFormatter');
const { securityHeaders, rateLimit } = require('./middleware/securityMiddleware');

app.use(requestId);
app.use(securityHeaders);
app.use(rateLimit());
app.use(responseFormatter);

// ============================================================================
// PHASE 8: HEALTH CHECKS & MONITORING
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/health/ready', async (req, res) => {
  try {
    const verified = await StartupVerification.runQuickCheck();
    res.status(verified ? 200 : 503).json({
      status: verified ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

app.get('/health/live', (req, res) => {
  res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

// ============================================================================
// PHASE 9: ROUTE LOADING & REGISTRATION
// ============================================================================

let routeStats = { total: 0, routes: [], errors: [] };

try {
  // Load routes from /routes directory
  const routesDir = path.join(__dirname, 'routes');
  const routes = DynamicRouteLoader.loadAllRoutes(routesDir);
  
  // Load module routes from /modules directory
  const modulesDir = path.join(__dirname, 'modules');
  const moduleRoutes = DynamicRouteLoader.loadAllRoutes(modulesDir);
  
  // Register all routes
  DynamicRouteLoader.registerRoutes(app, routes, '/api');
  DynamicRouteLoader.registerRoutes(app, moduleRoutes, '/api/modules');
  
  // Collect stats
  routeStats = {
    total: routes.length + moduleRoutes.length,
    routes: [...routes.map(r => r.name), ...moduleRoutes.map(r => r.name)],
    errors: []
  };
  
  logger.info(`✓ Loaded ${routeStats.total} API routes`);
} catch (err) {
  logger.error('Failed to load routes:', err.message);
  routeStats.errors.push(err.message);
}

// ============================================================================
// PHASE 10: ERROR HANDLING
// ============================================================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Global error handler (MUST be last)
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// PHASE 11: STARTUP SEQUENCE
// ============================================================================

async function start() {
  const PORT = process.env.PORT || 3001;
  
  try {
    logger.info('🚀 Starting EBDESIGN Backend...');
    
    // Run startup verification
    logger.info('🔍 Running startup verification...');
    const verified = await StartupVerification.runFullCheck();
    
    if (!verified) {
      logger.warn('⚠️  Some services unavailable - continuing with reduced functionality');
    }
    
    // Start HTTP server
    server.listen(PORT, () => {
      logger.info('✅ Server started successfully');
      logger.info(`📍 API: http://localhost:${PORT}`);
      logger.info(`🔍 Health: http://localhost:${PORT}/health`);
      logger.info(`📊 Routes loaded: ${routeStats.total}`);
    });
    
    // Graceful shutdown handlers
    process.on('SIGTERM', shutdown('SIGTERM'));
    process.on('SIGINT', shutdown('SIGINT'));
    
  } catch (err) {
    logger.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

function shutdown(signal) {
  return () => {
    logger.info(`${signal} received - shutting down gracefully...`);
    server.close(() => {
      logger.info('✓ Server closed');
      process.exit(0);
    });
  };
}

// ============================================================================
// PHASE 12: EXECUTION
// ============================================================================

if (process.env.NODE_ENV !== 'test') {
  start();
}

// ============================================================================
// EXPORTS (for testing)
// ============================================================================

module.exports = { app, server, io };
