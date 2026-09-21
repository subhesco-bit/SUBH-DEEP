'use strict';

const crypto = require('node:crypto');
const pool = require('../database/pool');
const ledger = require('./unifiedLedgerService');

const STATUSES = Object.freeze({
  OPEN: 'open', ON_HOLD: 'on_hold', EVIDENCE: 'evidence_requested',
  REVIEW: 'under_review', MEDIATION: 'mediation', PENDING: 'resolution_pending',
  RESOLVED: 'resolved', APPEALED: 'appealed', SETTLED: 'settled',
  CLOSED: 'closed', REJECTED: 'rejected',
});
const FINANCIAL_ACTIONS = new Set(['adjustment', 'reversal', 'clawback']);
// A dispute is an orchestration record only. The referenced record remains in
// its canonical domain service; this map prevents a parallel order/claim/
// subsidy/ERP implementation from being introduced here.
const CANONICAL_SOURCE_SERVICES = Object.freeze({
  order: 'commerce/orderService',
  procurement: 'commerce/institutionalProcurementService',
  escrow: 'legacy/escrowService',
  claim: 'legacy/insuranceClaimsService',
  subsidy: 'finance/subsidyService',
  erp: 'legacy/comprehensiveERPService',
});
const TRANSITIONS = {
  open: ['on_hold', 'evidence_requested', 'under_review', 'rejected'],
  on_hold: ['open', 'evidence_requested', 'under_review'],
  evidence_requested: ['under_review', 'on_hold'],
  under_review: ['mediation', 'resolution_pending', 'rejected'],
  mediation: ['resolution_pending', 'under_review'],
  resolution_pending: ['resolved', 'rejected'],
  resolved: ['appealed', 'settled'],
  appealed: ['under_review', 'resolved'],
  settled: ['closed'],
};

class DisputeError extends Error {
  constructor(message, code = 'DISPUTE_VALIDATION_ERROR', statusCode = 400) {
    super(message); this.code = code; this.statusCode = statusCode;
  }
}
const actor = (context = {}) => String(context.actorId || context.userId || '');
const correlation = (context = {}) => context.correlationId || null;
const id = () => crypto.randomUUID();
const now = () => new Date();
const addDays = (days) => new Date(Date.now() + days * 86400000);
function requireActor(context) { if (!actor(context)) throw new DisputeError('actorId is required', 'DISPUTE_ACTOR_REQUIRED'); }
function ensureTransition(from, to) {
  if (!(TRANSITIONS[from] || []).includes(to)) throw new DisputeError(`Cannot transition dispute from ${from} to ${to}`, 'DISPUTE_INVALID_TRANSITION');
}

class PostgresDisputeStore {
  async transaction(fn) {
    const client = await pool.connect();
    try { await client.query('BEGIN'); const result = await fn(client); await client.query('COMMIT'); return result; }
    catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
  }
  async get(disputeId) {
    const result = await pool.query('SELECT * FROM financial_disputes WHERE id = $1', [disputeId]);
    return result.rows[0] || null;
  }
}

class MemoryDisputeStore {
  constructor() { this.disputes = new Map(); this.evidence = []; this.events = []; this.notifications = []; this.actions = []; }
  async get(idValue) { return this.disputes.get(idValue) || null; }
  async saveDispute(value) { this.disputes.set(value.id, value); }
  async updateDispute(value) { this.disputes.set(value.id, value); }
  async findByIdempotency(actorId, key) {
    return [...this.disputes.values()].find((d) => d.opened_by === actorId && d.ai_metadata?.idempotency_key === key) || null;
  }
  async saveEvidence(value) { this.evidence.push(value); }
  async saveEvent(value) { this.events.push(value); }
  async saveNotification(value) { this.notifications.push(value); }
  async saveAction(value) { this.actions.push(value); }
  async findAction(disputeId, key) { return this.actions.find((a) => a.dispute_id === disputeId && a.idempotency_key === key) || null; }
  async listDue(clock) { return [...this.disputes.values()].filter((d) => new Date(d.sla_due_at) <= clock()); }
}

