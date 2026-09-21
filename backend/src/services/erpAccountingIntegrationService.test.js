'use strict';

const {
  createErpAccountingIntegration,
  canonicalId,
} = require('./erpAccountingIntegrationService');

function mockDb(rows = []) {
  return {
    queries: [],
    async query(text, params) {
      this.queries.push({ text, params });
      if (text.startsWith('SELECT id, company_id')) {
        if (params[0] === 'draft-journal') return { rows: [] };
        return { rows: [{
          id: 'journal-1',
          company_id: 'org-1',
          entry_number: 'JE-1',
          currency: 'INR',
          correlation_id: 'corr-1',
        }] };
      }
      if (text.startsWith('SELECT account_id')) {
        return { rows: [
          { account_id: 'cash', debit: 100, credit: 0 },
          { account_id: 'sales', debit: 0, credit: 100 },
        ] };
      }
      if (text.startsWith('SELECT event_id')) return { rows };
      return { rows: [] };
    },
  };
}

const balancedLines = [
  { accountId: 'cash', direction: 'debit', amount: 100 },
  { accountId: 'sales', direction: 'credit', amount: 100 },
];

describe('ERP accounting integration slice', () => {
  it('uses stable canonical IDs and atomically creates both outbox boundaries', async () => {
    const db = mockDb();
    const integration = createErpAccountingIntegration({
      db,
      adapter: { call: jest.fn() },
      authorization: { hasPermission: jest.fn().mockResolvedValue(true) },
    });

    const result = await integration.enqueueJournal({
      actorId: 'user-1',
      organizationId: 'org-1',
      journalEntryId: 'journal-1',
      lines: balancedLines,
      idempotencyKey: 'order-1-v1',
    });

    expect(result.canonicalDocumentId).toBe('erp:document:journal:journal-1');
    expect(db.queries.map(({ text }) => text)).toEqual(expect.arrayContaining([
      'BEGIN',
      expect.stringContaining('erp_accounting_outbox'),
      expect.stringContaining('platform_event_outbox'),
      'COMMIT',
    ]));
    expect(db.queries.find(({ text }) => text.startsWith('SELECT account_id')).text)
      .toContain('debit, credit');
  });

  it('fails closed when the accounting permission cannot be established', async () => {
    const db = mockDb();
    const integration = createErpAccountingIntegration({
      db,
      adapter: { call: jest.fn() },
      authorization: { hasPermission: jest.fn().mockResolvedValue(false) },
    });

    await expect(integration.enqueueJournal({
      actorId: 'user-1',
      organizationId: 'org-1',
      journalEntryId: 'journal-1',
      lines: balancedLines,
    })).rejects.toMatchObject({ code: 'ERP_PERMISSION_DENIED' });
    expect(db.queries).toHaveLength(0);
  });

  it('does not create an ERP handoff for a journal still in workflow', async () => {
    const integration = createErpAccountingIntegration({
      db: mockDb(),
      adapter: { call: jest.fn() },
      authorization: { hasPermission: jest.fn().mockResolvedValue(true) },
    });

    await expect(integration.enqueueJournal({
      actorId: 'user-1',
      organizationId: 'org-1',
      journalEntryId: 'draft-journal',
      lines: balancedLines,
    })).rejects.toMatchObject({ code: 'ERP_WORKFLOW_NOT_POSTED' });
  });

  it('retries adapter failures and marks the item terminal after max attempts', async () => {
    const db = mockDb([{
      event_id: '00000000-0000-0000-0000-000000000001',
      idempotency_key: 'order-1-v1',
      canonical_document_id: canonicalId('document', 'order-1'),
      payload: { lines: balancedLines },
      attempts: 4,
    }]);
    const adapter = { call: jest.fn().mockRejectedValue({ code: 'INTEGRATION_TIMEOUT' }) };
    const integration = createErpAccountingIntegration({
      db, adapter, maxAttempts: 5,
    });

    await expect(integration.dispatchPending()).resolves.toEqual([{
      eventId: '00000000-0000-0000-0000-000000000001',
      status: 'failed',
    }]);
    expect(adapter.call).toHaveBeenCalledWith('accounting', 'journal-post', expect.any(Object));
    expect(db.queries.at(-1).params[1]).toBe('failed');
  });

  it('reconciles an external posted result without inventing a local success', async () => {
    const db = mockDb([{
      event_id: '00000000-0000-0000-0000-000000000001',
      idempotency_key: 'order-1-v1',
      canonical_document_id: canonicalId('document', 'order-1'),
    }]);
    const adapter = {
      call: jest.fn().mockResolvedValue({ data: { status: 'posted', reference: 'EXT-1' } }),
    };
    const integration = createErpAccountingIntegration({ db, adapter });

    await expect(integration.reconcile('00000000-0000-0000-0000-000000000001'))
      .resolves.toMatchObject({ status: 'posted' });
    expect(adapter.call).toHaveBeenCalledWith('accounting', 'journal-status', expect.any(Object));
  });
});
