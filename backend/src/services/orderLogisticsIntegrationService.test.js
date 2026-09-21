'use strict';

const eventBus = require('../platform/events/eventBus');
const {
  validateOrderEvent,
  handleOrderCreated,
} = require('./orderLogisticsIntegrationService');

describe('order to logistics integration', () => {
  beforeEach(async () => {
    await eventBus.clearHistory();
  });

  it('fails validation when an order has no destination', () => {
    expect(() => validateOrderEvent({ eventData: { order_id: 'order-1' } }))
      .toThrow(expect.objectContaining({ code: 'ORDER_LOGISTICS_INVALID_EVENT' }));
  });

  it('keeps booking human-gated when route AI is unavailable', async () => {
    await expect(handleOrderCreated({
      eventData: { order_id: 'order-1', shipping_address: { city: 'Guwahati' } },
    })).resolves.toMatchObject({
      status: 'pending_human_approval',
      recommendation: { status: 'not_configured' },
    });
  });

  it('creates a shipment and emits a booking event after approval', async () => {
    const createShipment = jest.fn().mockResolvedValue({ id: 'shipment-1' });
    const adapter = { status: jest.fn().mockReturnValue({ status: 'not_configured' }) };
    const result = await handleOrderCreated({
      eventData: { order_id: 'order-2', shipping_address: { city: 'Imphal' } },
    }, {
      logistics: { createShipment },
      adapter,
      recommendRoute: async () => ({ status: 'approved', modeId: 'road' }),
    });

    expect(result).toMatchObject({ status: 'booked', shipment: { id: 'shipment-1' } });
    expect(createShipment).toHaveBeenCalledWith(expect.objectContaining({
      order_id: 'order-2',
      mode_id: 'road',
    }));
    await expect(eventBus.getEventHistory('shipment.booking.requested'))
      .resolves.toHaveLength(1);
    expect(adapter.status).toHaveBeenCalledWith('logistics');
  });
});
