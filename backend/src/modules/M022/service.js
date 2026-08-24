// Service for M022 Module — AI Model Routing Policy Registry
// See README.md Strategy Card for the weighted scoring algorithm.
const { logger } = require('../../utils/logger');
const { getPostgreSQL } = require('../../database/connection');

const tableName = 'farmer_m022_items';
const DEFAULT_WEIGHTS = { cost: 0.3, latency: 0.3, accuracy: 0.4 };

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

async function findPolicyRow(task_type) {
  const pg = getPostgreSQL(); if(!pg) throw new Error('Database not initialized');
  const res = await pg.query(`SELECT * FROM ${tableName} WHERE data->>'task_type' = $1 ORDER BY created_at DESC LIMIT 1`, [task_type]);
  return res.rows[0] || null;
}

/**
 * Register (or replace) the candidate model list for a task_type.
 */
async function registerPolicy({ task_type, candidates, default_weights = null } = {}) {
  if (!task_type) throw new Error('task_type is required');
  if (!Array.isArray(candidates) || !candidates.length) throw new Error('candidates must be a non-empty array');
  for (const c of candidates) {
    if (!c.model_id) throw new Error('every candidate needs a model_id');
  }
  const data = {
    task_type,
    candidates,
    default_weights: default_weights || DEFAULT_WEIGHTS
  };
  const existing = await findPolicyRow(task_type);
  return existing ? updateItem(existing.id, data) : createItem(data);
}

async function listPolicies() {
  const pg = getPostgreSQL(); if(!pg) throw new Error('Database not initialized');
  const res = await pg.query(`SELECT DISTINCT ON (data->>'task_type') * FROM ${tableName} ORDER BY data->>'task_type', created_at DESC`);
  return res.rows.map(r => r.data);
}

function minMax(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return { min, max, range: max - min };
}

/**
 * Score every candidate for task_type and pick the best one, with a full,
 * auditable score breakdown.
 */
async function route({ task_type, weights = null } = {}) {
  if (!task_type) throw new Error('task_type is required');
  const row = await findPolicyRow(task_type);
  if (!row) return { task_type, selected_model: null, reasoning: { message: `No routing policy registered for task_type '${task_type}'` } };

  const { candidates, default_weights } = row.data;
  const w = { ...(default_weights || DEFAULT_WEIGHTS), ...(weights || {}) };

  const costs = candidates.map(c => c.cost_per_1k ?? 0);
  const latencies = candidates.map(c => c.avg_latency_ms ?? 0);
  const costRange = minMax(costs);
  const latencyRange = minMax(latencies);

  const scored = candidates.map(c => {
    const normalizedCostGood = costRange.range === 0 ? 1 : 1 - ((c.cost_per_1k - costRange.min) / costRange.range);
    const normalizedLatencyGood = latencyRange.range === 0 ? 1 : 1 - ((c.avg_latency_ms - latencyRange.min) / latencyRange.range);
    const accuracy = typeof c.accuracy === 'number' ? c.accuracy : 0.5;
    const score = (w.cost || 0) * normalizedCostGood + (w.latency || 0) * normalizedLatencyGood + (w.accuracy || 0) * accuracy;
    return {
      model_id: c.model_id,
      score: Math.round(score * 1000) / 1000,
      factors: {
        cost_per_1k: c.cost_per_1k,
        normalized_cost_good: Math.round(normalizedCostGood * 1000) / 1000,
        avg_latency_ms: c.avg_latency_ms,
        normalized_latency_good: Math.round(normalizedLatencyGood * 1000) / 1000,
        accuracy
      }
    };
  });

  scored.sort((a, b) => b.score - a.score || (a.factors.cost_per_1k - b.factors.cost_per_1k));
  const winner = scored[0];

  return {
    task_type,
    selected_model: winner.model_id,
    score: winner.score,
    reasoning: { weights: w, candidates: scored }
  };
}

module.exports = {
  listItems, getItem, createItem, updateItem, deleteItem,
  registerPolicy, listPolicies, route
};
