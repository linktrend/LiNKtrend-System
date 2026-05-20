import Link from "next/link";

import {
  commandCentreRoleLabel,
  getCommandCentreRoleForUser,
  getEffectiveCommandCentreRole,
  isCommandCentreAdmin,
} from "@/lib/command-centre-access";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TABLE } from "@/lib/ui-standards";

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
      <p className="max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
        Only workspace <strong>Admins</strong> can change roles here. Ask an Admin if you need a different level of
        access.
      </p>
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
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Your role: <strong>{commandCentreRoleLabel(selfRole)}</strong>
      </p>
      <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        <strong>Admin</strong> can manage settings and roles. <strong>Operator</strong> can use day-to-day controls.{" "}
        <strong>Viewer</strong> is read-only. LiNKbot service accounts are managed on the Linktrend vendor side and do
        not appear in this human-user table.
      </p>

      <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-100 text-xs font-medium uppercase tracking-wide text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            <tr>
              <th className={`px-3 py-2 ${TABLE.thText}`}>User id</th>
              <th className={`px-3 py-2 ${TABLE.thText}`}>Email</th>
              <th className={`px-3 py-2 ${TABLE.thText}`}>Assigned role</th>
              <th className={`px-3 py-2 ${TABLE.thControl}`}>
                <div className={TABLE.thControlInner}>Actions</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <RoleRowForm key={row.userId} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
