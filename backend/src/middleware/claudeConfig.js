function ensureClaudeConfigured(req, res, next) {
  if (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY) {
    return next();
  }

  return res.status(503).json({
    success: false,
    code: 'CLAUDE_API_NOT_CONFIGURED',
    error: 'Claude API is not configured',
  });
}

module.exports = { ensureClaudeConfigured };
