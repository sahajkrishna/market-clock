import { useState, useEffect } from "react";
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

interface NextSessionCardProps {
  timezone: string;
}

export function NextSessionCard({ timezone }: NextSessionCardProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

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

  if (!nextSession || !nextOpenTime) return null;

  const countdown = formatCountdown(minMs);

  return (
    <div className="glass-card rounded-2xl overflow-hidden p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-4 w-4 text-primary" />
        <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">
          Next Session
        </span>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold">{nextSession.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Opens at {getSessionLocalTime(nextSession, timezone, "open")}
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-center">
          {[
            { val: countdown.hours, label: "hrs" },
            { val: countdown.minutes, label: "min" },
            { val: countdown.seconds, label: "sec" },
          ].map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-xl font-mono text-muted-foreground">:</span>}
              <div className="bg-background/40 backdrop-blur rounded-xl px-3 py-2 border border-border/30 min-w-[52px]">
                <p className="text-2xl font-mono font-bold tabular-nums">{unit.val}</p>
                <p className="text-[9px] uppercase text-muted-foreground">{unit.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1 mt-4 text-xs text-muted-foreground">
        <ArrowRight className="h-3 w-3" />
        <span>Active pairs: {nextSession.pairs.join(", ")}</span>
      </div>
    </div>
  );
}
