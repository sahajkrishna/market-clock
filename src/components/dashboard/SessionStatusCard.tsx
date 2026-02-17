import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type ForexSession, isSessionActive, getNextSessionOpen, getSessionLocalTime } from "@/lib/forex-sessions";
import { Activity, Clock, Lock } from "lucide-react";

const sessionColorMap: Record<string, string> = {
  tokyo: "bg-tokyo",
  london: "bg-london",
  newyork: "bg-newyork",
  sydney: "bg-sydney",
};

const sessionBorderMap: Record<string, string> = {
  tokyo: "border-l-tokyo",
  london: "border-l-london",
  newyork: "border-l-newyork",
  sydney: "border-l-sydney",
};

const sessionTextMap: Record<string, string> = {
  tokyo: "text-tokyo",
  london: "text-london",
  newyork: "text-newyork",
  sydney: "text-sydney",
};

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

interface SessionStatusCardProps {
  session: ForexSession;
  timezone: string;
}

export function SessionStatusCard({ session, timezone }: SessionStatusCardProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const active = isSessionActive(session, now);
  const nextOpen = getNextSessionOpen(session, now);
  const msUntilOpen = nextOpen.getTime() - now.getTime();

  // Calculate time until close for active sessions
  const closeDate = new Date(now);
  closeDate.setUTCHours(session.closeUTC.hour, session.closeUTC.minute, 0, 0);
  if (closeDate <= now) closeDate.setUTCDate(closeDate.getUTCDate() + 1);
  // Handle cross-midnight
  if (session.openUTC.hour > session.closeUTC.hour) {
    const openDate = new Date(now);
    openDate.setUTCHours(session.openUTC.hour, session.openUTC.minute, 0, 0);
    if (now < closeDate && now.getUTCHours() < session.closeUTC.hour) {
      // We're in the early morning portion
    }
  }
  const msUntilClose = closeDate.getTime() - now.getTime();

  // Progress for active sessions (0-100)
  const openMinutes = session.openUTC.hour * 60 + session.openUTC.minute;
  const closeMinutes = session.closeUTC.hour * 60 + session.closeUTC.minute;
  const totalMinutes = closeMinutes > openMinutes
    ? closeMinutes - openMinutes
    : (24 * 60 - openMinutes) + closeMinutes;
  const currentUTCMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  let elapsed = currentUTCMinutes - openMinutes;
  if (elapsed < 0) elapsed += 24 * 60;
  const progress = active ? Math.min(100, (elapsed / totalMinutes) * 100) : 0;

  return (
    <Card className={`relative overflow-hidden border-l-4 ${sessionBorderMap[session.id]} transition-all hover:shadow-lg`}>
      <CardContent className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`h-3 w-3 rounded-full ${sessionColorMap[session.id]} ${active ? "animate-pulse" : "opacity-50"}`} />
            <span className="font-semibold text-base">{session.name}</span>
          </div>
          {active ? (
            <Badge className="bg-success/15 text-success border-success/20 text-xs">
              <Activity className="h-3 w-3 mr-1" /> Open
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-xs opacity-60">
              <Lock className="h-3 w-3 mr-1" /> Closed
            </Badge>
          )}
        </div>

        {/* Times */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground text-xs">Open</span>
            <p className="font-mono font-medium">{getSessionLocalTime(session, timezone, "open")}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Close</span>
            <p className="font-mono font-medium">{getSessionLocalTime(session, timezone, "close")}</p>
          </div>
        </div>

        {/* Countdown */}
        <div className="rounded-lg bg-background/50 border border-border/50 p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            {active ? "Closes in" : "Opens in"}
          </p>
          <p className={`text-xl font-mono font-bold tabular-nums ${active ? sessionTextMap[session.id] : "text-foreground"}`}>
            {active ? formatCountdown(msUntilClose) : formatCountdown(msUntilOpen)}
          </p>
        </div>

        {/* Progress bar for active */}
        {active && (
          <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
            <div
              className={`h-full rounded-full ${sessionColorMap[session.id]} transition-all duration-1000`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Pairs */}
        <div className="flex flex-wrap gap-1">
          {session.pairs.map((pair) => (
            <span
              key={pair}
              className="text-[10px] font-mono bg-muted/20 border border-border/50 rounded px-1.5 py-0.5 text-muted-foreground"
            >
              {pair}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
