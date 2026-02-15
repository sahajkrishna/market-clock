import { FOREX_SESSIONS } from "./forex-sessions";
import { loadPreferences, savePreferences, clearPreferences, getCommonTimezones } from "./preferences";

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

export function processChatCommand(input: string): string {
  const cmd = input.toLowerCase().trim();

  if (cmd === "help") {
    return `Available commands:
• **help** — Show this list
• **status** — Show current preferences
• **add [session]** — Add a session (tokyo, london, newyork, sydney)
• **remove [session]** — Remove a session
• **change timezone to [timezone]** — Update your timezone
• **change alerts to [5/10/15] minutes** — Change alert timing
• **pause alerts** — Pause all notifications
• **resume alerts** — Resume notifications
• **export my data** — Export your preferences as JSON
• **delete my data** — Delete all your data`;
  }

  if (cmd === "status") {
    const prefs = loadPreferences();
    const sessions = prefs.selectedSessions.map(
      (s) => FOREX_SESSIONS.find((fs) => fs.id === s)?.name || s
    );
    return `**Your Settings:**
• Timezone: ${prefs.timezone}
• Sessions: ${sessions.join(", ") || "None"}
• Alert timing: ${prefs.alertMinutesBefore} min before
• Alerts: ${prefs.isPaused ? "⏸ Paused" : "✅ Active"}`;
  }

  // Add session
  const addMatch = cmd.match(/^add\s+(tokyo|london|new\s*york|newyork|sydney)$/);
  if (addMatch) {
    const sessionId = addMatch[1].replace(/\s+/g, "").replace("newyork", "newyork");
    const normalizedId = sessionId === "newyork" ? "newyork" : sessionId;
    const prefs = loadPreferences();
    const session = FOREX_SESSIONS.find((s) => s.id === normalizedId);
    if (!session) return "Session not found. Options: tokyo, london, newyork, sydney";
    if (prefs.selectedSessions.includes(normalizedId)) {
      return `${session.name} is already in your sessions.`;
    }
    prefs.selectedSessions.push(normalizedId);
    savePreferences(prefs);
    return `✅ Added **${session.name}** to your sessions. Alerts will be scheduled on next refresh.`;
  }

  // Remove session
  const removeMatch = cmd.match(/^remove\s+(tokyo|london|new\s*york|newyork|sydney)$/);
  if (removeMatch) {
    const sessionId = removeMatch[1].replace(/\s+/g, "");
    const normalizedId = sessionId === "newyork" ? "newyork" : sessionId;
    const prefs = loadPreferences();
    const session = FOREX_SESSIONS.find((s) => s.id === normalizedId);
    if (!session) return "Session not found.";
    prefs.selectedSessions = prefs.selectedSessions.filter((s) => s !== normalizedId);
    savePreferences(prefs);
    return `✅ Removed **${session.name}**. You won't receive alerts for this session.`;
  }

  // Change timezone
  const tzMatch = cmd.match(/^change\s+timezone\s+to\s+(.+)$/);
  if (tzMatch) {
    const tz = tzMatch[1].trim();
    const found = getCommonTimezones().find((t) => t.toLowerCase() === tz.toLowerCase());
    if (!found) {
      // Try partial match
      const partial = getCommonTimezones().find((t) => t.toLowerCase().includes(tz.toLowerCase()));
      if (partial) {
        const prefs = loadPreferences();
        prefs.timezone = partial;
        savePreferences(prefs);
        return `✅ Timezone changed to **${partial}**.`;
      }
      return `Timezone "${tz}" not recognized. Try a full IANA timezone like "America/New_York" or "Europe/London".`;
    }
    const prefs = loadPreferences();
    prefs.timezone = found;
    savePreferences(prefs);
    return `✅ Timezone changed to **${found}**. Alert times recalculated.`;
  }

  // Change alert timing
  const alertMatch = cmd.match(/^change\s+alerts?\s+to\s+(\d+)\s*min/);
  if (alertMatch) {
    const minutes = parseInt(alertMatch[1]);
    if (![5, 10, 15].includes(minutes)) {
      return "Alert timing must be 5, 10, or 15 minutes.";
    }
    const prefs = loadPreferences();
    prefs.alertMinutesBefore = minutes;
    savePreferences(prefs);
    return `✅ Alerts will now fire **${minutes} minutes** before sessions open.`;
  }

  if (cmd === "pause alerts" || cmd === "pause") {
    const prefs = loadPreferences();
    prefs.isPaused = true;
    savePreferences(prefs);
    return "⏸ Alerts paused. Type **resume alerts** to re-enable.";
  }

  if (cmd === "resume alerts" || cmd === "resume") {
    const prefs = loadPreferences();
    prefs.isPaused = false;
    savePreferences(prefs);
    return "✅ Alerts resumed! You'll receive notifications before sessions open.";
  }

  if (cmd === "export my data" || cmd === "export") {
    const prefs = loadPreferences();
    return `Here's your data:\n\`\`\`json\n${JSON.stringify(prefs, null, 2)}\n\`\`\``;
  }

  if (cmd === "delete my data" || cmd === "delete") {
    return "⚠️ This will delete all your preferences and reset the app. To confirm, type **confirm delete**.";
  }

  if (cmd === "confirm delete") {
    clearPreferences();
    return "✅ All your data has been deleted. Refreshing will take you back to onboarding.";
  }

  return `I don't understand that command. Type **help** to see available commands.`;
}
