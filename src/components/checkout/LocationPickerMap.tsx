// Raw Leaflet map — lazy-loaded so Leaflet never runs during SSR.
// CSS import is handled by Vite: injected automatically when this chunk loads.
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef } from "react";
import { reverseGeocode, type GeoAddress } from "@/lib/geocoding";

// Site-branded pin rendered as inline SVG — zero external image dependencies.
const PIN_HTML = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
  <path fill="#0B5FA5" stroke="white" stroke-width="1.5"
        d="M16 2C9.373 2 4 7.373 4 14c0 9.333 12 26 12 26S28 23.333 28 14
           C28 7.373 22.627 2 16 2z"/>
  <circle fill="white" cx="16" cy="14" r="5.5"/>
</svg>`;

const pinIcon = L.divIcon({
  className: "",
  html: PIN_HTML,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
});

export function LocationPickerMap({
  initialLat,
  initialLng,
  onAddressChange,
}: {
  initialLat: number;
  initialLng: number;
  onAddressChange: (addr: GeoAddress | null, loading: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Always call the latest version of the callback without re-mounting the map.
  const cbRef = useRef(onAddressChange);
  useEffect(() => { cbRef.current = onAddressChange; });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([initialLat, initialLng], 16);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
      icon: pinIcon,
    }).addTo(map);

    function geocodeAt(lat: number, lng: number) {
      cbRef.current(null, true);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const addr = await reverseGeocode(lat, lng);
        cbRef.current(addr, false);
      }, 500);
    }

    // Drag the pin → re-geocode
    marker.on("dragend", () => {
      const { lat, lng } = marker.getLatLng();
      geocodeAt(lat, lng);
    });

    // Tap / click elsewhere on the map → move pin and re-geocode
    map.on("click", (e) => {
      marker.setLatLng(e.latlng);
      geocodeAt(e.latlng.lat, e.latlng.lng);
    });

    // Geocode the initial detected position immediately
    geocodeAt(initialLat, initialLng);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      map.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // initialLat/Lng captured at mount; map is created once and never re-created

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
