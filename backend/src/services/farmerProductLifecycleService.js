'use strict';

const crypto = require('node:crypto');
const pool = require('../database/pool');
const nutrition = require('./legacy/nutritionIntelligenceService');
const dietTherapy = require('./dietTherapyService');
const media = require('./legacy/productMediaAIService');

function requireText(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} is required`);
  return value.trim();
}

async function createDraft(farmerId, input) {
  const name = requireText(input.name, 'name');
  const ingredients = Array.isArray(input.ingredients) ? input.ingredients : [];
  if (ingredients.length === 0) throw new Error('at least one ingredient is required');
  const result = await pool.query(
    `INSERT INTO farmer_product_lifecycle
      (farmer_id, name, status, product_data)
     VALUES ($1, $2, 'nutrition_pending', $3)
     RETURNING *`,
    [farmerId, name, JSON.stringify({ ...input, ingredients })],
  );
  return result.rows[0];
}

async function calculateNutrition(productId, farmerId, input) {
  const items = Array.isArray(input.items) ? input.items : [];
  const nutritionData = nutrition.calculateNutrientTotals(items, input.servings || 1);
  const result = await pool.query(
    `UPDATE farmer_product_lifecycle
     SET nutrition_data = $1, nutrition_provenance = $2,
         status = 'dietitian_review', updated_at = NOW()
     WHERE id = $3 AND farmer_id = $4
     RETURNING *`,
    [JSON.stringify(nutritionData), JSON.stringify({
      source: nutritionData.provenance,
      laboratoryVerified: Boolean(input.laboratoryVerified),
      sourceDocuments: input.sourceDocuments || [],
      calculatedAt: new Date().toISOString(),
    }), productId, farmerId],
  );
  if (!result.rows[0]) throw new Error('product lifecycle record not found');
  return result.rows[0];
}

async function requestImage(productId, farmerId, input) {
  const prompt = [
    `Create a truthful marketplace image for ${requireText(input.name, 'name')}.`,
    'Show only the supplied product characteristics; no health claims, labels, logos, or invented certifications.',
    input.visualDescription,
  ].filter(Boolean).join(' ');
  const image = await media.callImageProvider(input.provider || 'openai_images', prompt, input.options);
  if (!image || image.ok !== true) {
    const error = new Error(`image provider unavailable: ${image?.status || 'unknown'}`);
    error.statusCode = 503;
    error.code = 'IMAGE_PROVIDER_UNAVAILABLE';
    throw error;
  }
  const result = await pool.query(
    `UPDATE farmer_product_lifecycle
     SET image_data = $1, updated_at = NOW()
     WHERE id = $2 AND farmer_id = $3
     RETURNING *`,
    [JSON.stringify({ ...image, prompt, requestedAt: new Date().toISOString() }), productId, farmerId],
  );
  if (!result.rows[0]) throw new Error('product lifecycle record not found');
  return result.rows[0];
}

async function review(productId, reviewerId, decision, notes) {
  if (!['approve', 'reject'].includes(decision)) throw new Error('decision must be approve or reject');
  if (decision === 'approve') {
    const evidence = await pool.query(
      `SELECT nutrition_data, nutrition_provenance
       FROM farmer_product_lifecycle WHERE id = $1`,
      [productId],
    );
    const row = evidence.rows[0];
    if (!row) throw new Error('product lifecycle record not found');
    if (!row.nutrition_data || Object.keys(row.nutrition_data).length === 0
      || !row.nutrition_provenance || Object.keys(row.nutrition_provenance).length === 0) {
      throw new Error('nutrition evidence and provenance are required before approval');
    }
  }
  const result = await pool.query(
    `UPDATE farmer_product_lifecycle
     SET status = $1, dietitian_review = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [decision === 'approve' ? 'approved' : 'rejected', JSON.stringify({
      reviewerId, decision, notes: notes || null, reviewedAt: new Date().toISOString(),
    }), productId],
  );
  if (!result.rows[0]) throw new Error('product lifecycle record not found');
  if (decision === 'approve') {
    const product = result.rows[0];
    const slug = `${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${crypto.createHash('sha256').update(String(product.id)).digest('hex').slice(0, 10)}`;
    const canonical = await pool.query(
      `INSERT INTO products
        (name, slug, sku, description, nutrition_data, images, base_price, map_price, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (slug) DO UPDATE SET
         nutrition_data = EXCLUDED.nutrition_data,
         images = EXCLUDED.images,
         updated_at = CURRENT_TIMESTAMP
       RETURNING id`,
      [
        product.name, slug, `LIFECYCLE-${product.id}`, product.product_data?.description || null,
        JSON.stringify(product.nutrition_data || {}), JSON.stringify(product.image_data?.url ? [product.image_data.url] : []),
        Number(product.product_data?.base_price || 0), product.product_data?.map_price || null, product.farmer_id,
      ],
    );
    await pool.query(
      `UPDATE farmer_product_lifecycle SET canonical_product_id = $1 WHERE id = $2`,
      [canonical.rows[0].id, product.id],
    );
    return { ...product, canonical_product_id: canonical.rows[0].id };
  }
  return result.rows[0];
}

