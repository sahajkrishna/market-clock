import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePreferences } from "@/hooks/usePreferences";
import { FOREX_SESSIONS } from "@/lib/forex-sessions";
import { getCommonTimezones, getDetectedTimezone } from "@/lib/preferences";
import { requestNotificationPermission } from "@/lib/notifications";
import { Globe, Bell, Clock, TrendingUp } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const { prefs, updatePrefs } = usePreferences();
  const [timezone, setTimezone] = useState(prefs.timezone || getDetectedTimezone());
  const [selectedSessions, setSelectedSessions] = useState<string[]>(prefs.selectedSessions);
  const [alertMinutes, setAlertMinutes] = useState(String(prefs.alertMinutesBefore));
  const [step, setStep] = useState(0);

  const toggleSession = (id: string) => {
    setSelectedSessions((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    await requestNotificationPermission();
    updatePrefs({
      timezone,
      selectedSessions,
      alertMinutesBefore: parseInt(alertMinutes),
      onboardingComplete: true,
    });
    navigate("/dashboard");
  };

  const sessionColorMap: Record<string, string> = {
    tokyo: "bg-tokyo text-tokyo-foreground",
    london: "bg-london text-london-foreground",
    newyork: "bg-newyork text-newyork-foreground",
    sydney: "bg-sydney text-sydney-foreground",
  };

  const sessionBorderMap: Record<string, string> = {
    tokyo: "border-tokyo",
    london: "border-london",
    newyork: "border-newyork",
    sydney: "border-sydney",
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <TrendingUp className="h-4 w-4" />
            Forex Session Alerts
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Never Miss a Session</h1>
          <p className="text-muted-foreground">
            Get notified before major forex sessions open, in your timezone.
          </p>
        </div>

        {/* Step 1: Timezone */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Your Timezone</CardTitle>
              </div>
              <CardDescription>
                We detected <span className="font-medium text-foreground">{getDetectedTimezone()}</span>. Change it if needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getCommonTimezones().map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button className="w-full" onClick={() => setStep(1)}>
                Continue
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Session Selection */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Choose Sessions</CardTitle>
              </div>
              <CardDescription>Select which sessions you want alerts for.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {FOREX_SESSIONS.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all ${
                    selectedSessions.includes(session.id)
                      ? sessionBorderMap[session.id] + " bg-accent/50"
                      : "border-border"
                  }`}
                  onClick={() => toggleSession(session.id)}
                >
                  <Checkbox
                    checked={selectedSessions.includes(session.id)}
                    onCheckedChange={() => toggleSession(session.id)}
                  />
                  <div
                    className={`h-3 w-3 rounded-full ${sessionColorMap[session.id]}`}
                  />
                  <div className="flex-1">
                    <Label className="font-medium cursor-pointer">{session.name}</Label>
                    <p className="text-xs text-muted-foreground">
                      {session.pairs.slice(0, 3).join(", ")}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={selectedSessions.length === 0}
                  className="flex-1"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Alert Timing */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Alert Timing</CardTitle>
              </div>
              <CardDescription>How early do you want to be notified?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[5, 10, 15].map((min) => (
                <div
                  key={min}
                  className={`flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer transition-all ${
                    alertMinutes === String(min) ? "border-primary bg-primary/5" : "border-border"
                  }`}
                  onClick={() => setAlertMinutes(String(min))}
                >
                  <div
                    className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                      alertMinutes === String(min) ? "border-primary" : "border-muted-foreground"
                    }`}
                  >
                    {alertMinutes === String(min) && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <Label className="cursor-pointer font-medium">{min} minutes before</Label>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleComplete} className="flex-1">
                  Save & Start Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((s) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full transition-all ${
                s === step ? "bg-primary" : s < step ? "bg-primary/40" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Session timing alerts only. Not financial advice.
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
