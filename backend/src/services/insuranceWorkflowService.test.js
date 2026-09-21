'use strict';

const {
  InsuranceWorkflowService,
  MemoryInsuranceRepository,
} = require('./insuranceWorkflowService');

const context = { actorId: 'farmer-1', role: 'farmer' };

function makeService(overrides = {}) {
  return new InsuranceWorkflowService({
    repository: new MemoryInsuranceRepository(),
    ...overrides,
  });
}

describe('insurance workflow contract', () => {
  test('inventories source-aligned policy classes without claiming contract-only classes complete', () => {
    const classes = makeService().listPolicyClasses();
    expect(classes.map((item) => item.id)).toEqual(expect.arrayContaining([
      'medical_health', 'crop', 'weather_parametric', 'livestock', 'dairy', 'fishery',
      'transit', 'warehouse_cold_chain', 'product_quality_recall', 'asset_equipment',
      'property_infrastructure', 'liability', 'credit_loan_protection', 'personal_accident_life',
    ]));
    expect(classes.find((item) => item.id === 'crop').workflowStatus).toBe('implemented_subset');
    expect(classes.find((item) => item.id === 'medical_health').workflowStatus).toBe('contract_only');
  });

  test('requires policy-specific evidence and is idempotent', async () => {
    const service = makeService();
    await service.registerPolicy({ id: 'p-1', policyClass: 'crop', holderId: 'farmer-1', coverageLimit: 1000 }, context);
    await expect(service.submitClaim({
      policyId: 'p-1', amount: 500, idempotencyKey: 'k-1', evidence: { incident_location: 'A' },
    }, context)).rejects.toMatchObject({ code: 'INSURANCE_EVIDENCE_INCOMPLETE' });
    const input = {
      policyId: 'p-1', amount: 500, idempotencyKey: 'k-1',
      evidence: { incident_location: 'A', loss_assessment: 'loss-1' },
    };
    const first = await service.submitClaim(input, context);
    const second = await service.submitClaim(input, context);
    expect(second.id).toBe(first.id);
    expect(first.state).toBe('human_review');
  });

  test('records AI advice but requires a human adjudicator before approval', async () => {
    const service = makeService();
    await service.registerPolicy({ id: 'p-2', policyClass: 'transit', holderId: 'farmer-1', coverageLimit: 1000 }, context);
    const claim = await service.submitClaim({
      policyId: 'p-2', amount: 400, idempotencyKey: 'k-2',
      evidence: { dispatch_record: 'dispatch', loss_assessment: 'loss' },
    }, context);
    await service.recommend(claim.id, { decision: 'approve', amount: 400, confidence: 0.99 }, context);
    await expect(service.releasePayout(claim.id, context))
      .rejects.toMatchObject({ code: 'INSURANCE_PAYOUT_NOT_APPROVED' });
    await expect(service.adjudicate(claim.id, { decision: 'approve', amount: 400 }, context))
      .rejects.toMatchObject({ code: 'INSURANCE_HUMAN_APPROVAL_REQUIRED' });
    const approved = await service.adjudicate(
      claim.id, { decision: 'approve', amount: 400 }, { actorId: 'adjuster-1', role: 'adjuster' },
    );
    expect(approved.state).toBe('approved');
  });

  test('fails closed without a configured payout provider and calls hooks only after confirmed payout', async () => {
    const audit = [];
    const service = makeService({ auditHook: async (event) => audit.push(event) });
    await service.registerPolicy({ id: 'p-3', policyClass: 'livestock', holderId: 'farmer-1', coverageLimit: 1000 }, context);
    const claim = await service.submitClaim({
      policyId: 'p-3', amount: 300, idempotencyKey: 'k-3',
      evidence: { animal_register: 'animals', loss_assessment: 'loss' },
    }, context);
    await service.adjudicate(claim.id, { decision: 'approve', amount: 300 }, { actorId: 'a-1', role: 'claims_officer' });
    await expect(service.releasePayout(claim.id, { actorId: 'a-1', role: 'claims_officer' }))
      .rejects.toMatchObject({ code: 'INSURANCE_PROVIDER_NOT_CONFIGURED' });
    expect(audit.some((event) => event.type === 'claim_state_changed')).toBe(true);
  });

  test('settles only after provider and ledger confirmations, and exposes a dispute hook', async () => {
    const disputes = [];
    const service = makeService({
      payoutAdapter: { pay: async () => ({ success: true, amount: 250, reference: 'pay-1' }) },
      ledgerHook: async () => ({ recorded: true }),
      disputeHook: async ({ claim }) => { disputes.push(claim.id); return { recorded: true }; },
    });
    await service.registerPolicy({ id: 'p-4', policyClass: 'weather_parametric', holderId: 'farmer-1', coverageLimit: 500 }, context);
    const claim = await service.submitClaim({
      policyId: 'p-4', amount: 250, idempotencyKey: 'k-4',
      evidence: { incident_location: 'A', weather_event: 'flood' },
    }, context);
    await service.adjudicate(claim.id, { decision: 'approve', amount: 250 }, { actorId: 'a-2', role: 'adjuster' });
    const settled = await service.releasePayout(claim.id, { actorId: 'a-2', role: 'adjuster' });
    expect(settled.state).toBe('settled');
    const disputed = await service.openDispute(settled.id, { reason: 'amount challenged' }, context);
    expect(disputed.state).toBe('disputed');
    expect(disputes).toEqual([claim.id]);
  });
});
