'use strict';

const crypto = require('node:crypto');
const pool = require('../database/pool');

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = canonicalize(value[key]);
      return result;
    }, {});
  }
  return value;
}

function hashEvent(event, previousHash) {
  return crypto.createHash('sha256').update(JSON.stringify({
    action: event.action,
    entityType: event.entityType,
    entityId: event.entityId || null,
    payload: canonicalize(event.payload || {}),
    correlationId: event.correlationId || null,
    previousHash: previousHash || null,
  })).digest('hex');
}

async function append(event) {
  if (!event?.action || !event?.entityType) throw new Error('action and entityType are required');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock($1)', [184467]);
    const previous = await client.query(
      'SELECT event_hash FROM audit_chain_events ORDER BY sequence DESC LIMIT 1 FOR UPDATE',
    );
    const previousHash = previous.rows[0]?.event_hash || null;
    const eventHash = hashEvent(event, previousHash);
    const result = await client.query(
      `INSERT INTO audit_chain_events
        (actor_id, action, entity_type, entity_id, payload, correlation_id, previous_hash, event_hash)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        event.actorId || null, event.action, event.entityType, event.entityId || null,
        JSON.stringify(event.payload || {}), event.correlationId || null, previousHash, eventHash,
      ],
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function verify(limit = 10000) {
  const result = await pool.query(
    'SELECT * FROM audit_chain_events ORDER BY sequence ASC LIMIT $1',
    [Math.max(1, Math.min(Number(limit) || 10000, 100000))],
  );
  let previousHash = null;
  for (const row of result.rows) {
    const expected = hashEvent({
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      payload: row.payload,
      correlationId: row.correlation_id,
    }, previousHash);
    if (row.previous_hash !== previousHash || row.event_hash !== expected) {
      return { valid: false, sequence: row.sequence, reason: 'audit chain hash mismatch' };
    }
    previousHash = row.event_hash;
  }
  return { valid: true, checked: result.rows.length, lastHash: previousHash };
}

module.exports = { append, verify, hashEvent };
