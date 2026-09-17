/**
 * Auth service configuration: JWT settings and OAuth provider config.
 *
 * Split out of the former monolithic services/authService.js (M11 - god
 * service split). The JWT_SECRET boot-time guard below must still run
 * exactly once, the first time the authService directory is required
 * (same as when this was inline in the single file) - it is unconditional
 * module-load code, so requiring this module has the same effect as before.
 */

const crypto = require('crypto');

// Production must always provide JWT_SECRET. Local dev/test gets an ephemeral
// process-local secret instead of a reusable literal that can leak into tokens.
const runtimeDevJwtSecret = crypto.randomBytes(32).toString('hex');

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'FATAL: JWT_SECRET is not set and NODE_ENV=production. Refusing to start ' +
      'with an insecure, hardcoded fallback JWT secret in production.'
    );
  }
  process.emitWarning(
    'JWT_SECRET is not set. Using an ephemeral local-dev secret; set JWT_SECRET for any shared environment.',
    { code: 'AFRERA_EPHEMERAL_JWT_SECRET' }
  );
}

// JWT Configuration
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || runtimeDevJwtSecret,
  accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  issuer: process.env.JWT_ISSUER || 'afrera-platform',
  audience: process.env.JWT_AUDIENCE || 'afrera-users'
};

// OAuth2 Configuration
const OAUTH_PROVIDERS = {
  google: {
    enabled: process.env.GOOGLE_OAUTH_ENABLED === 'true',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI
  },
  facebook: {
    enabled: process.env.FACEBOOK_OAUTH_ENABLED === 'true',
    clientId: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    redirectUri: process.env.FACEBOOK_REDIRECT_URI
  }
};

module.exports = { JWT_CONFIG, OAUTH_PROVIDERS };
