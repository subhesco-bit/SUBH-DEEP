// Service for M031 Module — Irrigation Scheduling
//
// Computes crop water requirement using the standard FAO-56 single crop
// coefficient method: ETc = Kc * ET0, then schedules the next irrigation
// date from how fast the soil's readily available water is being
// depleted.
const { logger } = require('../../utils/logger');
const { getPostgreSQL } = require('../../database/connection');

const tableName = 'agronomist_m031_items';

// Crop coefficients (Kc) by growth stage — standard FAO-56 reference
// values for common field crops.
const KC_TABLE = {
  rice:      { initial: 1.10, development: 1.15, mid: 1.20, late: 0.90 },
  wheat:     { initial: 0.35, development: 0.75, mid: 1.15, late: 0.40 },
  maize:     { initial: 0.30, development: 0.70, mid: 1.20, late: 0.60 },
  cotton:    { initial: 0.35, development: 0.70, mid: 1.15, late: 0.60 },
  sugarcane: { initial: 0.40, development: 0.85, mid: 1.25, late: 0.75 },
  groundnut: { initial: 0.40, development: 0.70, mid: 1.10, late: 0.60 },
  vegetable: { initial: 0.50, development: 0.80, mid: 1.05, late: 0.85 }
};

// Total available water (TAW, mm per meter root depth) by broad soil
// texture, and the management-allowed depletion fraction (p) — the share
// of TAW that can be depleted before irrigation is needed without yield
// stress. Standard FAO-56 soil-texture defaults.
const SOIL_TAW_MM_PER_M = { sandy: 100, loamy: 160, clayey: 200 };
const DEFAULT_MAD = 0.5;

// Reference evapotranspiration (ET0, mm/day) defaults by season when no
// live weather feed is wired up — regional averages for the Indian
// subcontinent, used only as a fallback.
const DEFAULT_ET0_BY_SEASON = { kharif: 4.5, rabi: 3.5, summer: 6.5 };

/**
 * Compute today's crop water use and the next irrigation date.
 */
function computeIrrigationSchedule({ crop, growth_stage, soil_type, season, et0_mm_day, root_depth_m = 0.5, last_irrigation_date, area_hectares }) {
  const cropKey = String(crop || '').toLowerCase();
  const kcTable = KC_TABLE[cropKey] || KC_TABLE.vegetable;
  const stage = KC_TABLE[cropKey] && kcTable[growth_stage] ? growth_stage : 'mid';
  const kc = kcTable[stage];

  const et0 = et0_mm_day || DEFAULT_ET0_BY_SEASON[season] || DEFAULT_ET0_BY_SEASON.kharif;
  const etcMmPerDay = Math.round(kc * et0 * 100) / 100;

  const tawPerM = SOIL_TAW_MM_PER_M[String(soil_type || '').toLowerCase()] || SOIL_TAW_MM_PER_M.loamy;
  const taw = tawPerM * root_depth_m; // total available water for this root depth, mm
  const raw = taw * DEFAULT_MAD;      // readily available water before stress, mm

  const daysSinceIrrigation = last_irrigation_date
    ? Math.max(0, Math.round((Date.now() - new Date(last_irrigation_date).getTime()) / 86400000))
    : 0;
  const depletedMm = etcMmPerDay * daysSinceIrrigation;
  const remainingRawMm = Math.max(0, raw - depletedMm);
  const daysUntilNextIrrigation = etcMmPerDay > 0 ? Math.max(0, Math.floor(remainingRawMm / etcMmPerDay)) : null;

  const nextIrrigationDate = new Date(Date.now() + (daysUntilNextIrrigation || 0) * 86400000).toISOString().slice(0, 10);

  // 1mm of water over 1 hectare = 10,000 litres.
  const waterRequiredLiters = area_hectares ? Math.round(etcMmPerDay * area_hectares * 10000) : null;

  return {
    crop: cropKey,
    growth_stage: stage,
    kc,
    et0_mm_day: et0,
    etc_mm_day: etcMmPerDay,
    readily_available_water_mm: Math.round(raw * 10) / 10,
    depleted_since_last_irrigation_mm: Math.round(depletedMm * 10) / 10,
    days_until_next_irrigation: daysUntilNextIrrigation,
    next_irrigation_date: nextIrrigationDate,
    water_required_liters_per_irrigation: waterRequiredLiters,
    reasoning: `ETc = Kc(${kc}, ${stage} stage) x ET0(${et0}mm/day) = ${etcMmPerDay}mm/day depletion. ` +
      `Soil holds ${Math.round(raw * 10) / 10}mm readily-available water at ${DEFAULT_MAD * 100}% depletion allowance; ` +
      `${Math.round(depletedMm * 10) / 10}mm already depleted since last irrigation (${daysSinceIrrigation} day(s) ago), ` +
      `so ${daysUntilNextIrrigation} day(s) remain before the next irrigation is needed.`
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

async function createSchedule(payload) {
  const schedule = computeIrrigationSchedule(payload);
  return createItem({ ...payload, ...schedule, record_type: 'irrigation_schedule' });
}

module.exports = {
  listItems, getItem, createItem, updateItem, deleteItem,
  KC_TABLE, SOIL_TAW_MM_PER_M, computeIrrigationSchedule, createSchedule
};
