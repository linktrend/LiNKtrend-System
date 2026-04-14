import Link from "next/link";
import { redirect } from "next/navigation";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  commandCentreRoleLabel,
  getCommandCentreRoleForUser,
  getEffectiveCommandCentreRole,
  isCommandCentreAdmin,
} from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
        <p className="text-sm text-zinc-500">
          <Link href="/settings" className="text-zinc-700 underline">
            Settings
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900">Access</span>
        </p>
        <h1 className="mt-2 text-xl font-semibold text-zinc-900">Command centre access</h1>
        <p className="mt-4 max-w-xl text-sm text-zinc-700">
          You need an <strong>admin</strong> role in <code className="text-xs">linkaios.user_access</code>, or your
          email must be listed in <code className="text-xs">COMMAND_CENTRE_BOOTSTRAP_ADMIN_EMAILS</code> in the server
          environment (comma-separated).
        </p>
        <p className="mt-4 text-sm">
          <Link href="/settings" className="text-zinc-700 underline">
            Back to settings
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
        <h1 className="text-xl font-semibold text-zinc-900">Command centre access</h1>
        <p className="mt-4 text-sm text-red-700">{listErr.message}</p>
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
      const dbRole: DbRole =
        raw === "admin" || raw === "operator" || raw === "viewer" ? raw : null;
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
      <p className="text-sm text-zinc-500">
        <Link href="/settings" className="text-zinc-700 underline">
          Settings
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900">Access</span>
      </p>
      <h1 className="mt-2 text-xl font-semibold text-zinc-900">Command centre access</h1>
      <p className="mt-2 max-w-3xl text-sm text-zinc-600">
        Assign <code className="text-xs">viewer</code> for read-only dashboards, <code className="text-xs">operator</code>{" "}
        for normal writes, <code className="text-xs">admin</code> for settings administration. Removing a row restores
        implicit <strong>operator</strong> (same as before migration <code className="text-xs">010</code>), unless the
        account matches bootstrap admin emails.
      </p>
      <p className="mt-2 text-sm text-zinc-600">
        Your session is <strong>{commandCentreRoleLabel(selfRole)}</strong>.
      </p>

      <div className="mt-8 overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-100 text-xs font-medium uppercase tracking-wide text-zinc-600">
            <tr>
              <th className="px-3 py-2">User id</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">DB role</th>
              <th className="px-3 py-2">Actions</th>
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
