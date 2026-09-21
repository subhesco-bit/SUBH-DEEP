const express = require('express');
const { authMiddleware } = require('../middleware/auth.js');
const copilotSdkService = require('../services/copilotSdkService.js');

const router = express.Router();

router.use(authMiddleware);

router.get('/status', (req, res) => {
  res.json({ success: true, status: copilotSdkService.getStatus() });
});

router.post('/generate', async (req, res) => {
  try {
    const result = await copilotSdkService.generateResponse(req.body || {});
    return res.json({ success: true, result });
  } catch (error) {
    const statusCode = error.code === 'COPILOT_SDK_INVALID_PROMPT' ||
      error.code === 'COPILOT_SDK_PROMPT_TOO_LARGE' ||
      error.code === 'COPILOT_SDK_INVALID_SYSTEM_MESSAGE'
      ? 400
      : error.code === 'COPILOT_SDK_DISABLED' ||
        error.code === 'COPILOT_SDK_DEPENDENCY_UNAVAILABLE'
        ? 503
        : 502;

    return res.status(statusCode).json({
      success: false,
      code: error.code || 'COPILOT_SDK_REQUEST_FAILED',
      error: error.message,
    });
  }
});

module.exports = router;
