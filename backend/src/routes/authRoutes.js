/**
 * Authentication Routes
 *
 * This file used to be a self-contained mock: an in-memory `Map` of users with
 * plaintext passwords, and tokens of the form `jwt_<id>_<timestamp>` that were
 * not JWTs at all. It answered `success: true` to every registration while
 * persisting nothing, and the tokens it issued were rejected by
 * middleware/auth.js — which validates real JWTs via
 * services/dual-use/authService. The result was an API where sign-up appeared
 * to work, no user ever reached the database, and no protected endpoint could
 * be called by anyone.
 *
 * The real implementation already existed in services/dual-use/authService.js:
 * PostgreSQL-backed registration and login, hashed passwords, refresh tokens,
 * two-factor setup/verify/disable, OAuth, `/me`, and a dedicated 5-req/60s
 * brute-force limiter on the credential endpoints. It exports a ready router
 * that was only reachable at the incidental path
 * /api/v1/dual-use/auth-service/*, which nothing called.
 *
 * This module now delegates to that router, so /api/v1/auth and /api/auth
 * serve the real thing. Every route the mock offered (login, register, logout,
 * refresh) is present in the real router, which additionally provides 2FA,
 * OAuth and /me — so nothing is lost by the swap.
 */

const { router } = require('../services/dual-use/authService');

module.exports = router;
