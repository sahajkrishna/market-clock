import { useState, useEffect } from "react";
import { type ForexSession, isSessionActive, getNextSessionOpen, getSessionLocalTime } from "@/lib/forex-sessions";
import { Activity, Lock } from "lucide-react";

const SESSION_FLAGS: Record<string, string> = {
  tokyo: "🇯🇵",
  london: "🇬🇧",
  newyork: "🇺🇸",
  sydney: "🇦🇺",
};

const sessionGlowMap: Record<string, string> = {
  tokyo: "glow-red",
  london: "glow-blue",
  newyork: "glow-green",
  sydney: "glow-gold",
};

const sessionNeonBorder: Record<string, string> = {
  tokyo: "border-tokyo/30 hover:border-tokyo/60",
  london: "border-london/30 hover:border-london/60",
  newyork: "border-newyork/30 hover:border-newyork/60",
  sydney: "border-sydney/30 hover:border-sydney/60",
};

const sessionTextMap: Record<string, string> = {
  tokyo: "text-tokyo",
  london: "text-london",
  newyork: "text-newyork",
  sydney: "text-sydney",
};

const sessionBgMap: Record<string, string> = {
  tokyo: "bg-tokyo",
  london: "bg-london",
  newyork: "bg-newyork",
  sydney: "bg-sydney",
};

function formatCountdown(ms: number): { h: string; m: string; s: string } {
  if (ms <= 0) return { h: "00", m: "00", s: "00" };
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    h: h.toString().padStart(2, "0"),
    m: m.toString().padStart(2, "0"),
    s: s.toString().padStart(2, "0"),
  };
}

interface MarketCardProps {
  session: ForexSession;
  timezone: string;
}

export function MarketCard({ session, timezone }: MarketCardProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const active = isSessionActive(session, now);
  const nextOpen = getNextSessionOpen(session, now);
  const msUntilOpen = nextOpen.getTime() - now.getTime();

  const closeDate = new Date(now);
  closeDate.setUTCHours(session.closeUTC.hour, session.closeUTC.minute, 0, 0);
  if (closeDate <= now) closeDate.setUTCDate(closeDate.getUTCDate() + 1);
  const msUntilClose = closeDate.getTime() - now.getTime();

  const countdown = formatCountdown(active ? msUntilClose : msUntilOpen);

  // Current local time for the session city
  const cityTz: Record<string, string> = {
    tokyo: "Asia/Tokyo",
    london: "Europe/London",
    newyork: "America/New_York",
    sydney: "Australia/Sydney",
  };
  const localTime = now.toLocaleTimeString("en-US", {
    timeZone: cityTz[session.id] || timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Progress
  const openMinutes = session.openUTC.hour * 60 + session.openUTC.minute;
  const closeMinutes = session.closeUTC.hour * 60 + session.closeUTC.minute;
  const totalMinutes = closeMinutes > openMinutes ? closeMinutes - openMinutes : (24 * 60 - openMinutes) + closeMinutes;
  const currentUTCMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  let elapsed = currentUTCMinutes - openMinutes;
  if (elapsed < 0) elapsed += 24 * 60;
  const progress = active ? Math.min(100, (elapsed / totalMinutes) * 100) : 0;

  return (
    <div
      className={`market-card glass-card border rounded-2xl p-5 space-y-4 cursor-default ${
        sessionNeonBorder[session.id]
      } ${active ? sessionGlowMap[session.id] : ""}`}
    >
      {/* Header: Flag + Name + Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{SESSION_FLAGS[session.id]}</span>
          <div>
            <h3 className="font-bold text-base">{session.name}</h3>
            <p className="text-xs text-muted-foreground">{session.city}</p>
          </div>
        </div>
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            active
              ? "bg-success/15 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {active ? (
            <>
              <Activity className="h-3 w-3 animate-pulse" />
              OPEN
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" />
              CLOSED
            </>
          )}
        </div>
      </div>

      {/* Current Time */}
      <div className="text-center">
        <p className="text-2xl font-mono font-bold tabular-nums tracking-tight">
          {localTime}
        </p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">
          Local Time
        </p>
      </div>

      {/* Countdown */}
      <div className="rounded-xl bg-background/30 border border-border/30 p-3 text-center">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
          {active ? "Closes in" : "Opens in"}
        </p>
        <div className="flex items-center justify-center gap-1">
          {[
            { val: countdown.h, label: "hr" },
            { val: countdown.m, label: "min" },
            { val: countdown.s, label: "sec" },
          ].map((unit, i) => (
            <div key={unit.label} className="flex items-center gap-1">
              {i > 0 && <span className="text-muted-foreground font-mono text-lg">:</span>}
              <div className="bg-background/50 rounded-lg px-2 py-1 min-w-[36px]">
                <p className={`text-lg font-mono font-bold tabular-nums ${active ? sessionTextMap[session.id] : "text-foreground"}`}>
                  {unit.val}
                </p>
                <p className="text-[8px] uppercase text-muted-foreground">{unit.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      {active && (
        <div className="h-1 rounded-full bg-muted/20 overflow-hidden">
          <div
            className={`h-full rounded-full ${sessionBgMap[session.id]} transition-all duration-1000`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Session Hours */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Open: {getSessionLocalTime(session, timezone, "open")}</span>
        <span>Close: {getSessionLocalTime(session, timezone, "close")}</span>
      </div>
    </div>
  );
}
