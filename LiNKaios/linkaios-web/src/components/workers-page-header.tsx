"use client";

import { useSearchParams } from "next/navigation";

import { AddLinkbotHeaderAction } from "@/components/role-gated-ui";
import { useAppSurface } from "@/components/app-surface-provider";
import { licensorScopeLabel, useLicensorScope } from "@/components/role-preview-provider";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { parseWorkersFleetScope, type WorkersFleetScope } from "@/components/workers-fleet-nav";
import { resolveLicenseeRegistry } from "@/lib/licensee-registry";
import { BUTTON } from "@/lib/ui-standards";

export function WorkersPageHeader(props: { fleetScope?: WorkersFleetScope }) {
  const { isAdmin } = useAppSurface();
  const { scope, isAllLicensees } = useLicensorScope();
  const searchParams = useSearchParams();
  const fleetScope = props.fleetScope ?? parseWorkersFleetScope(searchParams.get("scope") ?? undefined);

  const title = isAdmin && fleetScope === "admin" ? "Admin LiNKbots" : "LiNKbots";

  let subtitle = "Your AI workforce — fleet status, sessions, skills, and configuration.";
  if (isAdmin) {
    if (fleetScope === "admin") {
      subtitle =
        "Vendor/studio LiNKbots only — licensor fleet scope. Use All LiNKbots to monitor every deployed bot across licensees.";
    } else if (isAllLicensees) {
      subtitle =
        "All LiNKbots — every deployed bot (client + admin) for vendor monitoring. Select a licensee scope to troubleshoot sessions and capabilities.";
    } else {
      const licensee = resolveLicenseeRegistry(scope);
      subtitle = licensee
        ? `${licensorScopeLabel(scope, licensee.name)} — Monitor and troubleshoot LiNKbots provisioned for this licensee.`
        : "Monitor and troubleshoot LiNKbots for the selected licensee scope.";
    }
  }

  return (
    <ShellPageHeaderClient
      title={title}
      subtitle={subtitle}
      actions={!isAdmin ? <AddLinkbotHeaderAction className={BUTTON.addRow} /> : undefined}
    />
  );
}
