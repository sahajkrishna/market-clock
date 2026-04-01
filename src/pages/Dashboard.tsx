import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "@/hooks/usePreferences";
import { useMarketAlerts } from "@/hooks/useMarketAlerts";
import { FOREX_SESSIONS } from "@/lib/forex-sessions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LiveClock } from "@/components/dashboard/LiveClock";
import { ActiveSessionBanner } from "@/components/dashboard/ActiveSessionBanner";
import { InsightsEngine } from "@/components/dashboard/InsightsEngine";
import { MarketCard } from "@/components/dashboard/MarketCard";
import { SessionTimeline } from "@/components/dashboard/SessionTimeline";
import { NextSessionCard } from "@/components/dashboard/NextSessionCard";
import { TradingViewWidget } from "@/components/dashboard/TradingViewWidget";
import { AlertPanel } from "@/components/dashboard/AlertPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Pause,
  Play,
  TrendingUp,
  Bell,
  BellOff,
  Activity,
  Clock,
} from "lucide-react";
import {
  getNotificationPermission,
  sendTestNotification,
} from "@/lib/notifications";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Home", icon: Activity, section: "hero" },
  { label: "Sessions", icon: Clock, section: "sessions" },
  { label: "Alerts", icon: Bell, section: "alerts" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { prefs, updatePrefs } = usePreferences();
  const { toast } = useToast();
  const [now, setNow] = useState(new Date());
  const [activeNav, setActiveNav] = useState("hero");
  const [alertPanelOpen, setAlertPanelOpen] = useState(false);
  const alertPanelRef = useRef<HTMLDivElement>(null);

  const { alerts, unreadCount, markAllRead, clearAlerts } = useMarketAlerts(
    prefs.selectedSessions,
    prefs.isPaused
  );

  // Show toast for new alerts
  const lastAlertCount = useRef(alerts.length);
  useEffect(() => {
    if (alerts.length > lastAlertCount.current) {
      const newest = alerts[alerts.length - 1];
      if (newest) {
        toast({ title: newest.message, duration: 4000 });
      }
    }
    lastAlertCount.current = alerts.length;
  }, [alerts, toast]);

  // Close alert panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (alertPanelRef.current && !alertPanelRef.current.contains(e.target as Node)) {
        setAlertPanelOpen(false);
      }
    };
    if (alertPanelOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [alertPanelOpen]);

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

  const scrollToSection = (section: string) => {
    setActiveNav(section);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-neon-blue/[0.03] blur-[100px]" />
      </div>

      {/* Sticky Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/30 backdrop-blur-2xl bg-background/60">
        <div className="container flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold text-lg tracking-tight">Market Clock</span>
            </div>
            {prefs.isPaused && (
              <Badge variant="secondary" className="text-xs glass-card">
                <Pause className="h-3 w-3 mr-1" /> Paused
              </Badge>
            )}
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.section}
                onClick={() => scrollToSection(item.section)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeNav === item.section
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            {/* Alert Bell with Panel */}
            <div className="relative" ref={alertPanelRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setAlertPanelOpen((o) => !o);
                  if (!alertPanelOpen) markAllRead();
                }}
                title="Market alerts"
                className="rounded-lg hover:bg-muted/30 relative"
              >
                {notifPermission === "granted" ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4 text-muted-foreground" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1">
                    {unreadCount}
                  </span>
                )}
              </Button>

              {alertPanelOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 animate-fade-in">
                  <AlertPanel alerts={alerts} onMarkAllRead={markAllRead} onClear={clearAlerts} />
                </div>
              )}
            </div>

            <Button variant="ghost" size="icon" onClick={() => updatePrefs({ isPaused: !prefs.isPaused })} title={prefs.isPaused ? "Resume alerts" : "Pause alerts"} className="rounded-lg hover:bg-muted/30">
              {prefs.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")} className="rounded-lg hover:bg-muted/30">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative container px-4 py-8 max-w-7xl mx-auto space-y-8">
        {/* Top Section: Clock + Active Session Banner + Insights */}
        <section id="hero" className="space-y-4 pt-2">
          <div className="animate-fade-in">
            <LiveClock timezone={prefs.timezone} />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <InsightsEngine now={now} />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <ActiveSessionBanner now={now} />
          </div>
        </section>

        {/* Main Section: Chart (left) + Market Cards (right) */}
        <section id="sessions" className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            <div className="min-h-[480px]">
              <TradingViewWidget />
            </div>
            <div className="flex flex-col gap-4">
              {FOREX_SESSIONS.map((session, i) => (
                <div key={session.id} className="animate-fade-in" style={{ animationDelay: `${0.05 * i}s` }}>
                  <MarketCard session={session} timezone={prefs.timezone} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <NextSessionCard timezone={prefs.timezone} />

        <section id="alerts" className="space-y-6">
          <SessionTimeline timezone={prefs.timezone} />
        </section>

        <p className="text-center text-xs text-muted-foreground pb-6 pt-4">
          Market Clock — Session timing alerts only. Not financial advice.
        </p>
      </main>
    </div>
  );
};

export default Dashboard;
