export interface ForexSession {
  id: string;
  name: string;
  city: string;
  openUTC: { hour: number; minute: number };
  closeUTC: { hour: number; minute: number };
  pairs: string[];
  colorClass: string;
}

export const FOREX_SESSIONS: ForexSession[] = [
  {
    id: "tokyo",
    name: "Tokyo",
    city: "Tokyo",
    openUTC: { hour: 0, minute: 0 },
    closeUTC: { hour: 9, minute: 0 },
    pairs: ["USD/JPY", "EUR/JPY", "AUD/JPY", "GBP/JPY"],
    colorClass: "tokyo",
  },
  {
    id: "london",
    name: "London",
    city: "London",
    openUTC: { hour: 8, minute: 0 },
    closeUTC: { hour: 17, minute: 0 },
    pairs: ["EUR/USD", "GBP/USD", "EUR/GBP", "USD/CHF"],
    colorClass: "london",
  },
  {
    id: "newyork",
    name: "New York",
    city: "New York",
    openUTC: { hour: 13, minute: 0 },
    closeUTC: { hour: 22, minute: 0 },
    pairs: ["EUR/USD", "USD/CAD", "GBP/USD", "USD/MXN"],
    colorClass: "newyork",
  },
  {
    id: "sydney",
    name: "Sydney",
    city: "Sydney",
    openUTC: { hour: 22, minute: 0 },
    closeUTC: { hour: 7, minute: 0 },
    pairs: ["AUD/USD", "NZD/USD", "AUD/NZD", "AUD/JPY"],
    colorClass: "sydney",
  },
];

export function getNextSessionOpen(session: ForexSession, now: Date): Date {
  const todayOpen = new Date(now);
  todayOpen.setUTCHours(session.openUTC.hour, session.openUTC.minute, 0, 0);

  if (todayOpen > now) return todayOpen;

  const tomorrowOpen = new Date(todayOpen);
  tomorrowOpen.setUTCDate(tomorrowOpen.getUTCDate() + 1);
  return tomorrowOpen;
}

export function getSessionLocalTime(
  session: ForexSession,
  timezone: string,
  type: "open" | "close"
): string {
  const ref = new Date();
  const time = type === "open" ? session.openUTC : session.closeUTC;
  ref.setUTCHours(time.hour, time.minute, 0, 0);
  return ref.toLocaleTimeString("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function isSessionActive(session: ForexSession, now: Date): boolean {
  const currentUTCMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const openMinutes = session.openUTC.hour * 60 + session.openUTC.minute;
  const closeMinutes = session.closeUTC.hour * 60 + session.closeUTC.minute;

  if (openMinutes < closeMinutes) {
    return currentUTCMinutes >= openMinutes && currentUTCMinutes < closeMinutes;
  }
  // Crosses midnight
  return currentUTCMinutes >= openMinutes || currentUTCMinutes < closeMinutes;
}

export interface UpcomingAlert {
  sessionId: string;
  sessionName: string;
  openTime: Date;
  alertTime: Date;
  colorClass: string;
  pairs: string[];
  status: "upcoming" | "sent";
}

export function getUpcomingAlerts(
  selectedSessions: string[],
  alertMinutesBefore: number,
  timezone: string,
  now: Date
): UpcomingAlert[] {
  const alerts: UpcomingAlert[] = [];
  const end = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  for (const session of FOREX_SESSIONS) {
    if (!selectedSessions.includes(session.id)) continue;

    let openTime = getNextSessionOpen(session, now);
    // Get up to 2 openings within 24h
    for (let i = 0; i < 2; i++) {
      if (openTime > end) break;
      const alertTime = new Date(openTime.getTime() - alertMinutesBefore * 60 * 1000);
      alerts.push({
        sessionId: session.id,
        sessionName: session.name,
        openTime,
        alertTime,
        colorClass: session.colorClass,
        pairs: session.pairs,
        status: alertTime < now ? "sent" : "upcoming",
      });
      // Next day
      openTime = new Date(openTime.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  return alerts.sort((a, b) => a.alertTime.getTime() - b.alertTime.getTime());
}
