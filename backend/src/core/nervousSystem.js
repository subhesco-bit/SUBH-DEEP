const { logger } = require('../utils/logger');

// AFRERA Nervous System - Enterprise Route Control. Minimal scaffold: logs
// startup so the platform boots; real sensor ingestion / route-control logic
// is not yet implemented here (see core/effectors.js and core/outcomeSink.js
// for the actually-wired signal pipeline this was meant to feed).
function initializeNervousSystem() {
  logger.info('Nervous system initialized (no-op scaffold)');
}

function startSensorDataCollection() {
  logger.info('Sensor data collection started (no-op scaffold)');
}

module.exports = { initializeNervousSystem, startSensorDataCollection };
