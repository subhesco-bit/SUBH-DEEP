/**
 * Explainable AI decision contract.
 *
 * AI can recommend or draft. Protected actions always require an explicitly
 * recorded human approval, regardless of model confidence.
 */
'use strict';

const crypto = require('node:crypto');
const { evaluateConfidence } = require('./aiConfidenceEngine');

const PROTECTED_ACTIONS = new Set([
  'release-funds',
  'approve-claim',
  'approve-loan',
  'publish-legal-document',
  'change-farmer-floor-price',
  'confirm-order',
]);

function createDecision({
  engineId,
  action,
  recommendation,
  inputs = [],
  rationale = [],
  explanation,
  confidence = {},
  sourceTags = [],
  source,
  dataQuality,
  humanApproval = null,
  correlationId = crypto.randomUUID(),
  audit = {},
  sideEffects = [],
  allowAutonomousExecution = false,
}) {
  if (!engineId || !action || recommendation === undefined) {
    throw Object.assign(new Error('engineId, action, and recommendation are required'), {
      code: 'AI_DECISION_INVALID',
    });
  }
  if (!Array.isArray(inputs) || !Array.isArray(rationale) || !Array.isArray(sourceTags)
    || (source !== undefined && !Array.isArray(source))) {
    throw Object.assign(new Error('inputs, rationale, and sourceTags must be arrays'), {
      code: 'AI_DECISION_INVALID',
    });
  }

  const normalizedConfidence = { ...confidence };
  const declaredDataQuality = dataQuality ?? confidence.dataQuality;
  if (declaredDataQuality !== undefined && normalizedConfidence.dataFreshness === undefined) {
    normalizedConfidence.dataFreshness = typeof declaredDataQuality === 'object'
      ? declaredDataQuality.score
      : declaredDataQuality;
  }
  const confidenceResult = evaluateConfidence(normalizedConfidence);
  const protectedAction = PROTECTED_ACTIONS.has(action);
  const requiresHumanApproval = !allowAutonomousExecution
    || protectedAction || confidenceResult.decision !== 'auto_execute';
  const sources = source || sourceTags;
  const blockedSideEffects = Object.freeze({
    blocked: true,
    autonomous: false,
    requested: Array.isArray(sideEffects) ? sideEffects : [],
    reason: 'AI decisions never execute side effects without an explicit human approval',
  });
  const decisionId = `decision_${crypto.randomUUID()}`;

  return {
    decisionId,
    engineId,
    action,
    recommendation,
    inputs,
    rationale,
    explanation: explanation || rationale,
    source: sources,
    sourceTags: sources,
    confidence: confidenceResult,
    dataQuality: declaredDataQuality ?? confidenceResult.dimensions.data_quality ?? null,
    protectedAction,
    requiresHumanApproval,
    approvedBy: humanApproval?.approvedBy || null,
    approvedAt: humanApproval?.approvedAt || null,
    correlationId,
    audit: {
      ...audit,
      correlationId,
      decisionId,
    },
    blockedSideEffects,
    status: requiresHumanApproval && !humanApproval ? 'pending_human_review' : 'approved',
  };
}

function approveDecision(decision, approvedBy, comment = '') {
  if (!decision?.decisionId || !approvedBy) {
    throw Object.assign(new Error('decision and approvedBy are required'), {
      code: 'AI_DECISION_APPROVAL_INVALID',
    });
  }
  if (decision.status === 'rejected') {
    throw Object.assign(new Error('Rejected decisions cannot be approved'), {
      code: 'AI_DECISION_ALREADY_REJECTED',
    });
  }
  return {
    ...decision,
    approvedBy,
    approvedAt: new Date().toISOString(),
    approvalComment: comment,
    status: 'approved',
  };
}

function rejectDecision(decision, rejectedBy, reason) {
  if (!decision?.decisionId || !rejectedBy || !String(reason || '').trim()) {
    throw Object.assign(new Error('decision, rejectedBy, and rejection reason are required'), {
      code: 'AI_DECISION_REJECTION_INVALID',
    });
  }
  if (decision.status === 'approved') {
    throw Object.assign(new Error('Approved decisions cannot be rejected'), {
      code: 'AI_DECISION_ALREADY_APPROVED',
    });
  }
  return {
    ...decision,
    rejectedBy,
    rejectedAt: new Date().toISOString(),
    rejectionReason: String(reason).trim(),
    status: 'rejected',
    blockedSideEffects: {
      ...decision.blockedSideEffects,
      blocked: true,
      reason: 'Decision was rejected by a human reviewer',
    },
  };
}

module.exports = {
  PROTECTED_ACTIONS,
  createDecision,
  approveDecision,
  rejectDecision,
};
