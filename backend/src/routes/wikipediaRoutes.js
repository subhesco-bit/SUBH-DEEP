/**
 * wikipediaRoutes — the canonical implementation for this resource.
 *
 * Consolidated from wikipediaRoutes_merged.js on 2026-09-13, per
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
 * Wikipedia Knowledge Reference Routes.
 * See services/wikipediaService.js — real Wikimedia REST API integration,
 * 24h in-memory cache, honest null (not fabricated) when no match is found.
 */

const express = require('express');
const logger = console; // TODO: use Winston/Pino logger

const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'wikipediaRoutes' });
});

const wikipediaService = require('../services/legacy/wikipediaService');
const { authMiddleware } = require('../middleware/auth');

router.get('/lookup', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, error: 'q query parameter is required' });
    const result = await wikipediaService.lookup(q);
    if (!result) {
      return res.json({ success: true, data: null, message: `No Wikipedia reference found for "${q}"` });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/summary/:title', authMiddleware, async (req, res) => {
  try {
    const result = await wikipediaService.getSummaryByTitle(req.params.title);
    if (!result) {
      return res.status(404).json({ success: false, error: `No Wikipedia page found for "${req.params.title}"` });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
