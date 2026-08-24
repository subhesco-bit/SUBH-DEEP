const { logger } = require('../utils/logger');

// backupService — minimal scaffold.
async function initialize() {
  logger.info('backupService: initialized (no-op scaffold)');
}

module.exports = { initialize };
