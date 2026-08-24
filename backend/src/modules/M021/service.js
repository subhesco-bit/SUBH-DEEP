// Service for M021 Module — Agent Task Queue
// See README.md Strategy Card for the priority/backoff algorithm.
const { logger } = require('../../utils/logger');
const { getPostgreSQL } = require('../../database/connection');
const { withTransaction } = require('../../core/withTransaction');

const tableName = 'farmer_m021_items';
const PRIORITY_RANK = { urgent: 3, normal: 2, low: 1 };
const DEFAULT_MAX_ATTEMPTS = 3;
const BACKOFF_CAP_MS = 5 * 60 * 1000;

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
 * Enqueue one agent task.
 */
async function enqueue({ task_type, payload = {}, priority = 'normal', max_attempts = DEFAULT_MAX_ATTEMPTS } = {}) {
  if (!task_type) throw new Error('task_type is required');
  if (!PRIORITY_RANK[priority]) throw new Error(`priority must be one of ${Object.keys(PRIORITY_RANK).join(', ')}`);
  const data = {
    task_type, payload, priority,
    status: 'pending',
    attempts: 0,
    max_attempts,
    enqueued_at: new Date().toISOString(),
    next_attempt_at: null,
    started_at: null,
    completed_at: null,
    result: null,
    error: null
  };
  return createItem(data);
}

/**
 * Atomically claim the highest-priority eligible pending task (row-locked
 * with SKIP LOCKED so concurrent workers never claim the same task twice)
 * and mark it running.
 */
async function dequeueNext() {
  const pg = getPostgreSQL(); if(!pg) throw new Error('Database not initialized');
  return withTransaction(async (client) => {
    const res = await client.query(
      `SELECT * FROM ${tableName}
       WHERE data->>'status' = 'pending'
         AND (data->>'next_attempt_at' IS NULL OR (data->>'next_attempt_at')::timestamptz <= NOW())
       ORDER BY
         CASE data->>'priority' WHEN 'urgent' THEN 3 WHEN 'normal' THEN 2 WHEN 'low' THEN 1 ELSE 0 END DESC,
         (data->>'enqueued_at')::timestamptz ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED`
    );
    if (!res.rows.length) return null;
    const row = res.rows[0];
    const data = { ...row.data, status: 'running', started_at: new Date().toISOString() };
    const updated = await client.query(
      `UPDATE ${tableName} SET data = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [data, row.id]
    );
    return updated.rows[0];
  }, { name: 'M021.dequeueNext' });
}

/**
 * Mark a running task complete with its result.
 */
async function completeTask(id, result = null) {
  const existing = await getItem(id);
  if (!existing) return null;
  const data = { ...existing.data, status: 'done', result, completed_at: new Date().toISOString(), error: null };
  return updateItem(id, data);
}

function backoffMs(attempts) {
  return Math.min(Math.pow(2, attempts) * 1000, BACKOFF_CAP_MS);
}

/**
 * Mark a running task failed, applying exponential-backoff retry until
 * max_attempts is exhausted, after which the task is permanently 'failed'.
 */
async function failTask(id, error = null) {
  const existing = await getItem(id);
  if (!existing) return null;
  const attempts = (existing.data.attempts || 0) + 1;
  const maxAttempts = existing.data.max_attempts || DEFAULT_MAX_ATTEMPTS;
  const willRetry = attempts < maxAttempts;
  const data = {
    ...existing.data,
    attempts,
    error: error || 'unknown error',
    status: willRetry ? 'pending' : 'failed',
    next_attempt_at: willRetry ? new Date(Date.now() + backoffMs(attempts)).toISOString() : null,
    completed_at: willRetry ? null : new Date().toISOString()
  };
  return updateItem(id, data);
}

/**
 * Queue depth broken down by status and priority.
 */
async function getStats() {
  const pg = getPostgreSQL(); if(!pg) throw new Error('Database not initialized');
  const res = await pg.query(
    `SELECT data->>'status' AS status, data->>'priority' AS priority, COUNT(*) AS count
     FROM ${tableName} GROUP BY data->>'status', data->>'priority'`
  );
  const stats = { total: 0, by_status: {}, by_priority: {} };
  for (const row of res.rows) {
    const count = parseInt(row.count, 10);
    stats.total += count;
    stats.by_status[row.status] = (stats.by_status[row.status] || 0) + count;
    stats.by_priority[row.priority] = (stats.by_priority[row.priority] || 0) + count;
  }
  return stats;
}

module.exports = {
  listItems, getItem, createItem, updateItem, deleteItem,
  enqueue, dequeueNext, completeTask, failTask, getStats
};
