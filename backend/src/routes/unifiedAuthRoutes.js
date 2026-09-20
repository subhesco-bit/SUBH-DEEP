/**
 * UNIFIED AUTHENTICATION ROUTES (12 endpoints)
 * Single identity authority replacing fragmented authRoutes + middleware
 */

import express from 'express';
import UnifiedAuthenticationService from '../services/UnifiedAuthenticationService.js';

export function setupUnifiedAuthRoutes(app, database, config) {
  const router = express.Router();
  const authService = new UnifiedAuthenticationService(database, config);

  // Middleware: Verify token and attach user to request
  const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const verified = await authService.verifyAccessToken(token);
    if (!verified.valid) {
      return res.status(401).json({ error: verified.error });
    }

    req.userId = verified.userId;
    next();
  };

  // ===== PUBLIC ENDPOINTS =====

  router.post('/register', async (req, res) => {
    try {
      const result = await authService.register(req.body);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const result = await authService.login(req.body);
      if (result.mfaRequired) {
        return res.status(200).json(result); // Return with mfaRequired flag
      }
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  });

  router.post('/mfa/verify', async (req, res) => {
    try {
      // Verify MFA code (userId should come from session after initial login)
      const result = await authService.verifyMFA(req.body.userId, req.body.code);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  });

  router.post('/token/refresh', async (req, res) => {
    try {
      const result = await authService.refreshAccessToken(req.body.refreshToken);
      res.json(result);
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  });

  router.post('/password/reset-request', async (req, res) => {
    try {
      const result = await authService.requestPasswordReset(req.body.email);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/password/reset', async (req, res) => {
    try {
      const result = await authService.resetPassword(req.body.token, req.body.newPassword);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // ===== PROTECTED ENDPOINTS =====

  router.post('/logout', authMiddleware, async (req, res) => {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const result = await authService.logout(req.userId, token);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/mfa/setup', authMiddleware, async (req, res) => {
    try {
      const result = await authService.setupMFA(req.userId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.get('/profile', authMiddleware, async (req, res) => {
    try {
      const [user] = await database.query(
        `SELECT id, email, name, role, identityLevel FROM users WHERE id = ?`,
        [req.userId]
      );
      res.json(user || { error: 'User not found' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.put('/profile', authMiddleware, async (req, res) => {
    try {
      const { name, phone } = req.body;
      await database.query(
        `UPDATE users SET name = ?, phone = ? WHERE id = ?`,
        [name, phone, req.userId]
      );
      res.json({ success: true, message: 'Profile updated' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  router.post('/verify-token', authMiddleware, async (req, res) => {
    // Just verify token is valid - if we reach here, it's valid
    res.json({ valid: true, userId: req.userId });
  });

  app.use('/api/v1/auth', router);
  return router;
}

export default setupUnifiedAuthRoutes;
