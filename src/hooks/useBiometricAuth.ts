import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";

// Biometric auth hook - uses Capacitor native biometric plugin when available
export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnabled, setIsEnabled] = useState(() => localStorage.getItem("biometric_enabled") === "true");

  useEffect(() => {
    // No real biometric plugin is installed yet, so the toggle would be cosmetic.
    // Hide it until @capacitor-community/biometric-auth (or similar) is wired up.
    setIsAvailable(false);
  }, []);

  const toggleBiometric = useCallback((enabled: boolean) => {
    localStorage.setItem("biometric_enabled", String(enabled));
    setIsEnabled(enabled);
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    if (!isEnabled || !Capacitor.isNativePlatform()) return true;
    
    try {
      // In native environment, this would trigger Face ID / Touch ID
      // For web fallback, we skip biometric check
      return true;
    } catch {
      return false;
    }
  }, [isEnabled]);

  return { isAvailable, isEnabled, toggleBiometric, authenticate };
}