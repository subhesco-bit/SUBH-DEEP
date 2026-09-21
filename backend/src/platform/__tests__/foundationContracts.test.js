const masterDataService = require('../masterData/masterDataService');
const workflowEngine = require('../workflow/workflowEngine');
const eventBus = require('../events/eventBus');

describe('platform foundation contracts', () => {
  beforeEach(async () => {
    masterDataService.records.clear();
    masterDataService.versions.clear();
    await eventBus.clearHistory();
  });

  it('validates, versions, and merges master data records', async () => {
    const farmer = await masterDataService.upsertRecord('farmer', {
      id: 'farmer-1',
      email: 'farmer@example.com',
      name: 'A Farmer',
    }, { id: 'operator-1' });
    expect(farmer.version).toBe(1);
    expect((await masterDataService.validateDataQuality('farmer', farmer)).isValid).toBe(true);

    await masterDataService.upsertRecord('farmer', {
      id: 'farmer-2',
      email: 'farmer@example.com',
      name: 'Duplicate Farmer',
    });
    expect((await masterDataService.detectDuplicates('farmer', {
      email: 'farmer@example.com',
    })).count).toBe(2);

    const result = await masterDataService.mergeDuplicates('farmer', ['farmer-2'], 'farmer-1');
    expect(result.mergedIds).toEqual(['farmer-2']);
    expect((await masterDataService.getVersionHistory('farmer', 'farmer-1')).length).toBe(1);
  });

  it('preserves workflow transition history and rejects invalid transitions', async () => {
    const code = `test_order_${Date.now()}`;
    workflowEngine.registerWorkflow(code, {
      initialState: 'draft',
      states: {
        draft: { transitions: ['submitted'] },
        submitted: { transitions: [], terminalStatus: 'completed' },
      },
    });
    const instance = await workflowEngine.startWorkflow(code, 'order', 'order-1');
    const completed = await workflowEngine.transitionStep(instance.workflowInstanceId, 'submitted', {}, { id: 'operator-1' });
    expect(completed.history[1].from).toBe('draft');
    await expect(
      workflowEngine.transitionStep(instance.workflowInstanceId, 'draft'),
    ).rejects.toMatchObject({ code: 'WORKFLOW_TERMINAL' });
  });

  it('supports correlation and idempotent event delivery', async () => {
    const received = [];
    await eventBus.subscribe('order.created', async (event) => received.push(event));
    const first = await eventBus.publishEvent('order.created', { orderId: 'order-1' }, {
      idempotencyKey: 'order-created-1',
      correlationId: 'corr-1',
    });
    const duplicate = await eventBus.publishEvent('order.created', { orderId: 'order-1' }, {
      idempotencyKey: 'order-created-1',
      correlationId: 'corr-1',
    });

    expect(first.duplicate).toBe(false);
    expect(duplicate.duplicate).toBe(true);
    expect(received).toHaveLength(1);
    expect(received[0].correlationId).toBe('corr-1');
  });
});
