import Link from "next/link";

import { LinkskillsCapabilityDiscoverPanel } from "@/components/linkskills-discover-panel";
import { LinkskillsHubNav } from "@/components/linkskills-hub-nav";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { DEMO_CONNECTOR_CATALOG_ROWS } from "@/lib/ui-mocks/capability-connectors-demo";
import { discoverRepoCapabilities } from "@/lib/linkskills-repo-discovery";

export const dynamic = "force-dynamic";

export default function DiscoverCapabilitiesPage() {
  const demoIds = new Set(
    DEMO_CONNECTOR_CATALOG_ROWS.flatMap((r) => r.capabilityScope.split(",").map((s) => s.trim())),
  );
  const candidates = discoverRepoCapabilities(demoIds);

  return (
    <main className="space-y-8">
      <div>
        <Link
          href="/skills/connectors"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Capabilities catalogue
        </Link>
      </div>
      <ShellPageHeaderClient
        title="Add Capability from Repo"
        subtitle="Capabilities are integrated under LiNKskills/capability-connectors/. This list shows manifests not yet added to the platform catalogue."
      />
      <LinkskillsHubNav />
      <LinkskillsCapabilityDiscoverPanel candidates={candidates} />
    </main>
  );
}
