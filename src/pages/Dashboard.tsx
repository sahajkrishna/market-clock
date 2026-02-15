import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePreferences } from "@/hooks/usePreferences";
import {
  FOREX_SESSIONS,
  getUpcomingAlerts,
  getSessionLocalTime,
  isSessionActive,
} from "@/lib/forex-sessions";
import {
  sendTestNotification,
  getNotificationPermission,
} from "@/lib/notifications";
import { processChatCommand, type ChatMessage } from "@/lib/chatbot";
import {
  Bell,
  BellOff,
  Settings,
  Send,
  Clock,
  TrendingUp,
  MessageSquare,
  TestTube,
  Pause,
  Play,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const sessionColorMap: Record<string, string> = {
  tokyo: "bg-tokyo text-tokyo-foreground",
  london: "bg-london text-london-foreground",
  newyork: "bg-newyork text-newyork-foreground",
  sydney: "bg-sydney text-sydney-foreground",
};

const sessionBorderMap: Record<string, string> = {
  tokyo: "border-tokyo/30",
  london: "border-london/30",
  newyork: "border-newyork/30",
  sydney: "border-sydney/30",
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { prefs, updatePrefs } = usePreferences();
  const { toast } = useToast();
  const [now, setNow] = useState(new Date());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "bot",
      text: 'Welcome! Type **help** to see available commands.',
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Redirect to onboarding if not complete
  useEffect(() => {
    if (!prefs.onboardingComplete) {
      navigate("/");
    }
  }, [prefs.onboardingComplete, navigate]);

  // Update clock every 30s
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const alerts = getUpcomingAlerts(
    prefs.selectedSessions,
    prefs.alertMinutesBefore,
    prefs.timezone,
    now
  );

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: chatInput,
      timestamp: new Date(),
    };
    const response = processChatCommand(chatInput);
    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "bot",
      text: response,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMsg, botMsg]);
    setChatInput("");
  };

  const handleTestNotification = () => {
    const success = sendTestNotification();
    if (success) {
      toast({ title: "Test notification sent!", description: "Check your browser notifications." });
    } else {
      toast({
        title: "Notifications not enabled",
        description: "Please allow notifications in your browser settings.",
        variant: "destructive",
      });
    }
  };

  const notifPermission = getNotificationPermission();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">FX Alerts</span>
            {prefs.isPaused && (
              <Badge variant="secondary" className="text-xs">
                <Pause className="h-3 w-3 mr-1" /> Paused
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updatePrefs({ isPaused: !prefs.isPaused })}
            >
              {prefs.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6 max-w-6xl">
        {/* Notification status bar */}
        {notifPermission !== "granted" && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 p-3 flex items-center gap-2 text-sm">
            <BellOff className="h-4 w-4 text-warning" />
            <span>Notifications are {notifPermission === "denied" ? "blocked" : "not enabled"}.</span>
          </div>
        )}

        {/* Session Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FOREX_SESSIONS.map((session) => {
            const active = isSessionActive(session, now);
            const selected = prefs.selectedSessions.includes(session.id);
            return (
              <Card
                key={session.id}
                className={`relative overflow-hidden transition-all ${
                  !selected ? "opacity-50" : ""
                } ${sessionBorderMap[session.id]} border-l-4`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${sessionColorMap[session.id]}`} />
                      {session.name}
                    </CardTitle>
                    {active && (
                      <Badge className="text-xs bg-success text-success-foreground">
                        <Activity className="h-3 w-3 mr-1" /> Live
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Open:</span>{" "}
                    <span className="font-mono font-medium">
                      {getSessionLocalTime(session, prefs.timezone, "open")}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Close:</span>{" "}
                    <span className="font-mono font-medium">
                      {getSessionLocalTime(session, prefs.timezone, "close")}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {session.pairs.map((pair) => (
                      <span
                        key={pair}
                        className="text-[10px] font-mono bg-muted rounded px-1.5 py-0.5 text-muted-foreground"
                      >
                        {pair}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Alerts Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Upcoming Alerts
                  </CardTitle>
                  <CardDescription>Next 24 hours</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleTestNotification}>
                  <TestTube className="h-4 w-4 mr-1" /> Test
                </Button>
              </CardHeader>
              <CardContent>
                {alerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    No alerts scheduled. Select sessions in settings.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Session</TableHead>
                        <TableHead>Opens At</TableHead>
                        <TableHead>Alert At</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {alerts.map((alert, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-2 w-2 rounded-full ${sessionColorMap[alert.colorClass]}`}
                              />
                              <span className="font-medium">{alert.sessionName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {alert.openTime.toLocaleTimeString("en-US", {
                              timeZone: prefs.timezone,
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {alert.alertTime.toLocaleTimeString("en-US", {
                              timeZone: prefs.timezone,
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </TableCell>
                          <TableCell>
                            {alert.status === "upcoming" ? (
                              <Badge className="bg-success/10 text-success border-success/20">
                                <Bell className="h-3 w-3 mr-1" /> Upcoming
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Sent</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chatbot */}
          <Card className="flex flex-col h-[500px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Command Chat
              </CardTitle>
              <CardDescription>Manage preferences via commands</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden p-3">
              <div className="flex-1 overflow-y-auto space-y-3 px-1">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <div
                        dangerouslySetInnerHTML={{
                          __html: msg.text
                            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                            .replace(/`([^`]+)`/g, "<code class='bg-background/50 rounded px-1 text-xs font-mono'>$1</code>")
                            .replace(/\n/g, "<br/>")
                            .replace(/• /g, "• "),
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="flex gap-2 pt-2 border-t mt-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a command..."
                  className="text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                />
                <Button size="icon" onClick={handleSendChat}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground pb-4">
          Session timing alerts only. Not financial advice.
        </p>
      </main>
    </div>
  );
};

export default Dashboard;
