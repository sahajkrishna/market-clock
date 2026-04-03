import { v4 } from "../lib/uuid";

export type TraderType = "beginner" | "intraday" | "scalper" | "swing";
export type MarketMode = "scalper" | "swing" | "news";

export interface NotificationPrefs {
  beforeSession: boolean;
  atSessionOpen: boolean;
  overlapAlerts: boolean;
  disabled: boolean;
}

export interface UserPreferences {
  userId: string;
  timezone: string;
  selectedSessions: string[];
  alertMinutesBefore: number;
  isPaused: boolean;
  onboardingComplete: boolean;
  traderType?: TraderType;
  marketMode: MarketMode;
  notificationPrefs: NotificationPrefs;
}

const STORAGE_KEY = "forex_alerts_preferences";

function generateUserId(): string {
  return "fx_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 9);
}

export function getDetectedTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getDefaultNotificationPrefs(): NotificationPrefs {
  return {
    beforeSession: true,
    atSessionOpen: true,
    overlapAlerts: true,
    disabled: false,
  };
}

export function getDefaultPreferences(): UserPreferences {
  return {
    userId: generateUserId(),
    timezone: getDetectedTimezone(),
    selectedSessions: ["tokyo", "london", "newyork", "sydney"],
    alertMinutesBefore: 10,
    isPaused: false,
    onboardingComplete: false,
    marketMode: "swing",
    notificationPrefs: getDefaultNotificationPrefs(),
  };
}

export function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return getDefaultPreferences();
}

export function savePreferences(prefs: UserPreferences): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function clearPreferences(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCommonTimezones(): string[] {
  return [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Anchorage",
    "Pacific/Honolulu",
    "America/Toronto",
    "America/Vancouver",
    "America/Sao_Paulo",
    "America/Argentina/Buenos_Aires",
    "America/Mexico_City",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Madrid",
    "Europe/Rome",
    "Europe/Amsterdam",
    "Europe/Zurich",
    "Europe/Moscow",
    "Europe/Istanbul",
    "Africa/Cairo",
    "Africa/Lagos",
    "Africa/Johannesburg",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Bangkok",
    "Asia/Singapore",
    "Asia/Hong_Kong",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Asia/Seoul",
    "Australia/Sydney",
    "Australia/Melbourne",
    "Australia/Perth",
    "Pacific/Auckland",
    "Pacific/Fiji",
  ];
}
