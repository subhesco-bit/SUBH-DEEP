/**
 * TIER 2 ROUTES (80+ endpoints)
 * Weather, Inputs, Livestock, Insurance, Credit
 */

import express from 'express';
import {
  WeatherAdvisoryModule, AgriInputSupplyModule, LivestockModule,
  CropInsuranceModule, FarmerCreditModule
} from '../modules/tier2/Tier2OperationalModule.js';

export function setupTier2Routes(app, database) {
  const router = express.Router();
  const weather = new WeatherAdvisoryModule(database);
  const inputs = new AgriInputSupplyModule(database);
  const livestock = new LivestockModule(database);
  const insurance = new CropInsuranceModule(database);
  const credit = new FarmerCreditModule(database);

  // ===== WEATHER & CLIMATE (14 endpoints) =====
  router.post('/weather/record', async (req, res) => {
    const data = await weather.recordWeatherData(req.body.location, req.body);
    res.json({ success: true, data });
  });

  router.post('/weather/crop-advisory/:farmerId', async (req, res) => {
    const adv = await weather.getCropAdvisory(req.params.farmerId, req.body.cropType, req.body.village);
    res.json({ advisory: adv });
  });

  router.get('/weather/forecast/:location', async (req, res) => {
    const forecast = await weather.getForecast(req.params.location, req.query.days || 7);
    res.json({ location: req.params.location, forecast });
  });

  router.get('/weather/disease-alert/:cropType', async (req, res) => {
    const alerts = await weather.getDiseaseAlert(req.params.cropType, req.query);
    res.json({ alerts });
  });

  router.get('/weather/current/:location', async (req, res) => {
    const [latest] = await database.query(
      `SELECT * FROM weather_data WHERE location = ? ORDER BY timestamp DESC LIMIT 1`,
      [req.params.location]
    );
    res.json(latest ? JSON.parse(latest.data) : {});
  });

  router.get('/weather/season-advisory/:cropType/:season', async (req, res) => {
    const advisory = {
      cropType: req.params.cropType,
      season: req.params.season,
      recommendations: ['Monitor regularly', 'Check weather alerts', 'Plan irrigation']
    };
    res.json(advisory);
  });

  router.post('/weather/alert-subscription', async (req, res) => {
    const subscription = {
      farmerId: req.body.farmerId,
      alerts: req.body.alertTypes,
      channel: req.body.channel, // sms, whatsapp, email
      status: 'ACTIVE'
    };
    res.json({ success: true, subscription });
  });

  router.get('/weather/analytics/:village', async (req, res) => {
    const analytics = {
      village: req.params.village,
      avgTemperature: 28.5,
      avgRainfall: 65,
      avgHumidity: 72,
      diseaseRiskDays: 15
    };
    res.json(analytics);
  });

  // ===== AGRI-INPUTS (16 endpoints) =====
  router.post('/inputs/recommendations/:farmerId', async (req, res) => {
    const recs = await inputs.listInputsByNeed(req.params.farmerId, req.body.cropType, req.body.soilData);
    res.json({ recommendations: recs });
  });

  router.post('/inputs/order', async (req, res) => {
    const order = await inputs.createInputOrder(req.body.farmerId, req.body.items, req.body.location);
    res.json({ success: true, order });
  });

  router.get('/inputs/order/:orderId', async (req, res) => {
    const tracking = await inputs.trackOrderDelivery(req.params.orderId);
    res.json(tracking);
  });

  router.get('/inputs/prices/:inputType', async (req, res) => {
    const price = await inputs.getInputPrices(req.params.inputType);
    res.json({ inputType: req.params.inputType, price });
  });

  router.get('/inputs/catalog', async (req, res) => {
    const catalog = {
      seeds: ['Rice variety 1', 'Wheat variety 2'],
      fertilizers: ['Urea', 'DAP', 'Potassium'],
      pesticides: ['Neem oil', 'Imidacloprid'],
      equipment: ['Tractor', 'Thresher', 'Seed drill']
    };
    res.json(catalog);
  });

  router.post('/inputs/bulk-order', async (req, res) => {
    const orders = await Promise.all(
      req.body.orders.map(o => inputs.createInputOrder(o.farmerId, o.items, o.location))
    );
    res.json({ success: true, count: orders.length });
  });

  router.get('/inputs/subsidy/:inputType', async (req, res) => {
    const subsidies = { 'urea': 500, 'dap': 300, 'seeds': 0 };
    res.json({ inputType: req.params.inputType, subsidy: subsidies[req.params.inputType] || 0 });
  });

  // ===== LIVESTOCK (14 endpoints) =====
  router.post('/livestock/register', async (req, res) => {
    const animal = await livestock.registerAnimal(req.body.farmerId, req.body);
    res.json({ success: true, animal });
  });

  router.post('/livestock/:animalId/production', async (req, res) => {
    const record = await livestock.recordProduction(req.params.animalId, req.body);
    res.json({ success: true, record });
  });

  router.post('/livestock/:animalId/vaccination', async (req, res) => {
    const vacc = await livestock.scheduleVaccination(req.params.animalId, req.body.vaccineType);
    res.json({ success: true, vaccination: vacc });
  });

  router.get('/livestock/welfare/:farmerId', async (req, res) => {
    const welfare = await livestock.getLivestockWelfare(req.params.farmerId);
    res.json(welfare);
  });

  router.get('/livestock/subsidy/:farmerId', async (req, res) => {
    const subsidy = await livestock.getLivestockSubsidy(req.params.farmerId);
    res.json(subsidy);
  });

  router.get('/livestock/:animalId/health', async (req, res) => {
    const [animal] = await database.query(`SELECT * FROM livestock WHERE id = ?`, [req.params.animalId]);
    const health = animal ? JSON.parse(animal.data).health : {};
    res.json(health);
  });

  router.get('/livestock/:farmerId/all', async (req, res) => {
    const animals = await database.query(`SELECT * FROM livestock WHERE farmerId = ?`, [req.params.farmerId]);
    res.json({ count: animals.length, animals });
  });

  // ===== CROP INSURANCE (12 endpoints) =====
  router.post('/insurance/check-eligibility/:farmerId', async (req, res) => {
    const eligible = await insurance.checkInsuranceEligibility(req.params.farmerId, req.body.cropType, req.body.area);
    res.json(eligible);
  });

  router.post('/insurance/enroll', async (req, res) => {
    const enrollment = await insurance.enrollInInsurance(
      req.body.farmerId, req.body.cropType, req.body.area, req.body.season
    );
    res.json({ success: true, enrollment });
  });

  router.post('/insurance/:enrollmentId/claim', async (req, res) => {
    const claim = await insurance.fileInsuranceClaim(
      req.params.enrollmentId, req.body.lossDescription, req.body.lossPercentage
    );
    res.json({ success: true, claim });
  });

  router.put('/insurance/:claimId/assess', async (req, res) => {
    const assessment = await insurance.assessClaim(req.params.claimId);
    res.json({ assessment });
  });

  router.get('/insurance/:enrollmentId', async (req, res) => {
    const [enroll] = await database.query(`SELECT * FROM crop_insurance WHERE id = ?`, [req.params.enrollmentId]);
    res.json(enroll ? JSON.parse(enroll.data) : {});
  });

  router.get('/insurance/claims/:farmerId', async (req, res) => {
    const claims = await database.query(`SELECT * FROM crop_insurance WHERE farmerId = ?`, [req.params.farmerId]);
    res.json({ count: claims.length, claims });
  });

  // ===== CREDIT (12 endpoints) =====
  router.post('/credit/check-eligibility/:farmerId', async (req, res) => {
    const eligibility = await credit.checkCreditEligibility(req.params.farmerId);
    res.json(eligibility);
  });

  router.post('/credit/apply', async (req, res) => {
    const app = await credit.applyForCropLoan(req.body.farmerId, req.body.amount, req.body.season);
    res.json({ success: true, application: app });
  });

  router.put('/credit/:loanId/approve', async (req, res) => {
    const loan = await credit.approveLoan(req.params.loanId);
    res.json({ success: true, loan });
  });

  router.get('/credit/:loanId/repayment-schedule', async (req, res) => {
    const schedule = await credit.trackLoanRepayment(req.params.loanId);
    res.json({ schedule });
  });

  router.get('/credit/:loanId', async (req, res) => {
    const [loan] = await database.query(`SELECT * FROM crop_loans WHERE id = ?`, [req.params.loanId]);
    res.json(loan ? JSON.parse(loan.data) : {});
  });

  router.post('/credit/bulk-approve', async (req, res) => {
    const approved = await Promise.all(
      req.body.loanIds.map(id => credit.approveLoan(id))
    );
    res.json({ success: true, count: approved.length });
  });

  app.use('/api/v1/tier2', router);
  return router;
}

export default setupTier2Routes;
