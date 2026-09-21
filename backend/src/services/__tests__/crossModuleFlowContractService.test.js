'use strict';

const { CrossModuleFlowContractService } = require('../crossModuleFlowContractService');

function deps() {
  return {
    approvals: {
      createProposal: jest.fn().mockResolvedValue({ id: 'p-1', status: 'proposed' }),
      decideProposal: jest.fn().mockResolvedValue({ id: 'p-1', status: 'approved' }),
      executeProposal: jest.fn().mockResolvedValue({ id: 'p-1', status: 'executed' }),
    },
    audit: { logEvent: jest.fn().mockResolvedValue({ id: 'audit-1' }) },
    notifications: { sendNotification: jest.fn().mockResolvedValue({ notification_id: 'n-1' }) },
    events: { emit: jest.fn() },
  };
}

test('propose persists evidence, notifies an approver, and emits a contract event', async () => {
  const d = deps();
  const result = await new CrossModuleFlowContractService(d).propose({
    userId: 'u-1', sourceModule: 'marketplace', targetModule: 'logistics',
    subjectType: 'order', subjectId: 'o-1', transition: 'dispatch',
    proposedValue: { carrier: 'adapter-owned' }, rationale: 'validated order',
    approverId: 'u-2',
  });

  expect(result.humanGate).toBe(true);
  expect(d.approvals.createProposal).toHaveBeenCalledWith(expect.objectContaining({
    proposalType: 'cross_module_flow',
    domain: 'marketplace->logistics',
  }));
  expect(d.audit.logEvent).toHaveBeenCalledWith(expect.objectContaining({ action: 'flow.proposed' }));
  expect(d.notifications.sendNotification).toHaveBeenCalled();
  expect(d.events.emit).toHaveBeenCalledWith('flow.proposed', expect.any(Object));
});

test('rejects unsupported modules and invalid transitions before adapters are called', async () => {
  const d = deps();
  const service = new CrossModuleFlowContractService(d);
  await expect(service.propose({
    sourceModule: 'unknown', targetModule: 'finance', transition: 'x',
    proposedValue: {}, rationale: 'x',
  })).rejects.toThrow('supported module');
  await expect(service.decide({
    proposalId: 'p-1', user: { id: 'u-1' }, decision: 'executed',
  })).rejects.toThrow('Invalid flow transition');
  expect(d.approvals.createProposal).not.toHaveBeenCalled();
});

test('decision and execution retain human-gated audit hooks', async () => {
  const d = deps();
  const service = new CrossModuleFlowContractService(d);
  await service.decide({ proposalId: 'p-1', user: { id: 'u-1' }, decision: 'approved' });
  await service.execute({
    proposalId: 'p-1', user: { id: 'u-1', role: 'admin' },
    sourceModule: 'marketplace', targetModule: 'logistics',
  });
  expect(d.audit.logEvent).toHaveBeenCalledTimes(2);
  expect(d.events.emit).toHaveBeenCalledWith('flow.approved', expect.any(Object));
  expect(d.events.emit).toHaveBeenCalledWith('flow.executed', expect.any(Object));
});
