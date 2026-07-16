// Central delivery fee config.
// Structured as a per-emirate lookup so switching to real rates later
// is a single-line edit per emirate — no component changes needed.
export const DELIVERY_FEES: Record<string, number> = {
  "Abu Dhabi":     0,
  "Dubai":         0,
  "Sharjah":       0,
  "Ajman":         0,
  "Umm Al Quwain": 0,
  "Ras Al Khaimah":0,
  "Fujairah":      0,
};

export const FLAT_DELIVERY_FEE = 0; // TEMP: set back to 15 after test payment

export function getDeliveryFee(emirate?: string): number {
  if (!emirate) return FLAT_DELIVERY_FEE;
  return DELIVERY_FEES[emirate] ?? FLAT_DELIVERY_FEE;
}
