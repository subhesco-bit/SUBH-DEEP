const validateBody = (schema) => (req, res, next) => {
  if (!schema || typeof schema.validate !== 'function') return next();
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, error: error.details?.[0]?.message || 'Invalid request body' });
  }
  next();
};

module.exports = { validateBody };
