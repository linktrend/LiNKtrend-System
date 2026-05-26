import { AddCapabilityHeaderAction } from "@/components/linkskills-header-actions";
import { ConnectorsCatalogDiscovery } from "@/components/connectors-catalog-discovery";
import { LinkskillsHubNav } from "@/components/linkskills-hub-nav";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { ConnectorsCatalogStatsGrid } from "@/components/summary-metric-card";
import { connectorHubStats, DEMO_CONNECTOR_CATALOG_ROWS } from "@/lib/ui-mocks/capability-connectors-demo";

export const dynamic = "force-dynamic";

export default function SkillsConnectorsPage() {
  const stats = connectorHubStats(DEMO_CONNECTOR_CATALOG_ROWS);

  return (
    <main className="space-y-8">
      <ShellPageHeaderClient
        title="Capabilities"
        subtitle="Capability registry — governed bridges to external software."
        actions={<AddCapabilityHeaderAction />}
      />
      <LinkskillsHubNav />

      <ConnectorsCatalogStatsGrid
        total={stats.total}
        implemented={stats.implemented}
        declared={stats.declared}
        pending={stats.pending}
      />

      <ConnectorsCatalogDiscovery seedRows={DEMO_CONNECTOR_CATALOG_ROWS} />
    </main>
  );
}
