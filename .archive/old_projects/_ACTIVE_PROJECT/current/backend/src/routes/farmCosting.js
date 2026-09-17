/**
 * Farm costing and farmer-first cost optimization routes.
 *
 * This module backs frontend/src/pages/FarmCostingPage.jsx with real record
 * storage, calculation, and practical savings guidance. PostgreSQL is used
 * when available; local/dev fallback keeps the workflow usable during demos.
 */

const crypto = require('crypto');
const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { getPostgreSQL } = require('../database/connection');
const { logger } = require('../utils/logger');

const router = express.Router();
const fallbackRecords = new Map();

const COST_CATEGORIES = [
  'Seeds',
  'Fertilizer',
  'Labour',
  'Irrigation',
  'Machinery',
  'Pesticides',
  'Transport',
  'Other',
];

function currentUserId(req) {
  return req.user?.id || req.user?.userId || 'anonymous';
}

function normalizeNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeRecord(input, userId) {
  const amount = normalizeNumber(input.amount);
  const expectedRevenue = input.expected_revenue === null || input.expected_revenue === ''
    ? null
    : normalizeNumber(input.expected_revenue);

  return {
    id: input.id || crypto.randomUUID(),
    user_id: userId,
    crop: String(input.crop || '').trim(),
    field_name: String(input.field_name || '').trim() || null,
    season: String(input.season || '').trim() || null,
    category: COST_CATEGORIES.includes(input.category) ? input.category : 'Other',
    amount,
    expected_revenue: expectedRevenue,
    notes: String(input.notes || '').trim() || null,
    created_at: input.created_at || new Date().toISOString(),
  };
}

function validateRecord(record) {
  const errors = [];
  if (!record.crop) errors.push('crop is required');
  if (record.amount <= 0) errors.push('amount must be greater than zero');
  if (record.expected_revenue !== null && record.expected_revenue < 0) {
    errors.push('expected_revenue must not be negative');
  }
  return errors;
}

async function ensureTable(pg) {
  await pg.query(`
    CREATE TABLE IF NOT EXISTS farm_costing_records (
      id UUID PRIMARY KEY,
      user_id TEXT NOT NULL,
      crop TEXT NOT NULL,
      field_name TEXT,
      season TEXT,
      category TEXT NOT NULL,
      amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
      expected_revenue NUMERIC(14,2),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function listRecords(userId) {
  const pg = getPostgreSQL();
  if (!pg) {
    return [...fallbackRecords.values()]
      .filter((record) => record.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  await ensureTable(pg);
  const result = await pg.query(
    `SELECT id, user_id, crop, field_name, season, category, amount, expected_revenue, notes, created_at
     FROM farm_costing_records
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );
  return result.rows;
}

async function createRecord(record) {
  const pg = getPostgreSQL();
  if (!pg) {
    fallbackRecords.set(record.id, record);
    return record;
  }

  await ensureTable(pg);
  const result = await pg.query(
    `INSERT INTO farm_costing_records
       (id, user_id, crop, field_name, season, category, amount, expected_revenue, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, user_id, crop, field_name, season, category, amount, expected_revenue, notes, created_at`,
    [
      record.id,
      record.user_id,
      record.crop,
      record.field_name,
      record.season,
      record.category,
      record.amount,
      record.expected_revenue,
      record.notes,
    ],
  );
  return result.rows[0];
}

async function deleteRecord(userId, id) {
  const pg = getPostgreSQL();
  if (!pg) {
    const record = fallbackRecords.get(id);
    if (!record || record.user_id !== userId) return false;
    fallbackRecords.delete(id);
    return true;
  }

  await ensureTable(pg);
  const result = await pg.query('DELETE FROM farm_costing_records WHERE id = $1 AND user_id = $2', [id, userId]);
  return result.rowCount > 0;
}

function summarize(records) {
  const totalCost = records.reduce((sum, record) => sum + normalizeNumber(record.amount), 0);
  const totalRevenue = records.reduce((sum, record) => sum + normalizeNumber(record.expected_revenue), 0);
  const margin = totalRevenue - totalCost;
  const byCategory = COST_CATEGORIES.map((category) => {
    const amount = records
      .filter((record) => record.category === category)
      .reduce((sum, record) => sum + normalizeNumber(record.amount), 0);
    return {
      category,
      amount,
      share: totalCost ? Number(((amount / totalCost) * 100).toFixed(2)) : 0,
    };
  }).filter((item) => item.amount > 0);

  return { totalCost, totalRevenue, margin, byCategory };
}

