jest.mock('../paymentService', () => ({
  getStatus: jest.fn(),
  processRazorpayPayment: jest.fn(),
}));

jest.mock('../../database/connection', () => ({
  getPostgreSQL: jest.fn(),
}));

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}));

jest.mock('../../core/signalBus', () => ({
  signalBus: { emitSignal: jest.fn() },
  SIGNAL: { PAYMENT_RECEIVED: 'PAYMENT_RECEIVED' },
  SEVERITY: { INFO: 'info' },
}));

const paymentService = require('../paymentService');
const { getPostgreSQL } = require('../../database/connection');
const { processPayment } = require('./orderService');

function makePgMock({ order, existingPayment = null, insertedPayment }) {
  const client = {
    query: jest.fn(async (sql) => {
      if (sql.startsWith('BEGIN') || sql.startsWith('COMMIT') || sql.startsWith('ROLLBACK')) {
        return {};
      }
      if (sql.startsWith('INSERT INTO payments')) {
        return { rows: [insertedPayment] };
      }
      if (sql.startsWith('UPDATE orders')) {
        return {};
      }
      return { rows: [] };
    }),
    release: jest.fn(),
  };

  return {
    query: jest.fn(async (sql) => {
      if (sql.startsWith('SELECT * FROM orders')) {
        return { rows: order ? [order] : [] };
      }
      if (sql.startsWith('SELECT * FROM payments')) {
        return { rows: existingPayment ? [existingPayment] : [] };
      }
      return { rows: [] };
    }),
    connect: jest.fn(async () => client),
  };
}

describe('legacy orderService.processPayment', () => {
  const baseOrder = {
    id: 'order-1', user_id: 'user-1', total_amount: 500, payment_status: 'pending',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects when the requesting user does not own the order', async () => {
    getPostgreSQL.mockReturnValue(makePgMock({ order: null }));

    await expect(
      processPayment('order-1', { gateway: 'razorpay', gateway_reference: 'pay_1' }, 'someone-else'),
    ).rejects.toThrow('Order not found');
  });

  it('fails closed when no gateway_reference is supplied', async () => {
    getPostgreSQL.mockReturnValue(makePgMock({ order: baseOrder }));

    await expect(
      processPayment('order-1', { gateway: 'razorpay' }, 'user-1'),
    ).rejects.toThrow('Missing gateway_reference');
    expect(paymentService.processRazorpayPayment).not.toHaveBeenCalled();
  });

  it('fails closed when no gateway is configured', async () => {
    getPostgreSQL.mockReturnValue(makePgMock({ order: baseOrder }));
    paymentService.getStatus.mockReturnValue({ stripe: false, razorpay: false, configured: false });

    await expect(
      processPayment('order-1', { gateway: 'razorpay', gateway_reference: 'pay_1' }, 'user-1'),
    ).rejects.toThrow('No payment gateway is configured');
  });

  it('rejects when Razorpay verification does not confirm the payment', async () => {
    getPostgreSQL.mockReturnValue(makePgMock({ order: baseOrder }));
    paymentService.getStatus.mockReturnValue({ stripe: false, razorpay: true, configured: true });
    paymentService.processRazorpayPayment.mockResolvedValue({ success: false, error: 'Payment verification failed' });

    await expect(
      processPayment('order-1', { gateway: 'razorpay', gateway_reference: 'pay_1' }, 'user-1'),
    ).rejects.toThrow('Payment verification failed');
  });

  it('rejects Stripe payments that were not pre-confirmed client-side', async () => {
    getPostgreSQL.mockReturnValue(makePgMock({ order: baseOrder }));
    paymentService.getStatus.mockReturnValue({ stripe: true, razorpay: false, configured: true });

    await expect(
      processPayment('order-1', { gateway: 'stripe', gateway_reference: 'pi_1' }, 'user-1'),
    ).rejects.toThrow('must be confirmed via /api/payment/stripe/intent');
  });

  it('accepts cash-on-delivery as collection-pending without a gateway reference', async () => {
    const insertedPayment = { id: 'pay-row-cod', order_id: 'order-1', payment_status: 'completed' };
    getPostgreSQL.mockReturnValue(makePgMock({ order: baseOrder, insertedPayment }));

    const result = await processPayment('order-1', { gateway: 'cod' }, 'user-1');

    expect(result).toEqual(insertedPayment);
    expect(paymentService.processRazorpayPayment).not.toHaveBeenCalled();
  });

  it('rejects bank transfer as requiring manual finance confirmation', async () => {
    getPostgreSQL.mockReturnValue(makePgMock({ order: baseOrder }));

    await expect(
      processPayment('order-1', { gateway: 'bank_transfer', gateway_reference: 'ref-1' }, 'user-1'),
    ).rejects.toThrow('manual confirmation by finance');
  });

  it('completes payment when Razorpay confirms the reference', async () => {
    const insertedPayment = { id: 'pay-row-1', order_id: 'order-1', payment_status: 'completed' };
    getPostgreSQL.mockReturnValue(makePgMock({ order: baseOrder, insertedPayment }));
    paymentService.getStatus.mockReturnValue({ stripe: false, razorpay: true, configured: true });
    paymentService.processRazorpayPayment.mockResolvedValue({ success: true, transactionId: 'pay_1' });

    const result = await processPayment(
      'order-1', { gateway: 'razorpay', gateway_reference: 'pay_1' }, 'user-1',
    );

    expect(result).toEqual(insertedPayment);
    expect(paymentService.processRazorpayPayment).toHaveBeenCalledWith('user-1', 500, 'pay_1');
  });

  it('returns the existing payment row instead of re-verifying on retry (idempotency)', async () => {
    const existingPayment = { id: 'pay-row-1', order_id: 'order-1', transaction_id: 'pay_1' };
    getPostgreSQL.mockReturnValue(makePgMock({ order: baseOrder, existingPayment }));

    const result = await processPayment(
      'order-1', { gateway: 'razorpay', gateway_reference: 'pay_1' }, 'user-1',
    );

    expect(result).toEqual(existingPayment);
    expect(paymentService.processRazorpayPayment).not.toHaveBeenCalled();
  });
});
