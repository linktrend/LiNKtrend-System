export type PrivacyPreferenceRow = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
};

export const DEFAULT_PRIVACY_PREFERENCES: PrivacyPreferenceRow[] = [
  {
    id: "data_sharing",
    label: "Product improvement data sharing",
    description: "Share anonymized usage signals to improve LiNKaios reliability and UX.",
    enabled: false,
  },
  {
    id: "analytics",
    label: "Analytics tracking",
    description: "Allow session analytics for feature adoption and funnel diagnostics.",
    enabled: false,
  },
  {
    id: "crash_reports",
    label: "Crash reports",
    description: "Send client error summaries to help LiNKtrend diagnose defects faster.",
    enabled: true,
  },
  {
    id: "personalization",
    label: "Personalized recommendations",
    description: "Use workspace activity to rank modules, templates, and operator tips.",
    enabled: false,
  },
  {
    id: "marketing",
    label: "Marketing communications",
    description: "Receive optional product education and event invitations by email.",
    enabled: false,
  },
];

const STORAGE_KEY = "linkaios-privacy-preferences-v1";
export const EVENT_PRIVACY_PREFERENCES_CHANGED = "linkaios-privacy-preferences-changed";

export function readPrivacyPreferences(): PrivacyPreferenceRow[] {
  if (typeof window === "undefined") return DEFAULT_PRIVACY_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PRIVACY_PREFERENCES;
    const parsed = JSON.parse(raw) as PrivacyPreferenceRow[];
    return DEFAULT_PRIVACY_PREFERENCES.map((seed) => {
      const saved = parsed.find((row) => row.id === seed.id);
      return saved ? { ...seed, enabled: saved.enabled } : seed;
    });
  } catch {
    return DEFAULT_PRIVACY_PREFERENCES;
  }
}

export function writePrivacyPreferences(rows: PrivacyPreferenceRow[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event(EVENT_PRIVACY_PREFERENCES_CHANGED));
}

export function privacySummaryLines(rows: PrivacyPreferenceRow[]): { dataSharing: string; analytics: string } {
  const dataSharing = rows.find((row) => row.id === "data_sharing");
  const analytics = rows.find((row) => row.id === "analytics");
  return {
    dataSharing: dataSharing?.enabled ? "On" : "Off",
    analytics: analytics?.enabled ? "On" : "Off",
  };
}
