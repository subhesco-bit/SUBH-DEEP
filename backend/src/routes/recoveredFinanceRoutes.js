/**
 * recoveredFinanceRoutes — the canonical implementation for this resource.
 *
 * Consolidated from recoveredFinanceRoutes_merged.js on 2026-09-13, per
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
 * Routes for finance and compliance logic recovered from v42/v44.
 * Backed by services/recoveredFinanceService.js and migration 053.
 *
 * Writes are authenticated throughout. A ledger entry, a warehouse receipt and
 * a risk event are all attributions — an unattributed one cannot be questioned
 * later, which defeats the purpose of recording it.
 */

'use strict';

const express = require('express');

const logger = console; // TODO: use Winston/Pino logger

const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'recoveredFinanceRoutes' });
});

const fin = require('../services/legacy/recoveredFinanceService');
const { authMiddleware } = require('../middleware/auth');
const { resolveFarmerId } = require('../middleware/resolveFarmerId');
const { authMiddleware: authenticate } = require('../middleware/auth');


function fail(res, error) {
  const bad = /required|must|Unknown|No GST rule|differ/i.test(error.message);
  res.status(bad ? 400 : 500).json({ success: false, error: error.message });
}

// ---- GST -----------------------------------------------------------------
//
// gstFor()/buildInvoice()/classify/invoice routes were deleted here
// (2026-08-17), not just blocked: they were a second, independent GST-rate
// authority alongside the canonical, HSN-driven gstService.resolveGSTRate(),
// which also handles the branded/unbranded staple-tax split these did not.
// No frontend caller ever called them (api.js defined classifyGst/buildInvoice
// wrappers but no page invoked them). Use /api/v1/gst instead.

// ---- Ledger ----------------------------------------------------------------
//
// POST /ledger/entry (appendLedgerEntry()) was deleted here (2026-08-17): it
// wrote into a second, fully disconnected hash-chained ledger
// (gl_ledger_chain) alongside the canonical journal_entries/journal_lines
// ledger that GST, AF-AA, AF-CO and AF-PS all actually post to - a real
// double-booking risk, and it had no live caller.
//
// trialBalance() and verifyLedger() below are different and were kept: they
// are read-only, they compute directly off gl_ledger_chain (view
// v_ledger_trial_balance / a dedicated integrity check over the hash chain),
// and - critically - verifyLedger()'s tamper-evidence check has NO
// equivalent anywhere else in the codebase (neither journal_entries/
// journal_lines nor the separate unified_ledger table have a hash-chain
// integrity concept at all). LedgerPage.jsx calls both
// (financeAPI.trialBalance()/verifyLedger()) - deleting the dangerous write
// path does not affect them, since gl_ledger_chain's existing rows stay
// queryable without new appends.
router.get('/ledger/trial-balance', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, data: await fin.trialBalance() });
  } catch (e) { fail(res, e); }
});
router.get('/ledger/verify', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, data: await fin.verifyLedger() });
  } catch (e) { fail(res, e); }
});

// ---- Schemes ---------------------------------------------------------------

router.get('/schemes/match', async (req, res) => {
  try {
    const { projectType, state } = req.query;
    if (!projectType) throw new Error('projectType is required');
    res.json({ success: true, data: await fin.matchSchemes(projectType, state) });
  } catch (e) { fail(res, e); }
});

// ---- eNWR ------------------------------------------------------------------

router.post('/enwr/issue', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, data: await fin.issueEnwr({ ...req.body, issuedBy: req.user?.id }) });
  } catch (e) { fail(res, e); }
});

// "Bank Passport" — added 2026-08-15. issueEnwr() had no way to list what
// had been issued; a lender-facing evidence view needs this to exist at all.
router.get('/enwr/my-receipts', authMiddleware, resolveFarmerId, async (req, res) => {
  try {
    res.json({ success: true, data: await fin.listMyEnwrReceipts(req.farmerId) });
  } catch (e) { fail(res, e); }
});

// ---- Freight ---------------------------------------------------------------

router.get('/freight/rate', async (req, res) => {
  try {
    const { km, class: cls, utilisation } = req.query;
    if (!km || !cls) throw new Error('km and class are required');
    res.json({
      success: true,
      data: await fin.freightRate({
        laneKm: Number(km),
        classKey: cls,
        utilisationPct: utilisation === undefined ? null : Number(utilisation),
      }),
    });
  } catch (e) { fail(res, e); }
});

// ---- Subsidy + risk --------------------------------------------------------

router.get('/subsidy/equipment', async (req, res) => {
  try {
    const { price, tier } = req.query;
    if (!price) throw new Error('price is required');
    res.json({ success: true, data: await fin.equipmentSubsidy(Number(price), tier || 'general') });
  } catch (e) { fail(res, e); }
});

router.post('/risk/event', authMiddleware, async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.partyId || !b.eventType) throw new Error('partyId and eventType are required');
    res.json({ success: true, data: await fin.recordRiskEvent(b) });
  } catch (e) { fail(res, e); }
});

router.get('/risk/:partyId', authMiddleware, async (req, res) => {
  try { res.json({ success: true, data: await fin.partyRisk(req.params.partyId) }); } catch (e) { fail(res, e); }
});

router.get('/certificates/expiring', authMiddleware, async (req, res) => {
  try {
    res.json({ success: true, data: await fin.certExpiryAlerts(Number(req.query.days) || 120) });
  } catch (e) { fail(res, e); }
});

module.exports = router;
