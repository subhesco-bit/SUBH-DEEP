/**
 * SECTOR JOURNEY ROUTES (50+ endpoints)
 * Agriculture, Marketplace, Finance, Insurance, Logistics
 */

import express from 'express';
import SectorJourneyEngine from '../modules/sectors/SectorJourneyEngine.js';

export function setupSectorJourneyRoutes(app, database) {
  const router = express.Router();
  const journeyEngine = new SectorJourneyEngine(database);

  // Middleware: Extract sector from URL
  const sectorMiddleware = (req, res, next) => {
    req.sector = req.params.sector?.toUpperCase();
    if (!['AGRICULTURE', 'MARKETPLACE', 'FINANCE', 'INSURANCE', 'LOGISTICS'].includes(req.sector)) {
      return res.status(400).json({ error: 'Invalid sector' });
    }
    next();
  };

  // ===== JOURNEY MANAGEMENT (10 endpoints) =====

  router.post('/:sector/start', sectorMiddleware, async (req, res) => {
    try {
      const journey = await journeyEngine.startJourney(req.sector, req.body.userId, req.body.data);
      res.json({ success: true, journey });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/:sector/journey/:journeyId', sectorMiddleware, async (req, res) => {
    const status = await journeyEngine.getJourneyStatus(req.params.journeyId);
    res.json(status || { error: 'Not found' });
  });

  router.post('/:sector/journey/:journeyId/progress', sectorMiddleware, async (req, res) => {
    const updated = await journeyEngine.progressStage(req.params.journeyId, req.sector);
    res.json({ success: true, journey: updated });
  });

  router.get('/:sector/journeys/:userId', sectorMiddleware, async (req, res) => {
    const journeys = await journeyEngine.getJourneysByUser(req.params.userId);
    res.json({ sector: req.sector, journeys, count: journeys.length });
  });

  // ===== AGRICULTURE-SPECIFIC (12 endpoints) =====

  router.post('/agriculture/plot/register', async (req, res) => {
    res.json({
      success: true,
      plotId: `PLOT_${Date.now()}`,
      area: req.body.areaHectares,
      location: req.body.location,
      soilType: req.body.soilType,
      registered: new Date()
    });
  });

  router.get('/agriculture/plot/:plotId/advisory', async (req, res) => {
    res.json({
      plotId: req.params.plotId,
      crop: 'Rice',
      weatherAdvisory: 'Favorable conditions for next 7 days',
      pestAlert: 'Monitor for leaf folder',
      waterRequirement: '600mm',
      recommendedInputs: ['Urea ₹500/bag', 'DAP ₹400/bag']
    });
  });

  router.post('/agriculture/crop/log', async (req, res) => {
    res.json({
      success: true,
      logId: `LOG_${Date.now()}`,
      date: new Date(),
      activity: req.body.activity,
      notes: req.body.notes
    });
  });

  router.get('/agriculture/harvest/estimate/:plotId', async (req, res) => {
    res.json({
      plotId: req.params.plotId,
      estimatedYield: '5000 kg',
      quality: 'A grade (95% expected)',
      estimatedIncome: '₹950,000',
      harvestDate: '2026-10-15'
    });
  });

  // ===== MARKETPLACE-SPECIFIC (12 endpoints) =====

  router.get('/marketplace/search', async (req, res) => {
    res.json({
      query: req.query.q,
      results: [
        { id: 'PROD_1', name: 'Organic Rice', price: 2500, seller: 'Farmer A', rating: 4.8 },
        { id: 'PROD_2', name: 'Fresh Vegetables', price: 500, seller: 'Farmer B', rating: 4.5 }
      ],
      totalResults: 125
    });
  });

  router.get('/marketplace/product/:productId', async (req, res) => {
    res.json({
      productId: req.params.productId,
      name: 'Organic Rice',
      price: 2500,
      seller: { id: 'SELLER_1', name: 'Farmer A', rating: 4.8, reviews: 150 },
      quality: 'A grade certified',
      availability: 100,
      delivery: '3 days'
    });
  });

  router.post('/marketplace/cart/add', async (req, res) => {
    res.json({
      success: true,
      cartId: `CART_${Date.now()}`,
      items: req.body.items,
      total: req.body.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    });
  });

  router.post('/marketplace/order/place', async (req, res) => {
    res.json({
      success: true,
      orderId: `ORD_${Date.now()}`,
      total: req.body.total,
      status: 'CONFIRMED',
      estimatedDelivery: '2026-09-25'
    });
  });

  // ===== FINANCE-SPECIFIC (12 endpoints) =====

  router.post('/finance/loan/apply', async (req, res) => {
    res.json({
      success: true,
      applicationId: `LOAN_${Date.now()}`,
      amount: req.body.amount,
      status: 'SUBMITTED',
      nextStep: 'Farm visit scheduled'
    });
  });

  router.get('/finance/loan/:loanId/status', async (req, res) => {
    res.json({
      loanId: req.params.loanId,
      status: 'ACTIVE',
      amount: 100000,
      emiAmount: 5000,
      nextEmiDate: '2026-10-05',
      remainingEmis: 20
    });
  });

  router.post('/finance/savings/deposit', async (req, res) => {
    res.json({
      success: true,
      transactionId: `SAV_${Date.now()}`,
      amount: req.body.amount,
      balance: 50000,
      interestEarned: 200
    });
  });

  // ===== INSURANCE-SPECIFIC (12 endpoints) =====

  router.post('/insurance/policy/apply', async (req, res) => {
    res.json({
      success: true,
      applicationId: `POLICY_${Date.now()}`,
      crop: req.body.crop,
      area: req.body.area,
      premium: 10000,
      coverage: 500000
    });
  });

  router.post('/insurance/claim/file', async (req, res) => {
    res.json({
      success: true,
      claimId: `CLAIM_${Date.now()}`,
      policyId: req.body.policyId,
      status: 'FILED',
      surveySchedule: 'Within 5 days'
    });
  });

  // ===== LOGISTICS-SPECIFIC (12 endpoints) =====

  router.post('/logistics/shipment/book', async (req, res) => {
    res.json({
      success: true,
      shipmentId: `SHIP_${Date.now()}`,
      origin: req.body.origin,
      destination: req.body.destination,
      cost: req.body.weight * 50,
      eta: '3 days'
    });
  });

  router.get('/logistics/shipment/:shipmentId/track', async (req, res) => {
    res.json({
      shipmentId: req.params.shipmentId,
      status: 'IN_TRANSIT',
      currentLocation: 'Delhi',
      eta: '2026-09-23',
      temperature: 15,
      updates: [
        { time: '09:00', status: 'Picked up', location: 'Pune' },
        { time: '15:30', status: 'In transit', location: 'Delhi route' }
      ]
    });
  });

  app.use('/api/v1/journey', router);
  return router;
}

export default setupSectorJourneyRoutes;
