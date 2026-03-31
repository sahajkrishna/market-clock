import { useState, useEffect, useRef, useCallback } from "react";
import { FOREX_SESSIONS, isSessionActive, type ForexSession } from "@/lib/forex-sessions";
import { sendNotification, getNotificationPermission } from "@/lib/notifications";

export type AlertType = "open" | "close" | "pre-open" | "pre-close";

export interface MarketAlert {
  id: string;
  sessionId: string;
  sessionName: string;
  type: AlertType;
  message: string;
  timestamp: Date;
  read: boolean;
}

const ALERT_LABELS: Record<AlertType, string> = {
  open: "Market Opened",
  close: "Market Closed",
  "pre-open": "Opening Soon",
  "pre-close": "Closing Soon",
};

const PRE_ALERT_MINUTES = 5;
const CHECK_INTERVAL_MS = 10_000; // check every 10s

function makeAlertKey(sessionId: string, type: AlertType, dateKey: string): string {
  return `${sessionId}:${type}:${dateKey}`;
}

function getUTCDateKey(d: Date): string {
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

function getEventTimeToday(session: ForexSession, type: "open" | "close", now: Date): Date {
  const d = new Date(now);
  const time = type === "open" ? session.openUTC : session.closeUTC;
  d.setUTCHours(time.hour, time.minute, 0, 0);
  return d;
}

function minutesUntil(target: Date, now: Date): number {
  return (target.getTime() - now.getTime()) / 60_000;
}

export function useMarketAlerts(selectedSessions: string[], isPaused: boolean) {
  const [alerts, setAlerts] = useState<MarketAlert[]>(() => {
    try {
      const stored = localStorage.getItem("market_alerts_history");
      if (stored) {
        const parsed = JSON.parse(stored) as MarketAlert[];
        return parsed.map((a) => ({ ...a, timestamp: new Date(a.timestamp) })).slice(-50);
      }
    } catch {}
    return [];
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const firedKeys = useRef<Set<string>>(new Set());

  // Persist alerts
  useEffect(() => {
    try {
      localStorage.setItem("market_alerts_history", JSON.stringify(alerts.slice(-50)));
    } catch {}
    setUnreadCount(alerts.filter((a) => !a.read).length);
  }, [alerts]);

  const addAlert = useCallback(
    (sessionId: string, sessionName: string, type: AlertType) => {
      const now = new Date();
      const key = makeAlertKey(sessionId, type, getUTCDateKey(now));
      if (firedKeys.current.has(key)) return;
      firedKeys.current.add(key);

      const alert: MarketAlert = {
        id: `${key}-${now.getTime()}`,
        sessionId,
        sessionName,
        type,
        message: `${sessionName} — ${ALERT_LABELS[type]}`,
        timestamp: now,
        read: false,
      };

      setAlerts((prev) => [...prev.slice(-49), alert]);

      // Browser notification
      if (getNotificationPermission() === "granted") {
        const emoji = type === "open" || type === "pre-open" ? "📈" : "📉";
        sendNotification(
          `${emoji} ${sessionName} ${ALERT_LABELS[type]}`,
          alert.message,
          key
        );
      }
    },
    []
  );

  const markAllRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
    firedKeys.current.clear();
  }, []);

  // Core check loop
  useEffect(() => {
    if (isPaused) return;

    const check = () => {
      const now = new Date();

      for (const session of FOREX_SESSIONS) {
        if (!selectedSessions.includes(session.id)) continue;

        const openTime = getEventTimeToday(session, "open", now);
        const closeTime = getEventTimeToday(session, "close", now);

        // Adjust close time if it wraps past midnight (e.g., Sydney close 07:00 when open 22:00)
        if (closeTime <= openTime) {
          // For sessions crossing midnight, check both today and tomorrow for close
        }

        const minsToOpen = minutesUntil(openTime, now);
        const minsToClose = minutesUntil(closeTime, now);

        // Pre-open: 5 min before open (within 0-5 min window)
        if (minsToOpen > 0 && minsToOpen <= PRE_ALERT_MINUTES) {
          addAlert(session.id, session.name, "pre-open");
        }

        // Open: within 60s after open time
        if (minsToOpen <= 0 && minsToOpen > -1) {
          addAlert(session.id, session.name, "open");
        }

        // Pre-close: 5 min before close
        if (minsToClose > 0 && minsToClose <= PRE_ALERT_MINUTES) {
          addAlert(session.id, session.name, "pre-close");
        }

        // Close: within 60s after close time
        if (minsToClose <= 0 && minsToClose > -1) {
          addAlert(session.id, session.name, "close");
        }
      }
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [selectedSessions, isPaused, addAlert]);

  // Clean stale keys daily
  useEffect(() => {
    const cleanup = setInterval(() => {
      firedKeys.current.clear();
    }, 24 * 60 * 60 * 1000);
    return () => clearInterval(cleanup);
  }, []);

  return { alerts, unreadCount, markAllRead, clearAlerts };
}
