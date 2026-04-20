const TABS = [
  "overview",
  "work-items",
  "cycles",
  "agents",
  "tools",
  "activity",
] as const;

export type ProjectTabId = (typeof TABS)[number];

export function parseProjectTab(raw: string | string[] | undefined): ProjectTabId {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v && (TABS as readonly string[]).includes(v)) return v as ProjectTabId;
  return "overview";
}
