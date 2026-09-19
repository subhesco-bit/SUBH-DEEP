/**
 * Global Error Handler STUB (Section 23: Middleware) - incomplete, never
 * wired up (zero requires of this file found anywhere in backend/src as
 * of the 2026-09-19 duplicate-collapse pass).
 *
 * Renamed from errorHandler.js to errorHandlerStub.js to disambiguate from
 * backend/src/middleware/errorHandler.js (the real, mounted Express error
 * handler) and backend/src/core/errorClasses.js (formerly errorHandler.js
 * too - a typed error-class library), which shared this filename despite
 * being three unrelated implementations. This one also has an
 * incompatible export shape from the other two - `module.exports =
 * errorHandler` (a bare function) rather than `{ errorHandler, ... }` - so
 * a caller doing `const { errorHandler } = require(...)` against this file
 * would silently get `undefined`, another reason not to leave it sharing
 * a name that invites that mistake.
 *
 * Catches and formats all errors consistently (intended design; not done -
 * see TODO below).
 */
const logger = require('../../utils/logger');

function errorHandler(err, req, res, next) {
  // TODO: Implement error categorization and formatting
  logger.error('Global error handler', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    errorId: `error_${ Date.now()}`,
    timestamp: new Date(),
  });
}

module.exports = errorHandler;
