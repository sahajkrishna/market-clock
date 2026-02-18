import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, Bell, Globe } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

const WelcomeStep = ({ onNext }: WelcomeStepProps) => {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Clock className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Track Global Market Sessions<br />in Your Local Time
        </h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto">
          Real-time session countdowns, alerts, and overlap insights — built for serious traders.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
        {[
          { icon: TrendingUp, label: "Live Countdowns" },
          { icon: Bell, label: "Smart Alerts" },
          { icon: Globe, label: "Timezone Sync" },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 rounded-xl bg-card p-3 border border-border">
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      <Button size="lg" className="w-full max-w-xs text-base" onClick={onNext}>
        Get Started
      </Button>
    </div>
  );
};

export default WelcomeStep;
