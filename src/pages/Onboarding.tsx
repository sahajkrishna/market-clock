import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "@/hooks/usePreferences";
import { getDetectedTimezone, getDefaultNotificationPrefs, type NotificationPrefs, savePreferences } from "@/lib/preferences";
import { FOREX_SESSIONS } from "@/lib/forex-sessions";
import { requestNotificationPermission } from "@/lib/notifications";
import { supabase } from "@/integrations/supabase/client";

import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import TimezoneStep from "@/components/onboarding/TimezoneStep";
import SessionSelectStep from "@/components/onboarding/SessionSelectStep";
import NotificationStep from "@/components/onboarding/NotificationStep";
import SummaryStep from "@/components/onboarding/SummaryStep";

const TOTAL_STEPS = 5;

const Onboarding = () => {
  const navigate = useNavigate();
  const { prefs, updatePrefs } = usePreferences();

  // If onboarding already done, go to dashboard immediately
  useEffect(() => {
    if (prefs.onboardingComplete) {
      navigate("/dashboard", { replace: true });
    }
  }, [prefs.onboardingComplete, navigate]);

  const [step, setStep] = useState(0);
  const [timezone, setTimezone] = useState(prefs.timezone || getDetectedTimezone());
  const [selectedSessions, setSelectedSessions] = useState<string[]>(prefs.selectedSessions);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(
    prefs.notificationPrefs || getDefaultNotificationPrefs()
  );
  const [saving, setSaving] = useState(false);

  const toggleSession = (id: string) => {
    setSelectedSessions((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectAllSessions = () => {
    const allIds = FOREX_SESSIONS.map((s) => s.id);
    setSelectedSessions((prev) =>
      prev.length === allIds.length ? [] : allIds
    );
  };

  const handleComplete = async () => {
    setSaving(true);

    if (!notificationPrefs.disabled) {
      try {
        await Promise.race([
          requestNotificationPermission(),
          new Promise((resolve) => setTimeout(resolve, 2000)),
        ]);
      } catch {}
    }

    // Fire-and-forget signup save
    supabase.from("signups").insert({
      device_user_id: prefs.userId,
      email: "onboarding@placeholder.com",
      timezone,
      selected_sessions: selectedSessions,
      alert_minutes_before: notificationPrefs.beforeSession ? 15 : 0,
    }).then(() => {});

    // Build the final prefs and save DIRECTLY to localStorage before navigating
    const finalPrefs = {
      ...prefs,
      timezone,
      selectedSessions,
      alertMinutesBefore: notificationPrefs.beforeSession ? 15 : 10,
      notificationPrefs,
      onboardingComplete: true,
    };
    savePreferences(finalPrefs);
    
    // Also update React state
    updatePrefs({
      timezone,
      selectedSessions,
      alertMinutesBefore: notificationPrefs.beforeSession ? 15 : 10,
      notificationPrefs,
      onboardingComplete: true,
    });

    // Navigate after localStorage is guaranteed written
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6">
        <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />

        {step === 0 && <WelcomeStep onNext={() => setStep(1)} />}
        {step === 1 && (
          <TimezoneStep
            timezone={timezone}
            onTimezoneChange={setTimezone}
            onNext={() => setStep(2)}
            onBack={() => setStep(0)}
          />
        )}
        {step === 2 && (
          <SessionSelectStep
            selectedSessions={selectedSessions}
            onToggle={toggleSession}
            onSelectAll={selectAllSessions}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <NotificationStep
            notificationPrefs={notificationPrefs}
            onChange={setNotificationPrefs}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <SummaryStep
            timezone={timezone}
            selectedSessions={selectedSessions}
            notificationPrefs={notificationPrefs}
            saving={saving}
            onComplete={handleComplete}
            onBack={() => setStep(3)}
          />
        )}

        <p className="text-center text-xs text-muted-foreground">
          Market Clock Pro · Session timing alerts only. Not financial advice.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
