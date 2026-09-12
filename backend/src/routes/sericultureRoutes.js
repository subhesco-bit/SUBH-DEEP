/**
 * Sericulture Management Routes
 * RESTful API endpoints for sericulture management (M027)
 *
 * Recovered from the old-new-folder dump — real file, real backing service
 * (services/legacy/sericultureService.js, exact method-name matches),
 * never copied into the live routes/ tree or mounted.
 */

const express = require('express');
const router = express.Router();
const sericultureService = require('../services/legacy/sericultureService');
const { authMiddleware: authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
  try {
    const filters = {
      farmer_id: req.query.farmer_id,
      variety: req.query.variety,
      status: req.query.status
    };
    const sericulture = await sericultureService.getAllSericulture(filters);
    res.json({ success: true, data: sericulture });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const sericulture = await sericultureService.getSericultureById(req.params.id);
    res.json({ success: true, data: sericulture });
  } catch (error) {
    res.status(404).json({ success: false, error: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const sericulture = await sericultureService.createSericulture(req.body);
    res.status(201).json({ success: true, data: sericulture });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/:id/silk', authenticate, async (req, res) => {
  try {
    const silk = await sericultureService.getSilkProduction(req.params.id);
    res.json({ success: true, data: silk });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:id/mulberry', authenticate, async (req, res) => {
  try {
    const mulberry = await sericultureService.getMulberryCultivation(req.params.id);
    res.json({ success: true, data: mulberry });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
