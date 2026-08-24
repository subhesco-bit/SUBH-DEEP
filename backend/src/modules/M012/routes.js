const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware, requireRole } = require('../../middleware/auth');

// Public get/list endpoints, protected writes by default
router.get('/', controller.list);
router.get('/leaderboard', controller.leaderboard);
router.get('/models/:model_id/stats', controller.modelStats);
router.get('/:id', controller.get);
router.post('/', authMiddleware, requireRole('admin'), controller.create);
router.post('/record', authMiddleware, controller.recordCall);
router.put('/:id', authMiddleware, requireRole('admin'), controller.update);
router.delete('/:id', authMiddleware, requireRole('admin'), controller.remove);

module.exports = router;
