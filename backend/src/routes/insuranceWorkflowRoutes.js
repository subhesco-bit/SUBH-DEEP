'use strict';

const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { service } = require('../services/insuranceWorkflowService');

const router = express.Router();
router.use(authMiddleware);

const handle = (fn) => async (req, res) => {
  try {
    const data = await fn(req);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      success: false, code: error.code || 'INSURANCE_WORKFLOW_ERROR', error: error.message,
    });
  }
};

router.get('/policy-classes', handle(() => service.listPolicyClasses()));
router.post('/policies', handle((req) => service.registerPolicy(req.body, {
  actorId: req.user.id, role: req.user.role,
})));
router.post('/claims', handle((req) => service.submitClaim(req.body, {
  actorId: req.user.id, role: req.user.role,
})));
router.post('/claims/:claimId/recommendation', handle((req) => service.recommend(req.params.claimId, req.body, {
  actorId: req.user.id, role: req.user.role,
})));
router.post('/claims/:claimId/adjudicate', handle((req) => service.adjudicate(req.params.claimId, req.body, {
  actorId: req.user.id, role: req.user.role,
})));
router.post('/claims/:claimId/payout', handle((req) => service.releasePayout(req.params.claimId, {
  actorId: req.user.id, role: req.user.role,
})));
router.post('/claims/:claimId/disputes', handle((req) => service.openDispute(req.params.claimId, req.body, {
  actorId: req.user.id, role: req.user.role,
})));

module.exports = router;
