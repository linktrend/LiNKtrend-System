import type { KpiViewId } from "@/lib/metrics-kpi-views";

export type MetricsNavItem = {
  id: KpiViewId;
  label: string;
  href: string;
  match: (path: string, search?: string) => boolean;
};

export function parseMetricsView(raw: string | null): KpiViewId {
  if (raw === "performance" || raw === "reliability") return raw;
  return "cost";
}

export function metricsViewFromSearch(search?: string): KpiViewId {
  return parseMetricsView(new URLSearchParams(search ?? "").get("view"));
}

export function metricsViewHref(view: KpiViewId): string {
  if (view === "cost") return "/metrics";
  return `/metrics?view=${view}`;
}

function isMetricsHubPath(path: string): boolean {
  return path === "/metrics" || path === "/metrics/";
}

/** Sidebar sections for Metrics — mirrors KPI view tabs on the dashboard. */
export const METRICS_SIDEBAR_ITEMS: MetricsNavItem[] = [
  {
    id: "cost",
    label: "Cost",
    href: metricsViewHref("cost"),
    match: (path, search) => isMetricsHubPath(path) && metricsViewFromSearch(search) === "cost",
  },
  {
    id: "performance",
    label: "Performance",
    href: metricsViewHref("performance"),
    match: (path, search) => isMetricsHubPath(path) && metricsViewFromSearch(search) === "performance",
  },
  {
    id: "reliability",
    label: "Reliability",
    href: metricsViewHref("reliability"),
    match: (path, search) => isMetricsHubPath(path) && metricsViewFromSearch(search) === "reliability",
  },
];

export function metricsSectionActive(pathname: string): boolean {
  return pathname === "/metrics" || pathname.startsWith("/metrics/");
}
