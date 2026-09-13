const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware } = require('../../middleware/authMiddleware');

/**
 * M241 Routes
 * Base path: /api/m241
 */

// Middleware
router.use(authMiddleware);

/**
 * @route   GET /api/m241
 * @desc    Get all m241 with pagination and filtering
 * @query   page, limit, status, user_id, search, sort, order
 * @access  Private
 */
router.get('/', controller.getAll.bind(controller));

/**
 * @route   POST /api/m241/bulk
 * @desc    Create multiple records in bulk
 * @body    { records: [...] }
 * @access  Private
 */
router.post('/bulk', controller.createBulk.bind(controller));

/**
 * @route   GET /api/m241/search
 * @desc    Search m241 records
 * @query   q (search query), fields (comma-separated field names)
 * @access  Private
 */
router.get('/search', controller.search.bind(controller));

/**
 * @route   POST /api/m241
 * @desc    Create new m241
 * @body    { user_id, ...data }
 * @access  Private
 */
router.post('/', controller.create.bind(controller));

/**
 * @route   GET /api/m241/:id
 * @desc    Get m241 by ID
 * @access  Private
 */
router.get('/:id', controller.getById.bind(controller));

/**
 * @route   PUT /api/m241/:id
 * @desc    Update m241
 * @access  Private
 */
router.put('/:id', controller.update.bind(controller));

/**
 * @route   DELETE /api/m241/:id
 * @desc    Delete (soft delete) m241
 * @access  Private
 */
router.delete('/:id', controller.delete.bind(controller));

module.exports = router;