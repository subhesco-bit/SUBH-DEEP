'use strict';

/**
 * Authentication routes.
 *
 *   POST /auth/register  - create an account
 *   POST /auth/login     - exchange credentials for tokens
 *   POST /auth/refresh   - exchange a refresh token for a new access token
 *   POST /auth/logout    - revoke a refresh token
 *
 * WHAT THIS REPLACED
 *
 * This router used to be a mock. It kept users in a process-local Map, stored
 * and compared passwords in PLAINTEXT (`user.password !== password`), and
 * minted fabricated non-JWT strings of the form `jwt_<userId>_<timestamp>`.
 *
 * It was not inert. index.js requires the file without an app.use, but
 * DynamicRouteLoader walks the routes directory, so it WAS auto-mounted and
 * reachable — verified live against a running server:
 *
 *   POST /api/v1/auth/register -> 200, token "jwt_user_1789976455307_..."
 *   POST /api/v1/auth/login    -> 200 with the plaintext password
 *
 * Login and authorization were two unrelated systems: middleware/auth.js
 * verifies real signed JWTs, so a token minted here was rejected everywhere
 * else. That made it not an authorization bypass, but it was still a live
 * endpoint accepting and retaining plaintext credentials, and a login that
 * appeared to succeed while granting no access. No account survived a restart.
 *
 * It now delegates to services/dual-use/authService — the module
 * middleware/auth.js already trusts — which hashes with bcrypt and issues real
 * signed JWTs carrying the same issuer/audience the verifier checks. A token
 * from /auth/login is therefore accepted on a protected route, which the mock
 * could never achieve.
 *
 * The mock is gone rather than flag-disabled: a plaintext-credential store
 * behind an environment variable is still a plaintext-credential store, and
 * the ALLOW_MOCK_AUTH escape hatch that previously guarded it is no longer
 * read anywhere. Any account created against the mock must be treated as
 * compromised — those passwords were held in cleartext in memory.
 */

const express = require('express');

const router = express.Router();
const authService = require('../services/dual-use/authService');
const { authMiddleware } = require('../middleware/auth');
const { logger } = require('../utils/logger');

/**
 * The service throws Error with a message. Map the ones that describe a
 * client mistake onto their status codes; anything else is a 500, because
 * reporting an internal fault as a 400 sends the caller chasing their own
 * input for a defect that is ours.
 */
function statusForError(message) {
  const m = String(message || '');
  if (/already registered|already exists/i.test(m)) return 409;
  if (/invalid credentials|invalid refresh token|invalid token|expired/i.test(m)) return 401;
  if (/not found/i.test(m)) return 404;
  if (/required|invalid|must be|too short/i.test(m)) return 400;
  if (/unavailable|not configured/i.test(m)) return 503;
  return 500;
}

function fail(res, err, context) {
  const status = statusForError(err && err.message);
  // Log the detail; return only the message, never a stack or a query.
  logger.warn(`auth.${context} failed`, { error: err && err.message, status });
  return res.status(status).json({
    success: false,
    error: { message: (err && err.message) || 'Authentication failed', code: `AUTH_${context.toUpperCase()}_FAILED` },
  });
}

function requireFields(body, fields) {
  const missing = fields.filter((f) => !body || body[f] === undefined || body[f] === null || body[f] === '');
  if (missing.length) {
    const err = new Error(`${missing.join(', ')} ${missing.length > 1 ? 'are' : 'is'} required`);
    err.expected = true;
    throw err;
  }
}

/** POST /auth/register */
router.post('/register', async (req, res) => {
  try {
    requireFields(req.body, ['email', 'password']);
    const result = await authService.registerUser(req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    return fail(res, err, 'register');
  }
});

/** POST /auth/login */
router.post('/login', async (req, res) => {
  try {
    requireFields(req.body, ['email', 'password']);
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password, {
      ip: req.ip,
      userAgent: req.get('user-agent') || undefined,
    });
    return res.json({ success: true, data: result });
  } catch (err) {
    return fail(res, err, 'login');
  }
});

/** POST /auth/refresh */
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = (req.body && (req.body.refreshToken || req.body.refresh_token)) || null;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: { message: 'refreshToken is required', code: 'AUTH_REFRESH_FAILED' },
      });
    }
    const result = await authService.refreshAccessToken(refreshToken);
    return res.json({ success: true, data: result });
  } catch (err) {
    return fail(res, err, 'refresh');
  }
});

/**
 * POST /auth/logout
 *
 * Authenticated: revoking a refresh token is an action on a specific account,
 * and req.user.id is the only trustworthy source of whose it is. Taking a
 * userId from the body would let any caller revoke anyone's session.
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const refreshToken = (req.body && (req.body.refreshToken || req.body.refresh_token)) || null;
    const result = await authService.logoutUser(req.user.id, refreshToken);
    return res.json({ success: true, data: result });
  } catch (err) {
    return fail(res, err, 'logout');
  }
});

module.exports = router;
