// Service for M060 - Seller Onboarding Checklist Tracking
// See README.md Strategy Card for the algorithm this module implements.
const { logger } = require('../../utils/logger');
const { getPostgreSQL } = require('../../database/connection');

const tableName = 'fpo_m060_items';

// Fixed onboarding checklist. Weighted so the steps that actually gate a
// seller transacting (bank verification, first listing) count for more than
// cosmetic ones (profile photo).
const STANDARD_CHECKLIST = [
  { key: 'business_registration', label: 'Business registration document uploaded', required: true, weight: 3 },
  { key: 'identity_verification', label: 'Identity (Aadhaar/PAN) verified', required: true, weight: 3 },
  { key: 'bank_account_verification', label: 'Bank account verified for payouts', required: true, weight: 3 },
  { key: 'gst_or_tax_id', label: 'GST/tax ID recorded', required: true, weight: 2 },
  { key: 'address_verification', label: 'Business address verified', required: true, weight: 2 },
  { key: 'seller_terms_agreement', label: 'Seller terms & conditions accepted', required: true, weight: 2 },
  { key: 'product_catalog_min3', label: 'At least 3 products listed', required: true, weight: 3 },
  { key: 'first_listing_approved', label: 'First listing passed review', required: true, weight: 3 },
  { key: 'quality_certification_upload', label: 'Quality/organic certification uploaded', required: false, weight: 1 },
  { key: 'store_profile_photo', label: 'Store profile photo added', required: false, weight: 1 },
];

function getStandardChecklist() {
  return STANDARD_CHECKLIST.map((step) => ({ ...step, completed: false, completed_at: null, notes: null }));
}

/**
 * Real completion algorithm: weighted ratio, not a naive "N of M" count, so
 * the steps that actually gate transacting move the needle more than
 * cosmetic ones.
 */
function computeChecklistStatus(steps) {
  const totalWeight = steps.reduce((s, st) => s + (st.weight || 0), 0) || 1;
  const doneWeight = steps.reduce((s, st) => s + (st.completed ? (st.weight || 0) : 0), 0);
  const requiredSteps = steps.filter((st) => st.required);
  const requiredTotalWeight = requiredSteps.reduce((s, st) => s + (st.weight || 0), 0) || 1;
  const requiredDoneWeight = requiredSteps.reduce((s, st) => s + (st.completed ? (st.weight || 0) : 0), 0);

  const completion_pct = Math.round((doneWeight / totalWeight) * 10000) / 100;
  const required_completion_pct = Math.round((requiredDoneWeight / requiredTotalWeight) * 10000) / 100;

  let status;
  if (doneWeight === 0) status = 'not_started';
  else if (completion_pct === 100) status = 'complete';
  else if (required_completion_pct === 100) status = 'ready_for_review';
  else status = 'in_progress';

  return { completion_pct, required_completion_pct, status };
}

async function listItems({ page = 1, limit = 20 } = {}) {
  const pg = getPostgreSQL(); if (!pg) throw new Error('Database not initialized');
  const offset = (page - 1) * limit;
  const totalRes = await pg.query(`SELECT COUNT(*) FROM ${tableName}`);
  const total = parseInt(totalRes.rows[0].count || '0', 10);
  const res = await pg.query(`SELECT * FROM ${tableName} ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
  return { items: res.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function getItem(id) {
  const pg = getPostgreSQL(); if (!pg) throw new Error('Database not initialized');
  const res = await pg.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
  return res.rows[0] || null;
}

async function getBySeller(sellerId) {
  const pg = getPostgreSQL(); if (!pg) throw new Error('Database not initialized');
  const res = await pg.query(`SELECT * FROM ${tableName} WHERE data->>'seller_id' = $1 ORDER BY created_at DESC LIMIT 1`, [String(sellerId)]);
  return res.rows[0] || null;
}

/**
 * Initialize a checklist for a seller. payload = { seller_id }.
 * Steps come from the standard checklist template; nothing is invented per-call.
 */
async function createItem(payload) {
  const pg = getPostgreSQL(); if (!pg) throw new Error('Database not initialized');
  if (!payload || !payload.seller_id) throw new Error('seller_id is required');

  const steps = getStandardChecklist();
  const { completion_pct, required_completion_pct, status } = computeChecklistStatus(steps);
  const data = {
    seller_id: payload.seller_id,
    steps,
    completion_pct,
    required_completion_pct,
    status,
    started_at: new Date().toISOString(),
  };

  const res = await pg.query(`INSERT INTO ${tableName} (data, created_at) VALUES ($1, NOW()) RETURNING *`, [data]);
  logger.info(`Onboarding checklist created for seller ${payload.seller_id}`);
  return res.rows[0];
}

async function updateItem(id, payload) {
  const pg = getPostgreSQL(); if (!pg) throw new Error('Database not initialized');
  const res = await pg.query(`UPDATE ${tableName} SET data = $1, updated_at = NOW() WHERE id = $2 RETURNING *`, [payload, id]);
  return res.rows[0] || null;
}

/**
 * Mark one checklist step complete/incomplete and recompute the derived
 * completion_pct/status server-side, so a client can never write a status
 * that disagrees with its own steps.
 */
async function updateStep(id, stepKey, { completed, notes } = {}) {
  const existing = await getItem(id);
  if (!existing) return null;

  const data = existing.data || {};
  const steps = Array.isArray(data.steps) ? data.steps : getStandardChecklist();
  const stepIndex = steps.findIndex((s) => s.key === stepKey);
  if (stepIndex === -1) throw new Error(`Unknown checklist step: ${stepKey}`);

  steps[stepIndex] = {
    ...steps[stepIndex],
    completed: !!completed,
    completed_at: completed ? new Date().toISOString() : null,
    notes: notes !== undefined ? notes : steps[stepIndex].notes,
  };

  const { completion_pct, required_completion_pct, status } = computeChecklistStatus(steps);
  const newData = { ...data, steps, completion_pct, required_completion_pct, status };

  return updateItem(id, newData);
}

async function deleteItem(id) {
  const pg = getPostgreSQL(); if (!pg) throw new Error('Database not initialized');
  const res = await pg.query(`DELETE FROM ${tableName} WHERE id = $1 RETURNING id`, [id]);
  return !!res.rows[0];
}

module.exports = {
  listItems, getItem, createItem, updateItem, deleteItem,
  getStandardChecklist, computeChecklistStatus, getBySeller, updateStep,
};
