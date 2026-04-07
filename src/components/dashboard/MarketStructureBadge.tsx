import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Activity, Zap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isSessionActive, FOREX_SESSIONS } from "@/lib/forex-sessions";

type MarketStructure = "trending" | "ranging" | "choppy" | "breakout";

interface StructureInfo {
  type: MarketStructure;
  label: string;
  icon: typeof TrendingUp;
  description: string;
  className: string;
}

const structures: Record<MarketStructure, StructureInfo> = {
  trending: {
    type: "trending",
    label: "Trending",
    icon: TrendingUp,
    description: "Strong directional momentum. Multiple major sessions active — favor trend-following setups.",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-400",
  },
  ranging: {
    type: "ranging",
    label: "Ranging",
    icon: Activity,
    description: "Low volatility, price consolidating. Single quiet session — consider range-bound strategies.",
    className: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400",
  },
  choppy: {
    type: "choppy",
    label: "Choppy",
    icon: Activity,
    description: "Erratic price action expected. Off-hours with no major session — avoid entries or use tight stops.",
    className: "bg-orange-500/15 text-orange-600 border-orange-500/30 dark:text-orange-400",
  },
  breakout: {
    type: "breakout",
    label: "Breakout",
    icon: Zap,
    description: "High breakout probability. Session overlap window — watch for momentum and volume spikes.",
    className: "bg-violet-500/15 text-violet-600 border-violet-500/30 dark:text-violet-400",
  },
};

function detectStructure(): MarketStructure {
  const now = new Date();
  const hour = now.getUTCHours();

  const activeSessions = FOREX_SESSIONS.filter((s) => isSessionActive(s, now));
  const activeCount = activeSessions.length;
  const activeIds = activeSessions.map((s) => s.id);

  // Major overlaps → breakout
  const hasLondonNY = activeIds.includes("london") && activeIds.includes("newyork");
  const hasTokyoLondon = activeIds.includes("tokyo") && activeIds.includes("london");
  if (activeCount >= 2 && (hasLondonNY || hasTokyoLondon)) return "breakout";

  // Other overlaps (e.g. Sydney-Tokyo) → trending
  if (activeCount >= 2) return "trending";

  // Peak single-session hours → trending
  if (activeIds.includes("london") && hour >= 8 && hour <= 11) return "trending";
  if (activeIds.includes("newyork") && hour >= 13 && hour <= 16) return "trending";

  // Single quiet session → ranging
  if (activeCount === 1) return "ranging";

  // No active major session → choppy
  return "choppy";
}

export function MarketStructureBadge() {
  const [structure, setStructure] = useState<MarketStructure>(detectStructure);

  useEffect(() => {
    const interval = setInterval(() => setStructure(detectStructure()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const info = structures[structure];
  const Icon = info.icon;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={`gap-1.5 px-3 py-1 text-xs font-medium cursor-default transition-colors ${info.className}`}
        >
          <Icon className="h-3 w-3" />
          {info.label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[220px] text-xs">
        <p className="font-medium mb-1">{info.label} Market</p>
        <p className="text-muted-foreground">{info.description}</p>
      </TooltipContent>
    </Tooltip>
  );
}
