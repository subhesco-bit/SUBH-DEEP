/**
 * costRoutes — the canonical implementation for this resource.
 *
 * Consolidated from finance/costRoutes_merged.js on 2026-09-13, per
 * .ai/decisions/0001-module-lineage-consolidation.md.
 *
 * Covers cost breakup and corridor-model endpoints.
 *
 * History: the implementation was filed into a domain subfolder under a
 * "_merged" name. dynamicRouteLoader.js builds mount paths from the folder and
 * filename, so it was published at a "...-merged" URL that nothing calls, while
 * this file — a placeholder with only a /health route — owned the path the
 * frontend requests. Relative requires were re-based for this file's depth.
 */
/**
 * Cost routes.
 *
 * /breakup is authenticated: per-consignment cost reveals the platform's
 * margin on a specific lane, which is commercially sensitive.
 * /corridor-model is public — it is the published business-plan model and the
 * transparency about where the money goes is the point.
 */
const express = require('express');
const router = express.Router();
// Liveness ping preserved from the placeholder this file used to contain.
router.get('/health', (req, res) => {
  res.json({ success: true, module: 'costRoutes', status: 'operational' });
});

const costService = require('../services/legacy/costService');
const { authMiddleware } = require('../middleware/auth');


const fail = (res, e) => res.status(/required|No landed-cost/i.test(e.message) ? 400 : 500)
  .json({ success: false, error: e.message });

router.get('/breakup', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await costService.getCostBreakup(req.query) }); }
  catch (e) { fail(res, e); }
});

router.get('/corridor-model', async (req, res) => {
  try { res.json({ success: true, data: await costService.getCorridorModel(req.query.corridor) }); }
  catch (e) { fail(res, e); }
});

module.exports = router;
