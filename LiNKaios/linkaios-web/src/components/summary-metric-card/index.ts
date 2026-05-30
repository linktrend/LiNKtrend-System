/**
 * Summary metric cards — canonical stat/stream/lifecycle tile system.
 *
 * All dashboard tiles with icon + title + primary metric (+ optional badge/preview/footer)
 * must use these components and {@link SUMMARY_METRIC_CARD} tokens from `lib/ui-standards.ts`.
 */

export { SummaryMetricCard, type SummaryMetricCardProps } from "./summary-metric-card";
export { SummaryMetricCardGrid, SummaryMetricCardSection } from "./summary-metric-card-grid";
export { ProjectLifecycleSummaryGrid } from "./project-lifecycle-summary-grid";
export { FleetSummaryStatsGrid } from "./fleet-summary-stats-grid";
export { ConnectorsCatalogStatsGrid } from "./connectors-catalog-stats-grid";
export { CapabilitiesCatalogStatsGrid } from "./capabilities-catalog-stats-grid";
export { LeaseSummaryStatsGrid } from "./lease-summary-stats-grid";
export { CockpitSummaryStatsGrid } from "./cockpit-summary-stats-grid";
export { OverviewProjectsSummaryGrid } from "./overview-projects-summary-grid";
export { OverviewWorkforceSummaryGrid } from "./overview-workforce-summary-grid";
export { MetricsKpiSummaryGrid } from "./metrics-kpi-summary-grid";
export { LinkguardSummaryStatsGrid, PrismSummaryStatsGrid } from "./linkguard-summary-stats-grid";
