// Service for M030 Module — Pest & Disease Incident Tracker
//
// Logs pest/disease sightings and computes a regional outbreak-risk score
// by looking at how many recent, nearby incidents of the same
// pest/disease have been reported, weighted by severity and recency.
const { logger } = require('../../utils/logger');
const { getPostgreSQL } = require('../../database/connection');

const tableName = 'farmer_m030_items';

const OUTBREAK_WINDOW_DAYS = 14;
const RISK_THRESHOLDS = { high: 8, medium: 4 }; // weighted-incident-score cutoffs

function daysAgo(dateStr) {
  return Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

/**
 * Score outbreak risk for a region+pest from a set of incident records:
 * [{ date, severity (1-5), region, pest_or_disease }]
 * Each incident contributes severity * recency_decay to the score, where
 * recency_decay linearly fades from 1.0 (today) to 0 at the window edge.
 */
function computeOutbreakRisk(incidents, windowDays = OUTBREAK_WINDOW_DAYS) {
  const recent = (incidents || []).filter(i => {
    const age = daysAgo(i.date);
    return age >= 0 && age <= windowDays && typeof i.severity === 'number';
  });

  let score = 0;
  for (const i of recent) {
    const age = daysAgo(i.date);
    const recencyDecay = 1 - (age / windowDays);
    score += i.severity * recencyDecay;
  }
  score = Math.round(score * 10) / 10;

  let level = 'low';
  if (score >= RISK_THRESHOLDS.high) level = 'high';
  else if (score >= RISK_THRESHOLDS.medium) level = 'medium';

  return {
    incident_count: recent.length,
    weighted_score: score,
    risk_level: level,
    window_days: windowDays,
    reasoning: `${recent.length} incident(s) in the last ${windowDays} days, severity-weighted and recency-decayed to a score of ${score} ` +
      `(thresholds: >=${RISK_THRESHOLDS.high} high, >=${RISK_THRESHOLDS.medium} medium, else low).`
  };
}

async function listItems({ page = 1, limit = 20 } = {}) {
  const pg = getPostgreSQL(); if (!pg) throw new Error('Database not initialized');
  const offset = (page - 1) * limit;
  const totalRes = await pg.query(`SELECT COUNT(*) FROM ${tableName}`);
  const total = parseInt(totalRes.rows[0].count || '0');
  const res = await pg.query(`SELECT * FROM ${tableName} ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
  return { items: res.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function getItem(id) {
  const pg = getPostgreSQL(); if (!pg) throw new Error('Database not initialized');
  const res = await pg.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
  return res.rows[0] || null;
}

async function createItem(payload) {
  const pg = getPostgreSQL(); if (!pg) throw new Error('Database not initialized');
  const res = await pg.query(`INSERT INTO ${tableName} (data, created_at) VALUES ($1, NOW()) RETURNING *`, [payload]);
  return res.rows[0];
}

async function updateItem(id, payload) {
  const pg = getPostgreSQL(); if (!pg) throw new Error('Database not initialized');
  const res = await pg.query(`UPDATE ${tableName} SET data = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [payload, id]);
  return res.rows[0] || null;
}

async function deleteItem(id) {
  const pg = getPostgreSQL(); if (!pg) throw new Error('Database not initialized');
  const res = await pg.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING id`, [id]);
  return !!res.rows[0];
}

async function outbreakRiskForRegion(region, pest) {
  let incidents = [];
  try {
    const pg = getPostgreSQL();
    if (pg) {
      const res = await pg.query(
        `SELECT data FROM ${tableName} WHERE data->>'region' = $1 AND data->>'pest_or_disease' = $2`,
        [String(region), String(pest)]
      );
      incidents = res.rows.map(r => r.data);
    }
  } catch (error) {
    logger.warn('M030 outbreakRiskForRegion: DB lookup failed', { error: error.message });
  }
  return computeOutbreakRisk(incidents);
}

module.exports = {
  listItems, getItem, createItem, updateItem, deleteItem,
  computeOutbreakRisk, outbreakRiskForRegion
};
