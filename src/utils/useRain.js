import { useEffect, useState } from "react";
import { fetchIsRaining } from "../services/weatherService";

const RECHECK_MS = 15 * 60 * 1000;
const DELHI_FALLBACK = { lat: 28.6139, lon: 77.209 };

export default function useRain() {
  const [isRaining, setIsRaining] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const check = (lat, lon) => {
      fetchIsRaining(lat, lon)
        .then((raining) => {
          if (!cancelled) setIsRaining(raining);
        })
        .catch(() => {});
    };

    const withPosition = (lat, lon) => {
      check(lat, lon);
      const id = setInterval(() => check(lat, lon), RECHECK_MS);
      return () => clearInterval(id);
    };

    let stopInterval = () => {};

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled) return;
          stopInterval = withPosition(
            pos.coords.latitude,
            pos.coords.longitude
          );
        },
        () => {
          if (cancelled) return;
          stopInterval = withPosition(DELHI_FALLBACK.lat, DELHI_FALLBACK.lon);
        },
        { timeout: 8000 }
      );
    } else {
      stopInterval = withPosition(DELHI_FALLBACK.lat, DELHI_FALLBACK.lon);
    }

    return () => {
      cancelled = true;
      stopInterval();
    };
  }, []);

  return isRaining;
}