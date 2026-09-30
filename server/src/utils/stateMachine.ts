export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PLACED: ['PAYMENT_CONFIRMED', 'RESTAURANT_ACCEPTED', 'REJECTED', 'CANCELLED'],
  PAYMENT_CONFIRMED: ['RESTAURANT_ACCEPTED', 'REJECTED', 'CANCELLED', 'REFUNDED'],
  RESTAURANT_ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['RIDER_ASSIGNED', 'CANCELLED'],
  RIDER_ASSIGNED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  REJECTED: ['REFUNDED'],
  CANCELLED: ['REFUNDED'],
  REFUNDED: [],
};

/**
 * Validates whether a status transition is permissible under the Foodle order state machine
 */
export function isValidStatusTransition(fromStatus: string, toStatus: string): boolean {
  if (fromStatus === toStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[fromStatus];
  return Boolean(allowed && allowed.includes(toStatus));
}
