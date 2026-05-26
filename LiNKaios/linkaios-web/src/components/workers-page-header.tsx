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
      subtitle = "Licensee LiNKbot fleets across the platform — not the licensor operator workforce.";
    } else {
      const licensee = resolveLicenseeRegistry(scope);
      subtitle = licensee
        ? `${licensorScopeLabel(scope, licensee.name)} — LiNKbots registered to this licensee.`
        : "LiNKbots for the selected licensee workspace.";
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
