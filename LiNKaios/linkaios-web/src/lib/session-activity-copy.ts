/** Copy and tab config for `/settings/sessions` (current operator session activity). */

export const SESSION_ACTIVITY_TABS = [
  { id: "active", label: "Active Sessions" },
  { id: "history", label: "Activity History" },
] as const;

export type SessionActivityTabId = (typeof SESSION_ACTIVITY_TABS)[number]["id"];

export const SESSION_ACTIVITY_DEFAULT_TAB: SessionActivityTabId = "active";

const SESSION_ACTIVITY_TAB_IDS = new Set<string>(SESSION_ACTIVITY_TABS.map((t) => t.id));

export function parseSessionActivityTab(raw: string | null | undefined): SessionActivityTabId {
  if (raw && SESSION_ACTIVITY_TAB_IDS.has(raw)) return raw as SessionActivityTabId;
  return SESSION_ACTIVITY_DEFAULT_TAB;
}

export function sessionActivityTabHref(tab: SessionActivityTabId): string {
  if (tab === SESSION_ACTIVITY_DEFAULT_TAB) return "/settings/sessions";
  return `/settings/sessions?tab=${tab}`;
}

export const SESSION_ACTIVITY_COPY = {
  pageNote:
    "Your sign-in sessions and security activity for this operator account. Demo data is shown until Supabase Auth session APIs are wired for live device and IP metadata.",
  activeTitle: "Devices signed in",
  activeDescription: "Review where your account is currently signed in and revoke sessions you do not recognize.",
  historyTitle: "Recent activity",
  historyDescription: "Logins, sign-outs, and security changes tied to your account.",
  revokeSuccess: "Session revoked (demo — production will invalidate the refresh token).",
  signOutOthersSuccess: "Other sessions signed out (demo).",
} as const;

export type SessionActivityEventType =
  | "login"
  | "logout"
  | "password_updated"
  | "mfa_enabled"
  | "mfa_disabled"
  | "session_revoked";

export function sessionActivityEventLabel(type: SessionActivityEventType): string {
  switch (type) {
    case "login":
      return "Signed in";
    case "logout":
      return "Signed out";
    case "password_updated":
      return "Password updated";
    case "mfa_enabled":
      return "2FA enabled";
    case "mfa_disabled":
      return "2FA disabled";
    case "session_revoked":
      return "Session revoked";
  }
}
