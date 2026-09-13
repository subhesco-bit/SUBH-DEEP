/**
 * dprGenerationRoutes — the canonical implementation for this resource.
 *
 * Consolidated from dprGenerationRoutes_merged.js on 2026-09-13, per
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
 * DPR (Detailed Project Report) Generation Routes.
 *
 * dprGenerationService.js was found fully built but with zero HTTP exposure
 * — no routes file existed for it at all. Real methods: assemble() (data
 * only, no persistence), generate() (persist + return), getById(), list(),
 * streamPdf() (real PDF export via pdfkit).
 */

const express = require('express');
const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'dprGenerationRoutes' });
});

const dprGenerationService = require('../services/legacy/dprGenerationService');
const { authMiddleware } = require('../middleware/auth');

router.post('/preview', authMiddleware, async (req, res) => {
  try {
    const { farmerId, fpoId, cropPlanId, purpose, financingAskInr } = req.body || {};
    if (!purpose) return res.status(400).json({ success: false, error: 'purpose is required' });
    const document = await dprGenerationService.assemble({ farmerId, fpoId, cropPlanId, purpose, financingAskInr });
    res.json({ success: true, data: document });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { farmerId, fpoId, cropPlanId, purpose, financingAskInr } = req.body || {};
    if (!purpose) return res.status(400).json({ success: false, error: 'purpose is required' });
    const dpr = await dprGenerationService.generate({
      farmerId, fpoId, cropPlanId, purpose, financingAskInr, generatedBy: req.user?.id,
    });
    res.status(201).json({ success: true, data: dpr });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { farmerId, fpoId } = req.query;
    const list = await dprGenerationService.list({ farmerId, fpoId }, { userId: req.user.id, isAdmin: req.user.role === 'admin' });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const dpr = await dprGenerationService.getById(req.params.id, { userId: req.user.id, isAdmin: req.user.role === 'admin' });
    res.json({ success: true, data: dpr });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

router.get('/:id/pdf', authMiddleware, async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="DPR-${req.params.id}.pdf"`);
    await dprGenerationService.streamPdf(req.params.id, res, { userId: req.user.id, isAdmin: req.user.role === 'admin' });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

module.exports = router;
