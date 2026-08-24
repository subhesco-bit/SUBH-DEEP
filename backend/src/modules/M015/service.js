// Service for M015 Module — AI Cost Tracking Per Feature
// See README.md Strategy Card for the cost-estimation algorithm.
const { logger } = require('../../utils/logger');
const { getPostgreSQL } = require('../../database/connection');

const tableName = 'core_m015_items';
const DEFAULT_BUDGET_USD = 10;

// $ per 1K tokens, [input, output]. Unknown model_id falls back to GENERIC_RATE.
const RATE_TABLE = {
  'claude-opus': [0.015, 0.075],
  'claude-sonnet': [0.003, 0.015],
  'claude-haiku': [0.00025, 0.00125],
  'gpt-4': [0.03, 0.06],
  'gpt-4o': [0.005, 0.015],
  'gpt-3.5-turbo': [0.0005, 0.0015],
  'gemini-pro': [0.00125, 0.005]
};
const GENERIC_RATE = [0.01, 0.03];

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

function estimateCost(model_id, promptTokens, completionTokens) {
  const key = Object.keys(RATE_TABLE).find(k => (model_id || '').toLowerCase().includes(k));
  const [inputRate, outputRate] = key ? RATE_TABLE[key] : GENERIC_RATE;
  const cost = (promptTokens / 1000) * inputRate + (completionTokens / 1000) * outputRate;
  return { cost_usd: Math.round(cost * 1e6) / 1e6, rate_source: key || 'generic_estimate' };
}

/**
 * Record one call's token usage and its estimated cost.
 */
async function recordUsage({ feature, model_id, prompt_tokens, completion_tokens, budget_usd = null } = {}) {
  if (!feature) throw new Error('feature is required');
  const promptTokens = Number(prompt_tokens) || 0;
  const completionTokens = Number(completion_tokens) || 0;
  const { cost_usd, rate_source } = estimateCost(model_id, promptTokens, completionTokens);
  const data = {
    feature,
    model_id: model_id || null,
    prompt_tokens: promptTokens,
    completion_tokens: completionTokens,
    cost_usd,
    rate_source,
    budget_usd: typeof budget_usd === 'number' ? budget_usd : DEFAULT_BUDGET_USD,
    recorded_at: new Date().toISOString()
  };
  return createItem(data);
}

function utcDateOf(iso) {
  return (iso || '').slice(0, 10);
}

async function fetchFeatureCalls(feature, date) {
  const pg = getPostgreSQL(); if(!pg) throw new Error('Database not initialized');
  const res = await pg.query(
    `SELECT data FROM ${tableName} WHERE data->>'feature' = $1 AND (data->>'recorded_at') LIKE $2`,
    [feature, `${date}%`]
  );
  return res.rows.map(r => r.data);
}

/**
 * Total spend, call count and over-budget flag for one feature on one UTC date.
 */
async function getFeatureSummary(feature, { date = null } = {}) {
  if (!feature) throw new Error('feature is required');
  const targetDate = date || new Date().toISOString().slice(0, 10);
  const calls = await fetchFeatureCalls(feature, targetDate);
  const totalCost = calls.reduce((sum, c) => sum + (c.cost_usd || 0), 0);
  const budget = calls.length ? (calls[calls.length - 1].budget_usd ?? DEFAULT_BUDGET_USD) : DEFAULT_BUDGET_USD;
  return {
    feature,
    date: targetDate,
    call_count: calls.length,
    total_cost_usd: Math.round(totalCost * 1e6) / 1e6,
    avg_cost_per_call_usd: calls.length ? Math.round((totalCost / calls.length) * 1e6) / 1e6 : 0,
    budget_usd: budget,
    over_budget: totalCost > budget
  };
}

/**
 * Every feature whose spend exceeded its budget on the given UTC date.
 */
async function listOverBudget({ date = null } = {}) {
  const pg = getPostgreSQL(); if(!pg) throw new Error('Database not initialized');
  const targetDate = date || new Date().toISOString().slice(0, 10);
  const res = await pg.query(
    `SELECT data FROM ${tableName} WHERE (data->>'recorded_at') LIKE $1`,
    [`${targetDate}%`]
  );
  const byFeature = new Map();
  for (const row of res.rows) {
    const d = row.data;
    if (!d || !d.feature) continue;
    if (!byFeature.has(d.feature)) byFeature.set(d.feature, []);
    byFeature.get(d.feature).push(d);
  }
  const overBudget = [];
  for (const [feature, calls] of byFeature.entries()) {
    const totalCost = calls.reduce((sum, c) => sum + (c.cost_usd || 0), 0);
    const budget = calls[calls.length - 1].budget_usd ?? DEFAULT_BUDGET_USD;
    if (totalCost > budget) {
      overBudget.push({ feature, date: targetDate, total_cost_usd: Math.round(totalCost * 1e6) / 1e6, budget_usd: budget, call_count: calls.length });
    }
  }
  overBudget.sort((a, b) => b.total_cost_usd - a.total_cost_usd);
  return overBudget;
}

module.exports = {
  listItems, getItem, createItem, updateItem, deleteItem,
  recordUsage, getFeatureSummary, listOverBudget, estimateCost
};
