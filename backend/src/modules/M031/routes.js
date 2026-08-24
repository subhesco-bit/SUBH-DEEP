const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware, requireRole } = require('../../middleware/auth');

// Static routes must precede '/:id' so they aren't swallowed by it.
router.post('/schedule', controller.schedule); // compute only, does not persist
router.post('/schedule/save', authMiddleware, requireRole('agronomist', 'admin'), controller.scheduleSave);

// Public get/list endpoints, protected writes by default
router.get('/', controller.list);
router.get('/:id', controller.get);
router.post('/', authMiddleware, requireRole('agronomist','admin'), controller.create);
router.put('/:id', authMiddleware, requireRole('agronomist','admin'), controller.update);
router.delete('/:id', authMiddleware, requireRole('agronomist','admin'), controller.remove);

module.exports = router;

