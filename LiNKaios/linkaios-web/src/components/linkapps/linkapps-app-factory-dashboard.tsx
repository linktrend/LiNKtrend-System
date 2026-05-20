import type { LinkappsFactoryFixture } from "@/lib/plugins/linkapps/types";

import { LinkappsAuditSpine } from "@/components/linkapps/linkapps-audit-spine";
import { LinkappsBlueprintIntakePanel } from "@/components/linkapps/linkapps-blueprint-intake-panel";
import { LinkappsCapabilityLeasesPanel } from "@/components/linkapps/linkapps-capability-leases-panel";
import { LinkappsContextBar } from "@/components/linkapps/linkapps-context-bar";
import { LinkappsHandoffPackPanel } from "@/components/linkapps/linkapps-handoff-pack-panel";
import { LinkappsSquadMonitorPanel } from "@/components/linkapps/linkapps-squad-monitor-panel";
import { LinkappsWorkflowStatusPanel } from "@/components/linkapps/linkapps-workflow-status-panel";

export function LinkappsAppFactoryDashboard(props: { data: LinkappsFactoryFixture }) {
  const { data } = props;
  return (
    <div className="space-y-6">
      <LinkappsContextBar context={data.context} />
      <div className="grid gap-6 lg:grid-cols-2">
        <LinkappsBlueprintIntakePanel blueprint={data.blueprint} />
        <LinkappsCapabilityLeasesPanel leases={data.leases} />
      </div>
      <LinkappsSquadMonitorPanel rows={data.squad} />
      <LinkappsWorkflowStatusPanel
        workflows={data.workflows}
        buildLogs={data.buildLogs}
        validationLines={data.validationLines}
        deploymentLines={data.deploymentLines}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <LinkappsHandoffPackPanel handoff={data.handoff} />
        <LinkappsAuditSpine entries={data.auditSpine} />
      </div>
    </div>
  );
}
