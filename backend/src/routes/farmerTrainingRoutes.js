/**
 * farmerTrainingRoutes — the canonical implementation for this resource.
 *
 * Consolidated from farmerTrainingRoutes_merged.js on 2026-09-13, per
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
 * Farmer Training Routes
 * REST API routes for farmer training operations
 */

const express = require('express');
const farmerTrainingController = require('../controllers/farmerTrainingController');
const { authMiddleware } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { logger } = require('../utils/logger');

const router = express.Router();

// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'farmerTrainingRoutes' });
});

router.use(authMiddleware);
router.use(apiLimiter);

// Training Program Management
router.post('/programs', farmerTrainingController.createTrainingProgram);
router.post('/register', farmerTrainingController.registerForTraining);
router.get('/progress/:registrationId', farmerTrainingController.trackTrainingProgress);

// Compliance and Sustainability
router.post('/folu-assessment', farmerTrainingController.assessFOLUCompliance);
router.get('/carbon-footprint/:farmerId', farmerTrainingController.trackCarbonFootprint);
router.post('/compliance-report', farmerTrainingController.generateComplianceReport);

// Tracking and Analysis
router.get('/northeast-organic', farmerTrainingController.getNortheastOrganicTracking);

// Certifications and Recommendations
router.post('/certificates/:registrationId', farmerTrainingController.issueTrainingCertificate);
router.get('/recommendations/:farmerId', farmerTrainingController.getTrainingRecommendations);

module.exports = router;
