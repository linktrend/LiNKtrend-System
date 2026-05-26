import { format, isValid, parseISO } from "date-fns";

/** Parse `YYYY-MM-DD` (or ISO datetime prefix) into a local Date, or undefined if empty/invalid. */
export function parseIsoDateField(value: string | undefined | null): Date | undefined {
  const trimmed = value?.trim().slice(0, 10) ?? "";
  if (!trimmed) return undefined;
  const parsed = parseISO(trimmed);
  return isValid(parsed) ? parsed : undefined;
}

/** Format a Date as `YYYY-MM-DD` for form values and hidden inputs. */
export function toIsoDateField(date: Date | undefined): string {
  if (!date || !isValid(date)) return "";
  return format(date, "yyyy-MM-dd");
}

/** Human-readable display for ISO date strings in read-only surfaces. */
export function formatIsoDateDisplay(value: string | undefined | null, fallback = "—"): string {
  const parsed = parseIsoDateField(value);
  if (!parsed) return value?.trim() || fallback;
  return format(parsed, "d MMMM yyyy");
}

/** True when the value looks like an ISO calendar date (`YYYY-MM-DD`). */
export function isIsoDateField(value: string | undefined | null): boolean {
  return Boolean(parseIsoDateField(value));
}
