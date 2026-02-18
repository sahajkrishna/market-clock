import { Button } from "@/components/ui/button";
import { type NotificationPrefs } from "@/lib/preferences";
import { FOREX_SESSIONS } from "@/lib/forex-sessions";
import { Globe, Bell, BellOff, CheckCircle2, Rocket } from "lucide-react";

interface SummaryStepProps {
  timezone: string;
  selectedSessions: string[];
  notificationPrefs: NotificationPrefs;
  saving: boolean;
  onComplete: () => void;
  onBack: () => void;
}

const sessionEmoji: Record<string, string> = {
  tokyo: "🇯🇵",
  london: "🇬🇧",
  newyork: "🇺🇸",
  sydney: "🇦🇺",
};

const SummaryStep = ({ timezone, selectedSessions, notificationPrefs, saving, onComplete, onBack }: SummaryStepProps) => {
  const activeNotifs = [
    notificationPrefs.beforeSession && "15 min before open",
    notificationPrefs.atSessionOpen && "At session open",
    notificationPrefs.overlapAlerts && "Overlap alerts",
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <CheckCircle2 className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">You're All Set</h2>
        <p className="text-muted-foreground text-sm">Here's a summary of your preferences.</p>
      </div>

      <div className="space-y-3">
        {/* Timezone */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Timezone</span>
          </div>
          <span className="font-mono text-sm text-foreground">{timezone}</span>
        </div>

        {/* Sessions */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Tracked Sessions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {FOREX_SESSIONS.filter((s) => selectedSessions.includes(s.id)).map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground"
              >
                {sessionEmoji[s.id]} {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-3 mb-3">
            {notificationPrefs.disabled ? (
              <BellOff className="h-4 w-4 text-destructive" />
            ) : (
              <Bell className="h-4 w-4 text-primary" />
            )}
            <span className="text-sm font-medium text-muted-foreground">Notifications</span>
          </div>
          {notificationPrefs.disabled ? (
            <span className="text-sm text-muted-foreground">All notifications disabled</span>
          ) : activeNotifs.length > 0 ? (
            <ul className="space-y-1">
              {activeNotifs.map((n) => (
                <li key={n as string} className="flex items-center gap-2 text-sm text-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {n}
                </li>
              ))}
            </ul>
          ) : (
            <span className="text-sm text-muted-foreground">No alerts selected</span>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onComplete} disabled={saving} className="flex-1 gap-2">
          <Rocket className="h-4 w-4" />
          {saving ? "Launching…" : "Launch My Dashboard"}
        </Button>
      </div>
    </div>
  );
};

export default SummaryStep;
