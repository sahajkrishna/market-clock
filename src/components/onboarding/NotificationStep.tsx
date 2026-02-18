import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { type NotificationPrefs } from "@/lib/preferences";
import { Bell, BellOff, Clock, Zap } from "lucide-react";

interface NotificationStepProps {
  notificationPrefs: NotificationPrefs;
  onChange: (prefs: NotificationPrefs) => void;
  onNext: () => void;
  onBack: () => void;
}

const NotificationStep = ({ notificationPrefs, onChange, onNext, onBack }: NotificationStepProps) => {
  const toggle = (key: keyof NotificationPrefs) => {
    if (key === "disabled") {
      onChange({ ...notificationPrefs, disabled: !notificationPrefs.disabled });
    } else {
      onChange({ ...notificationPrefs, [key]: !notificationPrefs[key], disabled: false });
    }
  };

  const items = [
    {
      key: "beforeSession" as const,
      icon: Clock,
      label: "15 minutes before session open",
      description: "Get a heads-up before each session starts",
    },
    {
      key: "atSessionOpen" as const,
      icon: Bell,
      label: "At session open",
      description: "Instant alert when a session opens",
    },
    {
      key: "overlapAlerts" as const,
      icon: Zap,
      label: "Session overlap alerts",
      description: "High-volatility zone notifications",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Notification Preferences</h2>
        <p className="text-muted-foreground text-sm">Choose how you want to be alerted.</p>
      </div>

      <div className="space-y-3">
        {items.map(({ key, icon: Icon, label, description }) => (
          <div
            key={key}
            className={`flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-opacity ${
              notificationPrefs.disabled ? "opacity-40 pointer-events-none" : ""
            }`}
          >
            <Icon className="h-5 w-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <Label className="font-medium cursor-pointer">{label}</Label>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch
              checked={notificationPrefs[key]}
              onCheckedChange={() => toggle(key)}
            />
          </div>
        ))}

        <div className="flex items-center gap-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <BellOff className="h-5 w-5 text-destructive shrink-0" />
          <div className="flex-1 min-w-0">
            <Label className="font-medium cursor-pointer">Disable all notifications</Label>
            <p className="text-xs text-muted-foreground">Turn off every alert</p>
          </div>
          <Switch
            checked={notificationPrefs.disabled}
            onCheckedChange={() => toggle("disabled")}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onNext} className="flex-1">Continue</Button>
      </div>
    </div>
  );
};

export default NotificationStep;
