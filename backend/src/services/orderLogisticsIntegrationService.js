'use strict';

const eventBus = require('../platform/events/eventBus');
const logisticsService = require('./legacy/logisticsService');
const externalAdapter = require('./externalIntegrationAdapter');
const { logger } = require('../utils/logger');

function validateOrderEvent(event) {
  const order = event?.eventData || event;
  if (!order?.order_id && !order?.id) {
    throw Object.assign(new Error('order_id is required'), { code: 'ORDER_LOGISTICS_INVALID_EVENT' });
  }
  if (!order.shipping_address && !order.destination_address) {
    throw Object.assign(new Error('destination address is required'), { code: 'ORDER_LOGISTICS_INVALID_EVENT' });
  }
  return {
    orderId: order.order_id || order.id,
    destination: order.shipping_address || order.destination_address,
    items: order.items || [],
    totalAmount: order.total_amount ?? order.totalAmount ?? null,
  };
}

async function handleOrderCreated(event, {
  logistics = logisticsService,
  adapter = externalAdapter,
  recommendRoute = async () => ({ status: 'not_configured', requiresHumanApproval: true }),
} = {}) {
  const order = validateOrderEvent(event);
  const recommendation = await recommendRoute(order);
  if (!recommendation || recommendation.requiresHumanApproval || recommendation.status !== 'approved') {
    return {
      status: 'pending_human_approval',
      orderId: order.orderId,
      recommendation: recommendation || { status: 'not_configured' },
    };
  }

  const shipment = await logistics.createShipment({
    order_id: order.orderId,
    destination_address: order.destination,
    origin_address: recommendation.originAddress || null,
    mode_id: recommendation.modeId || null,
    weight_kg: recommendation.weightKg || null,
    is_perishable: recommendation.isPerishable || false,
    temperature_requirement: recommendation.temperatureRequirement || null,
    estimated_cost: recommendation.estimatedCost || null,
    estimated_transit_days: recommendation.estimatedTransitDays || null,
  });

  let externalBooking = { status: 'not_configured' };
  if (adapter.status('logistics').status === 'configured') {
    externalBooking = await adapter.call('logistics', 'book', {
      body: { orderId: order.orderId, shipmentId: shipment.id, recommendation },
    });
  }
  await eventBus.publishEvent('shipment.booking.requested', {
    orderId: order.orderId,
    shipmentId: shipment.id,
    recommendation,
    externalBookingStatus: externalBooking.status || 'submitted',
  }, { idempotencyKey: `shipment-booking:${order.orderId}` });
  return { status: 'booked', orderId: order.orderId, shipment, externalBooking };
}

async function registerOrderLogisticsIntegration(options = {}) {
  const subscription = await eventBus.subscribe('order.created', (event) => (
    handleOrderCreated(event, options).catch((error) => {
      logger.error('Order logistics integration failed', {
        orderId: event?.eventData?.order_id || event?.eventData?.id,
        code: error.code,
        error: error.message,
      });
    })
  ));
  return subscription;
}

module.exports = { validateOrderEvent, handleOrderCreated, registerOrderLogisticsIntegration };
