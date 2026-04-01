import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { FOREX_SESSIONS, isSessionActive, getSessionLocalTime } from "@/lib/forex-sessions";
import { Clock, Activity } from "lucide-react";

const SESSION_COLORS: Record<string, { main: string; glow: string; bg: string }> = {
  tokyo: { main: "hsl(var(--tokyo))", glow: "hsl(var(--tokyo) / 0.4)", bg: "hsl(var(--tokyo) / 0.08)" },
  london: { main: "hsl(var(--london))", glow: "hsl(var(--london) / 0.4)", bg: "hsl(var(--london) / 0.08)" },
  newyork: { main: "hsl(var(--newyork))", glow: "hsl(var(--newyork) / 0.4)", bg: "hsl(var(--newyork) / 0.08)" },
  sydney: { main: "hsl(var(--sydney))", glow: "hsl(var(--sydney) / 0.4)", bg: "hsl(var(--sydney) / 0.08)" },
};

const CHART_PADDING = { top: 40, right: 24, bottom: 48, left: 24 };
const ROW_HEIGHT = 52;
const ROW_GAP = 8;
const TOTAL_MINUTES = 24 * 60;

function minutesToX(minutes: number, chartWidth: number): number {
  return CHART_PADDING.left + (minutes / TOTAL_MINUTES) * chartWidth;
}

interface HoveredSession {
  id: string;
  name: string;
  x: number;
  y: number;
  open: string;
  close: string;
  active: boolean;
  pairs: string[];
}

interface SessionChartProps {
  timezone: string;
}

