import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCommonTimezones, getDetectedTimezone } from "@/lib/preferences";
import { Globe, MapPin } from "lucide-react";

interface TimezoneStepProps {
  timezone: string;
  onTimezoneChange: (tz: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const TimezoneStep = ({ timezone, onTimezoneChange, onNext, onBack }: TimezoneStepProps) => {
  const detected = getDetectedTimezone();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <Globe className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Your Timezone</h2>
        <p className="text-muted-foreground text-sm">
          All session times will be adjusted to your local timezone.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="text-muted-foreground">Detected:</span>
          <span className="font-mono font-medium text-foreground">{detected}</span>
        </div>

        <Select value={timezone} onValueChange={onTimezoneChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {getCommonTimezones().map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">Back</Button>
        <Button onClick={onNext} className="flex-1">Continue</Button>
      </div>
    </div>
  );
};

export default TimezoneStep;