function buildFarmerVoicePrompt(summary, topCategory, context) {
  const language = context.language || 'Hindi/local language';
  if (!topCategory) {
    return `Speak in ${language}: Which crop are you growing, what did you spend money on today, and how much did it cost?`;
  }
  return `Speak in ${language}: Your biggest cost is ${topCategory.category}. Ask the farmer whether this was paid alone or as a group purchase, then suggest one saving step.`;
}

function buildOptimization(records, context = {}) {
  const summary = summarize(records);
  const topCategory = [...summary.byCategory].sort((a, b) => b.amount - a.amount)[0] || null;
  const recommendations = [];

  if (topCategory?.category === 'Fertilizer' || topCategory?.category === 'Seeds') {
    recommendations.push({
      lever: 'group_buying',
      title: 'Pool input purchase with nearby farmers or FPO',
      impact: 'High',
      estimated_saving_pct: 8,
      action: 'Collect demand before purchase, compare at least three suppliers, and negotiate transport-inclusive rate.',
    });
  }

  if (summary.byCategory.some((item) => item.category === 'Transport' && item.share >= 12)) {
    recommendations.push({
      lever: 'logistics_pooling',
      title: 'Pool transport or delay dispatch until truck fill improves',
      impact: 'Medium',
      estimated_saving_pct: 6,
      action: 'Match loads by route, crop perishability, and delivery date before booking vehicle.',
    });
  }

  if (summary.byCategory.some((item) => item.category === 'Irrigation' && item.share >= 10)) {
    recommendations.push({
      lever: 'water_timing',
      title: 'Shift irrigation timing and track water cost per acre',
      impact: 'Medium',
      estimated_saving_pct: 5,
      action: 'Use morning/evening schedule, soil moisture checks, and crop-stage irrigation thresholds.',
    });
  }

  if (summary.margin < 0) {
    recommendations.push({
      lever: 'loss_guardrail',
      title: 'Stop-loss review before adding more spend',
      impact: 'High',
      estimated_saving_pct: 10,
      action: 'Check expected price, remaining crop stage, and whether additional input spend can recover margin.',
    });
  }

  if (records.length === 0) {
    recommendations.push({
      lever: 'voice_first_entry',
      title: 'Start with spoken cost entry',
      impact: 'High',
      estimated_saving_pct: 0,
      action: 'Ask the farmer one question at a time: crop, field, item, amount, and expected selling price.',
    });
  }

  const estimatedSaving = recommendations.reduce(
    (sum, item) => sum + (summary.totalCost * (item.estimated_saving_pct / 100)),
    0,
  );

  return {
    summary,
    recommendations,
    estimatedSaving: Number(estimatedSaving.toFixed(2)),
    farmerVoicePrompt: buildFarmerVoicePrompt(summary, topCategory, context),
    safety: [
      'Treat this as planning guidance, not guaranteed market profit.',
      'Confirm supplier rate, quantity, quality, and delivery cost before purchase.',
      'Escalate to a human advisor for loans, insurance claims, pesticides, or medical/nutrition advice.',
    ],
  };
}

router.get('/health', (req, res) => {
  res.json({
    success: true,
    module: 'farmCosting',
    status: 'operational',
  });
});

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const records = await listRecords(currentUserId(req));
    res.json({ success: true, data: buildOptimization(records) });
  } catch (error) {
    next(error);
  }
});

router.get('/records', authMiddleware, async (req, res, next) => {
  try {
    const records = await listRecords(currentUserId(req));
    res.json({ success: true, data: records });
  } catch (error) {
    logger.error('Failed to list farm costing records', { error: error.message });
    next(error);
  }
});

router.post('/records', authMiddleware, async (req, res, next) => {
  try {
    const record = normalizeRecord(req.body, currentUserId(req));
    const errors = validateRecord(record);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, error: errors.join(', ') });
    }
    const created = await createRecord(record);
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    logger.error('Failed to create farm costing record', { error: error.message });
    next(error);
  }
});

router.delete('/records/:id', authMiddleware, async (req, res, next) => {
  try {
    const deleted = await deleteRecord(currentUserId(req), req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Cost record not found' });
    }
    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    logger.error('Failed to delete farm costing record', { error: error.message });
    next(error);
  }
});

router.post('/calculate', authMiddleware, async (req, res, next) => {
  try {
    const inputRecords = Array.isArray(req.body?.records) ? req.body.records : [];
    const records = inputRecords.map((item) => normalizeRecord(item, currentUserId(req)));
    res.json({ success: true, data: summarize(records) });
  } catch (error) {
    next(error);
  }
});

router.post('/optimize', authMiddleware, async (req, res, next) => {
  try {
    const inputRecords = Array.isArray(req.body?.records)
      ? req.body.records.map((item) => normalizeRecord(item, currentUserId(req)))
      : await listRecords(currentUserId(req));
    res.json({ success: true, data: buildOptimization(inputRecords, req.body?.context || {}) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
