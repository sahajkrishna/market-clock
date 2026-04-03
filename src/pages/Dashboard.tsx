import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { usePreferences } from "@/hooks/usePreferences";
import { useMarketAlerts } from "@/hooks/useMarketAlerts";
import { useDashboardLayout } from "@/hooks/useDashboardLayout";
import { FOREX_SESSIONS } from "@/lib/forex-sessions";
import { LiveClock } from "@/components/dashboard/LiveClock";
import { ActiveSessionBanner } from "@/components/dashboard/ActiveSessionBanner";
import { InsightsEngine } from "@/components/dashboard/InsightsEngine";
import { MarketCard } from "@/components/dashboard/MarketCard";
import { SessionChart } from "@/components/dashboard/SessionChart";
import { NextSessionCard } from "@/components/dashboard/NextSessionCard";
import { TradingViewWidget } from "@/components/dashboard/TradingViewWidget";
import { EconomicCalendar } from "@/components/dashboard/EconomicCalendar";
import { MarketInterpreter } from "@/components/dashboard/MarketInterpreter";
import { AlertPanel } from "@/components/dashboard/AlertPanel";
import { CustomizePanel } from "@/components/dashboard/CustomizePanel";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Pause,
  Play,
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
  const { sections, toggleSection, moveSection, resetLayout, isVisible } = useDashboardLayout();
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

  const scrollToSection = (section: string) => {
    setActiveNav(section);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-main">
        {/* Ambient background effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-neon-blue/[0.03] blur-[100px]" />
        </div>

        <AppSidebar activeSection={activeNav} onScrollToSection={scrollToSection} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-50 border-b border-border/30 backdrop-blur-2xl bg-background/60">
            <div className="flex items-center justify-between h-14 px-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="shrink-0" />
                {prefs.isPaused && (
                  <Badge variant="secondary" className="text-xs glass-card">
                    <Pause className="h-3 w-3 mr-1" /> Paused
                  </Badge>
                )}
              </div>

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
                <CustomizePanel sections={sections} onToggle={toggleSection} onMove={moveSection} onReset={resetLayout} />
              </div>
            </div>
          </header>

          <main className="relative flex-1 px-4 py-8 max-w-7xl mx-auto w-full space-y-8">
            {/* Clock + Banner are always visible */}
            <section id="hero" className="space-y-4 pt-2">
              <div className="animate-fade-in">
                <LiveClock timezone={prefs.timezone} />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
                <ActiveSessionBanner now={now} />
              </div>
            </section>

            {/* Orderable sections */}
            {sections.filter((s) => s.enabled).map((section) => {
              switch (section.id) {
                case "insights":
                  return (
                    <section key={section.id} className="animate-fade-in">
                      <InsightsEngine now={now} />
                    </section>
                  );
                case "tradingView":
                  return (
                    <section key={section.id} className="animate-fade-in">
                      <div style={{ height: "600px" }}>
                        <TradingViewWidget />
                      </div>
                    </section>
                  );
                case "chart":
                  return (
                    <section key={section.id} id="sessions" className="animate-fade-in">
                      <div className={`grid grid-cols-1 ${isVisible("marketCards") ? "lg:grid-cols-[1fr_340px]" : ""} gap-6`}>
                        <div className="min-h-[380px]">
                          <SessionChart timezone={prefs.timezone} />
                        </div>
                        {isVisible("marketCards") && (
                          <div className="flex flex-col gap-4">
                            {FOREX_SESSIONS.map((session, i) => (
                              <div key={session.id} className="animate-fade-in" style={{ animationDelay: `${0.05 * i}s` }}>
                                <MarketCard session={session} timezone={prefs.timezone} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </section>
                  );
                case "marketCards":
                  if (isVisible("chart")) return null;
                  return (
                    <section key={section.id} className="animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {FOREX_SESSIONS.map((session, i) => (
                          <div key={session.id} className="animate-fade-in" style={{ animationDelay: `${0.05 * i}s` }}>
                            <MarketCard session={session} timezone={prefs.timezone} />
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                case "nextSession":
                  return (
                    <section key={section.id} className="animate-fade-in">
                      <NextSessionCard timezone={prefs.timezone} />
                    </section>
                  );
                case "economicCalendar":
                  return (
                    <section key={section.id} id="economicCalendar" className="animate-fade-in">
                      <EconomicCalendar />
                    </section>
                  );
                case "marketInterpreter":
                  return (
                    <section key={section.id} className="animate-fade-in">
                      <MarketInterpreter now={now} />
                    </section>
                  );
                default:
                  return null;
              }
            })}

            <p className="text-center text-xs text-muted-foreground pb-6 pt-4">
              Market Clock — Session timing alerts only. Not financial advice.
            </p>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
