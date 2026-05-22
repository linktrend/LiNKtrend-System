import Link from "next/link";

import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableShell,
  DT,
} from "@/components/data-table";
import {
  commandCentreRoleLabel,
  getCommandCentreRoleForUser,
  getEffectiveCommandCentreRole,
  isCommandCentreAdmin,
} from "@/lib/command-centre-access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PERMISSIONS_PAGE_COPY } from "@/lib/permissions-page-copy";
import { formatUiLabel } from "@/lib/ui-standards";

import { RoleRowForm } from "./role-row-form";

type DbRole = "admin" | "operator" | "viewer" | null;

export async function TeamPermissionsSection() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Sign in to review team permissions.{" "}
        <Link href="/login" className="font-medium text-sky-700 underline dark:text-sky-400">
          Log in
        </Link>
      </p>
    );
  }

  const allowed = await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email });
  if (!allowed) {
    return (
      <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">{PERMISSIONS_PAGE_COPY.nonAdminNote}</p>
    );
  }

  const admin = getSupabaseAdmin();
  const { data: listData, error: listErr } = await admin.auth.admin.listUsers({ perPage: 200 });

  if (listErr) {
    return <p className="text-sm text-zinc-600 dark:text-zinc-400">The user directory could not be loaded.</p>;
  }

  const users = listData?.users ?? [];
  const adminClient = getSupabaseAdmin();

  type AuthUser = { id: string; email?: string | null };

  const rows = await Promise.all(
    (users as AuthUser[]).map(async (u) => {
      const { data: row } = await adminClient
        .schema("linkaios")
        .from("user_access")
        .select("role")
        .eq("user_id", u.id)
        .maybeSingle();
      const raw = row?.role as string | undefined;
      const dbRole: DbRole = raw === "admin" || raw === "operator" || raw === "viewer" ? raw : null;
      const effectiveRole = getEffectiveCommandCentreRole({
        dbRole,
        email: u.email ?? undefined,
      });
      return {
        userId: u.id,
        email: u.email ?? null,
        dbRole,
        effectiveRole,
      };
    }),
  );

  const selfRole = await getCommandCentreRoleForUser(supabase, {
    userId: user.id,
    email: user.email,
  });

  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        Your role: <strong>{commandCentreRoleLabel(selfRole)}</strong>. {PERMISSIONS_PAGE_COPY.adminNote}
      </p>

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
              <th className={DT.thTextInset}>Email</th>
              <th className={DT.thTextInset}>Current role</th>
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
              <RoleRowForm key={row.userId} row={row} />
            ))}
          </DataTableBody>
        </DataTable>
      </DataTableShell>
    </div>
  );
}
