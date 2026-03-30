import { FOREX_SESSIONS, isSessionActive } from "@/lib/forex-sessions";
import { Activity, Zap } from "lucide-react";

interface ActiveSessionBannerProps {
  now: Date;
}

export function ActiveSessionBanner({ now }: ActiveSessionBannerProps) {
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
