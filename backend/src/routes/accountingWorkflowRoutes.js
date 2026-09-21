'use strict';

const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const accounting = require('../services/accountingWorkflowService');

const router = express.Router();
router.use(authMiddleware);
const context = (req) => ({ actorId: req.user?.id, correlationId: req.correlationId || req.headers['x-correlation-id'] });
const requireChecker = (req, res, next) => {
  if (['admin', 'superadmin', 'finance_manager', 'finance_checker', 'checker'].includes(req.user?.role)) return next();
  return res.status(403).json({ success: false, error: 'Checker role required', code: 'ACCOUNTING_CHECKER_REQUIRED' });
};

router.post('/entries', async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await accounting.createDraft(req.body, context(req)), correlationId: req.correlationId }); } catch (e) { next(e); }
});
router.post('/entries/:id/submit', async (req, res, next) => {
  try { res.json({ success: true, data: await accounting.submitForApproval(req.params.id, context(req)) }); } catch (e) { next(e); }
});
router.post('/entries/:id/maker-approve', async (req, res, next) => {
  try { res.json({ success: true, data: await accounting.approveMaker(req.params.id, context(req)) }); } catch (e) { next(e); }
});
router.post('/entries/:id/checker-approve', requireChecker, async (req, res, next) => {
  try { res.json({ success: true, data: await accounting.approveChecker(req.params.id, context(req)) }); } catch (e) { next(e); }
});
router.post('/entries/:id/post', requireChecker, async (req, res, next) => {
  try { res.json({ success: true, data: await accounting.post(req.params.id, context(req)) }); } catch (e) { next(e); }
});
router.post('/entries/:id/reverse', requireChecker, async (req, res, next) => {
  try { res.json({ success: true, data: await accounting.reverse(req.params.id, req.body, context(req)) }); } catch (e) { next(e); }
});
router.get('/trial-balance', async (req, res, next) => {
  try { res.json({ success: true, data: await accounting.trialBalance(req.query), correlationId: req.correlationId }); } catch (e) { next(e); }
});
router.post('/ai/classification-suggestions', async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await accounting.suggestClassification(req.body, context(req)) }); } catch (e) { next(e); }
});
router.post('/ai/reconciliation-suggestions', async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await accounting.suggestReconciliation(req.body) }); } catch (e) { next(e); }
});
router.post('/ai/suggestions/:id/approve', async (req, res, next) => {
  try { res.json({ success: true, data: await accounting.approveSuggestion(req.params.id, context(req)) }); } catch (e) { next(e); }
});

module.exports = router;
