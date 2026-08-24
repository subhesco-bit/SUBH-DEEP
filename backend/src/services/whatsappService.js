const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');

// whatsappService — minimal scaffold.
router.get('/', (req, res) => {
  res.json({ success: true, data: [] });
});


module.exports = { router };
