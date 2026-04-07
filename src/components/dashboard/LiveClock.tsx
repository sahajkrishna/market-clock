import { useState, useEffect, useMemo } from "react";
import { FOREX_SESSIONS, isSessionActive } from "@/lib/forex-sessions";
import { Sparkles } from "lucide-react";

interface LiveClockProps {
  timezone: string;
}

function getWhyTodayMatters(now: Date): string {
  const active = FOREX_SESSIONS.filter((s) => isSessionActive(s, now));
  const activeIds = new Set(active.map((s) => s.id));
  const day = now.getUTCDay(); // 0=Sun
  const date = now.getUTCDate();
  const h = now.getUTCHours();

  const parts: string[] = [];

  // Check for NFP (first Friday of month)
  if (day === 5 && date <= 7) parts.push("NFP day");

  // FOMC typically mid-week (Wed)
  if (day === 3 && h >= 18 && h <= 20) parts.push("FOMC window");

  // Session overlaps
  if (activeIds.has("london") && activeIds.has("newyork")) parts.push("London–NY overlap");
  else if (activeIds.has("tokyo") && activeIds.has("london")) parts.push("Tokyo–London overlap");

  // Peak session
  if (parts.length === 0) {
    if (activeIds.has("london") && h >= 8 && h < 11) parts.push("London peak hours");
    else if (activeIds.has("newyork") && h >= 13 && h < 16) parts.push("New York peak hours");
    else if (active.length > 0) parts.push(`${active[0].name} session active`);
  }

  // Weekend
  if (day === 0 || day === 6) return "Markets closed — rest & review your week";

  if (parts.length === 0) return "Stay ready — sessions opening soon";

  return parts.join(" + ") + " today";
}

export function LiveClock({ timezone }: LiveClockProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeStr = now.toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const dateStr = now.toLocaleDateString("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const tzLabel = timezone.replace(/_/g, " ").split("/").pop() || timezone;
  const whyToday = useMemo(() => getWhyTodayMatters(now), [Math.floor(now.getTime() / 60000)]);

  return (
    <div className="text-center space-y-2">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
        Your Local Time · {tzLabel}
      </p>
      <h2 className="text-6xl md:text-8xl font-mono font-extrabold tracking-tighter tabular-nums text-foreground drop-shadow-lg">
        {timeStr}
      </h2>
      <p className="text-sm text-muted-foreground">{dateStr}</p>
      <div className="inline-flex items-center gap-1.5 text-xs text-primary/80 mt-1">
        <Sparkles className="h-3 w-3" />
        <span className="font-medium">{whyToday}</span>
      </div>
    </div>
  );
}
