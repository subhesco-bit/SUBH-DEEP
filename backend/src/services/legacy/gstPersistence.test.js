'use strict';

jest.mock('../../database/pool', () => ({ query: jest.fn() }));
const mockPool = require('../../database/pool');

const gst = require('./gstService');

describe('GST PostgreSQL persistence boundary', () => {
  beforeEach(() => mockPool.query.mockReset());

  test('writes profile and audit event to migration-backed tables', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ id: 'profile-1', gstin: '22AAAAA0000A1Z5', validation_status: 'valid' }] })
      .mockResolvedValueOnce({ rows: [] });
    const profile = await gst.persistProfile({
      gstin: '22AAAAA0000A1Z5', legalName: 'Co-op', stateCode: '22',
    }, 'actor-1');
    expect(profile.id).toBe('profile-1');
    expect(mockPool.query.mock.calls[0][0]).toContain('INSERT INTO gst_profiles');
    expect(mockPool.query.mock.calls[1][0]).toContain('INSERT INTO gst_audit_events');
  });

  test('persists invoice and idempotency record instead of using the memory store', async () => {
    mockPool.query
      .mockResolvedValueOnce({ rows: [{ id: 'profile-1' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 'invoice-1', invoice_number: 'INV-1' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    const invoice = await gst.persistInvoice({
      invoiceNumber: 'INV-1', idempotencyKey: 'idem-1',
      seller: { gstin: '22AAAAA0000A1Z5', legalName: 'Co-op', stateCode: '22' },
      sellerState: '22', buyerState: '22',
      items: [{ hsnCode: '1006', quantity: 1, unitPrice: 50 }],
    }, 'actor-1');
    expect(invoice.id).toBe('invoice-1');
    expect(mockPool.query.mock.calls.some(([sql]) => sql.includes('gst_canonical_invoices'))).toBe(true);
    expect(mockPool.query.mock.calls.some(([sql]) => sql.includes('gst_idempotency_keys'))).toBe(true);
  });

  test('fails closed when PostgreSQL is unavailable', async () => {
    mockPool.query.mockRejectedValue(new Error('connection refused'));
    await expect(gst.persistProfile({
      gstin: '22AAAAA0000A1Z5', legalName: 'Co-op', stateCode: '22',
    }, 'actor-1')).rejects.toMatchObject({ code: 'GST_DATABASE_UNAVAILABLE', status: 503 });
  });
});
