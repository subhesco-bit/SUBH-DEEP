'use strict';

const {
  SubsidyService,
  MemorySubsidyStore,
  PostgresSubsidyStore,
  SubsidyDatabaseUnavailableError,
  GovernmentAdapterUnavailableError,
} = require('../services/finance/subsidyService');

function service(overrides = {}) {
  return new SubsidyService({
    store: new MemorySubsidyStore(),
    ...overrides,
  });
}

const farmer = {
  applicant_type: 'farmer',
  applicant_id: 'farmer-1',
  state: 'Assam',
  category: 'infrastructure',
  estimated_cost: 100000,
  land_ownership: 'verified',
};

describe('canonical subsidy applicability flow', () => {
  test('uses deterministic rules and bounds AI to explanation metadata', async () => {
    const subsidy = service({
      aiRecommender: async () => ({
        scheme_code: 'NOT-ELIGIBLE',
        confidence: 99,
        source: 'model',
        explanation: 'recommendation',
        malicious_field: 'ignored',
      }),
    });
    const result = await subsidy.evaluateEligibility(farmer, 'farmer-1');
    expect(result.schemes.map((s) => s.code)).toEqual(['AIF', 'NESIDS']);
    expect(result.schemes[1].estimated_amount).toBe(90000);
    expect(result.ai_recommendation).toEqual({
      scheme_code: null,
      confidence: 1,
      source: 'model',
      explanation: 'recommendation',
    });
  });

  test('requires human approval and is idempotent', async () => {
    const subsidy = service();
    const eligibility = await subsidy.evaluateEligibility(farmer, 'farmer-1');
    const payload = { eligibility_id: eligibility.eligibility_id, idempotency_key: 'request-1' };
    const first = await subsidy.createApplication(payload, 'farmer-1');
    const second = await subsidy.createApplication(payload, 'farmer-1');
    expect(second.application_id).toBe(first.application_id);
    await expect(subsidy.submitApplication(first.application_id, 'farmer-1'))
      .rejects.toThrow('Human approval is required');
    await subsidy.approveApplication(first.application_id, 'admin-1');
    await expect(subsidy.submitApplication(first.application_id, 'admin-1'))
      .rejects.toBeInstanceOf(GovernmentAdapterUnavailableError);
    expect(first.status).toBe('approved');
    expect(subsidy.store.audit.map((entry) => entry.action))
      .toEqual(expect.arrayContaining(['eligibility.evaluated', 'application.created', 'application.approved']));
  });

  test('rejects incomplete farmer and FPO inputs', async () => {
    const subsidy = service();
    await expect(subsidy.evaluateEligibility({ ...farmer, land_ownership: undefined }, 'farmer-1'))
      .rejects.toThrow('land_ownership');
    await expect(subsidy.evaluateEligibility({
      ...farmer, applicant_type: 'fpo', registration_verified: false,
    }, 'fpo-1')).rejects.toThrow('registration_verified');
  });

  test('fails closed when PostgreSQL is unavailable', async () => {
    const subsidy = new SubsidyService({ store: new PostgresSubsidyStore(() => null) });
    await expect(subsidy.evaluateEligibility(farmer, 'farmer-1'))
      .rejects.toBeInstanceOf(SubsidyDatabaseUnavailableError);
  });
});
