export type NotificationChannel = "email" | "inApp" | "push";

export type NotificationPreferenceRow = {
  id: string;
  label: string;
  description: string;
  email: boolean;
  inApp: boolean;
  push: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferenceRow[] = [
  {
    id: "security_alerts",
    label: "Security alerts",
    description: "Sign-in attempts, password changes, and 2FA updates.",
    email: true,
    inApp: true,
    push: true,
  },
  {
    id: "billing",
    label: "Billing & invoices",
    description: "Payment receipts, failed charges, and subscription changes.",
    email: true,
    inApp: true,
    push: false,
  },
  {
    id: "mission_updates",
    label: "Project updates",
    description: "Project status changes, approvals, and blocked runs.",
    email: true,
    inApp: true,
    push: false,
  },
  {
    id: "linkbot_activity",
    label: "LiNKbot activity",
    description: "Worker heartbeats, session errors, and operator escalations.",
    email: false,
    inApp: true,
    push: false,
  },
  {
    id: "product_news",
    label: "Product news",
    description: "Release notes and feature announcements from LiNKtrend.",
    email: true,
    inApp: false,
    push: false,
  },
];

const STORAGE_KEY = "linkaios-notification-preferences-v1";
export const EVENT_NOTIFICATION_PREFERENCES_CHANGED = "linkaios-notification-preferences-changed";

export function readNotificationPreferences(): NotificationPreferenceRow[] {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFERENCES;
    const parsed = JSON.parse(raw) as NotificationPreferenceRow[];
    return DEFAULT_NOTIFICATION_PREFERENCES.map((seed) => {
      const saved = parsed.find((row) => row.id === seed.id);
      return saved ? { ...seed, email: saved.email, inApp: saved.inApp, push: saved.push } : seed;
    });
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

export function writeNotificationPreferences(rows: NotificationPreferenceRow[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event(EVENT_NOTIFICATION_PREFERENCES_CHANGED));
}

export function notificationSummaryLines(rows: NotificationPreferenceRow[]): { email: string; inApp: string } {
  const emailOn = rows.filter((row) => row.email).length;
  const inAppOn = rows.filter((row) => row.inApp).length;
  return {
    email: emailOn === rows.length ? "On" : emailOn === 0 ? "Off" : `${emailOn} categories on`,
    inApp: inAppOn === rows.length ? "On" : inAppOn === 0 ? "Off" : `${inAppOn} categories on`,
  };
}
