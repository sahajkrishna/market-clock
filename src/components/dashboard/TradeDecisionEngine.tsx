import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FOREX_SESSIONS, isSessionActive } from "@/lib/forex-sessions";
import { CheckCircle, XCircle, AlertTriangle, Shield, ShieldAlert, ShieldCheck } from "lucide-react";

interface TradeDecisionEngineProps {
  now: Date;
}

type Decision = "yes" | "no" | "caution";
type Risk = "low" | "medium" | "high";

interface TradeSignal {
  decision: Decision;
  reason: string;
  risk: Risk;
}

function computeSignal(now: Date): TradeSignal {
  const activeSessions = FOREX_SESSIONS.filter((s) => isSessionActive(s, now));
  const h = now.getUTCHours();

  // Check for major session overlaps
  const activeIds = new Set(activeSessions.map((s) => s.id));
  const londonNY = activeIds.has("london") && activeIds.has("newyork");
  const tokyoLondon = activeIds.has("tokyo") && activeIds.has("london");

  if (londonNY) {
    return { decision: "yes", reason: "London–New York overlap: peak liquidity window", risk: "low" };
  }
  if (tokyoLondon) {
    return { decision: "yes", reason: "Tokyo–London overlap: strong momentum expected", risk: "low" };
  }

  // Near NFP / major news window (first Friday of month, 13:30 UTC ± 30 min)
  const day = now.getUTCDay();
  const date = now.getUTCDate();
  if (day === 5 && date <= 7 && h >= 13 && h <= 14) {
    return { decision: "caution", reason: "Near major news release window (NFP)", risk: "high" };
  }

  // Multiple sessions active (non-major overlap)
  if (activeSessions.length >= 2) {
    return { decision: "yes", reason: `${activeSessions.map((s) => s.name).join(" & ")} sessions active`, risk: "medium" };
  }

  // Single active session — peak hours
  if (activeSessions.length === 1) {
    const s = activeSessions[0];
    const peakRanges: Record<string, [number, number]> = {
      london: [8, 11],
      newyork: [13, 16],
      tokyo: [0, 3],
      sydney: [22, 1],
    };
    const range = peakRanges[s.id];
    if (range) {
      const [start, end] = range;
      const inPeak = start < end ? h >= start && h < end : h >= start || h < end;
      if (inPeak) {
        return { decision: "yes", reason: `${s.name} session peak hours`, risk: "medium" };
      }
    }
    return { decision: "caution", reason: `${s.name} session active but off-peak`, risk: "medium" };
  }

  // No sessions active
  return { decision: "no", reason: "No major sessions active — low liquidity", risk: "high" };
}

const decisionConfig = {
  yes: { icon: CheckCircle, label: "YES", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  no: { icon: XCircle, label: "NO", className: "bg-destructive/15 text-destructive border-destructive/30" },
  caution: { icon: AlertTriangle, label: "CAUTION", className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" },
};

const riskConfig = {
  low: { icon: ShieldCheck, label: "Low Risk", className: "text-emerald-600 dark:text-emerald-400" },
  medium: { icon: Shield, label: "Medium Risk", className: "text-amber-600 dark:text-amber-400" },
  high: { icon: ShieldAlert, label: "High Risk", className: "text-destructive" },
};

export function TradeDecisionEngine({ now }: TradeDecisionEngineProps) {
  const signal = useMemo(() => computeSignal(now), [now]);

  const dec = decisionConfig[signal.decision];
  const risk = riskConfig[signal.risk];
  const DecIcon = dec.icon;
  const RiskIcon = risk.icon;

  return (
    <Card className="glass-card border-border/40">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Badge className={`${dec.className} text-sm font-bold px-3 py-1 gap-1.5`}>
              <DecIcon className="h-4 w-4" />
              {dec.label}
            </Badge>
            <span className="text-sm text-muted-foreground truncate">{signal.reason}</span>
          </div>
          <div className={`flex items-center gap-1.5 shrink-0 text-xs font-medium ${risk.className}`}>
            <RiskIcon className="h-3.5 w-3.5" />
            {risk.label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
