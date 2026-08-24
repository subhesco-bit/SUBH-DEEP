/**
 * Authentication Middleware
 * Provides JWT verification and authorization for protected routes
 */

const { verifyToken, hasPermission } = require('../services/authService');
const { logger } = require('../utils/logger');

// SECURITY (C1, fixed 2026-08-16): SKIP_AUTH used to grant every unauthenticated
// caller a default identity with no NODE_ENV guard at all - a full auth bypass
// if the flag ever leaked into a production environment. Fail closed at module
// load (boot time) instead of silently ignoring the misconfiguration.
if (process.env.SKIP_AUTH === 'true' && process.env.NODE_ENV === 'production') {
  throw new Error(
    'FATAL: SKIP_AUTH=true is set while NODE_ENV=production. This would disable ' +
    'authentication for every request. Refusing to start - unset SKIP_AUTH or fix NODE_ENV.'
  );
}

/**
 * Authentication middleware - verifies JWT token
 */
function authMiddleware(req, res, next) {
  try {
    // If SKIP_AUTH is explicitly set, use a default test user (useful for dev/test).
    // Gated to non-production; the production case is refused at boot above.
    if (process.env.SKIP_AUTH === 'true' && process.env.NODE_ENV !== 'production') {
      req.user = {
        id: process.env.TEST_USER_ID || 'test-user',
        email: process.env.TEST_USER_EMAIL || 'test@example.com',
        role: 'consumer',
        permissions: []
      };
      return next();
    }

    // (L9, consolidated 2026-08-17): this used to have a separate
    // NODE_ENV === 'test' branch with relaxed token verification, making a
    // third auth code path alongside the SKIP_AUTH bypass above and the
    // normal path below. verifyToken() no longer relaxes checks by
    // environment (see authService.js), and every token minted by this app
    // (generateAccessToken) always includes userId/email/role/permissions,
    // so the normal path below is correct for test mode too. One
    // verification path outside the explicit SKIP_AUTH dev/test bypass.
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'No authorization header provided',
        code: 'NO_TOKEN'
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }
    
    const payload = verifyToken(token);
    
    // Attach user info to request
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions
    };
    
    next();
  } catch (error) {
    logger.error('Authentication failed', { error: error.message, stack: error.stack });
    
    if (error.message === 'Token expired') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    return res.status(401).json({ 
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * Role-based authorization middleware
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole: req.user.role
      });
    }
    
    next();
  };
}

/**
 * Permission-based authorization middleware
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }
    
    if (!hasPermission(req.user.permissions, permission)) {
      return res.status(403).json({ 
        error: 'Permission denied',
        code: 'PERMISSION_DENIED',
        requiredPermission: permission
      });
    }
    
    next();
  };
}

/**
 * Optional authentication - doesn't fail if no token
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      
      if (token) {
        const payload = verifyToken(token);
        req.user = {
          id: payload.userId,
          email: payload.email,
          role: payload.role,
          permissions: payload.permissions
        };
      }
    }
    
    next();
  } catch (error) {
    // Don't fail, just continue without user
    next();
  }
}

/**
 * Rate limiting by user
 */
function userRateLimit(limit = 100, windowMs = 60000) {
  const userRequests = new Map();
  
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }
    
    const userId = req.user.id;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean old entries
    const userWindow = userRequests.get(userId) || [];
    const recentRequests = userWindow.filter(time => time > windowStart);
    
    if (recentRequests.length >= limit) {
      return res.status(429).json({ 
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        limit: limit,
        window: windowMs
      });
    }
    
    recentRequests.push(now);
    userRequests.set(userId, recentRequests);
    
    next();
  };
}

module.exports = {
  authMiddleware,
  requireRole,
  requirePermission,
  optionalAuth,
  userRateLimit
};
