/**
 * demandRoutes — the canonical implementation for this resource.
 *
 * Consolidated from demandRoutes_merged.js on 2026-09-13, per
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
 * Demand routes. Reads are public (a farmer should see market signal without
 * an account); nothing here writes.
 */
const express = require('express');
const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'demandRoutes' });
});

const demandService = require('../services/legacy/demandService');

const fail = (res, e) => res.status(/required/i.test(e.message) ? 400 : 500)
  .json({ success: false, error: e.message });

router.get('/forecast', async (req, res) => {
  try { res.json({ success: true, data: await demandService.getForecast(req.query) }); }
  catch (e) { fail(res, e); }
});

router.get('/heatmap', async (req, res) => {
  try { res.json({ success: true, data: await demandService.getHeatmap(req.query) }); }
  catch (e) { fail(res, e); }
});

router.get('/mandi-signal', async (req, res) => {
  try { res.json({ success: true, data: await demandService.getMandiSignal(req.query) }); }
  catch (e) { fail(res, e); }
});

module.exports = router;
