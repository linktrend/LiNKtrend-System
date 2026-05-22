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
import { TitledCardHeader } from "@/components/titled-card-header";
import {
  CLIENT_ROLES,
  PERMISSIONS_TABS,
  parsePermissionsTab,
  permissionsTabHref,
  ROLE_PERMISSION_MATRIX,
  type PermissionsTabId,
} from "@/lib/permissions-page-copy";
import { formatCardTitle, formatUiLabel, screenTabLinkClass, TABS } from "@/lib/ui-standards";

import { TeamMembersAddButton } from "@/components/settings/team-members-add-button";

function PermissionsTabNav(props: { active: PermissionsTabId }) {
  return (
    <nav className={TABS.row} aria-label="Permissions sections">
      {PERMISSIONS_TABS.map((tab) => (
        <Link key={tab.id} href={permissionsTabHref(tab.id)} className={screenTabLinkClass(props.active === tab.id)}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

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
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {CLIENT_ROLES.map((role) => (
          <article key={role.id} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{role.label}</h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{role.summary}</p>
          </article>
        ))}
      </div>

      <section className="space-y-4">
        <TitledCardHeader
          icon={Shield}
          title={formatCardTitle("Permission matrix")}
          description="Fixed client roles for MVO. Custom roles may be added in a later release."
        />
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
                  <div className={DT.controlInner}>{formatUiLabel("Admin")}</div>
                </th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Operator")}</div>
                </th>
                <th className={DT.thControl}>
                  <div className={DT.controlInner}>{formatUiLabel("Viewer")}</div>
                </th>
              </tr>
            </DataTableHead>
            <DataTableBody>
              {ROLE_PERMISSION_MATRIX.map((row) => (
                <DataTableRow key={row.id} multiline>
                  <td className={DT.tdClipInset}>
                    <span className={`${DT.tdTextSpan} font-medium text-zinc-900 dark:text-zinc-100`}>{row.label}</span>
                    <span className={`${DT.tdWrapSpan} mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400`}>{row.description}</span>
                  </td>
                  <PermissionCell allowed={row.admin} />
                  <PermissionCell allowed={row.operator} />
                  <PermissionCell allowed={row.viewer} />
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      </section>
    </div>
  );
}

export function PermissionsPageShell(props: { teamPanel: React.ReactNode }) {
  const searchParams = useSearchParams();
  const activeTab = parsePermissionsTab(searchParams.get("tab"));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PermissionsTabNav active={activeTab} />
        {activeTab === "team" ? <TeamMembersAddButton /> : null}
      </div>

      {activeTab === "team" ? <section className="space-y-4">{props.teamPanel}</section> : null}

      {activeTab === "roles" ? <RolePermissionsMatrix /> : null}
    </div>
  );
}
