'use strict';

const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { FinancialDisputeService } = require('../services/financialDisputeService');

const router = express.Router();
const service = new FinancialDisputeService();
router.use(authMiddleware);
const context = (req) => ({ actorId: req.user?.id, correlationId: req.correlationId || req.headers['x-correlation-id'] });
const run = (fn) => async (req, res, next) => {
  try { res.json({ success: true, data: await fn(req, context(req)) }); } catch (error) { next(error); }
};

router.post('/', run((req, ctx) => service.createDispute(req.body, ctx)));
router.get('/:id', run((req) => service.getDispute(req.params.id)));
router.post('/:id/evidence', run((req, ctx) => service.addEvidence(req.params.id, req.body, ctx)));
router.post('/:id/hold', run((req, ctx) => service.transition(req.params.id, 'on_hold', 'hold', ctx)));
router.post('/:id/review', run((req, ctx) => service.assignReviewer(req.params.id, req.body.reviewerId, ctx)));
router.post('/:id/mediation', run((req, ctx) => service.transition(req.params.id, 'mediation', 'mediation_started', ctx)));
router.post('/:id/request-resolution', run((req, ctx) => service.transition(req.params.id, 'resolution_pending', 'resolution_requested', ctx)));
router.post('/:id/approve-resolution', run((req, ctx) => service.approveResolution(req.params.id, req.body, ctx)));
router.post('/:id/appeal', run((req, ctx) => service.appeal(req.params.id, req.body, ctx)));
router.post('/:id/settle', run((req, ctx) => service.settle(req.params.id, ctx)));
router.post('/:id/close', run((req, ctx) => service.close(req.params.id, ctx)));
router.post('/:id/notify', run((req, ctx) => service.notify(req.params.id, req.body.event || 'status_changed', ctx)));
router.post('/sla/escalate', run((req, ctx) => service.escalateDue(ctx)));

module.exports = router;
