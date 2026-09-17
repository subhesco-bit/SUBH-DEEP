const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { authMiddleware } = require('../../middleware/authMiddleware');

/**
 * M084 Routes
 * Base path: /api/m084
 */

// Middleware
router.use(authMiddleware);

/**
 * @route   GET /api/m084
 * @desc    Get all m084 with pagination and filtering
 * @query   page, limit, status, user_id, search, sort, order
 * @access  Private
 */
router.get('/', controller.getAll.bind(controller));

/**
 * @route   POST /api/m084/bulk
 * @desc    Create multiple records in bulk
 * @body    { records: [...] }
 * @access  Private
 */
router.post('/bulk', controller.createBulk.bind(controller));

/**
 * @route   GET /api/m084/search
 * @desc    Search m084 records
 * @query   q (search query), fields (comma-separated field names)
 * @access  Private
 */
router.get('/search', controller.search.bind(controller));

/**
 * @route   POST /api/m084
 * @desc    Create new m084
 * @body    { user_id, ...data }
 * @access  Private
 */
router.post('/', controller.create.bind(controller));

/**
 * @route   GET /api/m084/:id
 * @desc    Get m084 by ID
 * @access  Private
 */
router.get('/:id', controller.getById.bind(controller));

/**
 * @route   PUT /api/m084/:id
 * @desc    Update m084
 * @access  Private
 */
router.put('/:id', controller.update.bind(controller));

/**
 * @route   DELETE /api/m084/:id
 * @desc    Delete (soft delete) m084
 * @access  Private
 */
router.delete('/:id', controller.delete.bind(controller));

module.exports = router;