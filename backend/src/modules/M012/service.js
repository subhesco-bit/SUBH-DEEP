// Service for M012 Module — AI Model Performance Ledger
// See README.md Strategy Card for the scoring algorithm.
const { logger } = require('../../utils/logger');
const { getPostgreSQL } = require('../../database/connection');

const tableName = 'core_m012_items';
const SAMPLE_WINDOW = 200; // most recent calls considered per (model_id, task_type)
const LATENCY_SLA_MS = 1500; // latency at/above this normalizes to 0 speed score
const DEGRADED_SUCCESS_RATE = 0.8;
const DEGRADED_MIN_SAMPLES = 5;

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

/**
 * Record the outcome of one AI model call.
 */
async function recordCall({ model_id, task_type, latency_ms, success, accuracy_score = null, error_message = null } = {}) {
  if (!model_id || !task_type) throw new Error('model_id and task_type are required');
  if (typeof latency_ms !== 'number' || latency_ms < 0) throw new Error('latency_ms must be a non-negative number');
  const data = {
    model_id, task_type,
    latency_ms,
    success: !!success,
    accuracy_score: typeof accuracy_score === 'number' ? accuracy_score : null,
    error_message: success ? null : (error_message || null),
    recorded_at: new Date().toISOString()
  };
  return createItem(data);
}

function normalizedSpeed(avgLatencyMs) {
  return Math.max(0, Math.min(1, 1 - (avgLatencyMs / LATENCY_SLA_MS)));
}

function computeScore({ successRate, avgLatencyMs, avgAccuracy }) {
  const accuracyComponent = avgAccuracy === null ? successRate : avgAccuracy; // fall back to success rate when no accuracy data recorded
  const score = 0.5 * successRate + 0.3 * normalizedSpeed(avgLatencyMs) + 0.2 * accuracyComponent;
  return Math.round(score * 1000) / 1000;
}

async function fetchRecentCalls({ model_id = null, task_type = null } = {}) {
  const pg = getPostgreSQL(); if(!pg) throw new Error('Database not initialized');
  const clauses = [];
  const params = [];
  if (model_id) { params.push(model_id); clauses.push(`data->>'model_id' = $${params.length}`); }
  if (task_type) { params.push(task_type); clauses.push(`data->>'task_type' = $${params.length}`); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  params.push(SAMPLE_WINDOW);
  const res = await pg.query(
    `SELECT data FROM ${tableName} ${where} ORDER BY created_at DESC LIMIT $${params.length}`,
    params
  );
  return res.rows.map(r => r.data);
}

function aggregateCalls(calls) {
  const n = calls.length;
  if (n === 0) return null;
  const successCount = calls.filter(c => c.success).length;
  const latencies = calls.map(c => c.latency_ms).filter(v => typeof v === 'number');
  const accuracies = calls.map(c => c.accuracy_score).filter(v => typeof v === 'number');
  const avgLatencyMs = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : LATENCY_SLA_MS;
  const avgAccuracy = accuracies.length ? accuracies.reduce((a, b) => a + b, 0) / accuracies.length : null;
  const successRate = successCount / n;
  return {
    sample_size: n,
    success_rate: Math.round(successRate * 1000) / 1000,
    avg_latency_ms: Math.round(avgLatencyMs),
    avg_accuracy: avgAccuracy === null ? null : Math.round(avgAccuracy * 1000) / 1000,
    score: computeScore({ successRate, avgLatencyMs, avgAccuracy }),
    degraded: n >= DEGRADED_MIN_SAMPLES && successRate < DEGRADED_SUCCESS_RATE
  };
}

/**
 * Rank all models seen for a task_type (or globally) by composite score.
 */
async function getLeaderboard({ task_type = null, limit = 20 } = {}) {
  const calls = await fetchRecentCalls({ task_type });
  const byModel = new Map();
  for (const call of calls) {
    if (!call || !call.model_id) continue;
    if (!byModel.has(call.model_id)) byModel.set(call.model_id, []);
    byModel.get(call.model_id).push(call);
  }
  const leaderboard = [];
  for (const [model_id, modelCalls] of byModel.entries()) {
    const stats = aggregateCalls(modelCalls);
    if (stats) leaderboard.push({ model_id, task_type, ...stats });
  }
  leaderboard.sort((a, b) => b.score - a.score);
  return leaderboard.slice(0, limit);
}

/**
 * Stats for a single model, optionally scoped to one task_type.
 */
async function getModelStats(model_id, { task_type = null } = {}) {
  if (!model_id) throw new Error('model_id is required');
  const calls = await fetchRecentCalls({ model_id, task_type });
  const stats = aggregateCalls(calls);
  if (!stats) return { model_id, task_type, sample_size: 0, message: 'No recorded calls for this model yet.' };
  return { model_id, task_type, ...stats };
}

module.exports = {
  listItems, getItem, createItem, updateItem, deleteItem,
  recordCall, getLeaderboard, getModelStats
};
