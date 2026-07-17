// Central delivery fee config — single source of truth for cart, checkout,
// PaymentIntent amount, and 3DS return calculation.
export const DELIVERY_FEES: Record<string, number> = {
  "Abu Dhabi":     22,
  "Dubai":         22,
  "Sharjah":       22,
  "Ajman":         22,
  "Umm Al Quwain": 22,
  "Ras Al Khaimah":22,
  "Fujairah":      22,
};

// Shown in cart and order summary before the emirate is selected (worst case / max).
export const FLAT_DELIVERY_FEE = 22;
export const DELIVERY_ESTIMATE = "Next-day delivery";

export function getDeliveryFee(emirate?: string): number {
  if (!emirate) return FLAT_DELIVERY_FEE;
  return DELIVERY_FEES[emirate] ?? FLAT_DELIVERY_FEE;
}