async function createHealthPlan(productId, actorId, profile, options = {}) {
  const product = await pool.query(
    `SELECT * FROM farmer_product_lifecycle
     WHERE id = $1 AND status = 'approved' AND recall_blocked = FALSE
       AND health_plan_invalidated_at IS NULL`,
    [productId],
  );
  if (!product.rows[0]) throw new Error('only dietitian-approved products can enter a health plan');
  const plan = await dietTherapy.createPlan({
    ...profile,
    product_context: {
      productId,
      name: product.rows[0].name,
      nutrition: product.rows[0].nutrition_data,
      provenance: product.rows[0].nutrition_provenance,
    },
  }, options);
  const link = { actorId, createdAt: new Date().toISOString(), plan };
  const result = await pool.query(
    `UPDATE farmer_product_lifecycle
     SET health_plan_links = health_plan_links || $1::jsonb, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [JSON.stringify([link]), productId],
  );
  return { product: result.rows[0], plan };
}

async function verifyLaboratoryEvidence(productId, farmerId, evidence) {
  if (!evidence || typeof evidence.reportId !== 'string' || !evidence.reportId.trim()) {
    throw new Error('laboratory reportId is required');
  }
  if (evidence.verified !== true) throw new Error('laboratory evidence must be verified');
  const result = await pool.query(
    `UPDATE farmer_product_lifecycle
     SET laboratory_verification = $1, fefo_eligible = TRUE, updated_at = NOW()
     WHERE id = $2 AND farmer_id = $3
     RETURNING *`,
    [JSON.stringify({ ...evidence, verifiedAt: new Date().toISOString() }), productId, farmerId],
  );
  if (!result.rows[0]) throw new Error('product lifecycle record not found');
  return result.rows[0];
}

async function recordAllergenConflicts(productId, farmerId, conflicts) {
  if (!Array.isArray(conflicts)) throw new Error('allergen conflicts must be an array');
  const result = await pool.query(
    `UPDATE farmer_product_lifecycle
     SET allergen_conflicts = $1,
        status = CASE WHEN jsonb_array_length($1::jsonb) > 0 THEN 'rejected' ELSE status END,
         updated_at = NOW()
     WHERE id = $2 AND farmer_id = $3
     RETURNING *`,
    [JSON.stringify(conflicts), productId, farmerId],
  );
  if (!result.rows[0]) throw new Error('product lifecycle record not found');
  return result.rows[0];
}

async function blockRecall(batchId, reason) {
  requireText(batchId, 'batchId');
  const result = await pool.query(
    `UPDATE farmer_product_lifecycle
     SET recall_blocked = TRUE, fefo_eligible = FALSE,
         health_plan_invalidated_at = COALESCE(health_plan_invalidated_at, NOW()),
         health_plan_invalidation_reason = $2, updated_at = NOW()
     WHERE batch_id = $1
     RETURNING *`,
    [batchId, requireText(reason, 'reason')],
  );
  return { batchId, affected: result.rowCount, products: result.rows };
}

async function invalidateBatchHealthPlans(batchId, reason) {
  return blockRecall(batchId, reason);
}

module.exports = {
  createDraft,
  calculateNutrition,
  requestImage,
  review,
  createHealthPlan,
  verifyLaboratoryEvidence,
  recordAllergenConflicts,
  blockRecall,
  invalidateBatchHealthPlans,
};
