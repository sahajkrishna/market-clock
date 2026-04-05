import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Activity, Zap } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isSessionActive, FOREX_SESSIONS } from "@/lib/forex-sessions";

type MarketStructure = "trending" | "ranging" | "volatile";

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
    description: "Strong directional movement detected. Multiple sessions active with momentum.",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  ranging: {
    type: "ranging",
    label: "Ranging",
    icon: Activity,
    description: "Price consolidating in a range. Low directional bias — wait for breakout.",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  volatile: {
    type: "volatile",
    label: "Volatile",
    icon: Zap,
    description: "High volatility expected. Session overlaps or major news window.",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
};

function detectStructure(): MarketStructure {
  const now = new Date();
  const hour = now.getUTCHours();

  const activeSessions = FOREX_SESSIONS.filter((s) => isSessionActive(s, now));
  const activeCount = activeSessions.length;

  // Overlap windows → volatile
  if (activeCount >= 2) return "volatile";

  // Peak session hours (London 8-11 UTC, NY 13-16 UTC) → trending
  if ((hour >= 8 && hour <= 11) || (hour >= 13 && hour <= 16)) return "trending";

  // Off-hours or single quiet session → ranging
  return "ranging";
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
