// Service for M029 Module — Harvest Yield Log & Yield Prediction
//
// Farmers log actual harvest yields per plot/season. From that history we
// predict the next season's likely yield using a recency-weighted moving
// average, with a confidence score derived from how consistent (low
// variance) the historical yields are.
const { logger } = require('../../utils/logger');
const { getPostgreSQL } = require('../../database/connection');

const tableName = 'farmer_m029_items';

// Most-recent-first weights for the weighted moving average. If fewer
// seasons of history exist, the remaining weight is redistributed
// proportionally across the available seasons.
const RECENCY_WEIGHTS = [0.5, 0.3, 0.2];

function weightedAverage(values) {
  const n = Math.min(values.length, RECENCY_WEIGHTS.length);
  const weights = RECENCY_WEIGHTS.slice(0, n);
  const weightSum = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let i = 0; i < n; i++) acc += values[i] * (weights[i] / weightSum);
  return acc;
}

function stddev(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return { mean, sd: Math.sqrt(variance) };
}

/**
 * Predict next-season yield per hectare from an array of historical
 * records, most recent first: [{ year, yield_per_hectare }, ...]
 */
function predictNextYield(history) {
  const clean = (history || [])
    .filter(h => typeof h.yield_per_hectare === 'number' && h.yield_per_hectare >= 0)
    .sort((a, b) => (b.year || 0) - (a.year || 0));

  if (clean.length === 0) {
    return { predicted_yield_per_hectare: null, confidence: 0, basis_seasons: 0, reasoning: 'No historical yield records available for this plot/crop.' };
  }

  const values = clean.map(h => h.yield_per_hectare);
  const predicted = weightedAverage(values);
  const { mean, sd } = stddev(values);
  // Coefficient of variation -> confidence: tight, consistent yields give
  // high confidence; volatile history gives low confidence. Clamped to
  // [0.3, 0.95] so we never claim total certainty or total ignorance.
  const cv = mean > 0 ? sd / mean : 1;
  const confidence = Math.max(0.3, Math.min(0.95, 1 - cv));

  return {
    predicted_yield_per_hectare: Math.round(predicted * 100) / 100,
    confidence: Math.round(confidence * 100) / 100,
    basis_seasons: clean.length,
    historical_mean: Math.round(mean * 100) / 100,
    historical_stddev: Math.round(sd * 100) / 100,
    reasoning: `Weighted average of the last ${clean.length} season(s) (most recent weighted highest); ` +
      `yield variability (coefficient of variation ${(cv * 100).toFixed(1)}%) sets confidence.`
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

/**
 * Fetch stored harvest-log rows for a plot+crop and run the prediction.
 * Falls back gracefully if the DB is unavailable or no rows match.
 */
async function predictForPlot(plotId, crop) {
  let history = [];
  try {
    const pg = getPostgreSQL();
    if (pg) {
      const res = await pg.query(
        `SELECT data FROM ${tableName} WHERE data->>'plot_id' = $1 AND data->>'crop' = $2 AND data->>'record_type' = 'harvest_log'`,
        [String(plotId), String(crop)]
      );
      history = res.rows.map(r => r.data);
    }
  } catch (error) {
    logger.warn('M029 predictForPlot: DB lookup failed, predicting from empty history', { error: error.message });
  }
  return predictNextYield(history);
}

module.exports = {
  listItems, getItem, createItem, updateItem, deleteItem,
  predictNextYield, predictForPlot
};
