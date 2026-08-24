const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware, requireRole } = require('../../middleware/auth');

// Sowing / Planting Schedule Planner
// Static routes must precede '/:id' so they aren't swallowed by it.
router.get('/reference/calendar', controller.calendar);
router.post('/plan', controller.plan); // compute only, does not persist
router.post('/plan/save', authMiddleware, requireRole('farmer', 'admin'), controller.createPlan);

router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', authMiddleware, requireRole('farmer', 'admin'), controller.create);
router.put('/:id', authMiddleware, requireRole('farmer', 'admin'), controller.update);
router.delete('/:id', authMiddleware, requireRole('farmer', 'admin'), controller.remove);

module.exports = router;
