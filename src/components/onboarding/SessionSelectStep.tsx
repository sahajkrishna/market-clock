import { Button } from "@/components/ui/button";
import { FOREX_SESSIONS } from "@/lib/forex-sessions";
import { Check } from "lucide-react";

interface SessionSelectStepProps {
  selectedSessions: string[];
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onNext: () => void;
  onBack: () => void;
}

const sessionMeta: Record<string, { emoji: string; color: string; borderColor: string }> = {
  tokyo: { emoji: "🇯🇵", color: "bg-tokyo", borderColor: "border-tokyo" },
  london: { emoji: "🇬🇧", color: "bg-london", borderColor: "border-london" },
  newyork: { emoji: "🇺🇸", color: "bg-newyork", borderColor: "border-newyork" },
  sydney: { emoji: "🇦🇺", color: "bg-sydney", borderColor: "border-sydney" },
};

const SessionSelectStep = ({ selectedSessions, onToggle, onSelectAll, onNext, onBack }: SessionSelectStepProps) => {
  const allSelected = FOREX_SESSIONS.every((s) => selectedSessions.includes(s.id));

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Preferred Sessions</h2>
        <p className="text-muted-foreground text-sm">Select the market sessions you want to track.</p>
      </div>

      <div className="space-y-3">
        {FOREX_SESSIONS.map((session) => {
          const meta = sessionMeta[session.id];
          const selected = selectedSessions.includes(session.id);
          return (
            <button
              key={session.id}
              onClick={() => onToggle(session.id)}
              className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 transition-all text-left ${
                selected
                  ? `${meta.borderColor} bg-accent/30`
                  : "border-border bg-card hover:border-muted"
              }`}
            >
              <span className="text-2xl">{meta.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground">{session.name} Session</div>
                <div className="text-xs text-muted-foreground truncate">
                  {session.pairs.join(" · ")}
                </div>
              </div>
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors ${
                  selected ? `${meta.color} border-transparent` : "border-muted"
                }`}
              >
                {selected && <Check className="h-3.5 w-3.5 text-white" />}
              </div>
            </button>
          );
        })}

        <button
          onClick={onSelectAll}
          className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm font-medium transition-all ${
            allSelected ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-muted"
          }`}
        >
          {allSelected ? <Check className="h-4 w-4" /> : null}
          {allSelected ? "All Sessions Selected" : "Select All Sessions"}
        </button>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onNext} disabled={selectedSessions.length === 0} className="flex-1">Continue</Button>
      </div>
    </div>
  );
};

export default SessionSelectStep;
