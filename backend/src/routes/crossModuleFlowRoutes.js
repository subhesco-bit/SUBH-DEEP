'use strict';

const router = require('express').Router();
const { authMiddleware } = require('../middleware/auth');
const service = require('../services/crossModuleFlowContractService');

router.use(authMiddleware);

router.post('/propose', async (req, res) => {
  try {
    const result = await service.propose({ ...req.body, userId: req.user.id });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/:id/decision', async (req, res) => {
  try {
    const result = await service.decide({
      proposalId: req.params.id, user: req.user, ...req.body,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.post('/:id/execute', async (req, res) => {
  try {
    const result = await service.execute({
      proposalId: req.params.id, user: req.user,
      sourceModule: req.body.sourceModule, targetModule: req.body.targetModule,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(403).json({ success: false, error: error.message });
  }
});

module.exports = router;
