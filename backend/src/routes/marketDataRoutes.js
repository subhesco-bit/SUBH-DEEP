/**
 * marketDataRoutes — the canonical implementation for this resource.
 *
 * Consolidated from marketDataRoutes_merged.js on 2026-09-13, per
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
 * Agmarknet / e-NAM ingestion, price trends, DBT reconciliation.
 * Backed by services/marketDataService.js.
 *
 * Price reads are public — market price is the single most useful thing a
 * farmer can see and gating it behind a login defeats the purpose. Ingestion
 * and DBT are authenticated.
 */
const express = require('express');
const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'marketDataRoutes' });
});

const md = require('../services/legacy/marketDataService');
const { authMiddleware } = require('../middleware/auth');
const { authMiddleware: authenticate } = require('../middleware/auth');

const fail = (res, e) => res.status(/required|must|Unknown/i.test(e.message) ? 400 : 500)
  .json({ success: false, error: e.message });

router.get('/prices/trend', async (req, res) => {
  try { res.json({ success: true, data: await md.priceTrend(req.query) }); } catch (e) { fail(res, e); }
});
router.post('/prices/ingest', authMiddleware, async (req, res) => {
  try {
    const { records, source } = req.body || {};
    res.json({ success: true, data: await md.ingestMandiPrices(records, source) });
  } catch (e) { fail(res, e); }
});
router.post('/dbt/reconcile', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await md.reconcileDbt(req.body) }); } catch (e) { fail(res, e); }
});
router.get('/dbt/unclaimed', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await md.unclaimedEntitlements(req.query) }); } catch (e) { fail(res, e); }
});
router.post('/competitor/observe', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await md.recordCompetitorPrice(req.body) }); } catch (e) { fail(res, e); }
});
router.get('/competitor/position', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await md.competitivePosition(req.query) }); } catch (e) { fail(res, e); }
});

module.exports = router;
