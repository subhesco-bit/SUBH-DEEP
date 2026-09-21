'use strict';

const gst = require('./gstService');

describe('canonical GST applicability flow', () => {
  beforeEach(() => {
    gst.classificationSuggestions.clear();
    gst.idempotency.clear();
    gst.auditLog.length = 0;
    gst.invoices.clear();
    gst.creditNotes.clear();
  });

  test('validates GST profile and rejects state mismatch', () => {
    expect(gst.validateGSTProfile({
      gstin: '22AAAAA0000A1Z5', legalName: 'Farmer Co-op', stateCode: '22',
    }).valid).toBe(true);
    expect(gst.validateGSTProfile({
      gstin: '22AAAAA0000A1Z5', legalName: 'Farmer Co-op', stateCode: '18',
    }).valid).toBe(false);
  });

  test('classifications are bounded and require explicit human confirmation', () => {
    const suggestion = gst.classifyHSNSAC({ description: 'coffee' });
    expect(suggestion.requiresHumanConfirmation).toBe(true);
    expect(suggestion.candidates.length).toBeLessThanOrEqual(3);
    expect(() => gst.confirmClassification(suggestion.suggestionId, '9999', 'u1'))
      .toThrow(/bounded suggestions/);
    expect(gst.confirmClassification(suggestion.suggestionId, suggestion.candidates[0].code, 'u1').confirmed).toBe(true);
  });

  test('calculates deterministic intra/inter-state tax with paise rounding', () => {
    expect(gst.calculateTax({
      sellerState: '18', buyerState: '18',
      items: [{ hsnCode: '0901', quantity: 3, unitPrice: 10.01 }],
    })).toMatchObject({ taxableValue: 30.03, totalTax: 1.5, cgst: 0.75, sgst: 0.75, igst: 0 });
    expect(gst.calculateTax({
      sellerState: '18', buyerState: '22',
      items: [{ hsnCode: '9985', quantity: 1, unitPrice: 100 }],
    })).toMatchObject({ totalTax: 18, cgst: 0, sgst: 0, igst: 18 });
  });

  test('invoice idempotency returns one document and audit trail', () => {
    const payload = {
      idempotencyKey: 'invoice-1',
      seller: { gstin: '22AAAAA0000A1Z5', legalName: 'Co-op', stateCode: '22' },
      buyerState: '22', sellerState: '22',
      items: [{ hsnCode: '1006', quantity: 1, unitPrice: 50 }],
    };
    const first = gst.createInvoice(payload, 'u1');
    const second = gst.createInvoice(payload, 'u1');
    expect(second.id).toBe(first.id);
    expect(gst.getAudit('invoice', first.id)).toHaveLength(1);
  });

  test('external submission fails closed when adapter is unavailable', async () => {
    await expect(gst.callExternal('gst-einvoice', 'submit', { body: {} }))
      .rejects.toMatchObject({ code: 'GST_EXTERNAL_UNAVAILABLE', status: 503 });
  });
});
