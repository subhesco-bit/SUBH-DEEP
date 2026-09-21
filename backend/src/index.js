/**
 * EBDESIGN Platform Backend - Main Entry Point (FIXED)
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
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// ============================================================================
// PHASE 2: VALIDATION (BEFORE ANY OTHER REQUIRES)
// ============================================================================

const EnvironmentValidator = require('./core/environmentValidator');
const { logger } = require('./utils/logger');

try {
  EnvironmentValidator.validate(['DATABASE_URL', 'REDIS_URL', 'FRONTEND_URL']);
} catch (err) {
  logger.error('❌ Environment validation failed:', err.message);
  process.exit(1);
}

// ============================================================================
// PHASE 3: DATABASE INITIALIZATION
// ============================================================================

const { initialize: initDatabase } = require('./database/connection');

// Initialize database before anything else
(async () => {
  try {
    await initDatabase();
    logger.info('✓ Database connections initialized');
  } catch (err) {
    logger.warn('Database initialization warning (fallback mode may be used):', err.message);
  }
})().catch(err => {
  logger.error('Fatal database initialization error:', err.message);
});

// ============================================================================
// PHASE 4: CORE DEPENDENCIES (MINIMAL SET)
// ============================================================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');

// Core Infrastructure
const DynamicRouteLoader = require('./core/dynamicRouteLoader');
const StartupVerification = require('./core/startupVerification');

// Middleware (all in one index)
const {
  setupMiddleware,
  requestId,
  errorBoundary,
  corsMiddleware,
  securityHeaders,
  createRateLimiter,
  validateInput,
  responseFormatter,
  requestLogger,
} = require('./middleware');

// ============================================================================
// PHASE 5: APP INITIALIZATION
// ============================================================================

const app = express();
const server = http.createServer(app);

// Socket.IO with secure CORS
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
  maxHttpBufferSize: 50 * 1024 * 1024, // 50MB
});

// Attach io to app for route access
app.io = io;

logger.info('✓ Express app and Socket.IO initialized');

// ============================================================================
// PHASE 6: SECURITY HARDENING
// ============================================================================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// ============================================================================
// PHASE 7: MIDDLEWARE SETUP (IN ORDER)
// ============================================================================

// Compression
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (msg) => logger.http(msg.trim()),
  },
}));

// CORS (custom implementation)
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0]);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID, X-Correlation-ID');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================================================
// PHASE 8: CUSTOM MIDDLEWARE SETUP
// ============================================================================

// Request ID
app.use(requestId);

// Security headers
app.use(securityHeaders);

// Rate limiting (100 requests per 15 minutes)
app.use(createRateLimiter(100, 15 * 60 * 1000));

// Input validation
app.use(validateInput);

// Response formatter
app.use(responseFormatter);

// Request logger
app.use(requestLogger);

logger.info('✓ All middleware initialized and wired');

// ============================================================================
// PHASE 9: HEALTH CHECKS & MONITORING
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/ready', async (req, res) => {
  try {
    const verified = await StartupVerification.runQuickCheck();
    res.status(verified ? 200 : 503).json({
      status: verified ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

app.get('/health/live', (req, res) => {
  res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

// ============================================================================
// PHASE 10: ROUTE LOADING & REGISTRATION
// ============================================================================

let routeStats = { total: 0, routes: [], errors: [] };

try {
  logger.info('🔄 Loading routes...');

  // Load routes from /routes directory
  const routesDir = path.join(__dirname, 'routes');
  const routes = DynamicRouteLoader.loadAllRoutes(routesDir);
  
  // Load module routes from /modules directory
  const modulesDir = path.join(__dirname, 'modules');
  const moduleRoutes = DynamicRouteLoader.loadAllRoutes(modulesDir);
  
  // Register all routes with error handling
  const routeStats1 = DynamicRouteLoader.registerRoutes(app, routes, '/api');
  const routeStats2 = DynamicRouteLoader.registerRoutes(app, moduleRoutes, '/api/modules');
  
  routeStats = {
    total: routeStats1.registered + routeStats2.registered,
    errors: routeStats1.errors + routeStats2.errors,
    routes: [...routes.map(r => r.name), ...moduleRoutes.map(r => r.name)],
  };
  
  logger.info(`✓ Loaded ${routeStats.total} API routes (${routeStats.errors} errors)`);
} catch (err) {
  logger.error('Failed to load routes:', err.message);
  routeStats.errors = 1;
}

// ============================================================================
// PHASE 11: WEBSOCKET SETUP
// ============================================================================

io.on('connection', (socket) => {
  logger.info(`✓ WebSocket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    logger.info(`✗ WebSocket disconnected: ${socket.id}`);
  });

  socket.on('error', (error) => {
    logger.error('WebSocket error:', { socketId: socket.id, error: error.message });
  });
});

logger.info('✓ WebSocket server initialized');

// ============================================================================
// PHASE 12: ERROR HANDLING (MUST BE LAST)
// ============================================================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    path: req.path,
    method: req.method,
    message: `Route ${req.method} ${req.path} not found`,
    requestId: req.id,
  });
});

// Global error handler (MUST be after all other middleware/routes)
app.use(errorBoundary);

logger.info('✓ Error handlers registered');

// ============================================================================
// PHASE 13: STARTUP SEQUENCE
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
    } else {
      logger.info('✓ All startup checks passed');
    }

    // Start HTTP server
    server.listen(PORT, '0.0.0.0', () => {
      logger.info('✅ Server started successfully');
      logger.info(`📍 API: http://localhost:${PORT}`);
      logger.info(`🔍 Health: http://localhost:${PORT}/health`);
      logger.info(`📊 Routes loaded: ${routeStats.total}`);
      logger.info(`🌐 CORS origins: ${allowedOrigins.join(', ')}`);
      logger.info(`✨ Environment: ${process.env.NODE_ENV}`);
    });

    // Graceful shutdown
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

    // Close server
    server.close(async () => {
      logger.info('✓ Server closed');

      // Close database connections
      try {
        const { close } = require('./database/connection');
        await close();
        logger.info('✓ Database connections closed');
      } catch (err) {
        logger.error('Error closing database:', err.message);
      }

      process.exit(0);
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('❌ Forced shutdown (timeout)');
      process.exit(1);
    }, 30000);
  };
}

// ============================================================================
// PHASE 14: EXECUTION
// ============================================================================

if (process.env.NODE_ENV !== 'test') {
  start();
}

// ============================================================================
// EXPORTS (for testing)
// ============================================================================

module.exports = { app, server, io, logger };
