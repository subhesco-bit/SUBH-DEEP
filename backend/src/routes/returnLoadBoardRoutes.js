/**
 * returnLoadBoardRoutes — the canonical implementation for this resource.
 *
 * Consolidated from returnLoadBoardRoutes_merged.js on 2026-09-13, per
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
 * Return-Load Board Routes. See services/returnLoadBoardService.js.
 */

const express = require('express');
const logger = console; // TODO: use Winston/Pino logger

const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'returnLoadBoardRoutes' });
});

const returnLoadBoardService = require('../services/legacy/returnLoadBoardService');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, async (req, res) => {
  try {
    const posting = await returnLoadBoardService.postCapacity(req.user.id, req.body);
    res.status(201).json({ success: true, data: posting });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { originAddress, destinationAddress, minCapacityKg } = req.query;
    const postings = await returnLoadBoardService.searchAvailable({ originAddress, destinationAddress, minCapacityKg });
    res.json({ success: true, count: postings.length, data: postings });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/:postingId/book', authMiddleware, async (req, res) => {
  try {
    const posting = await returnLoadBoardService.bookPosting(req.params.postingId, req.body.shipmentId);
    res.json({ success: true, data: posting });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/:postingId', authMiddleware, async (req, res) => {
  try {
    const posting = await returnLoadBoardService.cancelPosting(req.params.postingId, req.user.id);
    res.json({ success: true, data: posting });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
