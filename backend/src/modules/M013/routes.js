const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware, requireRole } = require('../../middleware/auth');

// Public get/list endpoints, protected writes by default
router.get('/', controller.list);
router.get('/flagged', authMiddleware, requireRole('admin'), controller.flagged);
router.get('/:id', controller.get);
router.post('/', authMiddleware, requireRole('admin'), controller.create);
router.post('/log', authMiddleware, controller.log);
router.post('/:id/review', authMiddleware, requireRole('admin'), controller.review);
router.put('/:id', authMiddleware, requireRole('admin'), controller.update);
router.delete('/:id', authMiddleware, requireRole('admin'), controller.remove);

module.exports = router;
