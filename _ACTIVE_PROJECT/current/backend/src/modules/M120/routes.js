const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware } = require('../../middleware/authMiddleware');

/**
 * M120 Routes
 * Base path: /api/m120
 */

// Middleware
router.use(authMiddleware);

/**
 * @route   GET /api/m120
 * @desc    Get all m120 with pagination and filtering
 * @query   page, limit, status, user_id, search, sort, order
 * @access  Private
 */
router.get('/', controller.getAll.bind(controller));

/**
 * @route   POST /api/m120/bulk
 * @desc    Create multiple records in bulk
 * @body    { records: [...] }
 * @access  Private
 */
router.post('/bulk', controller.createBulk.bind(controller));

/**
 * @route   GET /api/m120/search
 * @desc    Search m120 records
 * @query   q (search query), fields (comma-separated field names)
 * @access  Private
 */
router.get('/search', controller.search.bind(controller));

/**
 * @route   POST /api/m120
 * @desc    Create new m120
 * @body    { user_id, ...data }
 * @access  Private
 */
router.post('/', controller.create.bind(controller));

/**
 * @route   GET /api/m120/:id
 * @desc    Get m120 by ID
 * @access  Private
 */
router.get('/:id', controller.getById.bind(controller));

/**
 * @route   PUT /api/m120/:id
 * @desc    Update m120
 * @access  Private
 */
router.put('/:id', controller.update.bind(controller));

/**
 * @route   DELETE /api/m120/:id
 * @desc    Delete (soft delete) m120
 * @access  Private
 */
router.delete('/:id', controller.delete.bind(controller));

module.exports = router;