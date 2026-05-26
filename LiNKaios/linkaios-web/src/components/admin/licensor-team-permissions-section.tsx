"use client";

import { useState } from "react";

import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableRow,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { InsetSelect } from "@/components/forms";
import { StubBadge } from "@/components/stub-badge";
import { useAppRole } from "@/components/role-preview-provider";
import { StatusPill } from "@/components/ui/status-pill";
import {
  canManageLicensorOperatorTeam,
  ROLE_TIER_LABELS,
  type AppRoleTier,
} from "@/lib/app-roles";
import { LICENSOR_PERMISSIONS_PAGE_COPY } from "@/lib/licensor-permissions-page-copy";
import { ROLE_TIER_PILL_LABELS } from "@/lib/status-colors";
import { BUTTON, formatUiLabel } from "@/lib/ui-standards";

type LicensorTeamRow = {
  id: string;
  name: string;
  email: string;
  role: AppRoleTier;
};

const LICENSOR_TEAM_FIXTURE: LicensorTeamRow[] = [
  { id: "lt-1", name: "Alex Chen", email: "alex@linktrend.io", role: "super_admin" },
  { id: "lt-2", name: "Jordan Lee", email: "jordan@linktrend.io", role: "admin" },
  { id: "lt-3", name: "Sam Rivera", email: "sam@linktrend.io", role: "user" },
  { id: "lt-4", name: "Morgan Patel", email: "morgan@linktrend.io", role: "admin" },
];

function roleTone(role: AppRoleTier) {
  if (role === "super_admin") return "neutral" as const;
  if (role === "admin") return "success" as const;
  return "warning" as const;
}

function LicensorRoleRow(props: { row: LicensorTeamRow; canEdit: boolean }) {
  const [role, setRole] = useState(props.row.role);
  const [saved, setSaved] = useState(false);

  return (
    <DataTableRow multiline>
      <td className={DT.tdClipInset}>
        <span className={`${DT.tdTextSpan} font-medium text-zinc-900 dark:text-zinc-100`}>{props.row.name}</span>
        <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{props.row.email}</span>
      </td>
      <td className={DT.tdClipInset}>
        <StatusPill
          label={ROLE_TIER_LABELS[props.row.role]}
          tone={roleTone(props.row.role)}
          equalWidthLabels={ROLE_TIER_PILL_LABELS}
        />
      </td>
      <td className={DT.tdControl}>
        <div className={DT.controlInner}>
          <InsetSelect
            compact
            value={role}
            disabled={!props.canEdit}
            onChange={(e) => {
              setRole(e.target.value as AppRoleTier);
              setSaved(false);
            }}
          >
            <option value="user">{ROLE_TIER_LABELS.user}</option>
            <option value="admin">{ROLE_TIER_LABELS.admin}</option>
            <option value="super_admin">{ROLE_TIER_LABELS.super_admin}</option>
          </InsetSelect>
        </div>
      </td>
      <td className={DT.tdControl}>
        <div className={DT.controlInner}>
          <button
            type="button"
            className={BUTTON.primaryCompact}
            disabled={!props.canEdit}
            onClick={() => setSaved(true)}
          >
            Save
          </button>
          {saved ? <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">Updated (stub).</p> : null}
        </div>
      </td>
    </DataTableRow>
  );
}

/** MVO fixture — operator team directory for the Admin app. */
export function LicensorTeamPermissionsSection() {
  const { kind, role } = useAppRole();
  const canEdit = canManageLicensorOperatorTeam(kind, role);

  return (
    <div className="space-y-4">
      {!canEdit ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{LICENSOR_PERMISSIONS_PAGE_COPY.nonAdminNote}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <StubBadge label="Demo stub" />
      </div>

      <DataTableShell scrollableBody>
        <DataTable>
          <colgroup>
            <col className="w-[32%]" />
            <col className="w-[18%]" />
            <col className="w-[28%]" />
            <col className="w-[22%]" />
          </colgroup>
          <DataTableHead>
            <tr>
              <th className={DT.thTextInset}>{formatUiLabel("Name")}</th>
              <th className={DT.thTextInset}>{formatUiLabel("Current role")}</th>
              <th className={DT.thControl}>
                <div className={DT.controlInner}>{formatUiLabel("Role")}</div>
              </th>
              <th className={DT.thControl}>
                <div className={DT.controlInner}>{formatUiLabel("Save")}</div>
              </th>
            </tr>
          </DataTableHead>
          <DataTableBody>
            {LICENSOR_TEAM_FIXTURE.map((row) => (
              <LicensorRoleRow key={row.id} row={row} canEdit={canEdit} />
            ))}
          </DataTableBody>
        </DataTable>
      </DataTableShell>
    </div>
  );
}
