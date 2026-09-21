const workflowEngine = require('../platform/workflow/workflowEngine');
const rulesEngine = require('../platform/rules/rulesEngine');
const conceptRegistry = require('../core/conceptRegistry');
const { createDecision, approveDecision, rejectDecision } = require('../core/ai/decisionContract');

describe('concept foundation engines', () => {
  test('enforces workflow transitions and preserves history', async () => {
    const code = `test-order-${Date.now()}`;
    workflowEngine.registerWorkflow(code, {
      initialState: 'draft',
      states: {
        draft: { transitions: [{ to: 'approved', guard: (data) => data.total > 0 }] },
        approved: { transitions: ['settled'] },
        settled: { transitions: [], terminalStatus: 'completed' },
      },
    });

    const started = await workflowEngine.startWorkflow(code, 'order', 'order-1', { total: 10 });
    await expect(workflowEngine.transitionStep(started.workflowInstanceId, 'settled'))
      .rejects.toMatchObject({ code: 'WORKFLOW_INVALID_TRANSITION' });
    const approved = await workflowEngine.transitionStep(started.workflowInstanceId, 'approved');
    const completed = await workflowEngine.transitionStep(approved.workflowInstanceId, 'settled');

    expect(completed.status).toBe('completed');
    expect(completed.history).toHaveLength(3);
  });

  test('evaluates registered rules and rejects unknown rules', async () => {
    const code = `minimum-order-${Date.now()}`;
    await rulesEngine.registerRule(code, {
      category: 'commerce',
      evaluate: ({ quantity }) => ({
        passed: quantity >= 5,
        reason: quantity >= 5 ? 'Minimum met' : 'Minimum not met',
        data: { minimum: 5 },
      }),
    });

    await expect(rulesEngine.evaluateRule(code, { quantity: 2 }))
      .resolves.toMatchObject({ passed: false, data: { minimum: 5 } });
    await expect(rulesEngine.evaluateRule('missing-rule', {}))
      .rejects.toMatchObject({ code: 'RULE_NOT_FOUND' });
  });

  test('requires human approval for protected AI decisions', () => {
    const decision = createDecision({
      engineId: 'order-routing',
      action: 'confirm-order',
      recommendation: { route: 'reefer' },
      rationale: ['Perishable cargo requires temperature control'],
      sourceTags: ['src-rule'],
      confidence: { modelScore: 1, ruleMatchStrength: 1 },
    });

    expect(decision.status).toBe('pending_human_review');
    expect(approveDecision(decision, 'user-1').status).toBe('approved');
  });

  test('emits a complete auditable envelope and blocks autonomous side effects', () => {
    const decision = createDecision({
      engineId: 'subsidy-adapter',
      action: 'review-eligibility',
      recommendation: { eligible: true },
      inputs: [{ applicantId: 'a-1' }],
      source: ['adapter:subsidy', 'scheme:db'],
      confidence: { modelScore: 0.99, dataFreshness: 0.9 },
      explanation: 'Inputs match the published scheme rules.',
      correlationId: '00000000-0000-0000-0000-000000000002',
      sideEffects: ['submit-government-application'],
    });
    expect(decision).toMatchObject({
      inputs: [{ applicantId: 'a-1' }],
      source: ['adapter:subsidy', 'scheme:db'],
      explanation: 'Inputs match the published scheme rules.',
      recommendation: { eligible: true },
      correlationId: '00000000-0000-0000-0000-000000000002',
      blockedSideEffects: { blocked: true, autonomous: false },
      status: 'pending_human_review',
    });
    expect(rejectDecision(decision, 'reviewer-1', 'Missing land document').status).toBe('rejected');
  });

  test('keeps module, submodule, and feature ownership discoverable', () => {
    const feature = conceptRegistry.findFeature('logistics.dispatch');
    expect(feature.module.id).toBe('logistics');
    expect(feature.submodule.id).toBe('perishable-flow');
    expect(feature.feature.workflow).toBe('order-to-cash');
  });
});
