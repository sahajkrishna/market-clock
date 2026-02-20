import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "@/hooks/usePreferences";
import { FOREX_SESSIONS } from "@/lib/forex-sessions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LiveClock } from "@/components/dashboard/LiveClock";
import { ActiveSessionBanner } from "@/components/dashboard/ActiveSessionBanner";
import { SessionStatusCard } from "@/components/dashboard/SessionStatusCard";
import { SessionTimeline } from "@/components/dashboard/SessionTimeline";
import { NextSessionCard } from "@/components/dashboard/NextSessionCard";
import { EconomicCalendarPanel, CustomSessionPanel, StrategyHintBanner } from "@/components/dashboard/ProFeaturePanels";
import { GoldPriceCard } from "@/components/dashboard/GoldPriceCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Pause,
  Play,
  TrendingUp,
  Bell,
  BellOff,
} from "lucide-react";
import {
  getNotificationPermission,
  sendTestNotification,
} from "@/lib/notifications";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const { prefs, updatePrefs } = usePreferences();
  const { toast } = useToast();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!prefs.onboardingComplete) {
      navigate("/onboarding");
    }
  }, [prefs.onboardingComplete, navigate]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const notifPermission = getNotificationPermission();

  const handleTestNotification = () => {
    const success = sendTestNotification();
    if (success) {
      toast({ title: "Test notification sent!" });
    } else {
      toast({ title: "Notifications not enabled", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-20">
        <div className="container flex items-center justify-between h-14 px-4 max-w-7xl">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">Market Clock Pro</span>
            {prefs.isPaused && (
              <Badge variant="secondary" className="text-xs">
                <Pause className="h-3 w-3 mr-1" /> Paused
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTestNotification}
              title="Test notification"
            >
              {notifPermission === "granted" ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => updatePrefs({ isPaused: !prefs.isPaused })}
              title={prefs.isPaused ? "Resume alerts" : "Pause alerts"}
            >
              {prefs.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-8 max-w-7xl space-y-8">
        {/* Gold Price */}
        <GoldPriceCard />

        {/* Live Clock */}
        <LiveClock timezone={prefs.timezone} />

        {/* Active Session Status */}
        <ActiveSessionBanner now={now} />

        {/* Strategy Hint */}
        <StrategyHintBanner />

        {/* Next Session Countdown */}
        <NextSessionCard timezone={prefs.timezone} />

        {/* 24-Hour Timeline */}
        <SessionTimeline timezone={prefs.timezone} />

        {/* Session Status Cards */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Session Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FOREX_SESSIONS.map((session) => (
              <SessionStatusCard
                key={session.id}
                session={session}
                timezone={prefs.timezone}
              />
            ))}
          </div>
        </div>

        {/* Pro Feature Placeholders */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Pro Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EconomicCalendarPanel />
            <CustomSessionPanel />
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground pb-6">
          Market Clock Pro — Session timing alerts only. Not financial advice.
        </p>
      </main>
    </div>
  );
};

export default Dashboard;
