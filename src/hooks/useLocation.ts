import { useState, useCallback } from 'react';
import { useSyllabusStore } from '../store';
import { useHaptics } from './useHaptics';

export const useLocation = () => {
  const { setUserLocation } = useSyllabusStore();
  const { triggerClick } = useHaptics();
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = useCallback(() => {
    triggerClick();
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setIsDetecting(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          name: "Detected Location"
        };
        setUserLocation(newLocation);
        setIsDetecting(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Could not determine your location. Please check your permissions.");
        setIsDetecting(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [setUserLocation, triggerClick]);

  return {
    detectLocation,
    isDetecting,
    error,
    setError
  };
};