class FinancialDisputeService {
  constructor({ store, financialAdapter, notifier, clock } = {}) {
    this.store = store || new PostgresDisputeStore();
    this.adapter = financialAdapter || {
      post: async ({ action, amount, currency, dispute, context }) => ledger.createLedgerEntry({
        economy: dispute.economy || 'northeast', type: action === 'clawback' ? 'debit' : 'credit',
        amount: action === 'clawback' ? -amount : amount, currency,
        description: `${action} for dispute ${dispute.dispute_number}`, reference: dispute.id,
        category: `dispute_${action}`, accountId: dispute.source_id,
      }, { createdBy: actor(context), correlationId: correlation(context) }),
    };
    this.notifier = notifier || (async () => ({ delivered: false, reason: 'notification adapter unavailable' }));
    this.clock = clock || now;
  }

  async createDispute(input = {}, context = {}) {
    requireActor(context);
    if (!['order', 'procurement', 'escrow', 'claim', 'subsidy', 'erp'].includes(input.sourceType) || !input.sourceId) throw new DisputeError('A supported sourceType and sourceId are required');
    const amount = Number(input.amount);
    if (!Number.isFinite(amount) || amount < 0) throw new DisputeError('amount must be a non-negative number');
    const key = input.idempotencyKey;
    if (!key || key.length > 200) throw new DisputeError('idempotencyKey is required', 'DISPUTE_IDEMPOTENCY_REQUIRED');
    const existing = await this.findByIdempotency(actor(context), key);
    if (existing) return existing;
    const dispute = {
      id: id(), dispute_number: `DSP-${this.clock().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${crypto.randomBytes(3).toString('hex')}`,
      opened_by: actor(context), respondent_id: input.respondentId || null, source_type: input.sourceType, source_id: String(input.sourceId),
      amount, currency: input.currency || 'INR', reason: String(input.reason || '').trim(), status: STATUSES.OPEN,
      sla_due_at: input.slaDueAt || addDays(7), reviewer_id: null, mediator_id: null, resolution: null,
      ai_metadata: {
        idempotency_key: key, classification: classify(input.reason), requires_human_approval: true,
        canonical_service: CANONICAL_SOURCE_SERVICES[input.sourceType],
      },
      correlation_id: correlation(context), created_at: this.clock(), updated_at: this.clock(),
    };
    if (!dispute.reason) throw new DisputeError('reason is required');
    await this.persistDispute(dispute);
    await this.recordEvent(dispute, 'opened', null, STATUSES.OPEN, context, { idempotencyKey: key });
    return dispute;
  }

