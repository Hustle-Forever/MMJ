// Central delivery fee config — single source of truth for cart, checkout,
// PaymentIntent amount, and 3DS return calculation.
// TEMP: fees zeroed for email testing — restore to 30/40 after.
export const DELIVERY_FEES: Record<string, number> = {
  "Abu Dhabi":     0,
  "Dubai":         0,
  "Sharjah":       0,
  "Ajman":         0,
  "Umm Al Quwain": 0,
  "Ras Al Khaimah":0,
  "Fujairah":      0,
};

export const FLAT_DELIVERY_FEE = 0;
export const DELIVERY_ESTIMATE = "Next-day delivery";

export function getDeliveryFee(emirate?: string): number {
  if (!emirate) return FLAT_DELIVERY_FEE;
  return DELIVERY_FEES[emirate] ?? FLAT_DELIVERY_FEE;
}
