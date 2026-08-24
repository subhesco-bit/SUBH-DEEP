// Service for M071 - Product Catalog Audit Log
// See README.md Strategy Card for the algorithm this module implements.
const { logger } = require('../../utils/logger');
const { getPostgreSQL } = require('../../database/connection');

const tableName = 'agronomist_m071_items';

const VALID_ACTIONS = [
  'created', 'updated', 'price_changed', 'delisted', 'relisted',
  'certification_added', 'certification_removed',
];

/** Field-level diff between two flat snapshots. Only keys present in either object are compared. */
function diffProductFields(oldObj = {}, newObj = {}) {
  const keys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
  const changes = [];
  for (const field of keys) {
    const oldValue = oldObj ? oldObj[field] : undefined;
    const newValue = newObj ? newObj[field] : undefined;
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({ field, old_value: oldValue ?? null, new_value: newValue ?? null });
    }
  }
  return changes;
}

/** Fixed severity rules — see README Strategy Card. */
function classifySeverity(action, fieldChanges = []) {
  if (action === 'delisted' || action === 'certification_removed') return 'high';

  if (action === 'price_changed') {
    const priceChange = fieldChanges.find((c) => c.field === 'base_price' || c.field === 'price');
    if (priceChange && priceChange.old_value) {
      const oldVal = Number(priceChange.old_value);
      const newVal = Number(priceChange.new_value);
      if (oldVal > 0) {
        const pctChange = Math.abs((newVal - oldVal) / oldVal) * 100;
        if (pctChange > 20) return 'high';
        if (pctChange >= 5) return 'medium';
        return 'low';
      }
    }
    return 'medium';
  }

  if (fieldChanges.length >= 3) return 'medium';
  return 'low';
}

async function listItems({ page = 1, limit = 20, product_id, seller_id, action } = {}) {
  const pg = getPostgreSQL(); if (!pg) throw new Error('Database not initialized');
  const offset = (page - 1) * limit;

  const conditions = [];
  const params = [];
  if (product_id) { params.push(String(product_id)); conditions.push(`data->>'product_id' = $${params.length}`); }
  if (seller_id) { params.push(String(seller_id)); conditions.push(`data->>'seller_id' = $${params.length}`); }
  if (action) { params.push(String(action)); conditions.push(`data->>'action' = $${params.length}`); }
  const whereSql = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const totalRes = await pg.query(`SELECT COUNT(*) FROM ${tableName} ${whereSql}`, params);
  const total = parseInt(totalRes.rows[0].count || '0', 10);

  const listParams = [...params, limit, offset];
  const res = await pg.query(
    `SELECT * FROM ${tableName} ${whereSql} ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    listParams
  );
  return { items: res.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function getItem(id) {
  const pg = getPostgreSQL(); if (!pg) throw new Error('Database not initialized');
  const res = await pg.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
  return res.rows[0] || null;
}

/**
 * Log one audit entry. payload = { product_id, seller_id, actor_id, actor_role,
 * action, before, after, note }. `before`/`after` are optional flat snapshots
 * that get diffed into field_changes; callers that already know the changed
 * fields may pass `field_changes` directly instead.
 */
async function createItem(payload) {
  const pg = getPostgreSQL(); if (!pg) throw new Error('Database not initialized');
  if (!payload || !payload.product_id) throw new Error('product_id is required');
  if (!payload.action || !VALID_ACTIONS.includes(payload.action)) {
    throw new Error(`action must be one of: ${VALID_ACTIONS.join(', ')}`);
  }

  const field_changes = Array.isArray(payload.field_changes)
    ? payload.field_changes
    : diffProductFields(payload.before, payload.after);
  const severity = classifySeverity(payload.action, field_changes);

  const data = {
    product_id: payload.product_id,
    seller_id: payload.seller_id || null,
    actor_id: payload.actor_id || null,
    actor_role: payload.actor_role || null,
    action: payload.action,
    field_changes,
    severity,
    note: payload.note || null,
    occurred_at: new Date().toISOString(),
  };

  const res = await pg.query(`INSERT INTO ${tableName} (data, created_at) VALUES ($1, NOW()) RETURNING *`, [data]);
  logger.info(`Catalog audit entry logged: product ${payload.product_id}, action ${payload.action}, severity ${severity}`);
  return res.rows[0];
}

/** Audit logs are immutable by design — see README. */
async function updateItem() {
  throw new Error('Audit log entries are immutable. Log a new correcting entry instead of editing this one.');
}

/** Audit logs are immutable by design — see README. */
async function deleteItem() {
  throw new Error('Audit log entries are immutable and cannot be deleted.');
}

async function getTrail(productId) {
  const pg = getPostgreSQL(); if (!pg) throw new Error('Database not initialized');
  const res = await pg.query(
    `SELECT * FROM ${tableName} WHERE data->>'product_id' = $1 ORDER BY created_at ASC`,
    [String(productId)]
  );
  const entries = res.rows;
  const highImpact = entries.filter((e) => e.data && e.data.severity === 'high');
  const mostRecent = entries[entries.length - 1] || null;

  return {
    product_id: productId,
    total_changes: entries.length,
    high_impact_count: highImpact.length,
    most_recent_action: mostRecent ? mostRecent.data.action : null,
    most_recent_at: mostRecent ? mostRecent.data.occurred_at : null,
    entries,
  };
}

module.exports = {
  listItems, getItem, createItem, updateItem, deleteItem,
  diffProductFields, classifySeverity, getTrail,
};
