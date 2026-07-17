// Central delivery fee config — single source of truth for cart, checkout,
// PaymentIntent amount, and 3DS return calculation.
export const DELIVERY_FEES: Record<string, number> = {
  "Abu Dhabi":     22,
  "Dubai":         40,
  "Sharjah":       40,
  "Ajman":         40,
  "Umm Al Quwain": 40,
  "Ras Al Khaimah":40,
  "Fujairah":      40,
};

// Shown in cart and order summary before the emirate is selected (worst case / max).
export const FLAT_DELIVERY_FEE = 40;
export const DELIVERY_ESTIMATE = "Next-day delivery";

export function getDeliveryFee(emirate?: string): number {
  if (!emirate) return FLAT_DELIVERY_FEE;
  return DELIVERY_FEES[emirate] ?? FLAT_DELIVERY_FEE;
}
