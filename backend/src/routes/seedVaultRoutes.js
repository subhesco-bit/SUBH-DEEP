/**
 * seedVaultRoutes — the canonical implementation for this resource.
 *
 * Consolidated from seedVaultRoutes_merged.js on 2026-09-13, per
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
 * Seed Vault Routes. See services/seedVaultService.js.
 * Uses the same req.user.id -> farmers.id resolution fix as
 * farmerPortalEnhancements.js (that file's header explains the underlying
 * bug this pattern avoids: authMiddleware only ever sets req.user.id to a
 * users.id, never a farmers.id, and seed_vault_items.farmer_id references
 * farmers(id)).
 */

const express = require('express');
const logger = console; // TODO: use Winston/Pino logger

const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'seedVaultRoutes' });
});

const pool = require('../database/pool');
const seedVaultService = require('../services/legacy/seedVaultService');
const { authMiddleware } = require('../middleware/auth');

async function resolveFarmerId(req, res, next) {
  try {
    const result = await pool.query('SELECT id FROM farmers WHERE user_id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No farmer profile is associated with this account' });
    }
    req.farmerId = result.rows[0].id;
    next();
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

router.get('/', authMiddleware, resolveFarmerId, async (req, res) => {
  try {
    const seeds = await seedVaultService.listSeeds(req.farmerId);
    res.json({ success: true, data: seeds });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/categories', authMiddleware, resolveFarmerId, async (req, res) => {
  try {
    const categories = await seedVaultService.listCategories(req.farmerId);
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/', authMiddleware, resolveFarmerId, async (req, res) => {
  try {
    const seed = await seedVaultService.addSeed(req.farmerId, req.body);
    res.status(201).json({ success: true, data: seed });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.put('/:seedId', authMiddleware, resolveFarmerId, async (req, res) => {
  try {
    const seed = await seedVaultService.updateSeed(req.params.seedId, req.farmerId, req.body);
    res.json({ success: true, data: seed });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/:seedId/record-usage', authMiddleware, resolveFarmerId, async (req, res) => {
  try {
    const seed = await seedVaultService.recordUsage(req.params.seedId, req.farmerId, req.body?.amountUsed);
    res.json({ success: true, data: seed });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.delete('/:seedId', authMiddleware, resolveFarmerId, async (req, res) => {
  try {
    const result = await seedVaultService.deleteSeed(req.params.seedId, req.farmerId);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

module.exports = router;
