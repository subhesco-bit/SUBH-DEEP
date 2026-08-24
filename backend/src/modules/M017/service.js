// Service for M017 Module — AI Fallback / Circuit-Breaker Registry
// See README.md Strategy Card for the state-machine algorithm.
const { logger } = require('../../utils/logger');
const { getPostgreSQL } = require('../../database/connection');

const tableName = 'core_m017_items';
const FAILURE_THRESHOLD = 5;
const COOLDOWN_MS = 60 * 1000;

const STATE = { CLOSED: 'closed', OPEN: 'open', HALF_OPEN: 'half_open' };

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

async function findCircuitRow(circuit_key) {
  const pg = getPostgreSQL(); if(!pg) throw new Error('Database not initialized');
  const res = await pg.query(`SELECT * FROM ${tableName} WHERE data->>'circuit_key' = $1 ORDER BY created_at DESC LIMIT 1`, [circuit_key]);
  return res.rows[0] || null;
}

function freshCircuit(circuit_key, fallback_chain) {
  return {
    circuit_key,
    state: STATE.CLOSED,
    consecutive_failures: 0,
    last_failure_at: null,
    last_success_at: null,
    opened_at: null,
    fallback_chain: fallback_chain || [],
    last_transition_reason: 'initialized'
  };
}

/**
 * Lazily resolve the effective state of a circuit from stored timestamps —
 * an OPEN circuit becomes HALF_OPEN once the cooldown has elapsed, without
 * needing a background timer.
 */
function resolveState(data) {
  if (data.state === STATE.OPEN && data.opened_at) {
    const elapsed = Date.now() - new Date(data.opened_at).getTime();
    if (elapsed >= COOLDOWN_MS) {
      return { ...data, state: STATE.HALF_OPEN, last_transition_reason: 'cooldown_elapsed' };
    }
  }
  return data;
}

/**
 * Report the outcome of one call made against circuit_key, advancing the
 * breaker's state machine, and return the resulting state.
 */
async function reportOutcome(circuit_key, success, { fallback_chain = null } = {}) {
  if (!circuit_key) throw new Error('circuit_key is required');
  const row = await findCircuitRow(circuit_key);
  let data = row ? resolveState(row.data) : freshCircuit(circuit_key, fallback_chain);
  if (fallback_chain) data.fallback_chain = fallback_chain;

  const now = new Date().toISOString();
  if (success) {
    data.last_success_at = now;
    if (data.state === STATE.HALF_OPEN || data.state === STATE.OPEN) {
      data = { ...data, state: STATE.CLOSED, consecutive_failures: 0, opened_at: null, last_transition_reason: 'trial_call_succeeded' };
    } else {
      data.consecutive_failures = 0;
      data.last_transition_reason = 'success';
    }
  } else {
    data.last_failure_at = now;
    if (data.state === STATE.HALF_OPEN) {
      data = { ...data, state: STATE.OPEN, opened_at: now, last_transition_reason: 'trial_call_failed' };
    } else {
      data.consecutive_failures = (data.consecutive_failures || 0) + 1;
      if (data.consecutive_failures >= FAILURE_THRESHOLD) {
        data.state = STATE.OPEN;
        data.opened_at = now;
        data.last_transition_reason = `failure_threshold_reached(${data.consecutive_failures})`;
      } else {
        data.last_transition_reason = `failure_${data.consecutive_failures}_of_${FAILURE_THRESHOLD}`;
      }
    }
  }

  const saved = row ? await updateItem(row.id, data) : await createItem(data);
  return withSuggestion(saved.data);
}

async function withSuggestion(data) {
  if (data.state === STATE.CLOSED || !data.fallback_chain || !data.fallback_chain.length) {
    return { ...data, suggested_fallback: null };
  }
  for (const candidate of data.fallback_chain) {
    const candidateRow = await findCircuitRow(candidate);
    const candidateState = candidateRow ? resolveState(candidateRow.data).state : STATE.CLOSED;
    if (candidateState !== STATE.OPEN) {
      return { ...data, suggested_fallback: candidate };
    }
  }
  return { ...data, suggested_fallback: null };
}

/**
 * Current (lazily-evaluated) state for one circuit, with a fallback suggestion.
 */
async function getState(circuit_key) {
  const row = await findCircuitRow(circuit_key);
  if (!row) return { ...freshCircuit(circuit_key), suggested_fallback: null };
  return withSuggestion(resolveState(row.data));
}

/**
 * Every circuit currently OPEN or HALF_OPEN.
 */
async function listOpenCircuits() {
  const pg = getPostgreSQL(); if(!pg) throw new Error('Database not initialized');
  const res = await pg.query(
    `SELECT DISTINCT ON (data->>'circuit_key') * FROM ${tableName}
     ORDER BY data->>'circuit_key', created_at DESC`
  );
  const resolved = res.rows.map(r => resolveState(r.data));
  return resolved.filter(d => d.state !== STATE.CLOSED);
}

module.exports = {
  listItems, getItem, createItem, updateItem, deleteItem,
  reportOutcome, getState, listOpenCircuits, STATE
};
