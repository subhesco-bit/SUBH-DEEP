// Service for M028 Module — Sowing / Planting Schedule Planner
//
// Computes the recommended sowing (planting) date for a crop given its
// target harvest date and duration-to-maturity, validates the computed
// date against the crop's regional agro-climatic sowing window, and
// estimates the expected germination date.
const { logger } = require('../../utils/logger');
const { getPostgreSQL } = require('../../database/connection');

const tableName = 'farmer_m028_items';

// Reference agronomic data: duration to maturity (days), germination
// window (days), and typical sowing windows by season (MM-DD) for major
// Indian field crops. Values are standard agronomic ranges (ICAR crop
// calendars) used as sane deterministic defaults — not farm-specific.
const CROP_CALENDAR = {
  rice:      { duration_days: 120, germination_days: 7,  windows: { kharif: ['06-01', '07-15'], rabi: ['11-15', '12-15'] } },
  wheat:     { duration_days: 130, germination_days: 8,  windows: { rabi: ['11-01', '12-15'] } },
  maize:     { duration_days: 95,  germination_days: 6,  windows: { kharif: ['06-15', '07-15'], rabi: ['10-15', '11-15'] } },
  cotton:    { duration_days: 170, germination_days: 8,  windows: { kharif: ['05-01', '06-15'] } },
  sugarcane: { duration_days: 340, germination_days: 21, windows: { spring: ['02-15', '03-31'], autumn: ['09-15', '10-31'] } },
  mustard:   { duration_days: 130, germination_days: 5,  windows: { rabi: ['10-01', '11-10'] } },
  soybean:   { duration_days: 100, germination_days: 6,  windows: { kharif: ['06-15', '07-10'] } },
  groundnut: { duration_days: 110, germination_days: 8,  windows: { kharif: ['06-15', '07-15'], summer: ['01-15', '02-28'] } },
  moong:     { duration_days: 65,  germination_days: 4,  windows: { kharif: ['06-15', '07-15'], summer: ['03-15', '04-15'] } },
  potato:    { duration_days: 90,  germination_days: 15, windows: { rabi: ['10-01', '11-15'] } }
};

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function diffDays(a, b) {
  return Math.round((new Date(a) - new Date(b)) / 86400000);
}

function monthDayInRange(dateStr, [start, end]) {
  const md = dateStr.slice(5, 10);
  // Handles windows that don't wrap the new year (all crop windows above don't).
  return md >= start && md <= end;
}

/**
 * Compute a sowing plan working backwards from a target harvest date.
 * Falls back to "sow today" if no target harvest date is given.
 */
function computeSowingPlan({ crop, target_harvest_date, season, sowing_date }) {
  const key = String(crop || '').toLowerCase();
  const calendar = CROP_CALENDAR[key];
  if (!calendar) {
    return {
      error: `No agronomic calendar for crop "${crop}"`,
      supported_crops: Object.keys(CROP_CALENDAR)
    };
  }

  const recommendedSowingDate = sowing_date
    ? sowing_date
    : (target_harvest_date ? addDays(target_harvest_date, -calendar.duration_days) : new Date().toISOString().slice(0, 10));

  const germinationExpectedDate = addDays(recommendedSowingDate, calendar.germination_days);
  const expectedHarvestDate = addDays(recommendedSowingDate, calendar.duration_days);

  // Validate against the recommended window for the given season (or any
  // season if none supplied), citing which window was used and why.
  let withinWindow = null;
  let windowUsed = null;
  const seasonsToCheck = season && calendar.windows[season] ? [season] : Object.keys(calendar.windows);
  for (const s of seasonsToCheck) {
    if (monthDayInRange(recommendedSowingDate, calendar.windows[s])) {
      withinWindow = true;
      windowUsed = s;
      break;
    }
  }
  if (withinWindow === null) {
    withinWindow = false;
    windowUsed = seasonsToCheck[0];
  }

  return {
    crop: key,
    recommended_sowing_date: recommendedSowingDate,
    germination_expected_date: germinationExpectedDate,
    expected_harvest_date: expectedHarvestDate,
    duration_days: calendar.duration_days,
    within_recommended_window: withinWindow,
    window_checked: windowUsed,
    window_range: calendar.windows[windowUsed],
    reasoning: withinWindow
      ? `Sowing on ${recommendedSowingDate} falls inside the ${windowUsed} window (${calendar.windows[windowUsed].join(' to ')}) for ${key}.`
      : `Sowing on ${recommendedSowingDate} falls OUTSIDE all known windows for ${key}; nearest checked window is ${windowUsed} (${calendar.windows[windowUsed].join(' to ')}). Yield risk from off-season sowing is elevated.`
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
 * Compute a plan and persist it as a sowing-plan item in one call.
 */
async function createSowingPlan(payload) {
  const plan = computeSowingPlan(payload);
  if (plan.error) return plan;
  return createItem({ ...payload, ...plan, record_type: 'sowing_plan' });
}

module.exports = {
  listItems, getItem, createItem, updateItem, deleteItem,
  CROP_CALENDAR, computeSowingPlan, createSowingPlan
};
