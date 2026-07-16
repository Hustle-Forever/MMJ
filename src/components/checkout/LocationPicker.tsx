import { lazy, Suspense, useState, useCallback } from "react";
import { MapPin, X } from "lucide-react";
import type { GeoAddress } from "@/lib/geocoding";

// LocationPickerMap is lazy-loaded so raw Leaflet never runs during SSR.
const LocationPickerMap = lazy(() =>
  import("./LocationPickerMap").then((m) => ({ default: m.LocationPickerMap })),
);

export function LocationPicker({
  initialLat,
  initialLng,
  onConfirm,
  onCancel,
}: {
  initialLat: number;
  initialLng: number;
  onConfirm: (addr: GeoAddress) => void;
  onCancel: () => void;
}) {
  const [preview, setPreview] = useState<GeoAddress | null>(null);
  const [geocoding, setGeocoding] = useState(true);

  const handleAddressChange = useCallback((addr: GeoAddress | null, loading: boolean) => {
    setPreview(addr);
    setGeocoding(loading);
  }, []);

  return (
    /* Backdrop — click outside to cancel */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(11,95,165,0.18)", backdropFilter: "blur(6px)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      {/* Sheet — slides up on mobile, centred panel on desktop */}
      <div
        className="flex w-full flex-col overflow-hidden rounded-t-3xl bg-blush sm:max-w-sm sm:rounded-3xl"
        style={{
          maxHeight: "92dvh",
          boxShadow: "0 -8px 64px -8px rgba(11,95,165,0.22), 0 0 0 1px rgba(11,95,165,0.06)",
        }}
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-blue/10 px-5 py-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue" aria-hidden />
            <span className="text-caption uppercase tracking-caps text-blue">
              Your location
            </span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close location picker"
            className="flex h-7 w-7 items-center justify-center rounded-full text-blue/30 transition hover:bg-blue/8 hover:text-blue"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* ── Map ──────────────────────────────────────────────────────────── */}
        <div className="relative flex-shrink-0" style={{ height: "280px" }}>
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center bg-blue/4">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue/20 border-t-blue" />
              </div>
            }
          >
            <LocationPickerMap
              initialLat={initialLat}
              initialLng={initialLng}
              onAddressChange={handleAddressChange}
            />
          </Suspense>
          {/* OSM attribution — required by tile usage policy */}
          <p className="pointer-events-none absolute bottom-1 right-1 rounded bg-black/20 px-1 text-[9px] text-white/80">
            © OpenStreetMap
          </p>
        </div>

        {/* ── Instruction ──────────────────────────────────────────────────── */}
        <p className="flex-shrink-0 px-5 pt-3 text-center text-[11px] text-blue/40">
          Drag the pin or tap the map to fine-tune your location
        </p>

        {/* ── Address preview ───────────────────────────────────────────────── */}
        <div className="flex-shrink-0 px-5 py-3">
          {geocoding ? (
            <div className="flex items-center gap-3 rounded-2xl bg-white/50 px-4 py-3 ring-1 ring-blue/8">
              <div className="h-3.5 w-3.5 flex-shrink-0 animate-spin rounded-full border border-blue/20 border-t-blue/60" />
              <span className="text-[13px] text-blue/40">Looking up address…</span>
            </div>
          ) : preview ? (
            <div className="rounded-2xl bg-white/60 px-4 py-3 ring-1 ring-blue/10">
              <p className="text-caption text-blue">{preview.street || "—"}</p>
              <p className="mt-0.5 text-[11px] text-blue/50">
                {[preview.city, preview.emirate].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/40 px-4 py-3 ring-1 ring-blue/8">
              <p className="text-[12px] text-blue/40">
                Address not found — you can type it manually
              </p>
            </div>
          )}
        </div>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <div className="grid flex-shrink-0 grid-cols-2 gap-3 px-5 pb-6 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full py-3.5 text-caption uppercase tracking-caps text-blue/60 ring-1 ring-blue/20 transition hover:ring-blue/40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { if (preview) onConfirm(preview); }}
            disabled={geocoding || !preview}
            className="rounded-full bg-blue py-3.5 text-caption uppercase tracking-caps text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {geocoding ? "Detecting…" : "Use location →"}
          </button>
        </div>
      </div>
    </div>
  );
}
