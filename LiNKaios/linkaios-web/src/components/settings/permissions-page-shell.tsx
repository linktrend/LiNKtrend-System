"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Minus, Shield } from "lucide-react";

import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { useAppRole } from "@/components/role-preview-provider";
import { TitledCardHeader } from "@/components/titled-card-header";
import { canManageTeamRoles } from "@/lib/app-roles";
import {
  PERMISSIONS_TABS,
  parsePermissionsTab,
  permissionsTabHref,
  ROLE_PERMISSION_MATRIX,
} from "@/lib/permissions-page-copy";
import { formatCardTitle, formatUiLabel, screenTabLinkClass, TABS } from "@/lib/ui-standards";

import { TeamMembersAddButton } from "@/components/settings/team-members-add-button";

function PermissionCell(props: { allowed: boolean }) {
  return (
    <td className={DT.tdControl}>
      <div className={DT.controlInner}>
        {props.allowed ? (
          <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-label="Allowed" />
        ) : (
          <Minus className="h-4 w-4 text-zinc-300 dark:text-zinc-600" aria-label="Not allowed" />
        )}
      </div>
    </td>
  );
}

function RolePermissionsMatrix() {
  return (
    <section className="space-y-4">
      <TitledCardHeader icon={Shield} title={formatCardTitle("Permission matrix")} />
        <DataTableShell>
          <DataTable>
            <colgroup>
              <col className="w-[46%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
              <col className="w-[18%]" />
            </colgroup>
            <DataTableHead>
              <tr>
                <th className={DT.thTextInset}>{formatUiLabel("Capability")}</th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("User")}</div>
                </th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Admin")}</div>
                </th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Super Admin")}</div>
                </th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {ROLE_PERMISSION_MATRIX.map((row) => (
                <DataTableRow key={row.id} multiline>
                  <td className={DT.tdClipInset}>
                    <span className={`${DT.tdTextSpan} font-medium text-zinc-900 dark:text-zinc-100`}>{row.label}</span>
                  </td>
                  <PermissionCell allowed={row.user} />
                  <PermissionCell allowed={row.admin} />
                  <PermissionCell allowed={row.super_admin} />
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>
  );
}

export function PermissionsPageShell(props: { teamPanel: React.ReactNode }) {
  const searchParams = useSearchParams();
  const { kind, role } = useAppRole();
  const canManageTeam = canManageTeamRoles(kind, role);
  const activeTab = parsePermissionsTab(searchParams.get("tab"));
  const visibleTabs = canManageTeam
    ? PERMISSIONS_TABS
    : PERMISSIONS_TABS.filter((tab) => tab.id === "team");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <nav className={TABS.row} aria-label="Permissions sections">
          {visibleTabs.map((tab) => (
            <Link key={tab.id} href={permissionsTabHref(tab.id)} className={screenTabLinkClass(activeTab === tab.id)}>
              {tab.label}
            </Link>
          ))}
        </nav>
        {activeTab === "team" && canManageTeam ? <TeamMembersAddButton canInvite /> : null}
      </div>

      {activeTab === "team" ? <section className="space-y-4">{props.teamPanel}</section> : null}

      {activeTab === "roles" && canManageTeam ? <RolePermissionsMatrix /> : null}
    </div>
  );
}
