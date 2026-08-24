// Service for M032 Module — Crop Rotation Planner
//
// Recommends the next crop for a plot from its recent cropping history,
// applying two standard agronomic rotation rules: avoid re-planting the
// same botanical family back-to-back (pest/disease carryover), and
// prefer a nitrogen-fixing legume after a heavy nitrogen-feeding cereal.
const { logger } = require('../../utils/logger');
const { getPostgreSQL } = require('../../database/connection');

const tableName = 'agronomist_m032_items';

const CROP_FAMILY = {
  rice: 'poaceae', wheat: 'poaceae', maize: 'poaceae', sugarcane: 'poaceae',
  cotton: 'malvaceae',
  mustard: 'brassicaceae',
  soybean: 'fabaceae', groundnut: 'fabaceae', moong: 'fabaceae', urad: 'fabaceae', chickpea: 'fabaceae', lentil: 'fabaceae',
  potato: 'solanaceae', tomato: 'solanaceae', brinjal: 'solanaceae',
  onion: 'amaryllidaceae'
};
const LEGUME_FAMILY = 'fabaceae';
const HEAVY_N_FEEDER_FAMILY = 'poaceae';

// Candidate crops considered for recommendation, grouped by family.
const CANDIDATES_BY_FAMILY = {
  fabaceae: ['soybean', 'groundnut', 'moong', 'chickpea', 'lentil'],
  poaceae: ['maize', 'wheat', 'rice'],
  brassicaceae: ['mustard'],
  solanaceae: ['tomato', 'potato'],
  malvaceae: ['cotton']
};

/**
 * Recommend the next crop for a plot given its last 1-2 seasons of
 * cropping history, most recent first: [{ crop, season, year }, ...]
 */
function recommendNextCrop(plotHistory) {
  const history = (plotHistory || []).sort((a, b) => (b.year || 0) - (a.year || 0));
  const lastCrop = history[0] ? String(history[0].crop || '').toLowerCase() : null;
  const secondLastCrop = history[1] ? String(history[1].crop || '').toLowerCase() : null;
  const lastFamily = lastCrop ? CROP_FAMILY[lastCrop] : null;
  const recentFamilies = new Set([lastFamily, secondLastCrop ? CROP_FAMILY[secondLastCrop] : null].filter(Boolean));

  if (!lastCrop) {
    return {
      recommended_crops: CANDIDATES_BY_FAMILY[LEGUME_FAMILY],
      reasoning: 'No cropping history for this plot; defaulting to a nitrogen-fixing legume to build soil fertility before the first season.'
    };
  }

  // Rule 1: if the last crop was a heavy nitrogen feeder (cereal), prefer
  // a legume next to replenish soil nitrogen.
  if (lastFamily === HEAVY_N_FEEDER_FAMILY) {
    const recommended = CANDIDATES_BY_FAMILY[LEGUME_FAMILY].filter(c => !recentFamilies.has(CROP_FAMILY[c]));
    return {
      recommended_crops: recommended,
      avoid_family: HEAVY_N_FEEDER_FAMILY,
      reasoning: `Last crop (${lastCrop}) is a heavy nitrogen-feeding cereal (${HEAVY_N_FEEDER_FAMILY}); rotating to a legume ` +
        `(${LEGUME_FAMILY}) replenishes soil nitrogen and breaks the cereal pest/disease cycle.`
    };
  }

  // Rule 2: otherwise, avoid the same family as the last 1-2 seasons
  // (pest/disease/nutrient-drawdown carryover) and suggest crops from
  // other families, cereals included since fields need periodic
  // high-value/staple rotation too.
  const allCandidates = Object.values(CANDIDATES_BY_FAMILY).flat();
  const recommended = allCandidates.filter(c => !recentFamilies.has(CROP_FAMILY[c]));

  return {
    recommended_crops: recommended,
    avoid_families: Array.from(recentFamilies),
    reasoning: `Last crop (${lastCrop}, family ${lastFamily}) should not be repeated to avoid family-specific pest/disease ` +
      `carryover and nutrient drawdown; recommending crops outside families [${Array.from(recentFamilies).join(', ')}].`
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

async function recommendForPlot(plotId) {
  let history = [];
  try {
    const pg = getPostgreSQL();
    if (pg) {
      const res = await pg.query(
        `SELECT data FROM ${tableName} WHERE data->>'plot_id' = $1 AND data->>'record_type' = 'rotation_history'`,
        [String(plotId)]
      );
      history = res.rows.map(r => r.data);
    }
  } catch (error) {
    logger.warn('M032 recommendForPlot: DB lookup failed', { error: error.message });
  }
  return recommendNextCrop(history);
}

module.exports = {
  listItems, getItem, createItem, updateItem, deleteItem,
  CROP_FAMILY, recommendNextCrop, recommendForPlot
};
