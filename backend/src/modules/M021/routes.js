const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware, requireRole } = require('../../middleware/auth');

// Public get/list endpoints, protected writes by default
router.get('/', controller.list);
router.get('/stats', controller.stats);
router.get('/:id', controller.get);
router.post('/', authMiddleware, requireRole('admin'), controller.create);
router.post('/enqueue', authMiddleware, controller.enqueue);
router.post('/dequeue', authMiddleware, controller.dequeue);
router.post('/:id/complete', authMiddleware, controller.complete);
router.post('/:id/fail', authMiddleware, controller.fail);
router.put('/:id', authMiddleware, requireRole('admin'), controller.update);
router.delete('/:id', authMiddleware, requireRole('admin'), controller.remove);

module.exports = router;
