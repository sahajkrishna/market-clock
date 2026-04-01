import { useState } from "react";
import {
  type DashboardSection,
  type SectionId,
} from "@/hooks/useDashboardLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  SlidersHorizontal,
  GripVertical,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  X,
} from "lucide-react";

interface CustomizePanelProps {
  sections: DashboardSection[];
  onToggle: (id: SectionId) => void;
  onMove: (from: number, to: number) => void;
  onReset: () => void;
}

export function CustomizePanel({
  sections,
  onToggle,
  onMove,
  onReset,
}: CustomizePanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg hover:bg-muted/30 gap-2 text-xs"
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Customize</span>
      </Button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 z-50 w-72 glass-card rounded-2xl border border-border/40 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between px-4 pt-4 pb-2">
              <h4 className="text-sm font-semibold">Customize Dashboard</h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg hover:bg-muted/30"
                onClick={() => setOpen(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="px-2 pb-2 space-y-1">
              {sections.map((section, idx) => (
                <div
                  key={section.id}
                  className="flex items-center gap-2 px-2 py-2.5 rounded-xl hover:bg-muted/20 transition-colors group"
                >
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      disabled={idx === 0}
                      onClick={() => onMove(idx, idx - 1)}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      disabled={idx === sections.length - 1}
                      onClick={() => onMove(idx, idx + 1)}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>

                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />

                  <span className="flex-1 text-xs font-medium">
                    {section.label}
                  </span>

                  <Switch
                    checked={section.enabled}
                    onCheckedChange={() => onToggle(section.id)}
                    className="scale-75"
                  />
                </div>
              ))}
            </div>

            <div className="px-4 pb-4 pt-1 border-t border-border/20">
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="w-full text-xs text-muted-foreground hover:text-foreground gap-2"
              >
                <RotateCcw className="h-3 w-3" />
                Reset to Default
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
