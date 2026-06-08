import Link from "next/link";

import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableShell,
  DT,
} from "@/components/data-table";
import { StubBadge } from "@/components/stub-badge";
import { canManageLicensorOperatorTeam } from "@/lib/app-roles";
import { getAppRoleTierForUser } from "@/lib/command-centre-access";
import { LICENSOR_PERMISSIONS_PAGE_COPY } from "@/lib/licensor-permissions-page-copy";
import {
  resolveAppRoleTierFromAccess,
  type LicensorOperatorRow,
  type UserAccessDbRole,
} from "@/lib/licensor-operator-team";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatUiLabel } from "@/lib/ui-standards";

import { LicensorRoleRowForm } from "./licensor-role-row-form";

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

async function loadLicensorOperatorRows(): Promise<LicensorOperatorRow[]> {
  const admin = getSupabaseAdmin();
  const { data: listData, error: listErr } = await admin.auth.admin.listUsers({ perPage: 200 });
  if (listErr) return [];

  const users = (listData?.users ?? []) as AuthUser[];

  return Promise.all(
    users.map(async (user) => {
      const { data: row } = await admin
        .schema("linkaios")
        .from("user_access")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      const raw = row?.role as string | undefined;
      const dbRole: UserAccessDbRole | null =
        raw === "admin" || raw === "operator" || raw === "viewer" ? raw : null;

      const meta = user.user_metadata ?? {};
      const fullName =
        typeof meta.full_name === "string"
          ? meta.full_name
          : typeof meta.name === "string"
            ? meta.name
            : null;

      return {
        userId: user.id,
        email: user.email ?? null,
        fullName,
        dbRole,
        appRoleTier: resolveAppRoleTierFromAccess({
          dbRole,
          metadata: meta,
          email: user.email,
        }),
      };
    }),
  );
}

/** Operator team directory for the Admin app — Super Admin can invite and assign roles. */
export async function LicensorTeamPermissionsSection() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Sign in to review operator permissions.{" "}
        <Link href="/login" className="font-medium text-sky-700 underline dark:text-sky-400">
          Log in
        </Link>
      </p>
    );
  }

  const viewerTier = await getAppRoleTierForUser(supabase, { userId: user.id, email: user.email });
  const canEdit = canManageLicensorOperatorTeam("licensor", viewerTier);
  const rows = await loadLicensorOperatorRows();

  return (
    <div className="space-y-4">
      {!canEdit ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{LICENSOR_PERMISSIONS_PAGE_COPY.nonAdminNote}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <StubBadge label="Shadow invite" />
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          Create user → assign role → invite email. Delivery may be stubbed; every invite is audit-logged.
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">No operators in the directory yet.</p>
      ) : (
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
              {rows.map((row) => (
                <LicensorRoleRowForm key={row.userId} row={row} canEdit={canEdit} />
              ))}
            </DataTableBody>
          </DataTable>
        </DataTableShell>
      )}
    </div>
  );
}
