'use strict';

jest.mock('../database/pool', () => ({ connect: jest.fn(), query: jest.fn() }));

const pool = require('../database/pool');
const accounting = require('./accountingWorkflowService');

describe('accounting workflow validation', () => {
  test('requires balanced, single-sided lines', () => {
    expect(() => accounting.validateLines([
      { accountId: 1, debit: 100 },
      { accountId: 2, credit: 100 },
    ])).not.toThrow();
    expect(() => accounting.validateLines([
      { accountId: 1, debit: 100 },
      { accountId: 2, credit: 90 },
    ])).toThrow('not balanced');
    expect(() => accounting.validateLines([
      { accountId: 1, debit: 100, credit: 1 },
      { accountId: 2, credit: 99 },
    ])).toThrow('exactly one');
  });

  test('AI classification is bounded and remains pending for human approval', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, status: 'pending', confidence: 0.8, payload: { accountType: 'revenue' } }] });
    const suggestion = await accounting.suggestClassification({ description: 'sale of rice' });
    expect(Number(suggestion.confidence)).toBeLessThanOrEqual(0.85);
    expect(suggestion.status).toBe('pending');
    expect(pool.query.mock.calls[0][0]).toContain('accounting_ai_suggestions');
  });
});
