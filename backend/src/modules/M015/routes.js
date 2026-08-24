const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware, requireRole } = require('../../middleware/auth');

// Public get/list endpoints, protected writes by default
router.get('/', controller.list);
router.get('/over-budget', authMiddleware, requireRole('admin'), controller.overBudget);
router.get('/features/:feature/summary', authMiddleware, requireRole('admin'), controller.featureSummary);
router.get('/:id', controller.get);
router.post('/', authMiddleware, requireRole('admin'), controller.create);
router.post('/usage', authMiddleware, controller.usage);
router.put('/:id', authMiddleware, requireRole('admin'), controller.update);
router.delete('/:id', authMiddleware, requireRole('admin'), controller.remove);

module.exports = router;
