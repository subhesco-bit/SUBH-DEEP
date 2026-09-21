'use strict';

const crypto = require('node:crypto');
const pool = require('../database/pool');

const POLICY_CLASSES = Object.freeze({
  medical_health: { label: 'Medical / health', requiredEvidence: ['medical_report', 'identity'], implemented: false },
  crop: { label: 'Crop yield', requiredEvidence: ['incident_location', 'loss_assessment'], implemented: true },
  weather_parametric: { label: 'Crop weather / parametric', requiredEvidence: ['incident_location', 'weather_event'], implemented: true },
  livestock: { label: 'Livestock', requiredEvidence: ['animal_register', 'loss_assessment'], implemented: true },
  dairy: { label: 'Dairy', requiredEvidence: ['animal_register', 'loss_assessment'], implemented: false },
  fishery: { label: 'Fishery', requiredEvidence: ['pond_or_pondage_record', 'loss_assessment'], implemented: false },
  transit: { label: 'Transit', requiredEvidence: ['dispatch_record', 'loss_assessment'], implemented: true },
  warehouse_cold_chain: { label: 'Warehouse / cold-chain', requiredEvidence: ['storage_record', 'temperature_log'], implemented: true },
  product_quality_recall: { label: 'Product loss / quality / recall', requiredEvidence: ['lot_traceability', 'quality_report'], implemented: false },
  asset_equipment: { label: 'Asset / equipment', requiredEvidence: ['asset_register', 'damage_assessment'], implemented: false },
  property_infrastructure: { label: 'Property / infrastructure', requiredEvidence: ['asset_register', 'damage_assessment'], implemented: false },
  liability: { label: 'Liability', requiredEvidence: ['incident_report', 'third_party_notice'], implemented: false },
  credit_loan_protection: { label: 'Credit / loan protection', requiredEvidence: ['loan_statement', 'default_notice'], implemented: false },
  personal_accident_life: { label: 'Personal accident / life', requiredEvidence: ['identity', 'death_or_injury_report'], implemented: false },
});

const STATES = Object.freeze({
  SUBMITTED: 'submitted',
  HUMAN_REVIEW: 'human_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DISPUTED: 'disputed',
  SETTLED: 'settled',
});

const TRANSITIONS = Object.freeze({
  submitted: ['human_review', 'rejected'],
  human_review: ['approved', 'rejected', 'disputed'],
  approved: ['settled', 'disputed'],
  rejected: ['disputed'],
  disputed: ['human_review', 'approved', 'rejected'],
  settled: ['disputed'],
});

