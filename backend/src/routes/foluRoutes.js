/**
 * foluRoutes — the canonical implementation for this resource.
 *
 * Consolidated from foluRoutes_merged.js on 2026-09-13, per
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
 * FOLU land use, carbon and NE organic scheme status.
 *
 * Routes only — the logic lives in services/organicTraceabilityService.js,
 * extended rather than duplicated into a parallel FOLU service. Same parcels,
 * same certification state, one owner.
 */
const express = require('express');
const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'foluRoutes' });
});

const organic = require('../services/legacy/organicTraceabilityService');
const { authMiddleware } = require('../middleware/auth');
const fail = (res, e) => res.status(/required|must|Refusing/i.test(e.message) ? 400 : 500)
  .json({ success: false, error: e.message });

router.get('/land-use/summary', async (req, res) => {
  try { res.json({ success: true, data: await organic.landUseSummary(req.query) }); } catch (e) { fail(res, e); }
});
router.post('/parcels', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await organic.registerLandParcel(req.body) }); } catch (e) { fail(res, e); }
});
router.post('/land-use/change', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await organic.recordLandUseChange(req.body) }); } catch (e) { fail(res, e); }
});
router.post('/carbon/estimate', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await organic.estimateCarbon(req.body) }); } catch (e) { fail(res, e); }
});
router.get('/schemes/:farmerId', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await organic.organicSchemeStatus(req.params.farmerId) }); } catch (e) { fail(res, e); }
});
module.exports = router;
