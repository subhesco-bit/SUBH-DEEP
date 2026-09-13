/**
 * regionalVarietyRoutes — the canonical implementation for this resource.
 *
 * Consolidated from regionalVarietyRoutes_merged.js on 2026-09-13, per
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
 * Regional Variety Directory Routes.
 * See services/regionalVarietyService.js. Public GET endpoints (browsing
 * the directory is educational/discovery content, not sensitive), write
 * endpoints (image request, create-listing) require auth.
 */

const express = require('express');
const logger = console; // TODO: use Winston/Pino logger

const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'regionalVarietyRoutes' });
});

const regionalVarietyService = require('../services/legacy/regionalVarietyService');
const { authMiddleware } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const { category, giStatus, state, search } = req.query;
    const varieties = await regionalVarietyService.list({ category, giStatus, state, search });
    res.json({ success: true, count: varieties.length, data: varieties });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await regionalVarietyService.listCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const variety = await regionalVarietyService.getById(req.params.id);
    res.json({ success: true, data: variety });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

router.post('/:id/generate-image', authMiddleware, async (req, res) => {
  try {
    const result = await regionalVarietyService.requestVarietyImage(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/:id/create-listing', authMiddleware, async (req, res) => {
  try {
    const product = await regionalVarietyService.createListingFromVariety(req.params.id, {
      ...req.body,
      sellerId: req.body.sellerId || req.user?.id,
    });
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
