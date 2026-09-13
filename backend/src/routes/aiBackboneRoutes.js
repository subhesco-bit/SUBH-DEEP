/**
 * aiBackboneRoutes — the canonical implementation for this resource.
 *
 * Consolidated from aiBackboneRoutes_merged.js on 2026-09-13, per
 * .ai/decisions/0001-module-lineage-consolidation.md and
 * .ai/consolidation/CONSOLIDATION_PLAN.md (Phase 3.1): the consolidated code
 * belongs in the canonical file; duplicates are retired once their unique
 * behaviour is preserved and verified.
 *
 * History (why this file looked empty before): dynamicRouteLoader.js derives a
 * mount path from the FILENAME, so this implementation was published at a
 * "...-merged" URL that nothing called, while this file — a generated stub whose
 * only endpoints were a POST / answering "Route operational" and a GET /health —
 * owned the path the frontend actually requests. The stub's blanket
 * router.use(authMiddleware) is deliberately NOT carried over: the code below
 * applies auth per route and several endpoints are intentionally public. Its
 * POST / reply is not carried over either — it answered { success: true }
 * without writing anything.
 */
/**
 * AI Backbone Routes - Real AI Integration
 *
 * REST API routes for AI backbone with real AI provider integrations
 * Following RESTful API design conventions
 */

const express = require('express');
const aiBackboneController = require('../controllers/aiBackboneController');
const { authMiddleware } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { logger } = require('../utils/logger');

const router = express.Router();

// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'aiBackboneRoutes' });
});

router.use(authMiddleware);
router.use(apiLimiter);

// ============================================================================
// AI BACKBONE ROUTES
// ============================================================================

// General AI Operations
router.post('/call', aiBackboneController.callAI);
router.get('/status', aiBackboneController.getAIProviderStatus);
router.post('/switch-provider', aiBackboneController.switchProvider);
router.post('/reset-statistics', aiBackboneController.resetAIStatistics);

// Agricultural AI Operations
router.post('/agricultural-decision', aiBackboneController.supportAgriculturalDecision);
router.post('/livestock-optimization', aiBackboneController.optimizeLivestock);

module.exports = router;
