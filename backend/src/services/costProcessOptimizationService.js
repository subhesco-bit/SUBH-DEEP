'use strict';

const crypto = require('node:crypto');
const { createDecision, approveDecision, rejectDecision } = require('../core/ai/decisionContract');

const DEFAULT_POOL = require('../database/pool');

function number(value, field) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${field} must be a non-negative number`);
  }
  return parsed;
}

function normalizeCostItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('costItems must contain at least one item');
  }
  return items.map((item, index) => ({
    key: String(item.key || `cost-${index + 1}`),
    baseline: number(item.baseline, `costItems[${index}].baseline`),
    target: number(item.target, `costItems[${index}].target`),
    unit: item.unit ? String(item.unit) : null,
  })).map((item) => ({
    ...item,
    savings: Math.max(0, item.baseline - item.target),
    reductionRate: item.baseline === 0 ? 0 : Math.max(0, (item.baseline - item.target) / item.baseline),
  }));
}

function calculateCostPlan({ costItems, currency = 'INR' }) {
  const items = normalizeCostItems(costItems);
  const baseline = items.reduce((sum, item) => sum + item.baseline, 0);
  const target = items.reduce((sum, item) => sum + item.target, 0);
  const savings = Math.max(0, baseline - target);
  return {
    currency: String(currency),
    items,
    baseline,
    target,
    savings,
    reductionRate: baseline === 0 ? 0 : savings / baseline,
  };
}

function assessProcess({ processKey, steps }) {
  if (!processKey || !String(processKey).trim()) throw new Error('processKey is required');
  if (!Array.isArray(steps) || steps.length === 0) throw new Error('steps must contain at least one step');
  const normalized = steps.map((step, index) => {
    const cycleTime = number(step.cycleTime, `steps[${index}].cycleTime`);
    const waitTime = number(step.waitTime || 0, `steps[${index}].waitTime`);
    const errorRate = number(step.errorRate || 0, `steps[${index}].errorRate`);
    if (errorRate > 1) throw new Error(`steps[${index}].errorRate must be between 0 and 1`);
    return {
      key: String(step.key || `step-${index + 1}`),
      cycleTime,
      waitTime,
      errorRate,
      bottleneckScore: cycleTime + waitTime + (errorRate * Math.max(cycleTime, 1)),
    };
  });
  const totalCycleTime = normalized.reduce((sum, step) => sum + step.cycleTime, 0);
  const totalWaitTime = normalized.reduce((sum, step) => sum + step.waitTime, 0);
  const bottlenecks = [...normalized].sort((a, b) => b.bottleneckScore - a.bottleneckScore);
  return {
    processKey: String(processKey),
    steps: normalized,
    totalCycleTime,
    totalWaitTime,
    bottlenecks: bottlenecks.slice(0, Math.min(3, bottlenecks.length)),
  };
}

class CostProcessOptimizationService {
  constructor({ pool = DEFAULT_POOL } = {}) {
    this.pool = pool;
  }

  async createAssessment({ organizationId, actorId, processKey, steps, costItems, currency, correlationId }) {
    if (!organizationId || !actorId) throw new Error('organizationId and actorId are required');
    const process = assessProcess({ processKey, steps });
    const costs = calculateCostPlan({ costItems, currency });
    const decision = createDecision({
      engineId: 'cost-process-optimization-v1',
      action: 'optimize-process',
      recommendation: {
        processKey: process.processKey,
        topBottlenecks: process.bottlenecks.map((step) => step.key),
        projectedSavings: costs.savings,
        targetCycleTime: Math.max(0, process.totalCycleTime - process.bottlenecks[0].waitTime),
      },
      inputs: [{ process, costs }],
      rationale: [
        'Prioritize the highest combined cycle, wait, and error bottleneck.',
        'Cost targets are recommendations and do not post journals or release funds.',
      ],
      sourceTags: ['operational-metrics', 'cost-baseline'],
      dataQuality: { score: 1, missing: [] },
      confidence: { model: 0.8, dataFreshness: 1, dataCompleteness: 1 },
      correlationId: correlationId || crypto.randomUUID(),
      sideEffects: ['change-process', 'post-cost-saving'],
    });
    const result = await this.pool.query(
      `INSERT INTO optimization_assessments
         (organization_id, actor_id, process_key, process_metrics, cost_plan, decision, status, correlation_id)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, 'pending_review', $7)
       RETURNING *`,
      [organizationId, actorId, process.processKey, JSON.stringify(process), JSON.stringify(costs), JSON.stringify(decision), decision.correlationId],
    );
    return result.rows[0];
  }

  async listAssessments({ organizationId, status, limit = 50 }) {
    if (!organizationId) throw new Error('organizationId is required');
    const boundedLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const params = [organizationId];
    let query = 'SELECT * FROM optimization_assessments WHERE organization_id = $1';
    if (status) {
      params.push(String(status));
      query += ` AND status = $${params.length}`;
    }
    params.push(boundedLimit);
    query += ` ORDER BY created_at DESC LIMIT $${params.length}`;
    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async reviewAssessment({ assessmentId, reviewerId, approved, reason = '' }) {
    if (!assessmentId || !reviewerId) throw new Error('assessmentId and reviewerId are required');
    const current = await this.pool.query('SELECT * FROM optimization_assessments WHERE id = $1 FOR UPDATE', [assessmentId]);
    if (!current.rows[0]) throw new Error('Optimization assessment not found');
    const assessment = current.rows[0];
    if (assessment.actor_id === reviewerId) throw new Error('Maker-checker separation required');
    const decision = approved
      ? approveDecision(assessment.decision, reviewerId, reason)
      : rejectDecision(assessment.decision, reviewerId, reason || 'Optimization recommendation rejected');
    const status = approved ? 'approved' : 'rejected';
    const result = await this.pool.query(
      `UPDATE optimization_assessments
          SET decision = $1::jsonb, status = $2, reviewed_by = $3, reviewed_at = NOW(), review_reason = $4
        WHERE id = $5
        RETURNING *`,
      [JSON.stringify(decision), status, reviewerId, reason || null, assessmentId],
    );
    return result.rows[0];
  }
}

module.exports = {
  CostProcessOptimizationService,
  calculateCostPlan,
  assessProcess,
};
