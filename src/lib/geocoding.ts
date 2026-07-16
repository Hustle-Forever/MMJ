// Nominatim (OpenStreetMap) reverse geocoding — no API key required.
// Usage policy: 1 req/sec max, identify your app via User-Agent.
// For higher volume, swap the fetch URL for Google Maps or Mapbox (see README).

export type GeoAddress = {
  street: string;
  city: string;
  emirate: string;
};

// Normalize the inconsistent spellings Nominatim uses for UAE emirates
// so they always match the keys in DELIVERY_FEES.
const EMIRATE_NORM: Record<string, string> = {
  "Abu Dhabi": "Abu Dhabi",
  "Dubai": "Dubai",
  "Sharjah": "Sharjah",
  "Ajman": "Ajman",
  "Umm Al Quwain": "Umm Al Quwain",
  "Umm al-Quwain": "Umm Al Quwain",
  "Umm al Quwain": "Umm Al Quwain",
  "Ras Al Khaimah": "Ras Al Khaimah",
  "Ras al-Khaimah": "Ras Al Khaimah",
  "Ras al Khaimah": "Ras Al Khaimah",
  "Fujairah": "Fujairah",
  "Al Fujairah": "Fujairah",
};

export async function reverseGeocode(lat: number, lon: number): Promise<GeoAddress | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`;
    const res = await fetch(url, {
      headers: { "User-Agent": "MMJ-Notebook-Studio/1.0 (contact@mmjstudio.ae)" },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { address?: Record<string, string> };
    const a = data.address ?? {};

    // UAE addresses use road names, not house numbers most of the time.
    const streetParts = [a.house_number, a.road ?? a.pedestrian ?? a.footway].filter(Boolean);
    const street = streetParts.join(" ") || a.neighbourhood || a.suburb || a.quarter || "";

    const city =
      a.city || a.city_district || a.town || a.municipality || a.suburb || a.village || "";

    const emirate = EMIRATE_NORM[a.state ?? ""] ?? "";

    return { street, city, emirate };
  } catch {
    return null;
  }
}
