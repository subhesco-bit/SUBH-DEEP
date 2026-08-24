/**
 * Real-time notification helpers backed by the live socket.io instance.
 *
 * FIXED (M10, 2026-08-16): This module used to wrap `./socketServer.js`, a
 * second, independent `ws`-based real-time transport whose `initialize()`
 * was never called anywhere. `governmentSchemeService.js`,
 * `insuranceClaimsService.js` and `preSeasonOrderService.js` all called into
 * that dead instance and silently no-op'd (no error, no notification ever
 * sent) — see FIXES.md M10. `backend/src/index.js` already runs a second,
 * *live* socket.io server (`const io = new Server(httpServer, ...)`) with
 * its own per-user room convention (`socket.on('join', userId) =>
 * socket.join('user:' + userId)`). Rather than also initializing the dead
 * `ws` layer (which would leave two competing, separately-authenticated
 * real-time transports running side by side), this module now exposes the
 * same call sites (`sendNotification`, `sendGovernmentAnnouncement`) backed
 * by that single live `io` instance. `socketServer.js` has been deleted —
 * it had no other callers (verified via repo-wide grep) and duplicated this
 * functionality on a second transport with no client anywhere in the
 * frontend actually connecting to it.
 */

const { logger } = require('../utils/logger');

let ioInstance = null;

/**
 * Called once from index.js right after `const io = new Server(...)` is
 * constructed, so later requests (which is when sendNotification etc. are
 * actually invoked) always see a ready instance.
 */
function setIO(io) {
  ioInstance = io;
}

function getIO() {
  return ioInstance;
}

/**
 * Send a notification-shaped event to a single user's room. Matches the
 * `user:<id>` room convention already established in index.js's
 * `socket.on('join', ...)` handler. Mirrors the graceful-fallback pattern
 * used elsewhere in this codebase (Postgres/Mongo/Redis) — if socket.io
 * hasn't been initialized yet (e.g. during tests) or no userId is given,
 * this no-ops with a debug log instead of throwing.
 */
function sendNotification(userId, notification) {
  if (!ioInstance || !userId) {
    logger.debug('sendNotification skipped: socket.io not initialized or no userId', { userId: !!userId });
    return false;
  }

  ioInstance.to(`user:${userId}`).emit('notification', {
    type: 'notification',
    timestamp: new Date().toISOString(),
    data: notification
  });
  return true;
}

/**
 * Broadcast a government announcement to every connected client.
 */
function sendGovernmentAnnouncement(announcement) {
  if (!ioInstance) {
    logger.debug('sendGovernmentAnnouncement skipped: socket.io not initialized');
    return false;
  }

  ioInstance.emit('government_announcement', {
    type: 'government_announcement',
    timestamp: new Date().toISOString(),
    data: announcement
  });
  return true;
}

module.exports = {
  setIO,
  getIO,
  sendNotification,
  sendGovernmentAnnouncement
};
