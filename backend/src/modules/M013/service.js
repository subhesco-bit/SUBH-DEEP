// Service for M013 Module — AI Prompt/Response Audit Log
// See README.md Strategy Card for the PII-risk scoring algorithm.
const { logger } = require('../../utils/logger');
const { getPostgreSQL } = require('../../database/connection');

const tableName = 'core_m013_items';

const PII_PATTERNS = [
  { type: 'email', weight: 2, regex: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi },
  { type: 'phone', weight: 2, regex: /\b[6-9]\d{9}\b/g },
  { type: 'aadhaar_like', weight: 5, regex: /\b\d{4}\s?\d{4}\s?\d{4}\b/g },
  { type: 'card_like', weight: 5, regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g }
];
const BANNED_TERMS = ['password', 'otp', 'cvv'];
const RISK_SCORE_CAP = 10;
const FLAG_THRESHOLD = 5;

async function listItems({ page = 1, limit = 20 } = {}) {
  const pg = getPostgreSQL(); if(!pg) throw new Error('Database not initialized');
  const offset = (page - 1) * limit;
  const totalRes = await pg.query(`SELECT COUNT(*) FROM ${tableName}`);
  const total = parseInt(totalRes.rows[0].count || '0');
  const res = await pg.query(`SELECT * FROM ${tableName} ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
  return { items: res.rows, pagination: { page, limit, total, totalPages: Math.ceil(total/limit) } };
}

async function getItem(id) {
  const pg = getPostgreSQL(); if(!pg) throw new Error('Database not initialized');
  const res = await pg.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
  return res.rows[0] || null;
}

async function createItem(payload) {
  const pg = getPostgreSQL(); if(!pg) throw new Error('Database not initialized');
  const res = await pg.query(`INSERT INTO ${tableName} (data, created_at) VALUES ($1, NOW()) RETURNING *`, [payload]);
  return res.rows[0];
}

async function updateItem(id, payload) {
  const pg = getPostgreSQL(); if(!pg) throw new Error('Database not initialized');
  const res = await pg.query(`UPDATE ${tableName} SET data = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [payload, id]);
  return res.rows[0] || null;
}

async function deleteItem(id) {
  const pg = getPostgreSQL(); if(!pg) throw new Error('Database not initialized');
  const res = await pg.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING id`, [id]);
  return !!res.rows[0];
}

function assessRisk(text) {
  const matches = [];
  let score = 0;
  const lower = (text || '').toLowerCase();
  for (const pattern of PII_PATTERNS) {
    const found = (text || '').match(pattern.regex);
    if (found && found.length) {
      matches.push({ type: pattern.type, count: found.length });
      score += pattern.weight;
    }
  }
  const bannedHit = BANNED_TERMS.find(term => lower.includes(term));
  score = Math.min(score, RISK_SCORE_CAP);
  const flagged = score >= FLAG_THRESHOLD || !!bannedHit;
  return { pii_matches: matches, risk_score: score, flagged, banned_term_hit: bannedHit || null };
}

/**
 * Log one prompt/response pair and compute its PII/risk assessment.
 */
async function logInteraction({ feature, model_id, prompt, response } = {}) {
  if (!feature || !prompt || typeof response === 'undefined') {
    throw new Error('feature, prompt and response are required');
  }
  const combinedText = `${prompt}\n${response}`;
  const risk = assessRisk(combinedText);
  const data = {
    feature,
    model_id: model_id || null,
    prompt,
    response,
    prompt_chars: prompt.length,
    response_chars: String(response).length,
    ...risk,
    reviewed: false,
    reviewer_notes: null,
    logged_at: new Date().toISOString()
  };
  return createItem(data);
}

/**
 * List entries that were auto-flagged for review, unreviewed first.
 */
async function listFlagged({ page = 1, limit = 50 } = {}) {
  const pg = getPostgreSQL(); if(!pg) throw new Error('Database not initialized');
  const offset = (page - 1) * limit;
  const totalRes = await pg.query(`SELECT COUNT(*) FROM ${tableName} WHERE (data->>'flagged')::boolean IS TRUE`);
  const total = parseInt(totalRes.rows[0].count || '0');
  const res = await pg.query(
    `SELECT * FROM ${tableName}
     WHERE (data->>'flagged')::boolean IS TRUE
     ORDER BY (data->>'reviewed')::boolean ASC NULLS FIRST, created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return { items: res.rows, pagination: { page, limit, total, totalPages: Math.ceil(total/limit) } };
}

/**
 * Mark a flagged entry reviewed, with optional reviewer notes.
 */
async function markReviewed(id, notes = null) {
  const existing = await getItem(id);
  if (!existing) return null;
  const data = { ...existing.data, reviewed: true, reviewer_notes: notes, reviewed_at: new Date().toISOString() };
  return updateItem(id, data);
}

module.exports = {
  listItems, getItem, createItem, updateItem, deleteItem,
  logInteraction, listFlagged, markReviewed, assessRisk
};
