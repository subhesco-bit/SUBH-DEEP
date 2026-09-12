/**
 * Real backend routes for AuthorizationPage.jsx, backed by
 * services/legacy/roleManagementService.js. getUsers -> getUsersWithRoles
 * (name diff). updateUserRole and getAuditLog, which the page also calls,
 * have no matching implementation anywhere - not wired, flagged instead
 * of faked.
 */
'use strict';

const express = require('express');
const router = express.Router();
const svc = require('../services/legacy/roleManagementService');

try {
  const { authMiddleware } = require('../middleware/auth');
  router.use(authMiddleware);
} catch (e) {
  // Auth optional
}

const wrap = (fn) => async (req, res) => {
  try {
    res.json({ success: true, data: await fn(req) });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

router.get('/authorization/roles', wrap((req) => svc.getRoles(req.query)));
router.get('/authorization/users', wrap(() => svc.getUsersWithRoles()));

module.exports = router;
