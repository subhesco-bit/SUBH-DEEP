/**
 * Real backend routes for EcommerceMarketplacePage.jsx, backed by
 * services/legacy/ecommerceService.js.
 *
 * getListings -> getMarketplaceListings, getPriceTrends -> getMarketPriceTrends,
 * createListing -> createProductListing (takes sellerId + data; sellerId
 * filled from the authenticated user). updateListing, deleteListing, and
 * getSellerListings have no matching implementation - not wired, flagged
 * instead of faked.
 */
'use strict';

const express = require('express');
const router = express.Router();
const svc = require('../services/legacy/ecommerceService');

try {
  const { authMiddleware } = require('../middleware/auth');
  router.use(authMiddleware);
} catch (e) {
  // Auth optional
}

const wrap = (fn) => async (req, res) => {
  try {
    res.json({ success: true, data: await fn(req) });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

router.get('/ecommerce-marketplace/gi-listings', wrap((req) => svc.getGIListings(req.query)));
router.get('/ecommerce-marketplace/listings', wrap((req) => svc.getMarketplaceListings(req.query, req.query)));
router.get('/ecommerce-marketplace/price-trends/:categoryId', wrap((req) => svc.getMarketPriceTrends(req.params.categoryId, req.query.period)));
router.get('/ecommerce-marketplace/seller-analytics', wrap((req) => svc.getSellerAnalytics(req.user?.id, req.query.period)));
router.post('/ecommerce-marketplace/listing', wrap((req) => svc.createProductListing(req.user?.id, req.body)));

module.exports = router;
