const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware } = require('../../middleware/authMiddleware');

/**
 * M233 Routes
 * Base path: /api/m233
 */

// Middleware
router.use(authMiddleware);

/**
 * @route   GET /api/m233
 * @desc    Get all m233 with pagination and filtering
 * @query   page, limit, status, user_id, search, sort, order
 * @access  Private
 */
router.get('/', controller.getAll.bind(controller));

/**
 * @route   POST /api/m233/bulk
 * @desc    Create multiple records in bulk
 * @body    { records: [...] }
 * @access  Private
 */
router.post('/bulk', controller.createBulk.bind(controller));

/**
 * @route   GET /api/m233/search
 * @desc    Search m233 records
 * @query   q (search query), fields (comma-separated field names)
 * @access  Private
 */
router.get('/search', controller.search.bind(controller));

/**
 * @route   POST /api/m233
 * @desc    Create new m233
 * @body    { user_id, ...data }
 * @access  Private
 */
router.post('/', controller.create.bind(controller));

/**
 * @route   GET /api/m233/:id
 * @desc    Get m233 by ID
 * @access  Private
 */
router.get('/:id', controller.getById.bind(controller));

/**
 * @route   PUT /api/m233/:id
 * @desc    Update m233
 * @access  Private
 */
router.put('/:id', controller.update.bind(controller));

/**
 * @route   DELETE /api/m233/:id
 * @desc    Delete (soft delete) m233
 * @access  Private
 */
router.delete('/:id', controller.delete.bind(controller));

module.exports = router;