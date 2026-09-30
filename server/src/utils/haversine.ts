/**
 * Calculates great-circle distance between two geographic coordinates using the Haversine formula
 * Returns distance in Kilometers (km)
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Number(d.toFixed(2));
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Computes rider delivery payout based on distance
 * Base fare: ₹35.00 + ₹10.00 per km
 */
export function calculateRiderEarning(distanceKm: number): number {
  const baseFare = 35.0;
  const perKmRate = 10.0;
  return Number((baseFare + distanceKm * perKmRate).toFixed(2));
}

/**
 * Computes total estimated delivery time in minutes
 * prepTime (default 15m) + distance * average speed in city traffic (approx 3.5 min/km)
 */
export function calculateEstimatedDeliveryTimeMinutes(
  distanceKm: number,
  prepTimeMinutes: number = 15
): number {
  const travelTimeMinutes = distanceKm * 3.5;
  return Math.round(prepTimeMinutes + travelTimeMinutes);
}
