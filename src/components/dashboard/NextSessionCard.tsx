import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FOREX_SESSIONS, getNextSessionOpen, isSessionActive, getSessionLocalTime } from "@/lib/forex-sessions";
import { ArrowRight, Clock } from "lucide-react";

function formatCountdown(ms: number): { hours: string; minutes: string; seconds: string } {
  if (ms <= 0) return { hours: "00", minutes: "00", seconds: "00" };
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    hours: h.toString().padStart(2, "0"),
    minutes: m.toString().padStart(2, "0"),
    seconds: s.toString().padStart(2, "0"),
  };
}

const sessionGradients: Record<string, string> = {
  tokyo: "from-tokyo/20 to-tokyo/5",
  london: "from-london/20 to-london/5",
  newyork: "from-newyork/20 to-newyork/5",
  sydney: "from-sydney/20 to-sydney/5",
};

interface NextSessionCardProps {
  timezone: string;
}

export function NextSessionCard({ timezone }: NextSessionCardProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Find the next session to open (closest one that's not currently active)
  let nextSession = null;
  let nextOpenTime: Date | null = null;
  let minMs = Infinity;

  for (const session of FOREX_SESSIONS) {
    if (isSessionActive(session, now)) continue;
    const openTime = getNextSessionOpen(session, now);
    const ms = openTime.getTime() - now.getTime();
    if (ms > 0 && ms < minMs) {
      minMs = ms;
      nextSession = session;
      nextOpenTime = openTime;
    }
  }

  if (!nextSession || !nextOpenTime) {
    return null;
  }

  const countdown = formatCountdown(minMs);

  return (
    <Card className={`overflow-hidden bg-gradient-to-br ${sessionGradients[nextSession.id]} border-border/50`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
            Next Session
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold">{nextSession.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Opens at {getSessionLocalTime(nextSession, timezone, "open")}
            </p>
          </div>

          <div className="flex items-center gap-1 text-center">
            <div className="bg-background/80 backdrop-blur rounded-lg px-3 py-2 border border-border/50">
              <p className="text-2xl font-mono font-bold tabular-nums">{countdown.hours}</p>
              <p className="text-[9px] uppercase text-muted-foreground">hrs</p>
            </div>
            <span className="text-xl font-mono text-muted-foreground">:</span>
            <div className="bg-background/80 backdrop-blur rounded-lg px-3 py-2 border border-border/50">
              <p className="text-2xl font-mono font-bold tabular-nums">{countdown.minutes}</p>
              <p className="text-[9px] uppercase text-muted-foreground">min</p>
            </div>
            <span className="text-xl font-mono text-muted-foreground">:</span>
            <div className="bg-background/80 backdrop-blur rounded-lg px-3 py-2 border border-border/50">
              <p className="text-2xl font-mono font-bold tabular-nums">{countdown.seconds}</p>
              <p className="text-[9px] uppercase text-muted-foreground">sec</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground">
          <ArrowRight className="h-3 w-3" />
          <span>Active pairs: {nextSession.pairs.join(", ")}</span>
        </div>
      </CardContent>
    </Card>
  );
}
