import { useState, useEffect } from "react";
import { FOREX_SESSIONS, isSessionActive } from "@/lib/forex-sessions";

const sessionColors: Record<string, string> = {
  tokyo: "hsl(var(--tokyo))",
  london: "hsl(var(--london))",
  newyork: "hsl(var(--newyork))",
  sydney: "hsl(var(--sydney))",
};

function utcToPercent(hour: number, minute: number): number {
  return ((hour * 60 + minute) / (24 * 60)) * 100;
}

interface SessionTimelineProps {
  timezone: string;
}

export function SessionTimeline({ timezone }: SessionTimelineProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const currentUTCPercent = utcToPercent(now.getUTCHours(), now.getUTCMinutes());

  // Generate hour labels
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">24-Hour Market Timeline (UTC)</h3>
        <span className="text-xs text-muted-foreground font-mono">
          {now.toLocaleTimeString("en-US", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: false })} UTC
        </span>
      </div>

      <div className="relative rounded-xl bg-card border border-border overflow-hidden p-4">
        {/* Hour grid */}
        <div className="relative h-2 mb-1">
          {hours.filter((_, i) => i % 3 === 0).map((h) => (
            <div
              key={h}
              className="absolute top-0 h-full w-px bg-border/40"
              style={{ left: `${utcToPercent(h, 0)}%` }}
            />
          ))}
        </div>

        {/* Session bars */}
        <div className="space-y-2 mt-3">
          {FOREX_SESSIONS.map((session) => {
            const openPct = utcToPercent(session.openUTC.hour, session.openUTC.minute);
            const closePct = utcToPercent(session.closeUTC.hour, session.closeUTC.minute);
            const active = isSessionActive(session, now);
            const crossesMidnight = session.openUTC.hour > session.closeUTC.hour ||
              (session.openUTC.hour === session.closeUTC.hour && session.openUTC.minute > session.closeUTC.minute);

            return (
              <div key={session.id} className="flex items-center gap-3">
                <span className="text-[11px] font-medium w-16 text-right text-muted-foreground">
                  {session.name}
                </span>
                <div className="relative flex-1 h-6 rounded bg-muted/10">
                  {crossesMidnight ? (
                    <>
                      <div
                        className="absolute top-0 h-full rounded-l transition-opacity"
                        style={{
                          left: `${openPct}%`,
                          width: `${100 - openPct}%`,
                          backgroundColor: sessionColors[session.id],
                          opacity: active ? 0.8 : 0.3,
                        }}
                      />
                      <div
                        className="absolute top-0 h-full rounded-r transition-opacity"
                        style={{
                          left: "0%",
                          width: `${closePct}%`,
                          backgroundColor: sessionColors[session.id],
                          opacity: active ? 0.8 : 0.3,
                        }}
                      />
                    </>
                  ) : (
                    <div
                      className="absolute top-0 h-full rounded transition-opacity"
                      style={{
                        left: `${openPct}%`,
                        width: `${closePct - openPct}%`,
                        backgroundColor: sessionColors[session.id],
                        opacity: active ? 0.8 : 0.3,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Current time marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-primary z-10"
          style={{ left: `calc(${currentUTCPercent}% + 3.5rem)` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
        </div>

        {/* Hour labels */}
        <div className="flex justify-between mt-2 px-0" style={{ marginLeft: "4.75rem" }}>
          {hours.filter((_, i) => i % 6 === 0).map((h) => (
            <span key={h} className="text-[10px] text-muted-foreground font-mono">
              {h.toString().padStart(2, "0")}:00
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4">
        {FOREX_SESSIONS.map((session) => (
          <div key={session.id} className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: sessionColors[session.id] }}
            />
            <span className="text-xs text-muted-foreground">{session.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
