/**
 * Real backend routes for VoiceAssistant.jsx, backed by
 * services/legacy/voiceAIService.js. createSession -> createVoiceSession
 * (userId filled from auth), endSession -> endVoiceSession, getPreferences
 * -> getVoicePreferences (userId from auth), sendCommand ->
 * processVoiceCommand(sessionId, transcript, commandType, parameters)
 * (unwrapped from the page's single payload object).
 */
'use strict';

const express = require('express');
const router = express.Router();
const svc = require('../services/legacy/voiceAIService');

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
    res.status(400).json({ success: false, error: error.message });
  }
};

router.post('/voice-ai/session', wrap((req) => svc.createVoiceSession(req.user?.id, req.body.language)));
router.post('/voice-ai/session/:sessionId/end', wrap((req) => svc.endVoiceSession(req.params.sessionId)));
router.get('/voice-ai/preferences', wrap((req) => svc.getVoicePreferences(req.user?.id)));
router.post('/voice-ai/command', wrap((req) => svc.processVoiceCommand(req.body.session_id, req.body.transcript, req.body.command_type, req.body.parameters)));

module.exports = router;
