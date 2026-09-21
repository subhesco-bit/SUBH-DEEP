'use strict';

const {
  FinancialDisputeService, MemoryDisputeStore,
} = require('../services/financialDisputeService');

function context(actorId, role = 'finance_checker') {
  return { actorId, role, correlationId: `corr-${actorId}` };
}

describe('financial dispute lifecycle', () => {
  let store;
  let posted;
  let service;

  beforeEach(() => {
    store = new MemoryDisputeStore();
    posted = [];
    service = new FinancialDisputeService({
      store,
      financialAdapter: {
        post: async (input) => {
          posted.push(input);
          return { transactionId: `ledger-${posted.length}` };
        },
      },
    });
  });

  it('is idempotent and retains bounded AI metadata for human review', async () => {
    const input = {
      sourceType: 'order', sourceId: 'order-1', amount: 1000,
      reason: 'quality mismatch', idempotencyKey: 'same-request',
    };
    const first = await service.createDispute(input, context('buyer-1', 'buyer'));
    const second = await service.createDispute(input, context('buyer-1', 'buyer'));
    expect(second.id).toBe(first.id);
    expect(first.ai_metadata).toMatchObject({
      classification: { label: 'quality', recommendation: 'human_review' },
      requires_human_approval: true,
    });
  });

  it('enforces segregation of duties and financial bounds', async () => {
    const dispute = await service.createDispute({
      sourceType: 'escrow', sourceId: 'esc-1', amount: 200,
      reason: 'payment issue', idempotencyKey: 'k1',
    }, context('opener', 'buyer'));
    await service.assignReviewer(dispute.id, 'reviewer', context('manager'));
    await service.transition(dispute.id, 'resolution_pending', 'resolution_requested', context('reviewer'));
    await expect(service.approveResolution(dispute.id, {
      decision: 'uphold', amount: 201,
    }, context('approver'))).rejects.toMatchObject({ code: 'DISPUTE_FINANCIAL_INVARIANT' });
    await expect(service.approveResolution(dispute.id, {
      decision: 'uphold', amount: 100, action: 'adjustment', idempotencyKey: 'a1',
    }, context('reviewer'))).rejects.toMatchObject({ code: 'DISPUTE_SOD_VIOLATION' });
  });

  it('posts one canonical financial action and requires human approval', async () => {
    const dispute = await service.createDispute({
      sourceType: 'claim', sourceId: 'claim-1', amount: 200,
      reason: 'delivery not received', idempotencyKey: 'k2',
    }, context('opener'));
    await service.assignReviewer(dispute.id, 'reviewer', context('manager'));
    await service.transition(dispute.id, 'resolution_pending', 'resolution_requested', context('reviewer'));
    const resolved = await service.approveResolution(dispute.id, {
      decision: 'partial', amount: 75, action: 'reversal', idempotencyKey: 'a2',
    }, context('approver'));
    expect(resolved.status).toBe('resolved');
    expect(posted).toHaveLength(1);
    expect(posted[0].action).toBe('reversal');
  });

  it('fails closed when the financial adapter does not confirm a ledger entry', async () => {
    const failing = new FinancialDisputeService({
      store,
      financialAdapter: { post: async () => null },
    });
    const dispute = await failing.createDispute({
      sourceType: 'erp', sourceId: 'erp-1', amount: 50,
      reason: 'invoice issue', idempotencyKey: 'k3',
    }, context('opener'));
    await failing.assignReviewer(dispute.id, 'reviewer', context('manager'));
    await failing.transition(dispute.id, 'resolution_pending', 'resolution_requested', context('reviewer'));
    await expect(failing.approveResolution(dispute.id, {
      decision: 'uphold', amount: 50, action: 'adjustment', idempotencyKey: 'a3',
    }, context('approver'))).rejects.toMatchObject({
      code: 'DISPUTE_EXTERNAL_UNAVAILABLE', statusCode: 503,
    });
  });
});
