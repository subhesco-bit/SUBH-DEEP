const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware, requireRole } = require('../../middleware/auth');

// Static routes must precede '/:id' so they aren't swallowed by it.
router.get('/analytics/prediction', controller.prediction); // ?plot_id=&crop=

// Public get/list endpoints, protected writes by default
router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', authMiddleware, requireRole('farmer','admin'), controller.create);
router.put('/:id', authMiddleware, requireRole('farmer','admin'), controller.update);
router.delete('/:id', authMiddleware, requireRole('farmer','admin'), controller.remove);

module.exports = router;

