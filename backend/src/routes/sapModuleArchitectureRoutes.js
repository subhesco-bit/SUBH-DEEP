/**
 * sap Module Architecture Routes
 */

const express = require('express');
const router = express.Router();

try {
  const { authMiddleware } = require('../middleware/auth');
  router.use(authMiddleware);
} catch (e) {
  // Auth optional
}

/**
 * Main endpoint
 */
router.post('/', async (req, res) => {
  res.json({
    success: true,
    module: 'sapModuleArchitectureRoutes',
    message: 'Route operational',
    timestamp: new Date().toISOString()
  });
});

/**
 * Health check
 */
// Alias preserved from sapModuleArchitectureRoutes_merged.js before it was
// retired (2026-09-13). That file's only endpoint was GET /status returning
// { status: 'ok' } — the same liveness fact this module's /health reports under
// a different name. Kept so the retired file's contract is not silently dropped.
router.get('/status', (req, res) => {
  res.json({ status: 'ok', module: 'sapModuleArchitecture' });
});

router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    module: 'sapModuleArchitectureRoutes'
  });
});

module.exports = router;
