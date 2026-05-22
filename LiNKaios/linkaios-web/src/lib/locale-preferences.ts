export type MeasurementSystem = "metric" | "imperial";
export type FirstDayOfWeek = "monday" | "sunday";
export type TimeFormat = "12h" | "24h";

export type LocalePreferences = {
  language: string;
  region: string;
  currency: string;
  measurementSystem: MeasurementSystem;
  firstDayOfWeek: FirstDayOfWeek;
  dateFormat: string;
  timeFormat: TimeFormat;
  numberFormat: string;
};

export const LOCALE_LANGUAGE_OPTIONS = ["English", "繁體中文", "Spanish"] as const;
/** Continents and major geographic / cultural / economic regions — not individual countries. */
export const LOCALE_REGION_OPTIONS = [
  "North America",
  "Latin America",
  "Europe",
  "Middle East",
  "Africa",
  "Asia",
  "Oceania",
] as const;

const LEGACY_REGION_MAP: Record<string, (typeof LOCALE_REGION_OPTIONS)[number]> = {
  "United States": "North America",
  Canada: "North America",
  "United Kingdom": "Europe",
  "European Union": "Europe",
  Australia: "Oceania",
};

export const LOCALE_CURRENCY_OPTIONS = [
  "USD",
  "EUR",
  "TWD",
  "CRC",
  "MXN",
  "CAD",
  "ZAR",
  "AED",
  "CNY",
  "JPY",
  "SGD",
  "AUD",
  "CHF",
] as const;
export const LOCALE_DATE_FORMAT_OPTIONS = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"] as const;
export const LOCALE_NUMBER_FORMAT_OPTIONS = ["1,234.56", "1.234,56", "1 234,56"] as const;

export const DEFAULT_LOCALE_PREFERENCES: LocalePreferences = {
  language: "English",
  region: "North America",
  currency: "USD",
  measurementSystem: "imperial",
  firstDayOfWeek: "sunday",
  dateFormat: "MM/DD/YYYY",
  timeFormat: "12h",
  numberFormat: "1,234.56",
};

const STORAGE_KEY = "linkaios-locale-preferences-v1";
export const EVENT_LOCALE_PREFERENCES_CHANGED = "linkaios-locale-preferences-changed";

export function readLocalePreferences(): LocalePreferences {
  if (typeof window === "undefined") return DEFAULT_LOCALE_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LOCALE_PREFERENCES;
    const parsed = { ...DEFAULT_LOCALE_PREFERENCES, ...(JSON.parse(raw) as Partial<LocalePreferences>) };
    if (!LOCALE_LANGUAGE_OPTIONS.includes(parsed.language as (typeof LOCALE_LANGUAGE_OPTIONS)[number])) {
      parsed.language = DEFAULT_LOCALE_PREFERENCES.language;
    }
    if (LEGACY_REGION_MAP[parsed.region]) {
      parsed.region = LEGACY_REGION_MAP[parsed.region]!;
    } else if (!LOCALE_REGION_OPTIONS.includes(parsed.region as (typeof LOCALE_REGION_OPTIONS)[number])) {
      parsed.region = DEFAULT_LOCALE_PREFERENCES.region;
    }
    if (!LOCALE_CURRENCY_OPTIONS.includes(parsed.currency as (typeof LOCALE_CURRENCY_OPTIONS)[number])) {
      parsed.currency = DEFAULT_LOCALE_PREFERENCES.currency;
    }
    return parsed;
  } catch {
    return DEFAULT_LOCALE_PREFERENCES;
  }
}

export function writeLocalePreferences(next: LocalePreferences) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(EVENT_LOCALE_PREFERENCES_CHANGED));
}

export function localeSummaryLine(prefs: LocalePreferences): string {
  return `${prefs.language} · ${prefs.currency} · ${prefs.measurementSystem === "metric" ? "Metric" : "Imperial"}`;
}
