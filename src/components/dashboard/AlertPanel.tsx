import { type MarketAlert } from "@/hooks/useMarketAlerts";
import { Bell, BellRing, CheckCheck, Trash2, Clock, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const typeConfig: Record<string, { icon: typeof Bell; color: string }> = {
  open: { icon: TrendingUp, color: "text-success" },
  "pre-open": { icon: Clock, color: "text-neon-gold" },
  close: { icon: TrendingDown, color: "text-destructive" },
  "pre-close": { icon: AlertTriangle, color: "text-orange-400" },
};

interface AlertPanelProps {
  alerts: MarketAlert[];
  onMarkAllRead: () => void;
  onClear: () => void;
}

export function AlertPanel({ alerts, onMarkAllRead, onClear }: AlertPanelProps) {
  const reversed = [...alerts].reverse();

  return (
    <div className="w-[340px] sm:w-[380px] glass-card rounded-2xl border border-border/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
        <div className="flex items-center gap-2">
          <BellRing className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Market Alerts</span>
          {alerts.filter((a) => !a.read).length > 0 && (
            <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {alerts.filter((a) => !a.read).length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={onMarkAllRead} title="Mark all read">
            <CheckCheck className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={onClear} title="Clear all">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Alert list */}
      <ScrollArea className="h-[320px]">
        {reversed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">No alerts yet</p>
            <p className="text-[10px] mt-1">Alerts will appear when markets open or close</p>
          </div>
        ) : (
          <div className="divide-y divide-border/10">
            {reversed.map((alert) => {
              const cfg = typeConfig[alert.type] || typeConfig.open;
              const Icon = cfg.icon;
              const timeAgo = getTimeAgo(alert.timestamp);

              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                    !alert.read ? "bg-primary/[0.03]" : ""
                  }`}
                >
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted/20 ${cfg.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-tight">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{timeAgo}</p>
                  </div>
                  {!alert.read && (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}
