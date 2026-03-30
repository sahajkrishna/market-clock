import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePreferences } from "@/hooks/usePreferences";
import { FOREX_SESSIONS } from "@/lib/forex-sessions";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LiveClock } from "@/components/dashboard/LiveClock";
import { ActiveSessionBanner } from "@/components/dashboard/ActiveSessionBanner";
import { MarketCard } from "@/components/dashboard/MarketCard";
import { SessionTimeline } from "@/components/dashboard/SessionTimeline";
import { NextSessionCard } from "@/components/dashboard/NextSessionCard";
import { StrategyHintBanner } from "@/components/dashboard/ProFeaturePanels";
import { GoldPriceCard } from "@/components/dashboard/GoldPriceCard";
import { TradingViewWidget } from "@/components/dashboard/TradingViewWidget";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Pause,
  Play,
  TrendingUp,
  Bell,
  BellOff,
  BarChart3,
  Clock,
  Activity,
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

          {/* Nav links */}
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
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTestNotification}
              title="Test notification"
              className="rounded-lg hover:bg-muted/30"
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
              className="rounded-lg hover:bg-muted/30"
            >
              {prefs.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
              className="rounded-lg hover:bg-muted/30"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="relative container px-4 py-8 max-w-7xl mx-auto space-y-10">
        {/* Hero Section */}
        <section id="hero" className="text-center space-y-6 pt-4">
          <div className="space-y-3 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
              Market Clock
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto">
              Track global markets in real time
            </p>
          </div>

          {/* Live Clock */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <LiveClock timezone={prefs.timezone} />
          </div>
        </section>

        {/* Active Session Status */}
        <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <ActiveSessionBanner now={now} />
        </div>

        {/* Gold Price Section */}
        <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GoldPriceCard />
            <TradingViewWidget />
          </div>
        </section>

        {/* Strategy Hint */}
        <StrategyHintBanner />

        {/* Next Session Countdown */}
        <NextSessionCard timezone={prefs.timezone} />

        {/* Market Cards Grid */}
        <section id="sessions" className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Market Sessions</h2>
              <p className="text-xs text-muted-foreground">Live session status across global markets</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FOREX_SESSIONS.map((session, i) => (
              <div
                key={session.id}
                className="animate-fade-in"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <MarketCard session={session} timezone={prefs.timezone} />
              </div>
            ))}
          </div>
        </section>

        {/* 24-Hour Timeline */}
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
