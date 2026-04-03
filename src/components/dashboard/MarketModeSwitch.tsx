import { Zap, TrendingUp, Newspaper } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type MarketMode = "scalper" | "swing" | "news";

interface MarketModeSwitchProps {
  mode: MarketMode;
  onChange: (mode: MarketMode) => void;
}

const modes = [
  {
    value: "scalper" as const,
    label: "Scalper",
    icon: Zap,
    description: "Current session + next 1 hour",
  },
  {
    value: "swing" as const,
    label: "Swing",
    icon: TrendingUp,
    description: "Session trends & overlaps",
  },
  {
    value: "news" as const,
    label: "News",
    icon: Newspaper,
    description: "Economic events focus",
  },
];

export function MarketModeSwitch({ mode, onChange }: MarketModeSwitchProps) {
  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(v) => {
        if (v) onChange(v as MarketMode);
      }}
      className="bg-muted/30 rounded-lg p-0.5 h-8"
    >
      {modes.map((m) => (
        <Tooltip key={m.value}>
          <TooltipTrigger asChild>
            <ToggleGroupItem
              value={m.value}
              aria-label={m.label}
              className="h-7 px-2.5 text-xs font-medium gap-1.5 rounded-md data-[state=on]:bg-primary/15 data-[state=on]:text-primary data-[state=on]:shadow-sm transition-all"
            >
              <m.icon className="h-3 w-3" />
              <span className="hidden sm:inline">{m.label}</span>
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <p className="font-medium">{m.label} Mode</p>
            <p className="text-muted-foreground">{m.description}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </ToggleGroup>
  );
}
