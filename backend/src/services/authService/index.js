'use strict';

/**
 * Compatibility entry point for callers that explicitly import the former
 * split authentication directory. Authentication logic is canonical in
 * ../authService.js.
 */
module.exports = require('../authService.js');
