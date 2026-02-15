import { FOREX_SESSIONS, getNextSessionOpen, type UpcomingAlert } from "./forex-sessions";
import { loadPreferences } from "./preferences";

let scheduledTimers: ReturnType<typeof setTimeout>[] = [];
let sentAlertKeys = new Set<string>();

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function sendNotification(title: string, body: string, tag?: string): void {
  if (getNotificationPermission() !== "granted") return;
  new Notification(title, {
    body,
    icon: "/favicon.ico",
    tag: tag || undefined,
    badge: "/favicon.ico",
  });
}

export function sendTestNotification(): boolean {
  if (getNotificationPermission() !== "granted") return false;
  sendNotification(
    "🔔 Test Alert - Forex Sessions",
    "Notifications are working! You'll receive alerts before sessions open.",
    "test"
  );
  return true;
}

function getAlertKey(sessionId: string, openTime: Date): string {
  return `${sessionId}_${openTime.toISOString()}`;
}

export function scheduleAlerts(): void {
  clearScheduledAlerts();
  const prefs = loadPreferences();
  if (prefs.isPaused || !prefs.onboardingComplete) return;
  if (getNotificationPermission() !== "granted") return;

  const now = new Date();

  for (const session of FOREX_SESSIONS) {
    if (!prefs.selectedSessions.includes(session.id)) continue;

    const nextOpen = getNextSessionOpen(session, now);
    const alertTime = new Date(nextOpen.getTime() - prefs.alertMinutesBefore * 60 * 1000);
    const msUntilAlert = alertTime.getTime() - now.getTime();

    if (msUntilAlert <= 0) continue;
    if (msUntilAlert > 24 * 60 * 60 * 1000) continue;

    const key = getAlertKey(session.id, nextOpen);
    if (sentAlertKeys.has(key)) continue;

    const localOpenTime = nextOpen.toLocaleTimeString("en-US", {
      timeZone: prefs.timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const timer = setTimeout(() => {
      if (!sentAlertKeys.has(key)) {
        sentAlertKeys.add(key);
        sendNotification(
          `📈 ${session.name} Session Opening`,
          `Opens at ${localOpenTime} (in ${prefs.alertMinutesBefore} min)\nActive pairs: ${session.pairs.join(", ")}`,
          key
        );
        // Log to localStorage for tracking
        logSentAlert(session.id, session.name, nextOpen, new Date());
      }
    }, msUntilAlert);

    scheduledTimers.push(timer);
  }
}

export function clearScheduledAlerts(): void {
  scheduledTimers.forEach(clearTimeout);
  scheduledTimers = [];
}

function logSentAlert(sessionId: string, sessionName: string, scheduledTime: Date, sentTime: Date): void {
  try {
    const logs = JSON.parse(localStorage.getItem("forex_alert_logs") || "[]");
    logs.push({ sessionId, sessionName, scheduledTime: scheduledTime.toISOString(), sentTime: sentTime.toISOString() });
    // Keep only last 100 logs
    if (logs.length > 100) logs.splice(0, logs.length - 100);
    localStorage.setItem("forex_alert_logs", JSON.stringify(logs));
  } catch {}
}

export function getSentAlertKeys(): Set<string> {
  return sentAlertKeys;
}