  async getDispute(disputeId) {
    const dispute = await this.store.get(disputeId);
    if (!dispute) throw new DisputeError('Dispute not found', 'DISPUTE_NOT_FOUND', 404);
    return dispute;
  }
  async addEvidence(disputeId, input = {}, context = {}) {
    requireActor(context); const dispute = await this.getDispute(disputeId);
    if (![STATUSES.OPEN, STATUSES.ON_HOLD, STATUSES.EVIDENCE].includes(dispute.status)) throw new DisputeError('Evidence cannot be added in this status', 'DISPUTE_INVALID_TRANSITION');
    if (!input.kind || !input.uri) throw new DisputeError('kind and uri are required');
    const evidence = { id: id(), dispute_id: disputeId, submitted_by: actor(context), kind: input.kind, uri: input.uri, sha256: input.sha256 || null, metadata: input.metadata || {}, created_at: this.clock() };
    await this.persistEvidence(evidence); return evidence;
  }
  async transition(disputeId, to, action, context = {}, details = {}) {
    requireActor(context); const dispute = await this.getDispute(disputeId); ensureTransition(dispute.status, to);
    await this.updateStatus(dispute, to, context, action, details); return dispute;
  }
  async assignReviewer(disputeId, reviewerId, context = {}) {
    requireActor(context); const dispute = await this.getDispute(disputeId);
    if (String(reviewerId) === String(dispute.opened_by)) throw new DisputeError('Segregation of duties violation', 'DISPUTE_SOD_VIOLATION');
    dispute.reviewer_id = reviewerId; await this.updateStatus(dispute, STATUSES.REVIEW, context, 'review_assigned', { reviewerId }); return dispute;
  }
  async approveResolution(disputeId, resolution = {}, context = {}) {
    requireActor(context); const dispute = await this.getDispute(disputeId);
    if (dispute.status !== STATUSES.PENDING) throw new DisputeError('Dispute is not awaiting resolution approval', 'DISPUTE_INVALID_TRANSITION');
    if (String(dispute.opened_by) === actor(context) || String(dispute.reviewer_id) === actor(context)) throw new DisputeError('Approver must be independent of opener and reviewer', 'DISPUTE_SOD_VIOLATION');
    const amount = Number(resolution.amount || 0);
    if (!resolution.decision || !['uphold', 'deny', 'partial'].includes(resolution.decision)) throw new DisputeError('A valid resolution decision is required');
    if (!Number.isFinite(amount) || amount < 0 || amount > Number(dispute.amount)) throw new DisputeError('Resolution amount exceeds disputed amount', 'DISPUTE_FINANCIAL_INVARIANT');
    dispute.resolution = { decision: resolution.decision, amount, action: resolution.action || null, approved_by: actor(context), approved_at: this.clock().toISOString(), human_approved: true };
    if (resolution.action && amount > 0) await this.applyFinancialAction(dispute, resolution.action, amount, context, resolution.idempotencyKey || `${dispute.id}:resolution`);
    await this.updateStatus(dispute, STATUSES.RESOLVED, context, 'resolution_approved', { resolution: dispute.resolution }); return dispute;
  }
  async applyFinancialAction(dispute, action, amount, context, key) {
    if (!FINANCIAL_ACTIONS.has(action)) throw new DisputeError('Unsupported financial action');
    if (!key) throw new DisputeError('idempotencyKey is required for financial action', 'DISPUTE_IDEMPOTENCY_REQUIRED');
    const previous = await this.findAction(dispute.id, key); if (previous) return previous;
    const result = await this.adapter.post({ action, amount, currency: dispute.currency, dispute, context });
    if (!result || (!result.transaction_id && !result.transactionId && !result.id)) throw new DisputeError('Financial adapter did not confirm the ledger transaction', 'DISPUTE_EXTERNAL_UNAVAILABLE', 503);
    const financialAction = { id: id(), dispute_id: dispute.id, action, amount, currency: dispute.currency, ledger_transaction_id: result.transaction_id || result.transactionId || result.id, actor_id: actor(context), correlation_id: correlation(context), idempotency_key: key, created_at: this.clock() };
    await this.persistAction(financialAction); return financialAction;
  }
  async settle(disputeId, context = {}) { const d = await this.transition(disputeId, STATUSES.SETTLED, 'settled', context); return d; }
  async close(disputeId, context = {}) { return this.transition(disputeId, STATUSES.CLOSED, 'closed', context); }
  async appeal(disputeId, input = {}, context = {}) { return this.transition(disputeId, STATUSES.APPEALED, 'appealed', context, { reason: input.reason || null }); }
  async notify(disputeId, event, context = {}) {
    const d = await this.getDispute(disputeId); const recipients = [d.opened_by, d.respondent_id].filter(Boolean);
    const results = []; for (const recipientId of recipients) { const result = await this.notifier({ dispute: d, recipientId, event, correlationId: correlation(context) }); await this.persistNotification({ dispute_id: d.id, recipient_id: recipientId, event, delivered_at: result?.delivered ? this.clock() : null }); results.push({ recipientId, ...result }); } return results;
  }
  async escalateDue(context = {}) {
    const due = await this.listDue(); const results = [];
    for (const d of due) { if (['open', 'on_hold', 'evidence_requested'].includes(d.status)) results.push(await this.transition(d.id, STATUSES.REVIEW, 'sla_escalated', context, { slaDueAt: d.sla_due_at })); }
    return results;
  }

