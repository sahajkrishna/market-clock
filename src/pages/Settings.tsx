import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePreferences } from "@/hooks/usePreferences";
import { FOREX_SESSIONS } from "@/lib/forex-sessions";
import { getCommonTimezones } from "@/lib/preferences";
import { getNotificationPermission } from "@/lib/notifications";
import { ArrowLeft, Bell, BellOff, CheckCircle, Globe, Clock, Trash2, Shield } from "lucide-react";
import { useState } from "react";

const sessionColorMap: Record<string, string> = {
  tokyo: "bg-tokyo text-tokyo-foreground",
  london: "bg-london text-london-foreground",
  newyork: "bg-newyork text-newyork-foreground",
  sydney: "bg-sydney text-sydney-foreground",
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const { prefs, updatePrefs, resetPrefs } = usePreferences();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const notifPermission = getNotificationPermission();

  const toggleSession = (id: string) => {
    const next = prefs.selectedSessions.includes(id)
      ? prefs.selectedSessions.filter((s) => s !== id)
      : [...prefs.selectedSessions, id];
    updatePrefs({ selectedSessions: next });
  };

  const handleDelete = () => {
    resetPrefs();
    setShowDeleteDialog(false);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex items-center h-14 px-4 gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="font-bold text-lg">Settings</span>
        </div>
      </header>

      <main className="container px-4 py-6 max-w-lg space-y-6">
        {/* Notification Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Notification Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {notifPermission === "granted" ? (
                <>
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm text-success">Notifications enabled</span>
                </>
              ) : notifPermission === "denied" ? (
                <>
                  <BellOff className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">
                    Notifications blocked — enable in browser settings
                  </span>
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 text-warning" />
                  <span className="text-sm text-muted-foreground">Notifications not yet requested</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Timezone */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" /> Timezone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={prefs.timezone} onValueChange={(v) => updatePrefs({ timezone: v })}>
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
          </CardContent>
        </Card>

        {/* Sessions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" /> Sessions
            </CardTitle>
            <CardDescription>Choose which sessions to receive alerts for</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {FOREX_SESSIONS.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => toggleSession(session.id)}
              >
                <Checkbox checked={prefs.selectedSessions.includes(session.id)} />
                <div className={`h-3 w-3 rounded-full ${sessionColorMap[session.id]}`} />
                <Label className="cursor-pointer">{session.name}</Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alert Timing */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" /> Alert Timing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={String(prefs.alertMinutesBefore)}
              onValueChange={(v) => updatePrefs({ alertMinutesBefore: parseInt(v) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes before</SelectItem>
                <SelectItem value="10">10 minutes before</SelectItem>
                <SelectItem value="15">15 minutes before</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Pause */}
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <Label className="font-medium">Pause all alerts</Label>
              <p className="text-xs text-muted-foreground">Temporarily stop notifications</p>
            </div>
            <Switch
              checked={prefs.isPaused}
              onCheckedChange={(v) => updatePrefs({ isPaused: v })}
            />
          </CardContent>
        </Card>

        {/* Delete Data */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full text-destructive border-destructive/30 hover:bg-destructive/5">
              <Trash2 className="h-4 w-4 mr-2" /> Delete My Data
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete all data?</DialogTitle>
              <DialogDescription>
                This will remove all your preferences and reset the app. This cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Everything
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <p className="text-center text-xs text-muted-foreground pb-4">
          Session timing alerts only. Not financial advice.
        </p>
      </main>
    </div>
  );
};

export default SettingsPage;
