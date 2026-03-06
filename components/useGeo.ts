"use client";

import { useEffect, useState } from "react";

export type GeoState = {
  lat?: number;
  lng?: number;
  error?: string;
  loading: boolean;
};

export function useGeoLocation(): GeoState {
  const [state, setState] = useState<GeoState>({ loading: true });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ loading: false, error: "Geolocation not supported." });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          loading: false,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        setState({ loading: false, error: error.message });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000,
      },
    );
  }, []);

  return state;
}
