/**
 * revenueRoutes — the canonical implementation for this resource.
 *
 * Consolidated from revenueRoutes_merged.js on 2026-09-13, per
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
 * Revenue routes. Authenticated throughout — revenue is not public, and
 * allocation changes what a farmer was promised.
 */
const express = require('express');
const logger = console; // TODO: use Winston/Pino logger

const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'revenueRoutes' });
});

const revenueService = require('../services/legacy/revenueService');
const { authMiddleware } = require('../middleware/auth');

const fail = (res, e) => res.status(/required|must|not found/i.test(e.message) ? 400 : 500)
  .json({ success: false, error: e.message });

router.get('/overview', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await revenueService.getOverview(req.query) }); }
  catch (e) { fail(res, e); }
});

/**
 * Returns a PROPOSED allocation with applied:false. That is a 200 — the
 * service declining to auto-apply is the designed behaviour, not a failure.
 */
router.post('/allocate', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await revenueService.allocateChannels(req.body) }); }
  catch (e) { fail(res, e); }
});

module.exports = router;
