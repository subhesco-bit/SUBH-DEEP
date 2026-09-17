/**
 * User Service (M002)
 * (2026-09-17) Duplicate consolidation: unified user management under canonical implementation
 * This file maintains API compatibility while delegating to userManagementService.
 * See .ai/architecture/DUPLICATE_CONSOLIDATION.md for consolidation strategy.
 */

'use strict';

module.exports = require('./userManagementService.js');