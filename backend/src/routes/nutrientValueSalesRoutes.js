/**
 * nutrientValueSalesRoutes — the canonical implementation for this resource.
 *
 * Consolidated from nutrientValueSalesRoutes_merged.js on 2026-09-13, per
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
 * AFRERA Nutrient Value Sales Routes
 *
 * Nutrient-value-based sales endpoints:
 * - Nutrient-Value Pricing
 * - Nutrient Content Verification
 * - Nutrient-Value Listings
 * - Nutrient Quality Tiers
 * - Nutrient-Based Comparison
 * - Nutrient Certification
 * - Nutrient-Based Commission
 * - Nutrient-Value Search
 */

const express = require('express');
const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'nutrientValueSalesRoutes' });
});

const nutrientValueSalesController = require('../controllers/nutrientValueSalesController');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// ============================================================================
// NUTRIENT-VALUE PRICING ROUTES
// ============================================================================

/**
 * @route   POST /api/nutrient-value/calculate-price/:productId
 * @desc    Calculate nutrient-value-based price for product
 * @access  Private (Admin/Seller)
 */
router.post('/calculate-price/:productId', authLimiter, authMiddleware, nutrientValueSalesController.calculateNutrientValuePrice);

// ============================================================================
// NUTRIENT CONTENT VERIFICATION ROUTES
// ============================================================================

/**
 * @route   POST /api/nutrient-value/submit-verification
 * @desc    Submit nutrient content for lab verification
 * @access  Private (Seller)
 */
router.post('/submit-verification', authLimiter, authMiddleware, nutrientValueSalesController.submitNutrientContent);

/**
 * @route   POST /api/nutrient-value/approve-verification/:verificationId
 * @desc    Approve nutrient content verification
 * @access  Private (Admin/Lab)
 */
router.post('/approve-verification/:verificationId', authLimiter, authMiddleware, nutrientValueSalesController.approveNutrientVerification);

// ============================================================================
// NUTRIENT-VALUE LISTINGS ROUTES
// ============================================================================

/**
 * @route   POST /api/nutrient-value/create-listing
 * @desc    Create nutrient-value-based product listing
 * @access  Private (Seller)
 */
router.post('/create-listing', authLimiter, authMiddleware, nutrientValueSalesController.createNutrientValueListing);

// ============================================================================
// NUTRIENT QUALITY TIERS ROUTES
// ============================================================================

/**
 * @route   POST /api/nutrient-value/assign-tier/:productId
 * @desc    Assign nutrient quality tier to product
 * @access  Private (Admin)
 */
router.post('/assign-tier/:productId', authLimiter, authMiddleware, nutrientValueSalesController.assignNutrientTier);

// ============================================================================
// NUTRIENT-BASED COMPARISON ROUTES
// ============================================================================

/**
 * @route   POST /api/nutrient-value/compare-products
 * @desc    Compare products by nutrient value
 * @access  Public
 */
router.post('/compare-products', nutrientValueSalesController.compareProductsByNutrient);

// ============================================================================
// NUTRIENT CERTIFICATION ROUTES
// ============================================================================

/**
 * @route   POST /api/nutrient-value/issue-certificate
 * @desc    Issue nutrient quality certificate
 * @access  Private (Admin/Certifying Body)
 */
router.post('/issue-certificate', authLimiter, authMiddleware, nutrientValueSalesController.issueNutrientCertificate);

// ============================================================================
// NUTRIENT-BASED COMMISSION ROUTES
// ============================================================================

/**
 * @route   POST /api/nutrient-value/calculate-commission/:orderId
 * @desc    Calculate commission based on nutrient quality
 * @access  Private (Admin)
 */
router.post('/calculate-commission/:orderId', authLimiter, authMiddleware, nutrientValueSalesController.calculateNutrientBasedCommission);

// ============================================================================
// NUTRIENT-VALUE SEARCH ROUTES
// ============================================================================

/**
 * @route   GET /api/nutrient-value/search
 * @desc    Search products by nutrient criteria
 * @access  Public
 */
router.get('/search', nutrientValueSalesController.searchByNutrientCriteria);

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = router;

