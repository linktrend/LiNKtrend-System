"use client";

import { usePathname } from "next/navigation";

import { useAppSurface } from "@/components/app-surface-provider";
import { licensorScopeLabel, useAppRole, useLicensorScope } from "@/components/role-preview-provider";
import { StatusPill } from "@/components/ui/status-pill";
import { licensorScopeIsReadOnly } from "@/lib/app-roles";
import { resolveLicenseeRegistry, type LicenseeRegistryRow } from "@/lib/licensee-registry";
import { settingsSectionActive } from "@/lib/settings-nav";
import { formatUiLabel, SHELL } from "@/lib/ui-standards";

function licenseeStatusTone(status: LicenseeRegistryRow["status"]) {
  if (status === "suspended") return "danger" as const;
  if (status === "trialing") return "warning" as const;
  return "success" as const;
}

/** Inline scope row below the page title — admin surface only. Hidden on Settings (operator account, not tenant-scoped). */
export function LicensorScopeLine() {
  const pathname = usePathname() ?? "";
  const { isAdmin, routePath } = useAppSurface();
  const { scope, isSingleLicensee, isCrossTenantReadOnly } = useLicensorScope();
  const { role } = useAppRole();

  if (!isAdmin) return null;
  const route = routePath(pathname);
  if (settingsSectionActive(route)) return null;
  if (route.startsWith("/admin/projects")) return null;
  if (route === "/suites" || route.startsWith("/suites/")) return null;
  if (route === "/linksuitegen" || route.startsWith("/linksuitegen/")) return null;

  const readOnly = isCrossTenantReadOnly && licensorScopeIsReadOnly(scope, role);
  const viewLabel = licensorScopeLabel(scope);

  if (!isSingleLicensee) {
    return (
      <div className={SHELL.licensorScopeRow} role="status" aria-live="polite">
        <span className={SHELL.licensorScopePrefix}>View:</span>
        <span className={SHELL.licensorScopeName}>{viewLabel}</span>
        {readOnly ? <StatusPill label="Read-only" tone="neutral" equalWidth /> : null}
      </div>
    );
  }

  const licensee = resolveLicenseeRegistry(scope);
  if (!licensee) return null;

  return (
    <div className={SHELL.licensorScopeRow} role="status" aria-live="polite">
      <span className={SHELL.licensorScopePrefix}>View:</span>
      <span className={SHELL.licensorScopeName}>{licensorScopeLabel(scope, licensee.name)}</span>
      <StatusPill
        label={formatUiLabel(licensee.status)}
        tone={licenseeStatusTone(licensee.status)}
        equalWidth
      />
      {readOnly ? <StatusPill label="Read-only" tone="neutral" equalWidth /> : null}
    </div>
  );
}
