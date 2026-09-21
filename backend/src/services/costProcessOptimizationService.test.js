'use strict';

const {
  calculateCostPlan,
  assessProcess,
} = require('./costProcessOptimizationService');

describe('cost and process optimization contracts', () => {
  test('calculates bounded cost savings without negative savings', () => {
    const result = calculateCostPlan({
      costItems: [
        { key: 'transport', baseline: 1000, target: 700 },
        { key: 'packaging', baseline: 300, target: 350 },
      ],
    });
    expect(result.baseline).toBe(1300);
    expect(result.target).toBe(1050);
    expect(result.savings).toBe(250);
    expect(result.items[1].savings).toBe(0);
  });

  test('ranks process bottlenecks using cycle, wait, and error metrics', () => {
    const result = assessProcess({
      processKey: 'order-to-cash',
      steps: [
        { key: 'approval', cycleTime: 2, waitTime: 10, errorRate: 0.1 },
        { key: 'dispatch', cycleTime: 8, waitTime: 1, errorRate: 0.05 },
      ],
    });
    expect(result.totalCycleTime).toBe(10);
    expect(result.totalWaitTime).toBe(11);
    expect(result.bottlenecks[0].key).toBe('approval');
  });

  test('rejects invalid process metrics', () => {
    expect(() => assessProcess({
      processKey: 'procurement',
      steps: [{ key: 'quote', cycleTime: 1, waitTime: 0, errorRate: 2 }],
    })).toThrow('errorRate must be between 0 and 1');
  });
});
