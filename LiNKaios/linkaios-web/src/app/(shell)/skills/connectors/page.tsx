import Link from "next/link";

import { CapabilityConnectorsTable } from "@/components/capability-connectors-table";
import { LinkskillsGlossaryBrief } from "@/components/linkskills-glossary";
import { LinkskillsHubNav } from "@/components/linkskills-hub-nav";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { DEMO_CONNECTOR_CATALOG_ROWS } from "@/lib/ui-mocks/capability-connectors-demo";
import { BUTTON } from "@/lib/ui-standards";

export const dynamic = "force-dynamic";

export default function SkillsConnectorsPage() {
  return (
    <main className="space-y-8">
      <ShellPageHeaderClient
        title="Connectors"
        subtitle="Capability connector registry — governed bridges to external software."
        actions={
          <Link href="/skills/leases" className={`${BUTTON.secondaryRow} h-fit shrink-0`}>
            View leases
          </Link>
        }
      />
      <LinkskillsHubNav />

      <LinkskillsGlossaryBrief kind="connectors" />

      <p className="max-w-3xl text-xs text-zinc-600 dark:text-zinc-400">
        Rows mirror <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">LiNKskills/capability-connectors/connector-registry.md</code>{" "}
        for UI review. Runtime connector handlers and lease wiring live in LinkSkills.
      </p>

      <CapabilityConnectorsTable rows={DEMO_CONNECTOR_CATALOG_ROWS} />
    </main>
  );
}