class InsuranceWorkflowError extends Error {
  constructor(message, code = 'INSURANCE_WORKFLOW_INVALID', statusCode = 400) {
    super(message);
    this.name = 'InsuranceWorkflowError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

class MemoryInsuranceRepository {
  constructor() {
    this.policies = new Map();
    this.claims = new Map();
    this.events = [];
    this.idempotency = new Map();
  }

  async savePolicy(policy) { this.policies.set(policy.id, policy); return policy; }
  async getPolicy(id) { return this.policies.get(id) || null; }
  async saveClaim(claim) { this.claims.set(claim.id, claim); return claim; }
  async getClaim(id) { return this.claims.get(id) || null; }
  async findIdempotent(scope, key) { return this.idempotency.get(`${scope}:${key}`) || null; }
  async saveIdempotent(scope, key, value) { this.idempotency.set(`${scope}:${key}`, value); }
  async appendEvent(event) { this.events.push(event); return event; }
}

class PostgresInsuranceRepository {
    constructor(db) {
      if (!db || typeof db.query !== 'function') {
        throw new InsuranceWorkflowError('A database query adapter is required', 'INSURANCE_DATABASE_REQUIRED');
      }
      this.db = db;
    }

    async savePolicy(policy) {
      await this.db.query(
        `INSERT INTO insurance_workflow_policies
          (id, policy_class, holder_id, status, coverage_limit, workflow_status, payload, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)
         ON CONFLICT (id) DO UPDATE SET status=$4, coverage_limit=$5, payload=$7::jsonb`,
        [policy.id, policy.policyClass, policy.holderId, policy.status, policy.coverageLimit,
          policy.workflowStatus, JSON.stringify(policy), policy.createdAt],
      );
      return policy;
    }

    async getPolicy(id) {
      const result = await this.db.query(
        'SELECT payload FROM insurance_workflow_policies WHERE id = $1', [id],
      );
      return result.rows[0]?.payload || null;
    }

    async saveClaim(claim) {
      await this.db.query(
        `INSERT INTO insurance_workflow_claims
          (id, policy_id, holder_id, policy_class, amount, state, idempotency_key, payload, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10)
         ON CONFLICT (id) DO UPDATE SET state=$6, payload=$8::jsonb, updated_at=$10`,
        [claim.id, claim.policyId, claim.holderId, claim.policyClass, claim.amount, claim.state,
          claim.idempotencyKey, JSON.stringify(claim), claim.createdAt, claim.updatedAt],
      );
      return claim;
    }

    async getClaim(id) {
      const result = await this.db.query(
        'SELECT payload FROM insurance_workflow_claims WHERE id = $1', [id],
      );
      return result.rows[0]?.payload || null;
    }

    async findIdempotent(scope, key) {
      if (scope !== 'claim') return null;
      const result = await this.db.query(
        'SELECT payload FROM insurance_workflow_claims WHERE idempotency_key = $1', [key],
      );
      return result.rows[0]?.payload || null;
    }

    async saveIdempotent() {}

    async appendEvent(event) {
      await this.db.query(
        `INSERT INTO insurance_workflow_events
          (id, event_type, claim_id, actor_id, payload, occurred_at)
         VALUES ($1,$2,$3,$4,$5::jsonb,$6)`,
        [event.id, event.type, event.claimId, event.actorId || null, JSON.stringify(event.data), event.at],
      );
      return event;
    }
  }

const clone = (value) => JSON.parse(JSON.stringify(value));
const actorId = (context) => String(context.actorId || context.userId || '');
const now = () => new Date().toISOString();

function requireActor(context) {
  if (!actorId(context)) throw new InsuranceWorkflowError('actorId is required', 'INSURANCE_ACTOR_REQUIRED');
}

function requireIdempotency(key) {
  if (!key || typeof key !== 'string' || key.length > 200) {
    throw new InsuranceWorkflowError('idempotencyKey is required', 'INSURANCE_IDEMPOTENCY_REQUIRED');
  }
}

class InsuranceWorkflowService {
  constructor({ repository, payoutAdapter, ledgerHook, auditHook, disputeHook, clock } = {}) {
    this.repository = repository || new MemoryInsuranceRepository();
    this.payoutAdapter = payoutAdapter;
    this.ledgerHook = ledgerHook || (async () => ({ recorded: false, reason: 'ledger hook unavailable' }));
    this.auditHook = auditHook || (async () => ({ recorded: false, reason: 'audit hook unavailable' }));
    this.disputeHook = disputeHook || (async () => ({ recorded: false, reason: 'dispute hook unavailable' }));
    this.clock = clock || now;
  }

  listPolicyClasses() {
    return Object.entries(POLICY_CLASSES).map(([id, value]) => ({
      id, ...value, workflowStatus: value.implemented ? 'implemented_subset' : 'contract_only',
    }));
  }

  async registerPolicy(input = {}, context = {}) {
    requireActor(context);
    if (!input.id || !POLICY_CLASSES[input.policyClass]) {
      throw new InsuranceWorkflowError('id and a supported policyClass are required', 'INSURANCE_POLICY_INVALID');
    }
    const policy = {
      id: String(input.id), policyClass: input.policyClass, holderId: String(input.holderId || actorId(context)),
      status: input.status || 'active', coverageLimit: Number(input.coverageLimit || 0),
      createdAt: this.clock(), workflowStatus: POLICY_CLASSES[input.policyClass].implemented ? 'implemented_subset' : 'contract_only',
    };
    if (!Number.isFinite(policy.coverageLimit) || policy.coverageLimit < 0) {
      throw new InsuranceWorkflowError('coverageLimit must be a non-negative number', 'INSURANCE_POLICY_INVALID');
    }
    await this.repository.savePolicy(policy);
    await this._event('policy_registered', policy, context);
    return clone(policy);
  }

  async submitClaim(input = {}, context = {}) {
    requireActor(context);
    requireIdempotency(input.idempotencyKey);
    const existing = await this.repository.findIdempotent('claim', input.idempotencyKey);
    if (existing) return clone(existing);
    const policy = await this.repository.getPolicy(String(input.policyId || ''));
    if (!policy || policy.status !== 'active') {
      throw new InsuranceWorkflowError('An active policy is required', 'INSURANCE_POLICY_NOT_ACTIVE');
    }
    const definition = POLICY_CLASSES[policy.policyClass];
    const evidence = input.evidence || {};
    const missingEvidence = definition.requiredEvidence.filter((key) => !evidence[key]);
    if (missingEvidence.length) {
      throw new InsuranceWorkflowError(`Required evidence missing: ${missingEvidence.join(', ')}`, 'INSURANCE_EVIDENCE_INCOMPLETE');
    }
    const claim = {
      id: `clm_${crypto.randomUUID()}`, policyId: policy.id, holderId: policy.holderId,
      policyClass: policy.policyClass, amount: Number(input.amount || 0), incidentDate: input.incidentDate || null,
      evidence: clone(evidence), state: STATES.SUBMITTED, history: [], aiRecommendation: null,
      idempotencyKey: input.idempotencyKey, createdAt: this.clock(), updatedAt: this.clock(),
    };
    if (!Number.isFinite(claim.amount) || claim.amount <= 0 || claim.amount > policy.coverageLimit) {
      throw new InsuranceWorkflowError('amount must be positive and within policy coverage', 'INSURANCE_AMOUNT_INVALID');
    }
    await this.repository.saveClaim(claim);
    await this.repository.saveIdempotent('claim', input.idempotencyKey, claim);
    await this._transition(claim, STATES.HUMAN_REVIEW, context, { evidenceValidated: true });
    return clone(claim);
  }

  async recommend(claimId, recommendation = {}, context = {}) {
    requireActor(context);
    const claim = await this._claim(claimId);
    if (claim.state !== STATES.HUMAN_REVIEW) throw new InsuranceWorkflowError('Claim is not awaiting review', 'INSURANCE_INVALID_TRANSITION');
    const amount = Number(recommendation.amount);
    if (!Number.isFinite(amount) || amount < 0 || amount > claim.amount) {
      throw new InsuranceWorkflowError('AI recommendation amount is invalid', 'INSURANCE_AI_RECOMMENDATION_INVALID');
    }
    claim.aiRecommendation = {
      amount, decision: recommendation.decision || 'review', confidence: recommendation.confidence ?? null,
      explanation: String(recommendation.explanation || ''), sourceTags: recommendation.sourceTags || [],
      requiresHumanApproval: true, createdAt: this.clock(), actorId: actorId(context),
    };
    await this.repository.saveClaim(claim);
    await this._event('ai_recommendation_recorded', claim, context);
    return clone(claim);
  }

  async adjudicate(claimId, decision = {}, context = {}) {
    requireActor(context);
    if (!['admin', 'claims_officer', 'adjuster', 'insurer'].includes(context.role)) {
      throw new InsuranceWorkflowError('A claims human adjudicator is required', 'INSURANCE_HUMAN_APPROVAL_REQUIRED', 403);
    }
    const claim = await this._claim(claimId);
    if (![STATES.HUMAN_REVIEW, STATES.DISPUTED].includes(claim.state)) {
      throw new InsuranceWorkflowError('Claim is not awaiting adjudication', 'INSURANCE_INVALID_TRANSITION');
    }
    if (!['approve', 'reject'].includes(decision.decision)) {
      throw new InsuranceWorkflowError('decision must be approve or reject', 'INSURANCE_DECISION_INVALID');
    }
    claim.adjudication = { ...clone(decision), actorId: actorId(context), at: this.clock() };
    await this._transition(claim, decision.decision === 'approve' ? STATES.APPROVED : STATES.REJECTED, context);
    return clone(claim);
  }

  async releasePayout(claimId, context = {}) {
    requireActor(context);
    const claim = await this._claim(claimId);
    if (claim.state !== STATES.APPROVED) throw new InsuranceWorkflowError('Only an approved claim can be settled', 'INSURANCE_PAYOUT_NOT_APPROVED');
    if (!this.payoutAdapter || typeof this.payoutAdapter.pay !== 'function') {
      throw new InsuranceWorkflowError('Payout provider is not configured; no money was released', 'INSURANCE_PROVIDER_NOT_CONFIGURED', 503);
    }
    const result = await this.payoutAdapter.pay({ claimId: claim.id, amount: claim.adjudication.amount || claim.aiRecommendation?.amount || claim.amount });
    if (!result || result.success !== true) throw new InsuranceWorkflowError('Payout provider did not confirm settlement', 'INSURANCE_PAYOUT_UNCONFIRMED', 502);
    const ledgerResult = await this.ledgerHook({ claim, amount: result.amount || claim.amount, context });
    if (!ledgerResult || ledgerResult.recorded !== true) {
      throw new InsuranceWorkflowError('Ledger did not confirm payout posting', 'INSURANCE_LEDGER_UNCONFIRMED', 503);
    }
    await this._transition(claim, STATES.SETTLED, context, { payoutReference: result.reference || null });
    return clone(claim);
  }

  async openDispute(claimId, input = {}, context = {}) {
    requireActor(context);
    const claim = await this._claim(claimId);
    if (![STATES.HUMAN_REVIEW, STATES.APPROVED, STATES.REJECTED, STATES.SETTLED].includes(claim.state)) {
      throw new InsuranceWorkflowError('Claim cannot be disputed from its current state', 'INSURANCE_INVALID_TRANSITION');
    }
    claim.dispute = { reason: String(input.reason || '').trim(), actorId: actorId(context), at: this.clock() };
    if (!claim.dispute.reason) throw new InsuranceWorkflowError('reason is required', 'INSURANCE_DISPUTE_REASON_REQUIRED');
    await this.disputeHook({ claim, context });
    await this._transition(claim, STATES.DISPUTED, context);
    return clone(claim);
  }

  async _claim(id) {
    const claim = await this.repository.getClaim(String(id));
    if (!claim) throw new InsuranceWorkflowError('Claim not found', 'INSURANCE_CLAIM_NOT_FOUND', 404);
    return claim;
  }

  async _transition(claim, next, context, data = {}) {
    if (!(TRANSITIONS[claim.state] || []).includes(next)) {
      throw new InsuranceWorkflowError(`Cannot transition claim from ${claim.state} to ${next}`, 'INSURANCE_INVALID_TRANSITION');
    }
    const previous = claim.state;
    claim.state = next; claim.updatedAt = this.clock();
    claim.history.push({ from: previous, to: next, actorId: actorId(context), at: claim.updatedAt, data });
    await this.repository.saveClaim(claim);
    await this._event('claim_state_changed', claim, context, { from: previous, to: next });
  }

  async _event(type, claim, context, data = {}) {
    const event = { id: `evt_${crypto.randomUUID()}`, type, claimId: claim.id || null, actorId: actorId(context), at: this.clock(), data };
    await this.repository.appendEvent(event);
    await this.auditHook(event);
  }
}

module.exports = {
  InsuranceWorkflowService,
  MemoryInsuranceRepository,
  PostgresInsuranceRepository,
  POLICY_CLASSES,
  STATES,
  TRANSITIONS,
  InsuranceWorkflowError,
  service: new InsuranceWorkflowService({ repository: new PostgresInsuranceRepository(pool) }),
};
