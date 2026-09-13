/**
 * Password hashing helpers. Split out of the former monolithic
 * services/authService.js (M11).
 */

const bcrypt = require('bcryptjs');

/**
 * Hash password
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
async function comparePassword(password, hash) {
  // Fail closed for legacy plaintext, malformed fixtures, and non-string input.
  if (typeof password !== 'string' || typeof hash !== 'string' ||
      !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(hash)) return false;
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

module.exports = { hashPassword, comparePassword };
