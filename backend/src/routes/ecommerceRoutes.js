/**
 * ecommerceRoutes — the canonical implementation for this resource.
 *
 * Consolidated from ecommerceRoutes_merged.js on 2026-09-13, per
 * .ai/decisions/0001-module-lineage-consolidation.md and
 * .ai/consolidation/CONSOLIDATION_PLAN.md (Phase 3.1): the consolidated code
 * belongs in the canonical file; duplicates are retired once their unique
 * behaviour is preserved and verified.
 *
 * History (why this file looked empty before): dynamicRouteLoader.js derives a
 * mount path from the FILENAME, so this implementation was published at a
 * "...-merged" URL that nothing called, while this file — a generated stub whose
 * only endpoints were a POST / answering "Route operational" and a GET /health —
 * owned the path the frontend actually requests. The stub's blanket
 * router.use(authMiddleware) is deliberately NOT carried over: the code below
 * applies auth per route and several endpoints are intentionally public. Its
 * POST / reply is not carried over either — it answered { success: true }
 * without writing anything.
 */
/**
 * AFRERA E-Commerce Routes
 *
 * Comprehensive marketplace API routes with authentication and rate limiting.
 */

const express = require('express');
const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'ecommerceRoutes' });
});

const ecommerceController = require('../controllers/ecommerceController');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { adminMiddleware } = require('../middleware/admin');

// ============================================================================
// PRODUCT LISTING ROUTES
// ============================================================================

/**
 * @route   POST /api/ecommerce/listings
 * @desc    Create a new product listing with AI optimization
 * @access  Private (Seller)
 */
router.post('/listings', authLimiter, authMiddleware, ecommerceController.createListing);

/**
 * @route   GET /api/ecommerce/listings
 * @desc    Get marketplace listings with AI-powered ranking
 * @access  Public
 */
router.get('/listings', ecommerceController.getListings);

/**
 * @route   GET /api/ecommerce/listings/:id
 * @desc    Get single listing details
 * @access  Public
 */
router.get('/listings/:id', ecommerceController.getListing);

/**
 * @route   PUT /api/ecommerce/listings/:id
 * @desc    Update listing
 * @access  Private (Seller only)
 */
router.put('/listings/:id', authLimiter, authMiddleware, ecommerceController.updateListing);

/**
 * @route   DELETE /api/ecommerce/listings/:id
 * @desc    Delete listing
 * @access  Private (Seller only)
 */
router.delete('/listings/:id', authLimiter, authMiddleware, ecommerceController.deleteListing);

// ============================================================================
// SELLER ANALYTICS ROUTES
// ============================================================================

/**
 * @route   GET /api/ecommerce/seller/analytics
 * @desc    Get seller dashboard analytics
 * @access  Private (Seller)
 */
router.get('/seller/analytics', authMiddleware, ecommerceController.getSellerAnalytics);

/**
 * @route   GET /api/ecommerce/seller/listings
 * @desc    Get seller's own listings
 * @access  Private (Seller)
 */
router.get('/seller/listings', authMiddleware, ecommerceController.getSellerListings);

// ============================================================================
// GI MARKETPLACE ROUTES
// ============================================================================

/**
 * @route   GET /api/ecommerce/gi-listings
 * @desc    Get GI marketplace listings with premium pricing
 * @access  Public
 */
router.get('/gi-listings', ecommerceController.getGIListings);

// ============================================================================
// MARKET INTELLIGENCE ROUTES
// ============================================================================

/**
 * @route   GET /api/ecommerce/market/price-trends/:categoryId
 * @desc    Get market price trends for category
 * @access  Public
 */
router.get('/market/price-trends/:categoryId', ecommerceController.getPriceTrends);

/**
 * @route   GET /api/ecommerce/market/demand/:categoryId
 * @desc    Get market demand analysis
 * @access  Public
 */
router.get('/market/demand/:categoryId', ecommerceController.getDemandAnalysis);

/**
 * @route   POST /api/ecommerce/price-recommendation
 * @desc    Get AI price recommendation for a product
 * @access  Private (Seller)
 */
router.post('/price-recommendation', authLimiter, authMiddleware, ecommerceController.getPriceRecommendation);

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = router;

