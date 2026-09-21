'use strict';

const crypto = require('node:crypto');
const pool = require('./../database/pool');
const { logger } = require('../utils/logger');

const UNIT_TYPES = new Set(['household', 'farmer', 'fpo', 'cooperative', 'shg', 'pacs', 'dairy_society', 'fishery_cooperative', 'enterprise']);

function validateAmount(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value <= 0) {
    throw Object.assign(new Error('amount must be greater than zero'), { code: 'RURAL_LEDGER_INVALID_AMOUNT' });
  }
  return value;
}

function validateUnit(unitType, unitId) {
  if (!UNIT_TYPES.has(unitType) || !unitId) {
    throw Object.assign(new Error('valid unitType and unitId are required'), { code: 'RURAL_LEDGER_INVALID_UNIT' });
  }
}

async function recordEntry({ unitType, unitId, direction, amount, currency = 'INR', category, reference, actorId, idempotencyKey }) {
  validateUnit(unitType, unitId);
  if (!['credit', 'debit'].includes(direction)) {
    throw Object.assign(new Error('direction must be credit or debit'), { code: 'RURAL_LEDGER_INVALID_DIRECTION' });
  }
  const value = validateAmount(amount);
  if (!category || !reference) {
    throw Object.assign(new Error('category and reference are required'), { code: 'RURAL_LEDGER_REQUIRED_FIELDS' });
  }
  const result = await pool.query(
    `INSERT INTO rural_unit_ledger
      (unit_type, unit_id, direction, amount, currency, category, reference,
       actor_id, idempotency_key)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (idempotency_key) DO UPDATE SET idempotency_key = EXCLUDED.idempotency_key
     RETURNING *`,
    [unitType, unitId, direction, value, currency, category, reference, actorId || null, idempotencyKey || crypto.randomUUID()],
  );
  logger.info('Rural unit ledger entry recorded', { unitType, unitId, reference });
  return result.rows[0];
}

async function getBalance(unitType, unitId, currency = 'INR') {
  validateUnit(unitType, unitId);
  const result = await pool.query(
    `SELECT
       COALESCE(SUM(CASE WHEN direction = 'credit' THEN amount ELSE 0 END), 0) AS credits,
       COALESCE(SUM(CASE WHEN direction = 'debit' THEN amount ELSE 0 END), 0) AS debits,
       COALESCE(SUM(CASE WHEN direction = 'credit' THEN amount ELSE -amount END), 0) AS balance
     FROM rural_unit_ledger
     WHERE unit_type = $1 AND unit_id = $2 AND currency = $3`,
    [unitType, unitId, currency],
  );
  return {
    unitType,
    unitId,
    currency,
    credits: Number(result.rows[0].credits),
    debits: Number(result.rows[0].debits),
    balance: Number(result.rows[0].balance),
  };
}

async function settle({ unitType, unitId, amount, reference, actorId }) {
  const balance = await getBalance(unitType, unitId);
  const value = validateAmount(amount);
  if (balance.balance < value) {
    throw Object.assign(new Error('settlement exceeds available rural-unit balance'), {
      code: 'RURAL_LEDGER_INSUFFICIENT_BALANCE',
    });
  }
  return recordEntry({
    unitType,
    unitId,
    direction: 'debit',
    amount: value,
    category: 'settlement',
    reference,
    actorId,
    idempotencyKey: `settlement:${unitType}:${unitId}:${reference}`,
  });
}

module.exports = { UNIT_TYPES: [...UNIT_TYPES], recordEntry, getBalance, settle };
