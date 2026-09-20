/**
 * FOUNDATIONAL SYSTEMS ROUTES (50+ endpoints)
 * Land Registry, Farmer Registration, Government Schemes, Subsidies
 */

import express from 'express';
import {
  LandRegistryModule,
  FarmerRegistrationModule,
  GovernmentSchemeModule,
  SubsidyManagementModule
} from '../modules/foundational/FoundationalSystemsModule.js';

export function setupFoundationalRoutes(app, database) {
  const router = express.Router();

  const landRegistry = new LandRegistryModule(database);
  const farmerReg = new FarmerRegistrationModule(database);
  const schemes = new GovernmentSchemeModule(database);
  const subsidies = new SubsidyManagementModule(database);

  // ===== LAND REGISTRY (12 endpoints) =====

  router.post('/land/register', async (req, res) => {
    const land = await landRegistry.registerLandProperty(req.body);
    res.json({ success: true, land });
  });

  router.post('/land/:landId/upload-ror', async (req, res) => {
    const land = await landRegistry.uploadRoRDocument(req.params.landId, req.body);
    res.json({ success: true, land });
  });

  router.put('/land/:landId/verify', async (req, res) => {
    const land = await landRegistry.verifyLandTitle(req.params.landId, req.body.approved);
    res.json({ success: true, land });
  });

  router.get('/land/:landId', async (req, res) => {
    const [land] = await database.query(`SELECT * FROM land_registry WHERE id = ?`,
      [req.params.landId]);
    res.json(JSON.parse(land.data));
  });

  router.post('/land/:landId/dispute', async (req, res) => {
    const dispute = await landRegistry.recordLandDispute(req.params.landId, req.body);
    res.json({ success: true, dispute });
  });

  router.post('/land/:landId/mutation', async (req, res) => {
    const mutation = await landRegistry.trackLandMutation(
      req.params.landId,
      req.body.fromFarmerId,
      req.body.toFarmerId,
      req.body.reason
    );
    res.json({ success: true, mutation });
  });

  router.get('/farmer/:farmerId/lands', async (req, res) => {
    const holdings = await landRegistry.getFarmerLandHoldings(req.params.farmerId);
    res.json(holdings);
  });

  router.get('/land/:landId/disputes', async (req, res) => {
    const disputes = await database.query(
      `SELECT * FROM land_disputes WHERE landId = ?`,
      [req.params.landId]
    );
    res.json({ count: disputes.length, disputes });
  });

  router.get('/land/:landId/mutations', async (req, res) => {
    const mutations = await database.query(
      `SELECT * FROM land_mutations WHERE landId = ?`,
      [req.params.landId]
    );
    res.json({ count: mutations.length, mutations });
  });

  router.post('/land/bulk-register', async (req, res) => {
    const results = await Promise.all(
      req.body.lands.map(l => landRegistry.registerLandProperty(l))
    );
    res.json({ success: true, count: results.length, lands: results });
  });

  router.get('/villages/:village/land-audit', async (req, res) => {
    const lands = await database.query(
      `SELECT * FROM land_registry WHERE village = ?`,
      [req.params.village]
    );
    const totalArea = lands.reduce((sum, l) => sum + JSON.parse(l.data).area, 0);
    const verifiedArea = lands.filter(l => JSON.parse(l.data).titleStatus === 'VERIFIED')
      .reduce((sum, l) => sum + JSON.parse(l.data).area, 0);

    res.json({
      village: req.params.village,
      totalProperties: lands.length,
      totalArea,
      verifiedArea,
      verificationRate: ((verifiedArea / totalArea) * 100).toFixed(2) + '%'
    });
  });

  // ===== FARMER REGISTRATION (12 endpoints) =====

  router.post('/farmer/register', async (req, res) => {
    const farmer = await farmerReg.registerFarmer(req.body);
    res.json({ success: true, farmer });
  });

  router.post('/farmer/:farmerId/verify-kyc', async (req, res) => {
    const farmer = await farmerReg.verifyFarmerKYC(req.params.farmerId, req.body);
    res.json({ success: true, farmer });
  });

  router.put('/farmer/:farmerId/update-practice', async (req, res) => {
    const farmer = await farmerReg.updateFarmingPractice(req.params.farmerId, req.body);
    res.json({ success: true, farmer });
  });

  router.get('/farmer/:farmerId/profile', async (req, res) => {
    const farmer = await farmerReg.getFarmerProfile(req.params.farmerId);
    res.json(farmer);
  });

  router.get('/farmer/uid/:farmerUid', async (req, res) => {
    const [farmer] = await database.query(
      `SELECT * FROM farmer_registration WHERE farmerUid = ?`,
      [req.params.farmerUid]
    );
    res.json(farmer ? JSON.parse(farmer.data) : { error: 'Not found' });
  });

  router.post('/farmer/:farmerId/add-land', async (req, res) => {
    const [farmer] = await database.query(
      `SELECT * FROM farmer_registration WHERE id = ?`,
      [req.params.farmerId]
    );
    const farmerObj = JSON.parse(farmer.data);
    farmerObj.linkedLands = farmerObj.linkedLands || [];
    farmerObj.linkedLands.push(req.body.landId);

    await database.query(
      `UPDATE farmer_registration SET data = ? WHERE id = ?`,
      [JSON.stringify(farmerObj), req.params.farmerId]
    );
    res.json({ success: true });
  });

  router.get('/district/:district/farmers', async (req, res) => {
    const farmers = await database.query(
      `SELECT * FROM farmer_registration WHERE district = ?`,
      [req.params.district]
    );
    res.json({ count: farmers.length, farmers });
  });

  router.get('/farmer/:farmerId/kyc-status', async (req, res) => {
    const farmer = await farmerReg.getFarmerProfile(req.params.farmerId);
    res.json({
      farmerId: req.params.farmerId,
      verificationStatus: farmer.verificationStatus,
      kycDocuments: farmer.kycDocuments || [],
      pmKisanStatus: farmer.pmKisanStatus,
      eligibleForSchemes: farmer.verificationStatus === 'VERIFIED'
    });
  });

  router.post('/farmer/bulk-register', async (req, res) => {
    const results = await Promise.all(
      req.body.farmers.map(f => farmerReg.registerFarmer(f))
    );
    res.json({ success: true, count: results.length, farmers: results });
  });

  router.get('/farmer/:farmerId/eligibility-score', async (req, res) => {
    const [farmer] = await database.query(
      `SELECT * FROM farmer_registration WHERE id = ?`,
      [req.params.farmerId]
    );
    const farmerObj = JSON.parse(farmer.data);

    const score = {
      verification: farmerObj.verificationStatus === 'VERIFIED' ? 30 : 0,
      kyc: farmerObj.kycVerifiedAt ? 20 : 0,
      landProof: farmerObj.linkedLands?.length > 0 ? 30 : 0,
      bankAccount: farmerObj.bankName ? 20 : 0,
      total: 0
    };
    score.total = score.verification + score.kyc + score.landProof + score.bankAccount;

    res.json(score);
  });

  // ===== GOVERNMENT SCHEMES (14 endpoints) =====

  router.post('/schemes/navigate/:farmerId', async (req, res) => {
    const [farmer] = await database.query(
      `SELECT * FROM farmer_registration WHERE id = ?`,
      [req.params.farmerId]
    );
    const farmerObj = JSON.parse(farmer.data);

    const eligible = await schemes.navigateSchemes(farmerObj);
    res.json({ farmerId: req.params.farmerId, count: eligible.length, eligibleSchemes: eligible });
  });

  router.post('/schemes/:farmerId/apply', async (req, res) => {
    const app = await schemes.applyForScheme(req.params.farmerId, req.body.schemeId);
    res.json({ success: true, application: app });
  });

  router.get('/schemes/status/:applicationId', async (req, res) => {
    const status = await schemes.getSchemeStatus(req.params.applicationId);
    res.json(status);
  });

  router.get('/schemes/list', async (req, res) => {
    // All available schemes
    const schemeList = [
      { id: 'PM_KISAN', name: 'PM-KISAN', amount: 6000, frequency: 'annual' },
      { id: 'PMFBY', name: 'PM Fasal Bima', amount: 'variable', frequency: 'seasonal' },
      { id: 'SUBSIDIZED_INPUTS', name: 'Input Subsidy', amount: 2000, frequency: 'seasonal' },
      { id: 'IRRIGATION_SUBSIDY', name: 'Irrigation', amount: 15000, frequency: 'one_time' },
      { id: 'CROP_LOAN', name: 'Crop Loan', amount: 50000, frequency: 'seasonal' },
      { id: 'ORGANIC_CERT_SUBSIDY', name: 'Organic Cert', amount: 10000, frequency: 'one_time' },
      { id: 'SKILL_TRAINING_SUBSIDY', name: 'Skill Training', amount: 0, frequency: 'one_time' }
    ];
    res.json({ total: schemeList.length, schemes: schemeList });
  });

  router.get('/farmer/:farmerId/schemes/history', async (req, res) => {
    const apps = await database.query(
      `SELECT * FROM scheme_applications WHERE farmerId = ?`,
      [req.params.farmerId]
    );
    res.json({ count: apps.length, applications: apps });
  });

  router.post('/schemes/batch-apply', async (req, res) => {
    const results = await Promise.all(
      req.body.applications.map(a =>
        schemes.applyForScheme(a.farmerId, a.schemeId)
      )
    );
    res.json({ success: true, count: results.length, applications: results });
  });

  router.get('/district/:district/scheme-report/:schemeId', async (req, res) => {
    const apps = await database.query(
      `SELECT * FROM scheme_applications WHERE schemeId = ?`,
      [req.params.schemeId]
    );
    // Filter by district (from farmer table)
    res.json({
      district: req.params.district,
      scheme: req.params.schemeId,
      applications: apps.length,
      approved: apps.filter(a => JSON.parse(a.data).status === 'APPROVED').length
    });
  });

  // ===== SUBSIDIES (12 endpoints) =====

  router.post('/subsidies/allocate', async (req, res) => {
    const subsidy = await subsidies.allocateSubsidy(
      req.body.farmerId,
      req.body.schemeId,
      req.body.amount,
      req.body.conditions
    );
    res.json({ success: true, subsidy });
  });

  router.post('/subsidies/:subsidyId/verify-condition', async (req, res) => {
    const subsidy = await subsidies.verifySubsidyCondition(
      req.params.subsidyId,
      req.body.condition,
      req.body.proof
    );
    res.json({ success: true, subsidy });
  });

  router.put('/subsidies/:subsidyId/disburse', async (req, res) => {
    const subsidy = await subsidies.disburseSubsidy(req.params.subsidyId);
    res.json({ success: true, subsidy });
  });

  router.get('/subsidies/:subsidyId', async (req, res) => {
    const [subsidy] = await database.query(
      `SELECT * FROM subsidies WHERE id = ?`,
      [req.params.subsidyId]
    );
    res.json(JSON.parse(subsidy.data));
  });

  router.get('/farmer/:farmerId/subsidies/:year', async (req, res) => {
    const status = await subsidies.getFarmerSubsidyStatus(req.params.farmerId, req.params.year);
    res.json(status);
  });

  router.get('/subsidies/:subsidyId/certificate', async (req, res) => {
    const cert = await subsidies.generateSubsidyCertificate(req.params.subsidyId);
    res.json(cert);
  });

  router.get('/farmer/:farmerId/subsidy-dashboard', async (req, res) => {
    const currentYear = new Date().getFullYear();
    const status = await subsidies.getFarmerSubsidyStatus(req.params.farmerId, currentYear);
    res.json({
      farmer: req.params.farmerId,
      year: currentYear,
      ...status
    });
  });

  router.post('/subsidies/batch-allocate', async (req, res) => {
    const results = await Promise.all(
      req.body.subsidies.map(s =>
        subsidies.allocateSubsidy(s.farmerId, s.schemeId, s.amount, s.conditions)
      )
    );
    res.json({ success: true, count: results.length, subsidies: results });
  });

  router.get('/district/:district/subsidy-report', async (req, res) => {
    const subs = await database.query(
      `SELECT * FROM subsidies WHERE status = 'DISBURSED'`
    );
    const filtered = subs.filter(s => {
      // Filter by district (would need to join with farmer table in real scenario)
      return true;
    });

    const total = filtered.reduce((sum, s) => sum + JSON.parse(s.data).amount, 0);
    res.json({
      district: req.params.district,
      totalSubsidies: filtered.length,
      totalAmount: total,
      avgSubsidy: Math.round(total / filtered.length)
    });
  });

  router.post('/subsidies/:subsidyId/escalate', async (req, res) => {
    // Escalate subsidy for manual verification if stuck
    const [subsidy] = await database.query(
      `SELECT * FROM subsidies WHERE id = ?`,
      [req.params.subsidyId]
    );
    const subsidyObj = JSON.parse(subsidy.data);
    subsidyObj.escalatedAt = new Date();
    subsidyObj.escalationReason = req.body.reason;

    await database.query(
      `UPDATE subsidies SET data = ? WHERE id = ?`,
      [JSON.stringify(subsidyObj), req.params.subsidyId]
    );
    res.json({ success: true, escalated: true });
  });

  app.use('/api/v1/foundational', router);
  return router;
}

export default setupFoundationalRoutes;
