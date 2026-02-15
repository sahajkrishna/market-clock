import { useState, useCallback, useEffect } from "react";
import {
  type UserPreferences,
  loadPreferences,
  savePreferences,
  getDefaultPreferences,
  clearPreferences,
} from "@/lib/preferences";
import { scheduleAlerts, clearScheduledAlerts } from "@/lib/notifications";

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(loadPreferences);

  const updatePrefs = useCallback((updates: Partial<UserPreferences>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...updates };
      savePreferences(next);
      return next;
    });
  }, []);

  const resetPrefs = useCallback(() => {
    clearPreferences();
    clearScheduledAlerts();
    setPrefs(getDefaultPreferences());
  }, []);

  // Re-schedule alerts when preferences change
  useEffect(() => {
    if (prefs.onboardingComplete) {
      scheduleAlerts();
    }
    return () => clearScheduledAlerts();
  }, [prefs.selectedSessions, prefs.alertMinutesBefore, prefs.isPaused, prefs.timezone, prefs.onboardingComplete]);

  // Reload prefs from storage periodically (chatbot might update them)
  useEffect(() => {
    const interval = setInterval(() => {
      const stored = loadPreferences();
      setPrefs((prev) => {
        if (JSON.stringify(prev) !== JSON.stringify(stored)) return stored;
        return prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return { prefs, updatePrefs, resetPrefs };
}
