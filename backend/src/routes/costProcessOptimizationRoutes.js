'use strict';

const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { CostProcessOptimizationService } = require('../services/costProcessOptimizationService');

const router = express.Router();
const service = new CostProcessOptimizationService();

router.post('/assessments', authMiddleware, async (req, res, next) => {
  try {
    const data = await service.createAssessment({
      ...req.body,
      actorId: req.user.id,
      organizationId: req.user.organization_id || req.body.organizationId,
    });
    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.get('/assessments', authMiddleware, async (req, res, next) => {
  try {
    const data = await service.listAssessments({
      organizationId: req.user.organization_id || req.query.organizationId,
      status: req.query.status,
      limit: req.query.limit,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

router.post('/assessments/:assessmentId/review', authMiddleware, async (req, res, next) => {
  try {
    const data = await service.reviewAssessment({
      assessmentId: req.params.assessmentId,
      reviewerId: req.user.id,
      approved: req.body.approved === true,
      reason: req.body.reason,
    });
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
