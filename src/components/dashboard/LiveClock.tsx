import { useState, useEffect } from "react";

interface LiveClockProps {
  timezone: string;
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

  return (
    <div className="text-center space-y-2">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium">
        Your Local Time · {tzLabel}
      </p>
      <h2 className="text-6xl md:text-8xl font-mono font-extrabold tracking-tighter tabular-nums text-foreground drop-shadow-lg">
        {timeStr}
      </h2>
      <p className="text-sm text-muted-foreground">{dateStr}</p>
    </div>
  );
}
