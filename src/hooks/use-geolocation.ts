import { useState, useCallback } from "react";

export type GeoState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "success"; lat: number; lng: number }
  | { status: "error"; message: string };

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "idle" });

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState({ status: "error", message: "Geolocation is not supported by your browser." });
      return;
    }
    setState({ status: "requesting" });
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({ status: "success", lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) =>
        setState({
          status: "error",
          message:
            err.code === err.PERMISSION_DENIED
              ? "Location access denied. Please type your address manually."
              : "Could not detect your location. Please type your address manually.",
        }),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, request, reset };
}
