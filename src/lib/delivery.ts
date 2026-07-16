// Central delivery fee config.
// Structured as a per-emirate lookup so switching to real rates later
// is a single-line edit per emirate — no component changes needed.
export const DELIVERY_FEES: Record<string, number> = {
  "Abu Dhabi":     15,
  "Dubai":         15,
  "Sharjah":       15,
  "Ajman":         15,
  "Umm Al Quwain": 15,
  "Ras Al Khaimah":15,
  "Fujairah":      15,
};

export const FLAT_DELIVERY_FEE = 15;

export function getDeliveryFee(emirate?: string): number {
  if (!emirate) return FLAT_DELIVERY_FEE;
  return DELIVERY_FEES[emirate] ?? FLAT_DELIVERY_FEE;
}