  async findByIdempotency(actorId, key) { if (this.store.findByIdempotency) return this.store.findByIdempotency(actorId, key); const r = await pool.query('SELECT * FROM financial_disputes WHERE opened_by=$1 AND ai_metadata->>\'idempotency_key\'=$2', [actorId, key]); return r.rows[0] || null; }
  async listDue() { if (this.store.listDue) return this.store.listDue(this.clock()); const r = await pool.query("SELECT * FROM financial_disputes WHERE status IN ('open','on_hold','evidence_requested') AND sla_due_at <= NOW()"); return r.rows; }
  async persistDispute(d) { if (this.store.saveDispute) return this.store.saveDispute(d); await pool.query('INSERT INTO financial_disputes (id,dispute_number,opened_by,respondent_id,source_type,source_id,amount,currency,reason,status,sla_due_at,ai_metadata,correlation_id,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$14)', [d.id,d.dispute_number,d.opened_by,d.respondent_id,d.source_type,d.source_id,d.amount,d.currency,d.reason,d.status,d.sla_due_at,d.ai_metadata,d.correlation_id,d.created_at]); }
  async updateStatus(d, to, context, action, details) { const from = d.status; d.status = to; d.updated_at = this.clock(); if (to === STATUSES.RESOLVED) d.resolved_at = this.clock(); if (to === STATUSES.CLOSED) d.closed_at = this.clock(); if (this.store.updateDispute) await this.store.updateDispute(d); else await pool.query('UPDATE financial_disputes SET status=$2,reviewer_id=$3,resolution=$4,updated_at=$5,resolved_at=$6,closed_at=$7 WHERE id=$1', [d.id,to,d.reviewer_id,d.resolution,d.updated_at,d.resolved_at || null,d.closed_at || null]); await this.recordEvent(d, action, from, to, context, details); }
  async recordEvent(d, action, from, to, context, details) { const event = { dispute_id: d.id, action, from_status: from, to_status: to, actor_id: actor(context), correlation_id: correlation(context), details, created_at: this.clock() }; if (this.store.saveEvent) return this.store.saveEvent(event); await pool.query('INSERT INTO financial_dispute_events (dispute_id,action,from_status,to_status,actor_id,correlation_id,details,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [event.dispute_id,event.action,event.from_status,event.to_status,event.actor_id,event.correlation_id,event.details,event.created_at]); }
  async persistEvidence(e) { if (this.store.saveEvidence) return this.store.saveEvidence(e); await pool.query('INSERT INTO financial_dispute_evidence (id,dispute_id,submitted_by,kind,uri,sha256,metadata,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [e.id,e.dispute_id,e.submitted_by,e.kind,e.uri,e.sha256,e.metadata,e.created_at]); }
  async persistAction(a) { if (this.store.saveAction) return this.store.saveAction(a); await pool.query('INSERT INTO financial_dispute_financial_actions (id,dispute_id,action,amount,currency,ledger_transaction_id,idempotency_key,actor_id,correlation_id,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', [a.id,a.dispute_id,a.action,a.amount,a.currency,a.ledger_transaction_id,a.idempotency_key,a.actor_id,a.correlation_id,a.created_at]); }
  async findAction(disputeId, key) { if (this.store.findAction) return this.store.findAction(disputeId, key); const r = await pool.query('SELECT * FROM financial_dispute_financial_actions WHERE dispute_id=$1 AND idempotency_key=$2', [disputeId,key]); return r.rows[0] || null; }
  async persistNotification(n) { if (this.store.saveNotification) return this.store.saveNotification(n); await pool.query('INSERT INTO financial_dispute_notifications (dispute_id,recipient_id,event,delivered_at) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING', [n.dispute_id,n.recipient_id,n.event,n.delivered_at]); }
}

function classify(reason = '') {
  const text = String(reason).toLowerCase();
  const terms = [['delivery', 'delivery'], ['quality', 'quality'], ['tax', 'gst'], ['subsidy', 'subsidy'], ['payment', 'payment']];
  const match = terms.find(([, term]) => text.includes(term));
  return { label: match ? match[0] : 'other', confidence: match ? 0.7 : 0, method: 'bounded_keyword_v1', recommendation: 'human_review' };
}

module.exports = {
  STATUSES, CANONICAL_SOURCE_SERVICES, DisputeError, MemoryDisputeStore, FinancialDisputeService, classify,
};
