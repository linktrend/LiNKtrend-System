export type ActiveSessionRow = {
  id: string;
  deviceLabel: string;
  browser: string;
  os: string;
  location: string;
  ipAddress: string;
  signedInAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
};

export type SessionHistoryRow = {
  id: string;
  type: import("@/lib/session-activity-copy").SessionActivityEventType;
  occurredAt: string;
  ipAddress: string;
  location: string;
  deviceLabel: string;
  detail: string;
};

export function demoActiveSessions(): ActiveSessionRow[] {
  const now = Date.now();
  return [
    {
      id: "sess_current",
      deviceLabel: "This device",
      browser: "Chrome 136",
      os: "macOS 15.4",
      location: "Auckland, New Zealand",
      ipAddress: "203.97.42.18",
      signedInAt: new Date(now - 2 * 3600_000).toISOString(),
      lastActiveAt: new Date(now - 2 * 60_000).toISOString(),
      isCurrent: true,
    },
    {
      id: "sess_ipad",
      deviceLabel: "iPad Pro",
      browser: "Safari 18",
      os: "iPadOS 18.4",
      location: "Auckland, New Zealand",
      ipAddress: "203.97.42.22",
      signedInAt: new Date(now - 26 * 3600_000).toISOString(),
      lastActiveAt: new Date(now - 4 * 3600_000).toISOString(),
      isCurrent: false,
    },
    {
      id: "sess_phone",
      deviceLabel: "iPhone 16",
      browser: "Mobile Safari",
      os: "iOS 18.4",
      location: "Wellington, New Zealand",
      ipAddress: "122.62.88.41",
      signedInAt: new Date(now - 72 * 3600_000).toISOString(),
      lastActiveAt: new Date(now - 18 * 3600_000).toISOString(),
      isCurrent: false,
    },
  ];
}

export function demoSessionHistory(): SessionHistoryRow[] {
  const now = Date.now();
  return [
    {
      id: "evt_1",
      type: "login",
      occurredAt: new Date(now - 2 * 3600_000).toISOString(),
      ipAddress: "203.97.42.18",
      location: "Auckland, New Zealand",
      deviceLabel: "MacBook · Chrome",
      detail: "Password sign-in",
    },
    {
      id: "evt_2",
      type: "mfa_enabled",
      occurredAt: new Date(now - 28 * 3600_000).toISOString(),
      ipAddress: "203.97.42.18",
      location: "Auckland, New Zealand",
      deviceLabel: "MacBook · Chrome",
      detail: "Authenticator app verified",
    },
    {
      id: "evt_3",
      type: "login",
      occurredAt: new Date(now - 26 * 3600_000).toISOString(),
      ipAddress: "203.97.42.22",
      location: "Auckland, New Zealand",
      deviceLabel: "iPad Pro · Safari",
      detail: "Magic link sign-in",
    },
    {
      id: "evt_4",
      type: "session_revoked",
      occurredAt: new Date(now - 48 * 3600_000).toISOString(),
      ipAddress: "203.97.42.18",
      location: "Auckland, New Zealand",
      deviceLabel: "MacBook · Chrome",
      detail: "Revoked unknown Windows session",
    },
    {
      id: "evt_5",
      type: "login",
      occurredAt: new Date(now - 72 * 3600_000).toISOString(),
      ipAddress: "122.62.88.41",
      location: "Wellington, New Zealand",
      deviceLabel: "iPhone · Safari",
      detail: "Passkey sign-in",
    },
    {
      id: "evt_6",
      type: "password_updated",
      occurredAt: new Date(now - 120 * 3600_000).toISOString(),
      ipAddress: "203.97.42.18",
      location: "Auckland, New Zealand",
      deviceLabel: "MacBook · Chrome",
      detail: "Password changed from security settings",
    },
  ];
}

export function formatSessionTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeActive(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 60_000) return "Active now";
  if (diffMs < 3600_000) return `${Math.round(diffMs / 60_000)}m ago`;
  if (diffMs < 86_400_000) return `${Math.round(diffMs / 3600_000)}h ago`;
  return formatSessionTimestamp(iso);
}
