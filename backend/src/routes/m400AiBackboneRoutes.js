/**
 * M400 AI Backbone Routes
 *
 * 2026-08-31: wires up a real, substantial (743-line) enterprise AI
 * coordination service that has sat in modules/M400_AI_BACKBONE/backend/
 * service.js completely unreferenced by backend/src since it was written -
 * not a duplicate of the other "AI backbone" module folders (M400_AI_CORE,
 * M401_AI_GATEWAY, M402_AI_ORCHESTRATION are all thin re-export shims that
 * already correctly defer to the real, already-mounted legacy services -
 * see their own file headers), and not the same thing as the already-live
 * backend/src/routes/aiBackboneRoutes.js (that one wraps
 * services/legacy/aiBackboneService.js, a different, real multi-provider
 * AI call router) - genuinely orphaned code, mounted here under its own
 * non-colliding path.
 *
 * THE TWO BACKBONES ARE INTENTIONALLY SEPARATE:
 *
 *   this one (INTERNAL)  /api/v1/m400-ai-backbone
 *     cross-module decision, strategy, learning, prediction, coordination
 *
 *   aiBackboneRoutes     /api/aibackbone      <- NOT /api/v1/ai-backbone
 *     the EXTERNAL provider call router: Claude, OpenAI, Gemini, Azure
 *
 * They are interdependent through the shared ai_decisions and ai_strategies
 * tables, not by calling each other. This header previously gave the external
 * one's path as /api/v1/ai-backbone, which 404s — the real mount is
 * app.use('/api/aibackbone', ...) in index.js. That wrong path cost an audit
 * an hour, so it is stated explicitly here.
 *
 * The service self-creates its own tables (ai_decisions, ai_strategies,
 * ai_intelligence_cache, ai_metrics) idempotently in initialize(), so no
 * separate migration is needed - confirmed by reading initializeDatabase().
 *
 * Mounted admin-only: this coordinates decisions/strategy across modules,
 * not a farmer/consumer-facing surface.
 */

'use strict';

const express = require('express');
const router = express.Router();
const AIBackboneService = require('../modules/M400_AI_BACKBONE/backend/service');
const { authMiddleware } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');

/**
 * Use the instance core/ai/aiSystem.js initialised at boot, and only fall back
 * to a private one if the AI system did not start.
 *
 * This file used to unconditionally `new AIBackboneService()`. Once aiSystem
 * began initialising a backbone of its own there were two live instances: the
 * system's, with all five engines operational, and this route's, still lazily
 * uninitialised. The health endpoint reported every engine "failed" while the
 * platform's own status reported them healthy — both were telling the truth
 * about different objects.
 */
let fallbackBackbone = null;

function getBackbone() {
  try {
    const shared = require('../core/ai/aiSystem').backbone();
    if (shared) return shared;
  } catch {
    // aiSystem unavailable — fall through to a private instance.
  }
  if (!fallbackBackbone) fallbackBackbone = new AIBackboneService();
  return fallbackBackbone;
}

let initPromise = null;

function ensureInitialized() {
  const backbone = getBackbone();
  // The shared instance is already initialised by aiSystem.start().
  if (backbone.decisionEngine) return Promise.resolve({ success: true, shared: true });

  if (!initPromise) {
    initPromise = backbone.initialize({}).then((result) => {
      if (!result || result.success === false) {
        // Allow a retry on the next request rather than caching a failed init forever.
        initPromise = null;
        throw new Error(result?.error?.message || 'AI Backbone failed to initialize');
      }
      return result;
    });
  }
  return initPromise;
}

// GET /api/v1/m400-ai-backbone/health - health check, safe to call before full init
router.get('/health', async (req, res) => {
  try {
    const health = await getBackbone().healthCheck();
    res.status(health.status === 'healthy' ? 200 : 503).json(health);
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// POST /api/v1/m400-ai-backbone/execute - generic dispatch matching the service's own
// execute(operation, parameters, context) contract (operations: coordinate,
// decide, strategize, learn, predict, getIntelligence, registerModule, unregisterModule)
router.post('/execute', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await ensureInitialized();
    const { operation, parameters, context } = req.body || {};
    if (!operation) {
      return res.status(400).json({ success: false, error: 'operation is required' });
    }
    const result = await getBackbone().execute(operation, parameters || {}, context || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/m400-ai-backbone/coordinate
router.post('/coordinate', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await ensureInitialized();
    const result = await getBackbone().coordinateAIRequest(req.body || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/m400-ai-backbone/decide
router.post('/decide', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await ensureInitialized();
    const { parameters, context } = req.body || {};
    const result = await getBackbone().makeEnterpriseDecision(parameters || {}, context || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/m400-ai-backbone/strategize
router.post('/strategize', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await ensureInitialized();
    const { parameters, context } = req.body || {};
    const result = await getBackbone().generateEnterpriseStrategy(parameters || {}, context || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/m400-ai-backbone/intelligence - cross-module intelligence cache lookup
router.get('/intelligence', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await ensureInitialized();
    const result = await getBackbone().getCrossModuleIntelligence(req.query || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/m400-ai-backbone/modules - register a module with the backbone
router.post('/modules', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await ensureInitialized();
    const result = await getBackbone().registerModule(req.body || {});
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/m400-ai-backbone/modules/:moduleId - unregister a module
router.delete('/modules/:moduleId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await ensureInitialized();
    const result = await getBackbone().unregisterModule({ moduleId: req.params.moduleId });
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
