'use strict';

const { EventEmitter } = require('events');
const aiApproval = require('./aiApprovalService');
const auditService = require('./auditService');
const notificationService = require('./notificationService');
const { createDecision } = require('../core/ai/decisionContract');

// The contract is deliberately module-agnostic: domain services provide the
// subject and transition, while this boundary owns sequencing and evidence.
const MODULES = new Set([
  'iam', 'mdm', 'workflow', 'rules', 'notifications', 'dms', 'integration-hub',
  'event-bus', 'marketplace', 'farmer', 'finance', 'logistics', 'insurance',
  'greenhouse', 'subsidy', 'pricing', 'training', 'soil', 'contract-farming',
  'shared-infrastructure', 'government-schemes',
]);

const TRANSITIONS = Object.freeze({
  proposed: new Set(['approved', 'rejected']),
  approved: new Set(['executed']),
});
const HIGH_IMPACT_MODULES = new Set(['finance', 'insurance', 'pricing', 'subsidy']);

function assertModule(value, name) {
  if (!MODULES.has(value)) throw new Error(`${name} must be a supported module`);
}

function assertTransition(from, to) {
  if (!TRANSITIONS[from]?.has(to)) {
    throw new Error(`Invalid flow transition: ${from} -> ${to}`);
  }
}

function assertBusinessTransition(value) {
  if (!/^[a-z][a-z0-9._-]{1,79}$/.test(String(value || ''))) {
    throw new Error('transition must be a stable lowercase contract name');
  }
}

class CrossModuleFlowContractService {
  constructor(deps = {}) {
    this.approvals = deps.approvals || aiApproval;
    this.audit = deps.audit || auditService;
    this.notifications = deps.notifications || notificationService;
    this.events = deps.events || new EventEmitter();
  }

  async propose(input) {
    const {
      userId, sourceModule, targetModule, subjectType, subjectId,
      transition, currentValue, proposedValue, rationale, confidence,
      modelReference, approverId,
      correlationId,
    } = input || {};
    assertModule(sourceModule, 'sourceModule');
    assertModule(targetModule, 'targetModule');
    if (!transition || proposedValue === undefined || !rationale) {
      throw new Error('transition, proposedValue, and rationale are required');
    }
    assertBusinessTransition(transition);
    const decision = createDecision({
      engineId: modelReference || `flow:${sourceModule}->${targetModule}`,
      action: transition,
      recommendation: proposedValue,
      inputs: [{ subjectType, subjectId, currentValue }],
      source: [`module:${sourceModule}`, `module:${targetModule}`],
      confidence: confidence || {},
      explanation: rationale,
      correlationId,
      audit: { sourceModule, targetModule },
      sideEffects: [transition],
    });

    const proposal = await this.approvals.createProposal({
      userId,
      domain: `${sourceModule}->${targetModule}`,
      proposalType: 'cross_module_flow',
      subjectType,
      subjectId,
      currentValue,
      proposedValue: { transition, value: proposedValue },
      rationale,
      confidence,
      modelReference,
      correlationId: decision.correlationId,
      decisionEnvelope: decision,
    });
    const evidence = { sourceModule, targetModule, transition, approverId };
    await this.audit.logEvent({
      userId, action: 'flow.proposed', entityType: 'cross_module_flow',
      entityId: proposal.id, changes: { currentValue, proposedValue }, metadata: evidence,
    });
    if (approverId) {
      await this.notifications.sendNotification({
        userId: approverId, type: 'flow_approval_required',
        title: 'Cross-module flow requires approval',
        message: `${sourceModule} → ${targetModule} is awaiting human approval`,
        data: { proposalId: proposal.id, ...evidence },
      });
    }
    this.events.emit('flow.proposed', { proposal, ...evidence });
    return { proposal, decision, humanGate: true, evidence };
  }

  async decide({ proposalId, user, decision, rejectionReason }) {
    const to = decision;
    assertTransition('proposed', to);
    const proposal = await this.approvals.decideProposal({
      proposalId, user, decision: to, rejectionReason,
    });
    await this.audit.logEvent({
      userId: user.id, action: `flow.${to}`, entityType: 'cross_module_flow',
      entityId: proposalId, changes: { status: to }, metadata: { humanGated: true, correlationId: proposal?.correlation_id },
    });
    this.events.emit(`flow.${to}`, { proposal, actorId: user.id });
    return proposal;
  }

  async execute({ proposalId, user, sourceModule, targetModule }) {
    assertTransition('approved', 'executed');
    assertModule(sourceModule, 'sourceModule');
    assertModule(targetModule, 'targetModule');
    if ((HIGH_IMPACT_MODULES.has(sourceModule) || HIGH_IMPACT_MODULES.has(targetModule))
      && !['admin', 'superadmin'].includes(user?.role)) {
      throw new Error('High-impact flows require administrator execution');
    }
    const proposal = await this.approvals.executeProposal({ proposalId, user });
    await this.audit.logEvent({
      userId: user.id, action: 'flow.executed', entityType: 'cross_module_flow',
      entityId: proposalId, changes: { status: 'executed' },
      metadata: { humanGated: true, autonomousSideEffectsBlocked: true, executedByHuman: true },
    });
    this.events.emit('flow.executed', { proposal, actorId: user.id });
    return proposal;
  }
}

module.exports = new CrossModuleFlowContractService();
module.exports.CrossModuleFlowContractService = CrossModuleFlowContractService;
module.exports.MODULES = MODULES;
