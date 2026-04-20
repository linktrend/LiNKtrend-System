import Link from "next/link";
import { redirect } from "next/navigation";

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

export const dynamic = "force-dynamic";

type DbRole = "admin" | "operator" | "viewer" | null;

export default async function SettingsAccessPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) redirect("/login");

  const allowed = await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email });
  if (!allowed) {
    return (
      <main>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/settings/user" className="text-zinc-700 underline dark:text-zinc-300">
            Settings
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900 dark:text-zinc-100">Access</span>
        </p>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Access</h1>
        <p className="mt-4 max-w-xl text-sm text-zinc-600 dark:text-zinc-400">
          Only workspace <strong>Admins</strong> can change roles here. Ask an Admin if you need a different level of access.
        </p>
        <p className="mt-4 text-sm">
          <Link href="/settings/user" className="text-sky-700 underline dark:text-sky-400">
            Back to Settings
          </Link>
        </p>
      </main>
    );
  }

  const admin = getSupabaseAdmin();
  const { data: listData, error: listErr } = await admin.auth.admin.listUsers({ perPage: 200 });

  if (listErr) {
    return (
      <main>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Access</h1>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">The user directory could not be loaded.</p>
      </main>
    );
  }

  const users = listData?.users ?? [];
  const adminClient = getSupabaseAdmin();

  const rows = await Promise.all(
    users.map(async (u) => {
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
        email: u.email,
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
    <main>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/settings/user" className="text-zinc-700 underline dark:text-zinc-300">
          Settings
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">Access</span>
      </p>
      <h1 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-100">Access</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Your role: <strong>{commandCentreRoleLabel(selfRole)}</strong>
      </p>
      <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
        <strong>Admin</strong> can manage settings and roles. <strong>Operator</strong> can use day-to-day controls.{" "}
        <strong>Viewer</strong> is read-only.
      </p>

      <div className="mt-8 overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
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
    </main>
  );
}
