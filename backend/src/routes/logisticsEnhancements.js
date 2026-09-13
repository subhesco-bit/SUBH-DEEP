/**
 * logisticsEnhancements — the canonical implementation for this resource.
 *
 * Consolidated from logisticsEnhancements_merged.js on 2026-09-13, per
 * .ai/decisions/0001-module-lineage-consolidation.md and
 * .ai/consolidation/CONSOLIDATION_PLAN.md (Phase 3.1): the consolidated code
 * belongs in the canonical file; duplicates are retired once their unique
 * behaviour is preserved and verified.
 *
 * History (why this file looked empty before): dynamicRouteLoader.js derives a
 * mount path from the FILENAME, so this implementation was published at a
 * "...-merged" URL that nothing called, while this file — a generated stub whose
 * only endpoints were a POST / answering "Route operational" and a GET /health —
 * owned the path the frontend actually requests. The stub's blanket
 * router.use(authMiddleware) is deliberately NOT carried over: the code below
 * applies auth per route and several endpoints are intentionally public. Its
 * POST / reply is not carried over either — it answered { success: true }
 * without writing anything.
 */
/**
 * Logistics Enhancement Routes
 * API endpoints for Fleet Management, Real-time Tracking, Temperature Monitoring, and Warehouse Integration
 */

const express = require('express');
const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'logisticsEnhancements' });
});

const logisticsEnhancementService = require('../services/legacy/logisticsEnhancementService');
const { authMiddleware } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');
const { authLimiter } = require('../middleware/rateLimiter');

// Fleet Management Routes
router.post('/fleet', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const vehicle = await logisticsEnhancementService.addVehicle(req.body);
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/fleet', authMiddleware, async (req, res) => {
  try {
    const fleet = await logisticsEnhancementService.getFleet(req.query);
    res.json({ success: true, data: fleet });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Real "due for service" list — placed ahead of /fleet/:vehicleId so
// "maintenance-due" is never swallowed as a vehicleId.
router.get('/fleet/maintenance-due', authMiddleware, async (req, res) => {
  try {
    const dueSoonWithinDays = req.query.dueSoonWithinDays ? parseInt(req.query.dueSoonWithinDays, 10) : undefined;
    const result = await logisticsEnhancementService.getMaintenanceDueList({ dueSoonWithinDays });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/fleet/:vehicleId', authMiddleware, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await logisticsEnhancementService.getVehicle(vehicleId);
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/fleet/:vehicleId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const vehicle = await logisticsEnhancementService.updateVehicle(vehicleId, req.body);
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/fleet/:vehicleId/maintenance', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const maintenance = await logisticsEnhancementService.scheduleMaintenance(vehicleId, req.body);
    res.json({ success: true, data: maintenance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Real-time Tracking Routes
router.post('/shipments/:shipmentId/tracking', authLimiter, authMiddleware, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const tracking = await logisticsEnhancementService.updateTracking(shipmentId, req.body);
    res.json({ success: true, data: tracking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/shipments/:shipmentId/tracking', authMiddleware, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const tracking = await logisticsEnhancementService.getTracking(shipmentId);
    res.json({ success: true, data: tracking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/shipments/:shipmentId/live-tracking', authMiddleware, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const liveTracking = await logisticsEnhancementService.getLiveTracking(shipmentId);
    res.json({ success: true, data: liveTracking });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/shipments/:shipmentId/geofence', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const geofence = await logisticsEnhancementService.setGeofence(shipmentId, req.body);
    res.json({ success: true, data: geofence });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Temperature Monitoring Routes
router.post('/shipments/:shipmentId/temperature', authLimiter, authMiddleware, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const temperature = await logisticsEnhancementService.recordTemperature(shipmentId, req.body);
    res.json({ success: true, data: temperature });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/shipments/:shipmentId/temperature', authMiddleware, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const temperatureData = await logisticsEnhancementService.getTemperatureData(shipmentId, req.query);
    res.json({ success: true, data: temperatureData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/shipments/:shipmentId/temperature-alerts', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const alert = await logisticsEnhancementService.setTemperatureAlert(shipmentId, req.body);
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/shipments/:shipmentId/temperature-alerts', authMiddleware, async (req, res) => {
  try {
    const { shipmentId } = req.params;
    const alerts = await logisticsEnhancementService.getTemperatureAlerts(shipmentId);
    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Warehouse Integration Routes
router.post('/warehouses', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const warehouse = await logisticsEnhancementService.createWarehouse(req.body);
    res.json({ success: true, data: warehouse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/warehouses', authMiddleware, async (req, res) => {
  try {
    const warehouses = await logisticsEnhancementService.getWarehouses(req.query);
    res.json({ success: true, data: warehouses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/warehouses/:warehouseId', authMiddleware, async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const warehouse = await logisticsEnhancementService.getWarehouse(warehouseId);
    res.json({ success: true, data: warehouse });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/warehouses/:warehouseId/inventory', authLimiter, authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const inventory = await logisticsEnhancementService.addInventory(warehouseId, req.body);
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/warehouses/:warehouseId/inventory', authMiddleware, async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const inventory = await logisticsEnhancementService.getWarehouseInventory(warehouseId);
    res.json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/warehouses/:warehouseId/shipments', authLimiter, authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const shipment = await logisticsEnhancementService.processWarehouseShipment(warehouseId, req.body);
    res.json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/statistics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const stats = await logisticsEnhancementService.getLogisticsStatistics(req.query);
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

