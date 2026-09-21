'use strict';

const express = require('express');
const authMiddleware = require('../middleware/auth');
const pipeline = require('../services/aiUpstreamInformationPipelineService');

const router = express.Router();
router.use(authMiddleware);

router.post('/sources', (req, res) => {
  try { return res.status(201).json({ success: true, data: pipeline.registerSource(req.body) }); }
  catch (error) { return res.status(400).json({ success: false, code: error.code, error: error.message }); }
});
router.get('/sources/:sourceId/state', (req, res) => {
  try { return res.json({ success: true, data: pipeline.sourceState(req.params.sourceId) }); }
  catch (error) { return res.status(404).json({ success: false, code: error.code, error: error.message }); }
});
router.post('/artifacts', (req, res) => {
  try { return res.status(201).json({ success: true, data: pipeline.ingestArtifact(req.body) }); }
  catch (error) { return res.status(400).json({ success: false, code: error.code, error: error.message }); }
});
router.post('/artifacts/:artifactId/extract', (req, res) => {
  try { return res.json({ success: true, data: pipeline.extractEligibilityFacts(req.params.artifactId) }); }
  catch (error) { return res.status(400).json({ success: false, code: error.code, error: error.message }); }
});
router.post('/handoffs', (req, res) => {
  try { return res.status(201).json({ success: true, data: pipeline.buildHandoff(req.body) }); }
  catch (error) { return res.status(400).json({ success: false, code: error.code, error: error.message }); }
});
router.post('/handoffs/:handoffId/review', (req, res) => {
  try { return res.json({ success: true, data: pipeline.reviewHandoff(req.params.handoffId, req.body) }); }
  catch (error) { return res.status(400).json({ success: false, code: error.code, error: error.message }); }
});
router.post('/fixtures/subsidy', (req, res) => res.status(201).json({ success: true, data: pipeline.deterministicSubsidyFixture() }));

module.exports = router;
