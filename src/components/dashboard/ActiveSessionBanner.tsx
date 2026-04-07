import { FOREX_SESSIONS, isSessionActive } from "@/lib/forex-sessions";
import { Activity, Zap, Crosshair, TrendingUp } from "lucide-react";
import type { MarketMode } from "@/lib/preferences";

interface ActiveSessionBannerProps {
  now: Date;
  marketMode?: MarketMode;
}

export function ActiveSessionBanner({ now, marketMode = "swing" }: ActiveSessionBannerProps) {
  const activeSessions = FOREX_SESSIONS.filter((s) => isSessionActive(s, now));
  const hasOverlap = activeSessions.length >= 2;
  const overlapNames = activeSessions.map((s) => s.name);

  if (activeSessions.length === 0) {
    return (
      <div className="glass-card rounded-2xl px-6 py-4 text-center">
        <p className="text-muted-foreground text-sm">All major sessions are currently closed</p>
      </div>
    );
  }

  const isScalper = marketMode === "scalper";

  // In scalper mode, highlight the single most relevant session prominently
  if (isScalper) {
    const primary = activeSessions[0];
    const h = now.getUTCHours();
    const peakRanges: Record<string, [number, number]> = {
      london: [8, 11], newyork: [13, 16], tokyo: [0, 3], sydney: [22, 1],
    };
    const range = peakRanges[primary.id];
    const inPeak = range
      ? (range[0] < range[1] ? h >= range[0] && h < range[1] : h >= range[0] || h < range[1])
      : false;

    return (
      <div className="space-y-3">
        {hasOverlap && (
          <div className="glass-card rounded-2xl border-warning/20 px-6 py-3 flex items-center justify-center gap-2 animate-pulse-glow">
            <Zap className="h-4 w-4 text-warning" />
            <span className="text-sm font-semibold text-warning">
              Scalp Zone — {overlapNames.join(" + ")} Overlap
            </span>
            <Zap className="h-4 w-4 text-warning" />
          </div>
        )}
        <div className="glass-card rounded-2xl border-primary/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Crosshair className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {primary.name} Session {inPeak ? "· Peak" : "· Active"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Focus: {primary.pairs.slice(0, 3).join(", ")} · M5/M15 entries
              </p>
            </div>
          </div>
          <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${inPeak ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
            {inPeak ? "Peak Hours" : "Off-peak"}
          </div>
        </div>
      </div>
    );
  }

  // Swing mode: show all sessions with trend context
  return (
    <div className="space-y-3">
      {hasOverlap && (
        <div className="glass-card rounded-2xl border-warning/20 px-6 py-3 flex items-center justify-center gap-2 animate-pulse-glow">
          <Zap className="h-4 w-4 text-warning" />
          <span className="text-sm font-semibold text-warning">
            High Volatility Zone — {overlapNames.join(" + ")} Overlap
          </span>
          <Zap className="h-4 w-4 text-warning" />
        </div>
      )}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {activeSessions.map((session) => (
          <div
            key={session.id}
            className="inline-flex items-center gap-2 glass-card rounded-full px-5 py-2.5 border-success/20"
          >
            <Activity className="h-3.5 w-3.5 text-success animate-pulse" />
            <span className="text-sm font-semibold text-success">
              {session.name} Session is OPEN
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
