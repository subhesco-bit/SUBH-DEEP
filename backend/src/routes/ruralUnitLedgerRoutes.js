'use strict';

const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const ledger = require('../services/ruralUnitLedgerService');

const router = express.Router();
const isPrivileged = (req) => ['admin', 'superadmin', 'finance_manager'].includes(req.user?.role);

function resolveUnit(req) {
  const { unitType, unitId } = req.body;
  if (isPrivileged(req)) return { unitType, unitId };
  return { unitType: unitType || 'farmer', unitId: unitId || req.user.id };
}

router.use(authMiddleware);

router.get('/balance', async (req, res, next) => {
  try {
    const { unitType, unitId } = resolveUnit(req);
    const result = await ledger.getBalance(unitType, unitId, req.query.currency || 'INR');
    res.json({ success: true, data: result, correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
});

router.post('/entries', async (req, res, next) => {
  try {
    const unit = resolveUnit(req);
    const result = await ledger.recordEntry({ ...req.body, ...unit, actorId: req.user.id });
    res.status(201).json({ success: true, data: result, correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
});

router.post('/settlements', async (req, res, next) => {
  try {
    const unit = resolveUnit(req);
    const result = await ledger.settle({ ...req.body, ...unit, actorId: req.user.id });
    res.status(201).json({ success: true, data: result, correlationId: req.correlationId });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
