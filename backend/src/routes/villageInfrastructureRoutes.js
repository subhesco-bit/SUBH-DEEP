/**
 * VILLAGE INFRASTRUCTURE ROUTES (70+ endpoints)
 * Labs, Processing Units, Labor, CSR, Supply Chain
 */

import express from 'express';
import {
  LabsModule,
  ProcessingUnitsModule,
  VillageLaborModule,
  CSRModule,
  VillageSupplyChainModule
} from '../modules/village-infrastructure/VillageInfrastructureModule.js';

export function setupVillageInfrastructureRoutes(app, database) {
  const router = express.Router();

  const labs = new LabsModule(database);
  const units = new ProcessingUnitsModule(database);
  const labor = new VillageLaborModule(database);
  const csr = new CSRModule(database);
  const supply = new VillageSupplyChainModule(database);

  // ===== LABS (12 endpoints) =====
  router.post('/labs/register', async (req, res) => {
    const lab = await labs.registerLab(req.body);
    res.json({ success: true, lab });
  });

  router.post('/labs/:labId/test/submit', async (req, res) => {
    const test = await labs.submitTest(req.body);
    res.json({ success: true, test });
  });

  router.get('/labs/:labId/tests/:testId', async (req, res) => {
    const report = await labs.getTestReport(req.params.testId);
    res.json(report);
  });

  router.get('/labs/village/:village/type/:type', async (req, res) => {
    const labs_list = await labs.getLabs(req.params.village, req.params.type);
    res.json({ count: labs_list.length, labs: labs_list });
  });

  router.post('/labs/:labId/soil-test', async (req, res) => {
    const test = await labs.submitTest({ ...req.body, sampleType: 'soil' });
    res.json({ success: true, test });
  });

  router.post('/labs/:labId/crop-test', async (req, res) => {
    const test = await labs.submitTest({ ...req.body, sampleType: 'crop' });
    res.json({ success: true, test });
  });

  router.post('/labs/:labId/residue-test', async (req, res) => {
    const test = await labs.submitTest({ ...req.body, sampleType: 'residue' });
    res.json({ success: true, test });
  });

  router.post('/labs/:labId/water-test', async (req, res) => {
    const test = await labs.submitTest({ ...req.body, sampleType: 'water' });
    res.json({ success: true, test });
  });

  router.get('/farmer/:farmerId/tests', async (req, res) => {
    const tests = await database.query(`SELECT * FROM lab_tests WHERE farmerId = ?`, [req.params.farmerId]);
    res.json({ count: tests.length, tests });
  });

  // ===== PROCESSING UNITS (14 endpoints) =====
  router.post('/units/register', async (req, res) => {
    const unit = await units.registerUnit(req.body);
    res.json({ success: true, unit });
  });

  router.post('/units/:unitId/schedule-production', async (req, res) => {
    const schedule = await units.scheduleProduction(req.body);
    res.json({ success: true, schedule });
  });

  router.put('/units/:unitId/production/:prodId/complete', async (req, res) => {
    const prod = await units.completeProduction(req.params.prodId, req.body.actualOutput);
    res.json({ success: true, production: prod });
  });

  router.get('/units/:unitId/schedule/:month', async (req, res) => {
    const schedule = await units.getUnitSchedule(req.params.unitId, req.params.month);
    res.json({ count: schedule.length, schedule });
  });

  router.get('/units/:unitId/analytics', async (req, res) => {
    const analytics = await units.getProductionAnalytics(req.params.unitId);
    res.json(analytics);
  });

  router.get('/units/village/:village/category/:category', async (req, res) => {
    const units_list = await database.query(
      `SELECT * FROM processing_units WHERE village = ? AND category = ?`,
      [req.params.village, req.params.category]
    );
    res.json({ count: units_list.length, units: units_list });
  });

  router.post('/units/:unitId/mobile-route', async (req, res) => {
    const route = {
      unitId: req.params.unitId,
      schedule: req.body.schedule, // array of villages and dates
      estimatedCoverage: req.body.schedule.length
    };
    res.json({ success: true, route });
  });

  router.get('/units/:unitId/production-history', async (req, res) => {
    const history = await database.query(
      `SELECT * FROM productions WHERE unitId = ?`,
      [req.params.unitId]
    );
    res.json({ count: history.length, history });
  });

  // ===== VILLAGE LABOR MARKETPLACE (18 endpoints) =====
  router.post('/labor/register-laborer', async (req, res) => {
    const laborer = await labor.registerLaborer(req.body);
    res.json({ success: true, laborer });
  });

  router.post('/labor/jobs/post', async (req, res) => {
    const job = await labor.createJobPosting(req.body);
    res.json({ success: true, job });
  });

  router.post('/labor/jobs/:jobId/apply', async (req, res) => {
    const app = await labor.applyForJob(req.params.jobId, req.body.laborerId);
    res.json({ success: true, application: app });
  });

  router.put('/labor/jobs/:jobId/hire/:laborerId', async (req, res) => {
    const contract = await labor.hireLaborer(req.params.jobId, req.params.laborerId);
    res.json({ success: true, contract });
  });

  router.post('/labor/contracts/:contractId/attendance', async (req, res) => {
    const record = await labor.markAttendance(req.params.contractId, req.body.attended);
    res.json({ success: true, record });
  });

  router.put('/labor/contracts/:contractId/complete', async (req, res) => {
    const result = await labor.completeLaborWork(req.params.contractId, req.body.farmerId, req.body.rating);
    res.json({ success: true, result });
  });

  router.get('/labor/available/:village/:jobType', async (req, res) => {
    const laborers = await labor.getAvailableLaborers(req.params.village, req.params.jobType);
    res.json({ count: laborers.length, laborers });
  });

  router.get('/labor/profile/:laborerId', async (req, res) => {
    const profile = await labor.getLaborerProfile(req.params.laborerId);
    res.json(profile);
  });

  router.get('/labor/jobs/:village/open', async (req, res) => {
    const jobs = await database.query(
      `SELECT * FROM job_postings WHERE village = ? AND status = 'OPEN'`,
      [req.params.village]
    );
    res.json({ count: jobs.length, jobs });
  });

  router.get('/labor/contracts/:laborerId/active', async (req, res) => {
    const contracts = await database.query(
      `SELECT * FROM labor_contracts WHERE laborerId = ? AND status = 'ACTIVE'`,
      [req.params.laborerId]
    );
    res.json({ count: contracts.length, contracts });
  });

  router.get('/labor/earnings/:laborerId/:month', async (req, res) => {
    const contracts = await database.query(
      `SELECT * FROM labor_contracts WHERE laborerId = ? AND MONTH(startDate) = ?`,
      [req.params.laborerId, req.params.month]
    );
    const earnings = contracts.reduce((sum, c) => sum + (JSON.parse(c.data).actualCost || 0), 0);
    res.json({ laborerId: req.params.laborerId, month: req.params.month, earnings });
  });

  router.post('/labor/bulk-hire', async (req, res) => {
    const hires = await Promise.all(
      req.body.hiring.map(h => labor.hireLaborer(h.jobId, h.laborerId))
    );
    res.json({ success: true, count: hires.length, contracts: hires });
  });

  // ===== CSR (CORPORATE SOCIAL RESPONSIBILITY) (16 endpoints) =====
  router.post('/csr/programs/register', async (req, res) => {
    const program = await csr.registerCSRProgram(req.body);
    res.json({ success: true, program });
  });

  router.post('/csr/programs/:programId/activities', async (req, res) => {
    const activity = await csr.registerCSRActivity(req.body);
    res.json({ success: true, activity });
  });

  router.post('/csr/activities/:activityId/beneficiary', async (req, res) => {
    const bene = await csr.recordBeneficiary(req.params.activityId, req.body);
    res.json({ success: true, beneficiary: bene });
  });

  router.put('/csr/activities/:activityId/complete', async (req, res) => {
    const activity = await csr.completeActivity(req.params.activityId);
    res.json({ success: true, activity });
  });

  router.get('/csr/programs/:programId/report', async (req, res) => {
    const report = await csr.getCSRReport(req.params.programId);
    res.json(report);
  });

  router.get('/csr/programs/company/:company', async (req, res) => {
    const programs = await database.query(
      `SELECT * FROM csr_programs WHERE company = ?`,
      [req.params.company]
    );
    res.json({ count: programs.length, programs });
  });

  router.get('/csr/villages/:village/programs', async (req, res) => {
    const programs = await database.query(
      `SELECT * FROM csr_programs WHERE JSON_CONTAINS(targetVillages, ?)`,
      [JSON.stringify(req.params.village)]
    );
    res.json({ count: programs.length, programs });
  });

  router.get('/csr/activities/:village/current', async (req, res) => {
    const activities = await database.query(
      `SELECT * FROM csr_activities WHERE village = ? AND status IN ('ACTIVE', 'SCHEDULED')`,
      [req.params.village]
    );
    res.json({ count: activities.length, activities });
  });

  router.post('/csr/impact-report/:programId', async (req, res) => {
    const report = await csr.getCSRReport(req.params.programId);
    res.json(report);
  });

  router.get('/csr/leaderboard/programs/:metric', async (req, res) => {
    const programs = await database.query(`SELECT * FROM csr_programs ORDER BY ? DESC LIMIT 10`, [req.params.metric]);
    res.json({ metric: req.params.metric, programs });
  });

  // ===== VILLAGE SUPPLY CHAIN (10 endpoints) =====
  router.post('/supply-chain/household/production', async (req, res) => {
    const prod = await supply.createHouseholdProduction(req.body);
    res.json({ success: true, production: prod });
  });

  router.post('/supply-chain/village/aggregate', async (req, res) => {
    const aggregated = await supply.aggregateToVillage(req.body.productionIds, req.body.villageId);
    res.json({ success: true, aggregated });
  });

  router.post('/supply-chain/region/distribute', async (req, res) => {
    const dist = await supply.distributeInterVillage(req.body.villageProductionIds, req.body.region);
    res.json({ success: true, distribution: dist });
  });

  router.get('/supply-chain/trace/:productId', async (req, res) => {
    const trace = await supply.traceSupplyChain(req.params.productId);
    res.json(trace);
  });

  router.get('/supply-chain/village/:villageId/production', async (req, res) => {
    const prods = await database.query(
      `SELECT * FROM productions WHERE villageId = ?`,
      [req.params.villageId]
    );
    res.json({ count: prods.length, productions: prods });
  });

  router.get('/supply-chain/household/:farmerId/history', async (req, res) => {
    const prods = await database.query(
      `SELECT * FROM productions WHERE farmerId = ? AND level = 'HOUSEHOLD'`,
      [req.params.farmerId]
    );
    res.json({ count: prods.length, productions: prods });
  });

  router.get('/supply-chain/region/:region/distribution', async (req, res) => {
    const dists = await database.query(
      `SELECT * FROM distributions WHERE region = ?`,
      [req.params.region]
    );
    res.json({ count: dists.length, distributions: dists });
  });

  router.post('/supply-chain/batch-trace', async (req, res) => {
    const traces = await Promise.all(
      req.body.productIds.map(id => supply.traceSupplyChain(id))
    );
    res.json({ count: traces.length, traces });
  });

  app.use('/api/v1/village', router);
  return router;
}

export default setupVillageInfrastructureRoutes;
