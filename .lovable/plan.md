

# Forex Session Timing Alerts App

## Overview
A web app that helps forex traders never miss key market sessions by delivering browser notifications before Tokyo, London, New York, and Sydney sessions open. Includes a dashboard with upcoming alerts and a chatbot for managing preferences.

## Screens & Features

### 1. Welcome / Onboarding Screen
- Auto-detect user's timezone using browser API (with manual override dropdown)
- Session selection checkboxes: Tokyo, London, New York, Sydney
- Alert timing selection: 5, 10, or 15 minutes before session open
- "Save & Start Alerts" button → requests browser notification permission
- Generates a device-based anonymous user ID (stored in localStorage + database)

### 2. Dashboard
- **Upcoming Alerts Table**: Shows next 24 hours of alerts with session name, local open time, alert time, and status (color-coded: green = upcoming, gray = sent)
- **Session Overview Cards**: Visual display of all 4 sessions with their local open/close times and active currency pairs
- **Chatbot Panel**: Simple command-based chat interface supporting commands like "help", "add Tokyo", "remove Sydney", "change timezone to GMT", "change alerts to 15 minutes", "pause alerts", "export my data", "delete my data"
- **Test Notification Button**: Sends a sample browser notification to verify setup
- **Quick Settings Access**: Edit preferences without leaving the dashboard

### 3. Settings Screen
- Edit timezone, session selections, and alert timing
- Pause/resume all alerts toggle
- Delete my data option with confirmation dialog
- Notification permission status indicator

## Notification System
- Uses the Browser Notifications API with a service worker for background delivery
- Notifications display: session name, local open time, countdown, and active currency pairs
- Scheduling handled client-side with timers that check against the user's alert schedule (recalculated on page load and preference changes)
- Duplicate prevention logic

## Backend (Supabase)
- **Users table**: user_id, timezone, created_at, last_active
- **Preferences table**: user_id, session_name, alert_minutes_before, is_active
- **Alerts log table**: tracking sent alerts for debugging and preventing duplicates
- Device-based auth (anonymous UUID, no email required)

## Key Technical Details
- Hardcoded forex session times in UTC with automatic DST adjustment via Intl API
- All times converted and displayed in user's local timezone
- Chatbot uses keyword matching (no AI needed for v1)
- Responsive design for desktop and mobile browsers
- Disclaimer: "Session timing alerts only. Not financial advice."

## Design Style
- Clean, professional dashboard aesthetic
- Dark mode friendly (traders often work in low-light environments)
- Color-coded session indicators (e.g., Tokyo = red, London = blue, NY = green, Sydney = gold)

