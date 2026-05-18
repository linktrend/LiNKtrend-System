import Link from "next/link";

import type { CommandCentreRole } from "@/lib/command-centre-access";
import { getCommandCentreRoleForUser, isCommandCentreAdmin } from "@/lib/command-centre-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function roleLabel(role: CommandCentreRole | undefined) {
  if (role === "admin") return "Admin";
  if (role === "viewer") return "Viewer";
  if (role === "operator") return "Operator";
  return "Unknown";
}

export default async function SettingsUserPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role =
    user?.id != null ? await getCommandCentreRoleForUser(supabase, { userId: user.id, email: user.email }) : undefined;
  const isAdmin =
    user?.id != null ? await isCommandCentreAdmin(supabase, { userId: user.id, email: user.email }) : false;

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-900">User</h2>
      <p className="mt-3 text-sm text-zinc-700">
        <span className="font-medium text-zinc-900">Access:</span>{" "}
        <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-medium text-zinc-800">{roleLabel(role)}</span>
        {user?.email ? (
          <>
            <span className="text-zinc-400"> · </span>
            <span className="text-zinc-800">{user.email}</span>
          </>
        ) : (
          <span className="text-zinc-500"> · not signed in</span>
        )}
      </p>

      <ul className="mt-10 space-y-4">
        <li>
          <Link
            href="/settings/access"
            className="block rounded-lg border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300"
          >
            <h3 className="text-sm font-semibold text-zinc-900">Command centre access</h3>
            <p className="mt-1 text-sm text-zinc-600">
              Manage operator, viewer, and admin roles (<code className="text-xs">linkaios.user_access</code>).
            </p>
            {!isAdmin ? (
              <p className="mt-2 text-xs text-amber-800">Requires admin. You can open the page to see the explanation.</p>
            ) : null}
          </Link>
        </li>
      </ul>
    </div>
  );
}
