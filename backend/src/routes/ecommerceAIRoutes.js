/**
 * ecommerceAIRoutes — the canonical implementation for this resource.
 *
 * Consolidated from ecommerceAIRoutes_merged.js on 2026-09-13, per
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
 * AFRERA E-Commerce AI Routes
 *
 * AI-powered marketplace endpoints:
 * - Customer Segmentation
 * - Demand Forecasting
 * - Inventory Optimization
 * - Product Recommendations
 * - Sales Prediction
 * - Customer Lifetime Value
 * - Market Basket Analysis
 */

const express = require('express');
const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'ecommerceAIRoutes' });
});

const ecommerceAIController = require('../controllers/ecommerceAIController');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// ============================================================================
// CUSTOMER SEGMENTATION ROUTES
// ============================================================================

/**
 * @route   POST /api/ecommerce-ai/segment-customers-rfm
 * @desc    Segment all customers using RFM analysis
 * @access  Private (Admin)
 */
router.post('/segment-customers-rfm', authLimiter, authMiddleware, ecommerceAIController.segmentCustomersRFM);

/**
 * @route   POST /api/ecommerce-ai/segment-customers-behavioral
 * @desc    Segment all customers using behavioral analysis
 * @access  Private (Admin)
 */
router.post('/segment-customers-behavioral', authLimiter, authMiddleware, ecommerceAIController.segmentCustomersBehavioral);

// ============================================================================
// DEMAND FORECASTING ROUTES
// ============================================================================

/**
 * @route   POST /api/ecommerce-ai/forecast-demand/:productId
 * @desc    Forecast demand for a specific product
 * @access  Private (Admin/Seller)
 */
router.post('/forecast-demand/:productId', authLimiter, authMiddleware, ecommerceAIController.forecastProductDemand);

// ============================================================================
// INVENTORY OPTIMIZATION ROUTES
// ============================================================================

/**
 * @route   POST /api/ecommerce-ai/optimize-inventory/:productId
 * @desc    Optimize inventory levels for a product
 * @access  Private (Admin/Seller)
 */
router.post('/optimize-inventory/:productId', authLimiter, authMiddleware, ecommerceAIController.optimizeInventory);

// ============================================================================
// PRODUCT RECOMMENDATIONS ROUTES
// ============================================================================

/**
 * @route   GET /api/ecommerce-ai/recommendations/:userId
 * @desc    Get personalized product recommendations for user
 * @access  Private
 */
router.get('/recommendations/:userId', authMiddleware, ecommerceAIController.getPersonalizedRecommendations);

// ============================================================================
// SALES PREDICTION ROUTES
// ============================================================================

/**
 * @route   POST /api/ecommerce-ai/predict-sales
 * @desc    Predict sales for category or overall
 * @access  Private (Admin)
 */
router.post('/predict-sales', authLimiter, authMiddleware, ecommerceAIController.predictSales);

// ============================================================================
// CUSTOMER LIFETIME VALUE ROUTES
// ============================================================================

/**
 * @route   GET /api/ecommerce-ai/clv/:userId
 * @desc    Calculate customer lifetime value
 * @access  Private (Admin)
 */
router.get('/clv/:userId', authMiddleware, ecommerceAIController.calculateCustomerLifetimeValue);

// ============================================================================
// MARKET BASKET ANALYSIS ROUTES
// ============================================================================

/**
 * @route   GET /api/ecommerce-ai/market-basket
 * @desc    Analyze market basket for cross-sell opportunities
 * @access  Private (Admin)
 */
router.get('/market-basket', authMiddleware, ecommerceAIController.analyzeMarketBasket);

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = router;

