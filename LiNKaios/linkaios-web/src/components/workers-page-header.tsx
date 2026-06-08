"use client";

import { AddLinkbotHeaderAction } from "@/components/role-gated-ui";
import { useAppSurface } from "@/components/app-surface-provider";
import { licensorScopeLabel, useLicensorScope } from "@/components/role-preview-provider";
import { ShellPageHeaderClient } from "@/components/shell-page-header-client";
import { resolveLicenseeRegistry } from "@/lib/licensee-registry";
import { BUTTON } from "@/lib/ui-standards";

export function WorkersPageHeader() {
  const { isAdmin } = useAppSurface();
  const { scope, isAllLicensees } = useLicensorScope();

  let subtitle = "Your AI workforce — fleet status, sessions, skills, and configuration.";
  if (isAdmin) {
    if (isAllLicensees) {
      subtitle =
        "Vendor fleet monitor — aggregate LiNKbot status across all licensees. Select a licensee scope to troubleshoot sessions and capabilities.";
    } else {
      const licensee = resolveLicenseeRegistry(scope);
      subtitle = licensee
        ? `${licensorScopeLabel(scope, licensee.name)} — Monitor and troubleshoot LiNKbots provisioned for this licensee.`
        : "Monitor and troubleshoot LiNKbots for the selected licensee scope.";
    }
  }

  return (
    <ShellPageHeaderClient
      title="LiNKbots"
      subtitle={subtitle}
      actions={!isAdmin ? <AddLinkbotHeaderAction className={BUTTON.addRow} /> : undefined}
    />
  );
}
