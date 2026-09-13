/**
 * rfqRoutes — the canonical implementation for this resource.
 *
 * Consolidated from rfqRoutes_merged.js on 2026-09-13, per
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
 * RFQ, quote outcomes, QC holds and FPO cost centres.
 * All authenticated — bidding, releasing a QC hold and recording a loss reason
 * are each attributable acts.
 */
const express = require('express');
const logger = console; // TODO: use Winston/Pino logger

const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'rfqRoutes' });
});

const s = require('../services/legacy/rfqService');
const { authMiddleware } = require('../middleware/auth');
const { protectRouter } = require('./enterpriseRouteSupport');
const { authMiddleware: authenticate } = require('../middleware/auth');

const fail = (res, e) => res.status(/required|must|not found|not open|closed|requires/i.test(e.message) ? 400 : 500)
  .json({ success: false, error: e.message });

protectRouter(router, { signal: 'commerce.rfq.changed', params: { id: true } });

router.post('/rfq', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await s.createRfq(req.body) }); } catch (e) { fail(res, e); }
});
router.post('/rfq/:id/bid', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, data: await s.submitBid({
      ...req.body, rfqId: Number(req.params.id), bidderId: req.body.bidderId || req.user?.id }) });
  } catch (e) { fail(res, e); }
});
router.get('/rfq/:id/bids', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, data: await s.bidsFor(Number(req.params.id),
      { asBuyer: req.query.asBuyer === 'true' }) });
  } catch (e) { fail(res, e); }
});
router.post('/quotes/outcome', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await s.recordQuoteOutcome(req.body) }); } catch (e) { fail(res, e); }
});
router.get('/quotes/loss-analysis', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await s.lossAnalysis(req.query) }); } catch (e) { fail(res, e); }
});
router.post('/qc/hold', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await s.raiseQcHold(req.body) }); } catch (e) { fail(res, e); }
});
router.post('/qc/release', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, data: await s.releaseQcHold({ ...req.body, releasedBy: req.body.releasedBy || req.user?.id }) });
  } catch (e) { fail(res, e); }
});
router.get('/qc/holds', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await s.activeHolds() }); } catch (e) { fail(res, e); }
});
router.get('/fpo/centre-pnl', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await s.centrePnl(req.query.fpoId) }); } catch (e) { fail(res, e); }
});
module.exports = router;
