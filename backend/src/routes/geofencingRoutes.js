/**
 * Geofencing routes — thin layer over services/geofencingService.js.
 *
 * Two real use cases only (see the service file for the full honest scope
 * note): a manual labour/farmer check-in, and a driver-ping-vs-warehouse-zone
 * check that reads the existing driver_location pipeline. Nothing here does
 * continuous tracking or polygon-precision geofencing.
 *
 * update/deactivate/events/current/check-polygon below were recovered from
 * an abandoned worktree branch (EBDESIGN.worktrees/integration-devin-key-apk,
 * commit f57302b2, never merged) that had real DB-backed zone management
 * missing from this file - verified real (schema, geo.js dependency all
 * already live) before re-implementing against geofencingService.js instead
 * of copying its raw pool queries, to keep one source of truth. Its
 * POST /zones/:id/check was NOT recovered - redundant with the already-real
 * checkIn/checkDriverZoneArrival flow above.
 */
const express = require('express');
const router = express.Router();
const geofencingService = require('../services/legacy/geofencingService');
const { authMiddleware } = require('../middleware/auth');

const fail = (res, e) => res
  .status(/required|must|Refusing|not found|not active|No recorded/i.test(e.message) ? 400 : 500)
  .json({ success: false, error: e.message });

// ---------------------------------------------------------------------------
// Zone definition
// ---------------------------------------------------------------------------

router.post('/zones', authMiddleware, async (req, res) => {
  try {
    const data = await geofencingService.createGeofence({ ...req.body, createdBy: req.user?.id });
    res.status(201).json({ success: true, data });
  } catch (e) { fail(res, e); }
});

router.get('/zones', authMiddleware, async (req, res) => {
  try {
    const data = await geofencingService.listGeofences(req.query);
    res.json({ success: true, data });
  } catch (e) { fail(res, e); }
});

router.get('/zones/:id', authMiddleware, async (req, res) => {
  try {
    const data = await geofencingService.getGeofence(req.params.id);
    res.json({ success: true, data });
  } catch (e) { fail(res, e); }
});

router.put('/zones/:id', authMiddleware, async (req, res) => {
  try {
    const data = await geofencingService.updateGeofence(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (e) { fail(res, e); }
});

router.delete('/zones/:id', authMiddleware, async (req, res) => {
  try {
    const data = await geofencingService.deactivateGeofence(req.params.id);
    res.json({ success: true, data });
  } catch (e) { fail(res, e); }
});

router.get('/zones/:id/events', authMiddleware, async (req, res) => {
  try {
    const data = await geofencingService.listGeofenceEvents(req.params.id, req.query);
    res.json({ success: true, ...data });
  } catch (e) { fail(res, e); }
});

router.get('/zones/:id/current', authMiddleware, async (req, res) => {
  try {
    const data = await geofencingService.getCurrentOccupants(req.params.id);
    res.json({ success: true, count: data.length, data });
  } catch (e) { fail(res, e); }
});

router.post('/check-polygon', authMiddleware, async (req, res) => {
  try {
    const { latitude, longitude, polygon } = req.body || {};
    const data = geofencingService.checkPolygon(latitude, longitude, polygon);
    res.json({ success: true, data });
  } catch (e) { fail(res, e); }
});

// ---------------------------------------------------------------------------
// Use case 1 — manual labour/farmer check-in
// ---------------------------------------------------------------------------

router.post('/checkins', authMiddleware, async (req, res) => {
  try {
    const { geofenceId, latitude, longitude, accuracyM } = req.body;
    const data = await geofencingService.checkIn({
      geofenceId,
      userId: req.user?.id,
      userRole: req.user?.role,
      latitude,
      longitude,
      accuracyM,
    });
    res.json({ success: true, data });
  } catch (e) { fail(res, e); }
});

router.get('/checkins', authMiddleware, async (req, res) => {
  try {
    const data = await geofencingService.checkInHistory({
      userId: req.query.userId || req.user?.id,
      geofenceId: req.query.geofenceId,
      limit: req.query.limit,
    });
    res.json({ success: true, data });
  } catch (e) { fail(res, e); }
});

// ---------------------------------------------------------------------------
// Use case 2 — driver/shipment zone arrival (reads existing driver_location)
// ---------------------------------------------------------------------------

router.post('/driver-zone-check', authMiddleware, async (req, res) => {
  try {
    const { geofenceId, driverId, shipmentId } = req.body;
    const data = await geofencingService.checkDriverZoneArrival({ geofenceId, driverId, shipmentId });
    res.json({ success: true, data });
  } catch (e) { fail(res, e); }
});

module.exports = router;
