import { useMemo } from "react";
import { FOREX_SESSIONS, isSessionActive, type ForexSession } from "@/lib/forex-sessions";
import { TrendingUp, AlertTriangle, Moon, Zap, BarChart3, Target, Crosshair } from "lucide-react";
import type { MarketMode } from "@/lib/preferences";

interface InsightsEngineProps {
  now: Date;
  marketMode?: MarketMode;
}

type InsightLevel = "high" | "moderate" | "low";

interface Insight {
  level: InsightLevel;
  message: string;
  detail: string;
}

const SESSION_RANKINGS: Record<string, number> = {
  london: 5,
  newyork: 5,
  tokyo: 3,
  sydney: 2,
};

function getOverlapName(a: ForexSession, b: ForexSession): string {
  return `${a.name}–${b.name}`;
}

function generateInsights(now: Date, mode: MarketMode): Insight[] {
  const active = FOREX_SESSIONS.filter((s) => isSessionActive(s, now));
  const insights: Insight[] = [];

  if (active.length === 0) {
    insights.push({
      level: "low",
      message: mode === "scalper" ? "No setups — sessions closed" : "Low activity period — avoid trading",
      detail: mode === "scalper"
        ? "Wait for the next session to open before looking for entries."
        : "All major sessions are closed. Spreads may widen and liquidity is thin.",
    });
    return insights;
  }

  // Check overlaps
  if (active.length >= 2) {
    for (let i = 0; i < active.length; i++) {
      for (let j = i + 1; j < active.length; j++) {
        const name = getOverlapName(active[i], active[j]);
        const combined = (SESSION_RANKINGS[active[i].id] || 1) + (SESSION_RANKINGS[active[j].id] || 1);
        if (combined >= 8) {
          insights.push({
            level: "high",
            message: mode === "scalper"
              ? `Scalp zone active — ${name} overlap`
              : `High liquidity — ${name} overlap`,
            detail: mode === "scalper"
              ? "Fast moves expected. Use tight stops and quick targets on M5."
              : "Peak trading window with tightest spreads and highest volume.",
          });
        } else {
          insights.push({
            level: "moderate",
            message: `Moderate liquidity — ${name} overlap`,
            detail: mode === "scalper"
              ? "Decent for scalping but watch for choppy moves."
              : "Decent volume but lower than peak overlap windows.",
          });
        }
      }
    }
  }

  // Best active session
  const best = [...active].sort((a, b) => (SESSION_RANKINGS[b.id] || 0) - (SESSION_RANKINGS[a.id] || 0))[0];
  if (best) {
    const rank = SESSION_RANKINGS[best.id] || 1;
    if (mode === "scalper") {
      // Scalper: focus on current session momentum
      const h = now.getUTCHours();
      const peakRanges: Record<string, [number, number]> = {
        london: [8, 11], newyork: [13, 16], tokyo: [0, 3], sydney: [22, 1],
      };
      const range = peakRanges[best.id];
      const inPeak = range
        ? (range[0] < range[1] ? h >= range[0] && h < range[1] : h >= range[0] || h < range[1])
        : false;

      if (inPeak) {
        insights.push({
          level: "high",
          message: `${best.name} peak momentum — ideal for scalping`,
          detail: `Focus on ${best.pairs.slice(0, 2).join(", ")} with M5 entries.`,
        });
      } else {
        insights.push({
          level: "moderate",
          message: `${best.name} active but off-peak`,
          detail: `Momentum fading. Tighten targets or wait for next peak.`,
        });
      }
    } else {
      // Swing
      if (rank >= 4) {
        insights.push({
          level: "high",
          message: `Best trading session active: ${best.name}`,
          detail: `${best.name} offers deep liquidity on ${best.pairs.slice(0, 3).join(", ")}. Look for H1 trend setups.`,
        });
      } else {
        insights.push({
          level: "moderate",
          message: `${best.name} session is active`,
          detail: `${best.name} provides moderate volume. Focus on ${best.pairs.slice(0, 2).join(", ")}.`,
        });
      }
    }
  }

  return insights;
}

const levelConfig: Record<InsightLevel, { border: string; bg: string; text: string; icon: typeof TrendingUp; badge: string; badgeText: string }> = {
  high: {
    border: "border-success/30",
    bg: "bg-success/5",
    text: "text-success",
    icon: TrendingUp,
    badge: "bg-success/15 text-success",
    badgeText: "Optimal",
  },
  moderate: {
    border: "border-warning/30",
    bg: "bg-warning/5",
    text: "text-warning",
    icon: BarChart3,
    badge: "bg-warning/15 text-warning",
    badgeText: "Moderate",
  },
  low: {
    border: "border-destructive/30",
    bg: "bg-destructive/5",
    text: "text-destructive",
    icon: Moon,
    badge: "bg-destructive/15 text-destructive",
    badgeText: "Low",
  },
};

export function InsightsEngine({ now, marketMode = "swing" }: InsightsEngineProps) {
  const insights = useMemo(() => generateInsights(now, marketMode), [now, marketMode]);
  const primary = insights[0];
  if (!primary) return null;

  const config = levelConfig[primary.level];
  const ModeIcon = marketMode === "scalper" ? Crosshair : TrendingUp;

  return (
    <div className="space-y-2">
      {/* Mode indicator */}
      <div className="flex items-center gap-2 px-1">
        <ModeIcon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {marketMode === "scalper" ? "Scalper Insights · Short-term" : "Swing Insights · Trend-based"}
        </span>
      </div>

      {/* Primary insight banner */}
      <div className={`glass-card rounded-2xl ${config.border} ${config.bg} px-6 py-4 flex items-center gap-4 transition-all duration-500`}>
        <div className={`h-10 w-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
          <config.icon className={`h-5 w-5 ${config.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.badge}`}>
              {config.badgeText}
            </span>
            <Zap className={`h-3 w-3 ${config.text} animate-pulse`} />
          </div>
          <p className={`text-sm font-semibold ${config.text}`}>{primary.message}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{primary.detail}</p>
        </div>
      </div>

      {/* Secondary insights */}
      {insights.length > 1 && (
        <div className="flex flex-wrap gap-2 px-1">
          {insights.slice(1).map((insight, i) => {
            const c = levelConfig[insight.level];
            const I2 = c.icon;
            return (
              <div key={i} className={`inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 ${c.border} text-xs`}>
                <I2 className={`h-3 w-3 ${c.text}`} />
                <span className={`font-medium ${c.text}`}>{insight.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