export function SessionChart({ timezone }: SessionChartProps) {
  const [now, setNow] = useState(new Date());
  const [hovered, setHovered] = useState<HoveredSession | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 0 });
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const totalHeight = CHART_PADDING.top + FOREX_SESSIONS.length * (ROW_HEIGHT + ROW_GAP) - ROW_GAP + CHART_PADDING.bottom;
  const chartWidth = dimensions.width - CHART_PADDING.left - CHART_PADDING.right;

  const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const nowX = minutesToX(currentMinutes, chartWidth);

  const hours = useMemo(() => Array.from({ length: 25 }, (_, i) => i), []);

  const handleMouseMove = useCallback(
    (sessionIdx: number, session: typeof FOREX_SESSIONS[0], e: React.MouseEvent<SVGRectElement>) => {
      const rect = e.currentTarget.closest("svg")?.getBoundingClientRect();
      if (!rect) return;
      setHovered({
        id: session.id,
        name: session.name,
        x: e.clientX - rect.left,
        y: CHART_PADDING.top + sessionIdx * (ROW_HEIGHT + ROW_GAP) - 8,
        open: getSessionLocalTime(session, timezone, "open"),
        close: getSessionLocalTime(session, timezone, "close"),
        active: isSessionActive(session, now),
        pairs: session.pairs,
      });
    },
    [timezone, now]
  );

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(el);
    setDimensions({ width: el.clientWidth, height: el.clientHeight });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="glass-card rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">24-Hour Session Map</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Interactive Timeline</p>
          </div>
        </div>
        <div className="flex items-center gap-2 glass-card rounded-full px-3 py-1.5">
          <Clock className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-xs font-mono text-muted-foreground">
            {now.toLocaleTimeString("en-US", { timeZone: "UTC", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })} UTC
          </span>
        </div>
      </div>

      {/* Chart */}
      <div ref={chartRef} className="flex-1 relative min-h-[340px] px-1 pb-2">
        <svg width="100%" height={totalHeight} className="overflow-visible">
          <defs>
            {FOREX_SESSIONS.map((s) => (
              <linearGradient key={s.id} id={`grad-${s.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={SESSION_COLORS[s.id].main} stopOpacity={isSessionActive(s, now) ? 0.8 : 0.25} />
                <stop offset="50%" stopColor={SESSION_COLORS[s.id].main} stopOpacity={isSessionActive(s, now) ? 0.9 : 0.3} />
                <stop offset="100%" stopColor={SESSION_COLORS[s.id].main} stopOpacity={isSessionActive(s, now) ? 0.8 : 0.25} />
              </linearGradient>
            ))}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Subtle vertical grid lines */}
          {hours.filter((h) => h < 24).map((h) => {
            const x = minutesToX(h * 60, chartWidth);
            return (
              <line
                key={h}
                x1={x} y1={CHART_PADDING.top - 8}
                x2={x} y2={totalHeight - CHART_PADDING.bottom + 12}
                stroke="hsl(var(--border))"
                strokeOpacity={h % 6 === 0 ? 0.15 : 0.06}
                strokeDasharray={h % 6 === 0 ? "none" : "2 4"}
              />
            );
          })}

          {/* Hour labels */}
          {hours.filter((h) => h % 3 === 0 && h < 24).map((h) => {
            const x = minutesToX(h * 60, chartWidth);
            return (
              <text
                key={h}
                x={x} y={totalHeight - CHART_PADDING.bottom + 30}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] font-mono"
              >
                {h.toString().padStart(2, "0")}:00
              </text>
            );
          })}

          {/* Session rows */}
          {FOREX_SESSIONS.map((session, idx) => {
            const y = CHART_PADDING.top + idx * (ROW_HEIGHT + ROW_GAP);
            const openMin = session.openUTC.hour * 60 + session.openUTC.minute;
            const closeMin = session.closeUTC.hour * 60 + session.closeUTC.minute;
            const active = isSessionActive(session, now);
            const crossesMidnight = openMin >= closeMin;

            const bars: { x1: number; x2: number }[] = [];
            if (crossesMidnight) {
              bars.push({ x1: minutesToX(openMin, chartWidth), x2: minutesToX(TOTAL_MINUTES, chartWidth) });
              bars.push({ x1: minutesToX(0, chartWidth), x2: minutesToX(closeMin, chartWidth) });
            } else {
              bars.push({ x1: minutesToX(openMin, chartWidth), x2: minutesToX(closeMin, chartWidth) });
            }

            return (
              <g key={session.id}>
                {/* Row background on hover */}
                <rect
                  x={CHART_PADDING.left} y={y - 2}
                  width={chartWidth} height={ROW_HEIGHT + 4}
                  rx={12}
                  fill={hovered?.id === session.id ? SESSION_COLORS[session.id].bg : "transparent"}
                  className="transition-all duration-300"
                />

                {/* Session label */}
                <text
                  x={CHART_PADDING.left + 8} y={y + 14}
                  className="fill-foreground text-[11px] font-semibold"
                >
                  {session.name}
                </text>
                <text
                  x={CHART_PADDING.left + 8} y={y + 28}
                  className="fill-muted-foreground text-[9px]"
                >
                  {active ? "OPEN" : "CLOSED"}
                </text>

                {/* Session bars */}
                {bars.map((bar, i) => (
                  <g key={i}>
                    {active && (
                      <rect
                        x={bar.x1} y={y + 36}
                        width={Math.max(0, bar.x2 - bar.x1)} height={10}
                        rx={5}
                        fill={SESSION_COLORS[session.id].glow}
                        filter="url(#glow)"
                        className="animate-pulse"
                      />
                    )}
                    <rect
                      x={bar.x1} y={y + 36}
                      width={Math.max(0, bar.x2 - bar.x1)} height={10}
                      rx={5}
                      fill={`url(#grad-${session.id})`}
                      className="transition-all duration-500"
                    />
                  </g>
                ))}

                {/* Invisible hover target */}
                <rect
                  x={CHART_PADDING.left} y={y}
                  width={chartWidth} height={ROW_HEIGHT}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseMove={(e) => handleMouseMove(idx, session, e)}
                  onMouseLeave={() => setHovered(null)}
                />
              </g>
            );
          })}

          {/* Current time indicator */}
          <line
            x1={nowX} y1={CHART_PADDING.top - 12}
            x2={nowX} y2={totalHeight - CHART_PADDING.bottom + 12}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            strokeDasharray="4 3"
            className="drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]"
          />
          <circle
            cx={nowX} cy={CHART_PADDING.top - 12}
            r={5}
            fill="hsl(var(--primary))"
            className="drop-shadow-[0_0_8px_hsl(var(--primary)/0.8)] animate-pulse"
          />
          <text
            x={nowX} y={CHART_PADDING.top - 20}
            textAnchor="middle"
            className="fill-primary text-[9px] font-bold font-mono"
          >
            NOW
          </text>
        </svg>

        {/* Tooltip */}
        {hovered && (
          <div
            className="absolute z-50 pointer-events-none glass-card rounded-xl px-4 py-3 border shadow-xl transition-all duration-150"
            style={{
              left: Math.min(hovered.x + 12, dimensions.width - 200),
              top: hovered.y,
              borderColor: SESSION_COLORS[hovered.id]?.main,
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SESSION_COLORS[hovered.id]?.main }} />
              <span className="text-xs font-bold">{hovered.name} Session</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${hovered.active ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
                {hovered.active ? "OPEN" : "CLOSED"}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mb-1">
              {hovered.open} — {hovered.close} (local)
            </p>
            <p className="text-[10px] text-muted-foreground">
              Pairs: {hovered.pairs.join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="px-5 pb-4 flex flex-wrap justify-center gap-4">
        {FOREX_SESSIONS.map((s) => {
          const active = isSessionActive(s, now);
          return (
            <div key={s.id} className="flex items-center gap-1.5">
              <div
                className={`h-2.5 w-2.5 rounded-full ${active ? "animate-pulse" : ""}`}
                style={{ backgroundColor: SESSION_COLORS[s.id].main, opacity: active ? 1 : 0.4 }}
              />
              <span className="text-[10px] text-muted-foreground font-medium">{s.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
