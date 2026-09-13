/**
 * unifiedAIRoutes — the canonical implementation for this resource.
 *
 * Consolidated from unifiedAIRoutes_merged.js on 2026-09-13, per
 * .ai/decisions/0001-module-lineage-consolidation.md and
 * .ai/consolidation/CONSOLIDATION_PLAN.md (Phase 3.1): the consolidated code
 * belongs in the canonical file; duplicates are retired once their unique
 * behaviour is preserved and verified.
 *
 * History (why this file looked empty before): dynamicRouteLoader.js derives a
 * mount path from the FILENAME, so this implementation was published at a
 * "...-merged" URL that nothing called, while this file — a generated stub whose
 * only endpoints were a POST / answering "Route operational" and a GET /health —
 * owned the path the frontend actually requests. The stub's blanket
 * router.use(authMiddleware) is deliberately NOT carried over: the code below
 * applies auth per route and several endpoints are intentionally public. Its
 * POST / reply is not carried over either — it answered { success: true }
 * without writing anything.
 */
/**
 * Root Unified AI routes.
 *
 * Keeps backend/src/index.js imports stable while using the real coordinator
 * and service shims under backend/src.
 */

'use strict';

const express = require('express');
const claudeAICoordinator = require('../core/claudeAICoordinator');
const { authMiddleware } = require('../middleware/auth');
const aiDomainAdapterRoutes = require('./aiDomainAdapterRoutes');

const logger = console; // TODO: use Winston/Pino logger

const router = express.Router();
// Liveness ping preserved from the generated stub this file used to contain.
// Declared first so a pattern route such as '/:id' cannot swallow it.
router.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', module: 'unifiedAIRoutes' });
});

router.use('/adapters', aiDomainAdapterRoutes);

const AGENTS = [
  {
    id: 'farmer-advisor',
    name: 'Farmer Advisor',
    description: 'Agricultural advisor for farmers',
    capabilities: ['crop advice', 'pest risk', 'market timing', 'scheme eligibility'],
  },
  {
    id: 'business-analyst',
    name: 'Business Analyst',
    description: 'Business intelligence and performance analysis',
    capabilities: ['financial analysis', 'KPI review', 'forecasting', 'risk assessment'],
  },
  {
    id: 'operations-manager',
    name: 'Operations Manager',
    description: 'Workflow and operating optimization',
    capabilities: ['resource allocation', 'scheduling', 'supply chain', 'workflow automation'],
  },
  {
    id: 'governance-agent',
    name: 'Governance Agent',
    description: 'Compliance, audit, and policy monitoring',
    capabilities: ['policy checks', 'audit trails', 'risk monitoring', 'governance reporting'],
  },
];

async function coordinate(req, res, requestType, agentPreference) {
  try {
    const userId = req.user?.id || 'anonymous';
    const sessionId = req.sessionID || req.headers['x-session-id'] || `session-${userId}`;
    const response = await claudeAICoordinator.coordinateAIRequest({
      requestType,
      query: req.body?.query,
      context: req.body?.context || {},
      userId,
      sessionId,
      agentPreference: req.body?.agentPreference || agentPreference,
    });

    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process AI request',
    });
  }
}

router.post('/unified', authMiddleware, (req, res) => {
  coordinate(req, res, req.body?.requestType || 'conversational', req.body?.agentPreference);
});

router.post('/conversational', authMiddleware, (req, res) => {
  coordinate(req, res, 'conversational', 'farmer-advisor');
});

router.post('/analytical', authMiddleware, (req, res) => {
  coordinate(req, res, 'analytical', 'business-analyst');
});

router.post('/automation', authMiddleware, (req, res) => {
  coordinate(req, res, 'automation', 'operations-manager');
});

router.post('/governance', authMiddleware, (req, res) => {
  coordinate(req, res, 'monitoring', 'governance-agent');
});

router.get('/agents', authMiddleware, (req, res) => {
  res.json({ success: true, data: AGENTS });
});

router.get('/usage', authMiddleware, (req, res) => {
  res.json({
    success: true,
    data: {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      byAgent: {},
      byRequestType: {},
      note: 'Usage aggregation requires ai_usage_tracking rows.',
    },
  });
});

module.exports = router;
