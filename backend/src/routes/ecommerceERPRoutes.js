/**
 * ecommerceERPRoutes — the canonical implementation for this resource.
 *
 * Consolidated from ecommerceERPRoutes_merged.js on 2026-09-13, per
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
 * AFRERA E-Commerce ERP Routes
 *
 * ERP integration endpoints:
 * - Financial ERP (GL posting, GST invoicing)
 * - Supply Chain ERP (inventory sync, purchase orders)
 * - Production ERP (production orders)
 * - Customer ERP (CRM synchronization)
 */

const express = require('express');
const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'ecommerceERPRoutes' });
});

const ecommerceERPController = require('../controllers/ecommerceERPController');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

// ============================================================================
// FINANCIAL ERP ROUTES
// ============================================================================

/**
 * @route   POST /api/ecommerce-erp/post-gl
 * @desc    Post transaction to general ledger
 * @access  Private (Admin/Finance)
 */
router.post('/post-gl', authLimiter, authMiddleware, ecommerceERPController.postToGeneralLedger);

/**
 * @route   POST /api/ecommerce-erp/generate-gst-invoice/:orderId
 * @desc    Generate GST invoice for order
 * @access  Private (Admin/Finance)
 */
router.post('/generate-gst-invoice/:orderId', authLimiter, authMiddleware, ecommerceERPController.generateGSTInvoice);

// ============================================================================
// SUPPLY CHAIN ERP ROUTES
// ============================================================================

/**
 * @route   POST /api/ecommerce-erp/sync-inventory/:productId
 * @desc    Sync marketplace inventory with ERP warehouse
 * @access  Private (Admin/Supply Chain)
 */
router.post('/sync-inventory/:productId', authLimiter, authMiddleware, ecommerceERPController.syncInventoryWithERP);

/**
 * @route   POST /api/ecommerce-erp/create-purchase-order
 * @desc    Create purchase order for marketplace listing
 * @access  Private (Admin/Supply Chain)
 */
router.post('/create-purchase-order', authLimiter, authMiddleware, ecommerceERPController.createPurchaseOrder);

// ============================================================================
// CUSTOMER ERP (CRM) ROUTES
// ============================================================================

/**
 * @route   POST /api/ecommerce-erp/sync-customer/:userId
 * @desc    Sync marketplace customer with CRM
 * @access  Private (Admin/CRM)
 */
router.post('/sync-customer/:userId', authLimiter, authMiddleware, ecommerceERPController.syncCustomerWithCRM);

// ============================================================================
// PRODUCTION ERP ROUTES
// ============================================================================

/**
 * @route   POST /api/ecommerce-erp/create-production-order
 * @desc    Create production order based on marketplace demand
 * @access  Private (Admin/Production)
 */
router.post('/create-production-order', authLimiter, authMiddleware, ecommerceERPController.createProductionOrder);

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = router;

