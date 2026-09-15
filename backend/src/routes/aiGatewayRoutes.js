/** Governed multi-provider AI gateway. */
'use strict';

const express = require('express');
const aiGateway = require('../services/aiGatewayService');
const aiBackbone = require('../services/legacy/aiBackboneService');
const { authMiddleware, requireRole, userRateLimit } = require('../middleware/auth');

const router = express.Router();
const generationLimit = userRateLimit(30, 60_000);
const MODEL_FIELDS = Object.freeze({
  claude: 'model',
  openai: 'model',
  gemini: 'model',
  azure: 'deployment',
  huggingface: 'defaultModel',
  ollama: 'model',
});

function publicProviderState() {
  const status = aiBackbone.getAIProviderStatus();
  return Object.entries(status.providers).map(([provider, config]) => ({
    provider,
    enabled: Boolean(config.enabled),
    configured: Boolean(config.configured),
    available: status.availableProviders.includes(provider),
    model: config[MODEL_FIELDS[provider]] || null,
  }));
}

function generationHttpStatus(result) {
  if (result.success) return 200;
  return result.status === 'not_configured' ? 503 : 502;
}

function generationInput(body = {}, user = {}) {
  return {
    moduleId: body.moduleId || 'enterprise-ai',
    capability: body.capability || 'governed-chat',
    prompt: body.prompt,
    context: body.context || {},
    provider: body.provider,
    model: body.model,
    maxTokens: body.maxTokens,
    temperature: body.temperature,
    companyId: body.companyId,
    actorId: user.id,
  };
}

router.get('/health', (_req, res) => {
  const providers = publicProviderState();
  res.json({
    success: true,
    status: providers.some(provider => provider.available) ? 'ready' : 'unconfigured',
    module: 'aiGatewayRoutes',
    availableProviders: providers.filter(provider => provider.available).map(provider => provider.provider),
  });
});

router.post('/chat', authMiddleware, generationLimit, async (req, res) => {
  try {
    const result = await aiGateway.run(generationInput(req.body, req.user));
    res.status(generationHttpStatus(result)).json(result);
  } catch (error) {
    const validation = /required|exceeds|unknown/i.test(error.message);
    res.status(validation ? 400 : 500).json({
      success: false,
      error: validation ? error.message : 'AI request failed',
    });
  }
});

router.post('/stream', authMiddleware, generationLimit, async (req, res) => {
  try {
    const result = await aiGateway.run(generationInput(req.body, req.user));
    res.status(generationHttpStatus(result));
    res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write(`event: ${result.success ? 'completion' : 'error'}\n`);
    res.write(`data: ${JSON.stringify(result)}\n\n`);
    res.end();
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

router.get('/statistics', authMiddleware, (_req, res) => {
  const { statistics, availableProviders } = aiBackbone.getAIProviderStatus();
  res.json({ success: true, data: { ...statistics, availableProviders } });
});

router.get('/providers', authMiddleware, (_req, res) => {
  res.json({ success: true, data: publicProviderState() });
});

router.get('/models/:provider', authMiddleware, (req, res) => {
  const provider = publicProviderState().find(item => item.provider === req.params.provider);
  if (!provider) return res.status(404).json({ success: false, error: 'Unknown AI provider' });
  return res.json({
    success: true,
    data: { provider: provider.provider, configuredModel: provider.model, available: provider.available },
  });
});

router.put('/providers/:provider/enable', authMiddleware, requireRole('admin', 'super_admin'), (req, res) => {
  const config = aiBackbone.AI_PROVIDERS[req.params.provider];
  if (!config) return res.status(404).json({ success: false, error: 'Unknown AI provider' });
  if (req.params.provider !== 'ollama' && !config.apiKey) {
    return res.status(409).json({ success: false, error: 'Provider credentials are not configured' });
  }
  config.enabled = true;
  return res.json({ success: true, data: publicProviderState().find(item => item.provider === req.params.provider) });
});

router.put('/providers/:provider/disable', authMiddleware, requireRole('admin', 'super_admin'), (req, res) => {
  const config = aiBackbone.AI_PROVIDERS[req.params.provider];
  if (!config) return res.status(404).json({ success: false, error: 'Unknown AI provider' });
  config.enabled = false;
  return res.json({ success: true, data: publicProviderState().find(item => item.provider === req.params.provider) });
});

module.exports = router;
