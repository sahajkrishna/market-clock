import { useState, useEffect, useCallback, useRef } from "react";
import { FOREX_SESSIONS, isSessionActive } from "@/lib/forex-sessions";
import { Brain, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarketInterpreterProps {
  now: Date;
}

function getTimeOfDay(utcHour: number): string {
  if (utcHour >= 0 && utcHour < 6) return "Late night / early Asia";
  if (utcHour >= 6 && utcHour < 10) return "Asia close / Europe pre-market";
  if (utcHour >= 10 && utcHour < 13) return "European morning";
  if (utcHour >= 13 && utcHour < 17) return "London-New York overlap";
  if (utcHour >= 17 && utcHour < 22) return "New York afternoon";
  return "New York close / Sydney open";
}

function getOverlaps(active: string[]): string[] {
  const overlaps: string[] = [];
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      overlaps.push(`${active[i]}-${active[j]}`);
    }
  }
  return overlaps;
}

// Simple mock upcoming events for context
function getStaticInsights(activeSessions: string[], utcHour: number): string[] {
  const insights: string[] = [];
  if (activeSessions.length === 0) {
    insights.push("⏰ Markets are in off-hours — low liquidity expected, wider spreads likely.");
    insights.push("🟡 Avoid trading during low-volume periods unless scalping.");
  } else {
    insights.push(`🟢 ${activeSessions.join(" & ")} session${activeSessions.length > 1 ? "s" : ""} active — liquidity is available.`);
  }
  if (activeSessions.includes("New York") && activeSessions.includes("London")) {
    insights.push("📊 London-New York overlap — historically the highest volatility window for EUR/USD and GBP/USD.");
  }
  if (activeSessions.includes("Tokyo") && activeSessions.includes("London")) {
    insights.push("📊 Tokyo-London overlap — watch for JPY and EUR pairs.");
  }
  if (utcHour >= 13 && utcHour <= 15) {
    insights.push("⏰ US economic data releases often happen around this time — check the calendar.");
  }
  if (activeSessions.includes("Tokyo")) {
    insights.push("🟡 Asian session tends to be range-bound — best for JPY and AUD pairs.");
  }
  if (activeSessions.includes("New York") && utcHour >= 20) {
    insights.push("🟡 New York session winding down — volatility typically decreasing.");
  }
  return insights.slice(0, 5);
}

function getMockUpcomingEvents() {
  const events = [
    { currency: "USD", event: "Core CPI", impact: "High" },
    { currency: "EUR", event: "ECB Rate Decision", impact: "High" },
    { currency: "GBP", event: "GDP", impact: "Medium" },
    { currency: "JPY", event: "BoJ Minutes", impact: "Medium" },
  ];
  // Return 0-2 random events to simulate
  const count = Math.floor(Math.random() * 3);
  return events.slice(0, count);
}

export function MarketInterpreter({ now }: MarketInterpreterProps) {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditsExhausted, setCreditsExhausted] = useState(false);
  const { toast } = useToast();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchInsights = useCallback(() => {
    setLoading(true);
    const utcHour = new Date().getUTCHours();
    const activeSessions = FOREX_SESSIONS.filter((s) => isSessionActive(s, new Date())).map((s) => s.name);
    const fallback = getStaticInsights(activeSessions, utcHour);
    setInsights(fallback);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  // Fetch on mount and every 60 seconds
  useEffect(() => {
    fetchInsights();
    intervalRef.current = setInterval(fetchInsights, 60_000);
    return () => clearInterval(intervalRef.current);
  }, [fetchInsights]);

  return (
    <div className="glass-card rounded-2xl border border-border/40 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-1.5">
              Market Interpreter
              <Sparkles className="h-3.5 w-3.5 text-primary/60" />
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "AI-powered analysis"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchInsights}
          disabled={loading}
          className="h-8 w-8 rounded-lg hover:bg-muted/30"
          title="Refresh insights"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Insights list */}
      <div className="px-5 py-4 space-y-3 max-h-[320px] overflow-y-auto">
        {loading && insights.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-2 w-2 rounded-full bg-muted mt-2 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : error && insights.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-xs text-muted-foreground">{error}</p>
            <Button variant="link" size="sm" onClick={fetchInsights} className="mt-2 text-xs">
              Try again
            </Button>
          </div>
        ) : (
          insights.map((insight, i) => (
            <div
              key={i}
              className="flex gap-3 group animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-primary/50 mt-[7px] shrink-0 group-hover:bg-primary transition-colors" />
              <p className="text-sm text-foreground/90 leading-relaxed">{insight}</p>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {loading && insights.length > 0 && (
        <div className="px-5 py-2 border-t border-border/20">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <RefreshCw className="h-2.5 w-2.5 animate-spin" />
            Updating…
          </p>
        </div>
      )}
    </div>
  );
}
