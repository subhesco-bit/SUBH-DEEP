'use strict';

const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');
const auditChain = require('../services/auditChainService');

const router = express.Router();
router.get('/verify', authMiddleware, adminMiddleware, async (req, res, next) => {
  try { res.json({ success: true, data: await auditChain.verify(req.query.limit) }); } catch (error) { next(error); }
});

module.exports = router;
