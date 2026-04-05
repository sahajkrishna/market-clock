import { useState, useEffect, useMemo, useRef } from "react";
import { FOREX_SESSIONS, isSessionActive, getSessionLocalTime } from "@/lib/forex-sessions";
import { Clock, Activity } from "lucide-react";

const SESSION_COLORS: Record<string, { main: string; light: string }> = {
  tokyo: { main: "#3B82F6", light: "rgba(59,130,246,0.18)" },
  london: { main: "#22C55E", light: "rgba(34,197,94,0.18)" },
  newyork: { main: "#EF4444", light: "rgba(239,68,68,0.18)" },
  sydney: { main: "#A855F7", light: "rgba(168,85,247,0.18)" },
};

const PADDING = { top: 20, right: 16, bottom: 36, left: 16 };
const BAR_HEIGHT = 32;
const BAR_GAP = 10;
const TOTAL_MINUTES = 24 * 60;

export function SessionChart({ timezone }: { timezone: string }) {
  const [now, setNow] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(700);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 0) setWidth(w);
    });
    obs.observe(el);
    setWidth(el.clientWidth || 700);
    return () => obs.disconnect();
  }, []);

  const chartW = width - PADDING.left - PADDING.right;
  const svgH = PADDING.top + FOREX_SESSIONS.length * (BAR_HEIGHT + BAR_GAP) - BAR_GAP + PADDING.bottom;

  const toX = (min: number) => PADDING.left + (min / TOTAL_MINUTES) * chartW;

  const nowMin = now.getUTCHours() * 60 + now.getUTCMinutes();
  const nowX = toX(nowMin);

  const hours = useMemo(() => [0, 3, 6, 9, 12, 15, 18, 21, 24], []);

  return (
    <div className="glass-card rounded-2xl overflow-visible h-full flex flex-col">
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
      <div ref={containerRef} className="flex-1 relative px-2 pb-2" style={{ minHeight: `${svgH + 8}px` }}>
        {chartW > 10 && (
          <svg width={width} height={svgH} style={{ display: "block", overflow: "visible" }}>
            {/* Grid lines */}
            {hours.map((h) => {
              const x = toX(h * 60);
              return (
                <line
                  key={h}
                  x1={x} y1={PADDING.top - 4}
                  x2={x} y2={svgH - PADDING.bottom + 8}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                  strokeDasharray={h % 6 === 0 ? "none" : "2 4"}
                />
              );
            })}

            {/* Hour labels */}
            {hours.filter((h) => h <= 24).map((h) => (
              <text
                key={h}
                x={toX(h * 60)}
                y={svgH - 6}
                textAnchor="middle"
                fill="currentColor"
                opacity={0.4}
                fontSize={10}
                fontFamily="monospace"
              >
                {(h % 24).toString().padStart(2, "0")}:00
              </text>
            ))}

            {/* Session bars */}
            {FOREX_SESSIONS.map((session, idx) => {
              const y = PADDING.top + idx * (BAR_HEIGHT + BAR_GAP);
              const openMin = session.openUTC.hour * 60 + session.openUTC.minute;
              const closeMin = session.closeUTC.hour * 60 + session.closeUTC.minute;
              const active = isSessionActive(session, now);
              const color = SESSION_COLORS[session.id] || SESSION_COLORS.tokyo;

              const segments: { x: number; w: number }[] = [];
              if (openMin >= closeMin) {
                // Crosses midnight
                segments.push({ x: toX(openMin), w: toX(TOTAL_MINUTES) - toX(openMin) });
                segments.push({ x: toX(0), w: toX(closeMin) - toX(0) });
              } else {
                segments.push({ x: toX(openMin), w: toX(closeMin) - toX(openMin) });
              }

              const localOpen = getSessionLocalTime(session, timezone, "open");
              const localClose = getSessionLocalTime(session, timezone, "close");

              return (
                <g key={session.id}>
                  {segments.map((seg, i) => (
                    <g key={i}>
                      {/* Glow for active */}
                      {active && (
                        <rect
                          x={seg.x} y={y}
                          width={Math.max(seg.w, 2)} height={BAR_HEIGHT}
                          rx={6}
                          fill={color.main}
                          opacity={0.15}
                          filter="url(#session-glow)"
                        />
                      )}
                      {/* Main bar */}
                      <rect
                        x={seg.x} y={y}
                        width={Math.max(seg.w, 2)} height={BAR_HEIGHT}
                        rx={6}
                        fill={color.main}
                        opacity={active ? 0.7 : 0.3}
                      />
                      {/* Label inside first segment */}
                      {i === 0 && seg.w > 50 && (
                        <>
                          <text
                            x={seg.x + 10} y={y + 14}
                            fill="white"
                            fontSize={11}
                            fontWeight={600}
                          >
                            {session.name}
                          </text>
                          <text
                            x={seg.x + 10} y={y + 26}
                            fill="white"
                            fontSize={9}
                            opacity={0.7}
                          >
                            {active ? `● OPEN` : `${localOpen} – ${localClose}`}
                          </text>
                        </>
                      )}
                    </g>
                  ))}
                </g>
              );
            })}

            {/* NOW indicator */}
            <line
              x1={nowX} y1={PADDING.top - 8}
              x2={nowX} y2={svgH - PADDING.bottom + 8}
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="4 3"
            />
            <circle cx={nowX} cy={PADDING.top - 8} r={4} fill="#10B981" />
            <text
              x={nowX} y={PADDING.top - 16}
              textAnchor="middle"
              fill="#10B981"
              fontSize={9}
              fontWeight={700}
              fontFamily="monospace"
            >
              NOW
            </text>

            {/* Glow filter */}
            <defs>
              <filter id="session-glow">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>
          </svg>
        )}
      </div>

      {/* Legend */}
      <div className="px-5 pb-4 flex flex-wrap justify-center gap-4">
        {FOREX_SESSIONS.map((s) => {
          const active = isSessionActive(s, now);
          const color = SESSION_COLORS[s.id] || SESSION_COLORS.tokyo;
          return (
            <div key={s.id} className="flex items-center gap-1.5">
              <div
                className={`h-2.5 w-2.5 rounded-full ${active ? "animate-pulse" : ""}`}
                style={{ backgroundColor: color.main, opacity: active ? 1 : 0.4 }}
              />
              <span className="text-[10px] text-muted-foreground font-medium">{s.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
