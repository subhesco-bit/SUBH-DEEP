'use strict';

const express = require('express');
const { authMiddleware, requireRole } = require('../middleware/auth');
const service = require('../services/farmerProductLifecycleService');

const router = express.Router();
router.use(authMiddleware);

router.post('/', async (req, res, next) => {
  try { res.status(201).json({ success: true, data: await service.createDraft(req.user.id, req.body) }); } catch (error) { next(error); }
});

router.post('/:id/nutrition', async (req, res, next) => {
  try { res.json({ success: true, data: await service.calculateNutrition(req.params.id, req.user.id, req.body) }); } catch (error) { next(error); }
});

router.post('/:id/image', async (req, res, next) => {
  try { res.json({ success: true, data: await service.requestImage(req.params.id, req.user.id, req.body) }); } catch (error) { next(error); }
});

router.post('/:id/review', requireRole('dietitian', 'nutritionist', 'admin', 'superadmin'), async (req, res, next) => {
  try { res.json({ success: true, data: await service.review(req.params.id, req.user.id, req.body.decision, req.body.notes) }); } catch (error) { next(error); }
});

router.post('/:id/health-plan', requireRole('dietitian', 'nutritionist', 'doctor', 'admin', 'superadmin'), async (req, res, next) => {
  try { res.json({ success: true, data: await service.createHealthPlan(req.params.id, req.user.id, req.body.profile, req.body.options) }); } catch (error) { next(error); }
});

module.exports = router;
