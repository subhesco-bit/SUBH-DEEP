/**
 * Library AI Workspace Routes
 *
 * Provider-neutral API so any coding agent (Claude, ChatGPT/Codex, Copilot,
 * Devin, Visual Studio agent, or a human reviewer) can use the same
 * EBDESIGN Library index (_EBDESIGN_LIBRARY/25_DISCOVERY_INDEX) as a
 * shared source of truth for file lookup, safe bounded content access,
 * improvement-workspace assembly, and agent-action audit logging - with
 * no external AI provider key required.
 *
 * Backed by services/libraryAIWorkspaceService.js, which existed fully
 * implemented (real CSV-streaming search, safe-read guardrails, audit
 * event logging) but was never mounted to a live route. Endpoint list
 * matches svc.getStatus().endpoints exactly.
 */
'use strict';

const express = require('express');
const router = express.Router();
const svc = require('../services/libraryAIWorkspaceService');

try {
  const { authMiddleware } = require('../middleware/auth');
  router.use(authMiddleware);
} catch (e) {
  // Auth optional
}

const wrap = (fn) => async (req, res) => {
  try {
    res.json({ success: true, data: await fn(req) });
  } catch (error) {
    res.status(error.status || 400).json({ success: false, error: error.message });
  }
};

router.get('/status', wrap(() => svc.getStatus()));

router.get('/files/search', wrap((req) => svc.searchFiles(req.query)));

router.get('/files/:libraryId', wrap(async (req) => {
  const file = await svc.findByLibraryId(req.params.libraryId);
  if (!file) {
    const err = new Error('library_id_not_found');
    err.status = 404;
    throw err;
  }
  return file;
}));

router.get('/files/:libraryId/content', wrap((req) => svc.readFileContent(req.params.libraryId, req.query)));

router.post('/context', wrap((req) => svc.buildWorkspace(req.body)));

router.post('/improvement-workspace', wrap((req) => svc.buildWorkspace(req.body)));

router.post('/events', wrap((req) => svc.recordAgentEvent(req.body)));

module.exports = router;
