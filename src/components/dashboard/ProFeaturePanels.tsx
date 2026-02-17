import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Lightbulb, Plus, Crown } from "lucide-react";

export function EconomicCalendarPanel() {
  return (
    <Card className="relative overflow-hidden border-dashed">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3">
        <Badge className="bg-primary/10 text-primary border-primary/20">
          <Crown className="h-3 w-3 mr-1" /> Pro
        </Badge>
        <p className="text-sm font-medium text-foreground">Economic Calendar</p>
        <p className="text-xs text-muted-foreground text-center px-6">
          See upcoming high-impact news events
        </p>
        <Button size="sm" variant="outline" className="text-xs" disabled>
          Coming Soon
        </Button>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Calendar className="h-4 w-4" /> Economic Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 opacity-30">
        {["NFP Release", "FOMC Minutes", "ECB Rate Decision"].map((event) => (
          <div key={event} className="flex items-center justify-between py-2 border-b border-border/30">
            <span className="text-xs">{event}</span>
            <Badge variant="secondary" className="text-[10px]">High Impact</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function CustomSessionPanel() {
  return (
    <Card className="relative overflow-hidden border-dashed">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3">
        <Badge className="bg-primary/10 text-primary border-primary/20">
          <Crown className="h-3 w-3 mr-1" /> Pro
        </Badge>
        <p className="text-sm font-medium text-foreground">Custom Sessions</p>
        <p className="text-xs text-muted-foreground text-center px-6">
          Add crypto, Indian, or custom sessions
        </p>
        <Button size="sm" variant="outline" className="text-xs" disabled>
          Coming Soon
        </Button>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> Custom Sessions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 opacity-30">
        {["Crypto (24/7)", "India (NSE)", "Hong Kong (HKEX)"].map((s) => (
          <div key={s} className="flex items-center justify-between py-2 border-b border-border/30">
            <span className="text-xs">{s}</span>
            <Button size="sm" variant="ghost" className="text-[10px] h-6" disabled>Add</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function StrategyHintBanner() {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-3 flex items-center gap-3">
      <Lightbulb className="h-4 w-4 text-primary shrink-0" />
      <div>
        <p className="text-sm font-medium text-foreground">Strategy Insight</p>
        <p className="text-xs text-muted-foreground">
          Session overlaps typically see 2-3x higher volatility — ideal for breakout strategies.
        </p>
      </div>
    </div>
  );
}
