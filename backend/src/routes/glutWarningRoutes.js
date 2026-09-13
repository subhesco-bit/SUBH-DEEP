/**
 * glutWarningRoutes — the canonical implementation for this resource.
 *
 * Consolidated from glutWarningRoutes_merged.js on 2026-09-13, per
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
 * Glut Early-Warning Routes. See services/glutWarningService.js.
 */

const express = require('express');
const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'glutWarningRoutes' });
});

const glutWarningService = require('../services/legacy/glutWarningService');
const { authMiddleware } = require('../middleware/auth');

router.get('/check', authMiddleware, async (req, res) => {
  try {
    const { categoryId, stateId } = req.query;
    const result = await glutWarningService.checkGlutRisk(
      categoryId ? Number(categoryId) : undefined,
      stateId ? Number(stateId) : undefined,
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/scan', authMiddleware, async (req, res) => {
  try {
    const { stateId } = req.query;
    const atRiskCategories = await glutWarningService.scanAllCategories(stateId ? Number(stateId) : undefined);
    res.json({ success: true, count: atRiskCategories.length, data: atRiskCategories });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
