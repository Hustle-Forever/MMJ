import { useState, useCallback } from "react";

export type GeoState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "success"; lat: number; lng: number }
  | { status: "error"; message: string; code: number };

// Short UI messages — clear enough to guide the user.
// Detailed code is logged to console for debugging.
function geoErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case 1: // PERMISSION_DENIED
      return "Location access denied. On iPhone: Settings → Privacy & Security → Location Services → Safari → While Using";
    case 2: // POSITION_UNAVAILABLE
      return "Position unavailable — move to an open area with better signal, or type your address.";
    case 3: // TIMEOUT
      return "Location timed out — try moving outdoors, or type your address manually.";
    default:
      return "Could not get your location. Please type your address manually.";
  }
}

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "idle" });

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ status: "error", message: "Location is not supported by your browser.", code: 0 });
      return;
    }

    // IMPORTANT: Call getCurrentPosition as the VERY FIRST operation after the
    // user gesture. iOS Safari invalidates the user activation if any state
    // mutation (setState, DOM change) happens before the geolocation call —
    // causing PERMISSION_DENIED (code 1) even when the user has granted access.
    // setState("requesting") is intentionally moved AFTER this call.
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({ status: "success", lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.error(
          "[geolocation] Error —",
          `code: ${err.code}`,
          "(1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT)",
          `| browser message: "${err.message}"`,
        );
        setState({ status: "error", message: geoErrorMessage(err), code: err.code });
      },
      // enableHighAccuracy: true uses GPS on iOS; timeout raised to 15 s
      // because GPS acquisition can be slow indoors.
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
    );

    // Set "requesting" AFTER getCurrentPosition — keeps the geo call first
    // in the user-gesture context. Callbacks are always async so this always
    // runs before success/error is received.
    setState({ status: "requesting" });
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, request, reset };
}
